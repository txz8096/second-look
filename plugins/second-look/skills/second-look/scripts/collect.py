#!/usr/bin/env python3
"""Weekly evidence collector for the second look skill.

Reads local session logs from Claude Code, Codex, Cursor and Antigravity, plus any
claude.ai, ChatGPT or Gemini data exports you pass in, and prints a compact JSON
summary: counts, tool and skill usage, unused skills, repeated instructions, correction
signals and a few trimmed prompt samples. Nothing leaves the machine.

Usage: python3 collect.py [--days 7] [--home ~] [--out summary.json]
"""
import argparse, collections, datetime as dt, glob, hashlib, json, os, re, sqlite3, sys

CORRECTION = re.compile(
    r"^\s*(no[,. ]|nope|actually|that'?s not|not what i|wrong|i said|i meant|instead[,]|"
    r"don'?t |stop |again[,.]|still (not|wrong|broken)|you (missed|forgot|ignored))",
    re.I)
SECRET = re.compile(r"(sk-[A-Za-z0-9_-]{10,}|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}|"
                    r"(?i:api[_-]?key|token|password)\s*[:=]\s*\S+)")
NOISE = re.compile(r"^<(command-|local-command|system-reminder|bash-|user-memory)", re.I)
SLASH = re.compile(r"<command-name>/?([\w:.-]+)</command-name>")
BUILTIN_COMMANDS = {"clear", "compact", "help", "model", "config", "cost", "init", "resume",
                    "login", "logout", "status", "memory", "permissions", "exit", "doctor",
                    "add-dir", "agents", "hooks", "mcp", "context", "usage", "rewind", "plan"}

# Behavior signals. Heuristics: the coach spot-checks samples before trusting a number.
GOAL = re.compile(r"\b(goal|so that|i want|i need|trying to|help me|purpose|because|in order to)\b", re.I)
CONTEXT = re.compile(r"\b(i'?m|my|our|for (a|an|the)|users?|audience|context|background|currently|we have)\b", re.I)
DONE = re.compile(r"\b(done when|output|format|table|list|bullets?|steps|should|must|include|words|"
                  r"deliver|return|example|constraints?|no more than|limit)\b", re.I)
CHECK = re.compile(r"(are you sure|double[- ]check|verify|fact[- ]check|\bsources?\b|\bcite|citation|evidence|"
                   r"edge cases?|what could go wrong|what am i missing|poke holes|stress[- ]test|test (it|this)|"
                   r"critique|assum(e|ption)|how do you know|counter ?argument)", re.I)
REFINE = re.compile(r"^\s*(now|also|next|then|great|good|ok(ay)?|nice|perfect|can you (also|now)|make it|add|"
                    r"change|tweak|shorten|expand|update|let'?s)\b", re.I)
STYLE = re.compile(r"(no filler|skip (the )?(filler|preamble|intro)|use (a )?tables?|bullet points?|"
                   r"be (more )?concise|short sentences|plain (language|english)|"
                   r"don'?t use (jargon|emojis?|bullets)|ask (me )?clarifying questions|cite (your )?sources)", re.I)
# Agent-side checks, from the tool calls Claude Code and Codex log. Heuristics too: spot-check `unchecked_samples`.
EDIT_TOOLS = {"Edit", "Write", "MultiEdit", "NotebookEdit", "apply_patch"}
CHECK_TOOL = re.compile(r"browser|preview_|playwright|screenshot|simulator|chrome", re.I)
CHECK_CMD = re.compile(r"\b(pytest|unittest|jest|vitest|mocha|cypress|playwright|go (test|vet)|cargo (test|check|clippy)|"
                       r"(npm|pnpm|yarn|bun)( run)? (test|build|lint|check|typecheck)|tsc\b|eslint|ruff|mypy|flake8|"
                       r"make (test|check)|xcodebuild[^|;&\n]*\btest|swift (test|build)|check_\w+\.py|validate|lint)", re.I)
SHIP_CMD = re.compile(r"\bgit\b[^|;&\n]*\b(commit|push)\b|\bgh pr (create|merge)\b|\b(vercel|netlify|firebase|fly)\b[^|;&\n]*deploy|"
                      r"\b(npm|pnpm|yarn) publish\b", re.I)
READ_ONLY = re.compile(r"^\W*(grep|rg|sed|cat|ls|find|head|tail|wc|echo|awk|diff|git (log|diff|show|status))\b")
PROSE = re.compile(r"\.(md|mdx|txt|rst)$|/\.(claude|codex|cursor|gemini|agents)/", re.I)
ACCEPT = re.compile(r"^\s*(lgtm|ship it|looks good|perfect|((ok(ay)?|yes|great|good|perfect)[,.! ]+)?"
                    r"(commit|push|merge|deploy|publish|ship)( it| this| that)?)\b", re.I)
CATEGORIES = [  # order breaks ties
    ("career", re.compile(r"recruiter|interview|resume|r[eé]sum[eé]|cover letter|job (description|posting|"
                               r"search|offer)|hiring manager|salary|negotiat|linkedin|application|offer call", re.I)),
    ("prototyping", re.compile(r"prototype|\bbuild|implement|component|\bcss\b|react|tailwind|\bbug|error|"
                               r"\bfix\b|refactor|deploy|\bapi\b|\bmcp\b|script|\bcode\b|function|layout", re.I)),
    ("creating", re.compile(r"\bwrite|draft|essay|blog|\bpost\b|deck|slides|\bdoc\b|case study|\bcopy\b|"
                            r"email|rewrite|poster|outline|edit (this|my)", re.I)),
    ("research", re.compile(r"research|compare|competit|landscape|sources|studies|market|look up|analy[sz]e|"
                            r"what does the data|benchmark", re.I)),
    ("brainstorming", re.compile(r"brainstorm|ideas?\b|what if|explore|options|how might|could we|name for|"
                                 r"concepts?|directions", re.I)),
]
CODING_TOOLS = {"claude_code", "codex", "cursor", "antigravity"}
BUILD_CATEGORIES = {"prototyping", "creating", "research"}


def clean(text, n=300):
    text = SECRET.sub("[redacted]", " ".join(str(text).split()))
    return text[:n]


def parse_ts(v):
    if v is None:
        return None
    try:
        if isinstance(v, (int, float)):
            return dt.datetime.fromtimestamp(v / 1000 if v > 1e12 else v, dt.timezone.utc)
        # trim sub-microsecond digits, which fromisoformat rejects
        return dt.datetime.fromisoformat(re.sub(r"(\.\d{6})\d+", r"\1", str(v).replace("Z", "+00:00")))
    except Exception:
        return None


def iter_jsonl(path):
    try:
        with open(path, encoding="utf-8", errors="ignore") as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        yield json.loads(line)
                    except Exception:
                        continue
    except OSError:
        return


class Agg:
    def __init__(self, name):
        self.name = name
        self.sessions = set()
        self.days = set()
        self.hours = collections.Counter()
        self.prompts = []          # (ts, session, text)
        self.tools = collections.Counter()
        self.skills = collections.Counter()
        self.slash = collections.Counter()
        self.compactions = 0
        self.events = []           # (ts, kind, name) for tools/skills over time
        self.skill_sessions = set()
        self.timeline = collections.defaultdict(list)   # session -> [(kind, detail)] in log order

    def add_action(self, session, name, blob, shell=False):
        """Record what an agent tool call did: edit, check or ship. Others are ignored."""
        edit = name in EDIT_TOOLS or "*** Begin Patch" in blob
        runs = []
        if shell and not edit:
            # commit messages, heredocs and grep patterns aren't commands
            bare = re.sub(r"<<-?\s*['\"]?(\w+)['\"]?.*?\n\1\b|\"(\\.|[^\"\\])*\"|'[^']*'", " ", blob, flags=re.S)
            runs = [p for p in re.split(r"&&|\|\||[;|\n]", bare) if p.strip() and not READ_ONLY.match(p)]
        if CHECK_TOOL.search(name) or any(CHECK_CMD.search(p) for p in runs) or (
                name in ("Agent", "Task") and CHECK.search(blob)):
            self.timeline[session].append(("check", name))
        ship = next((m for m in map(SHIP_CMD.search, runs) if m), None)
        if ship:
            self.timeline[session].append(("ship", clean(ship.group(0), 80)))
        elif edit:
            paths = [a or b for a, b in re.findall(r'"file_path": "([^"]+)"|\*\*\* (?:Update|Add) File: (\S+)', blob)]
            # prose and the tools' own settings and memory have nothing to run, so they don't need an agent check
            code = [p for p in paths if not PROSE.search(p)]
            if code or not paths:
                self.timeline[session].append(("edit", os.path.basename(code[0]) if code else name))

    def add_prompt(self, ts, session, text):
        if not text or NOISE.match(text.strip()):
            m = SLASH.search(text or "")
            if m:
                self.slash[m.group(1)] += 1
                self.events.append((ts, "skill", m.group(1).split(":")[-1]))
                if m.group(1).split(":")[-1] not in BUILTIN_COMMANDS:
                    self.skill_sessions.add(session)
            return
        self.sessions.add(session)
        if ts:
            local = ts.astimezone()
            self.days.add(local.date().isoformat())
            self.hours[local.hour] += 1
        self.prompts.append((ts, session, text))
        self.timeline[session].append(("prompt", text))
        m = SLASH.search(text or "")
        if m:
            self.slash[m.group(1)] += 1
            self.events.append((ts, "skill", m.group(1).split(":")[-1]))
            if m.group(1).split(":")[-1] not in BUILTIN_COMMANDS:
                self.skill_sessions.add(session)


def text_of(content):
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for c in content:
            if isinstance(c, dict) and c.get("type") in ("text", "input_text"):
                parts.append(c.get("text", ""))
        return "\n".join(parts)
    return ""


def claude_code(home, since):
    a = Agg("claude_code")
    for path in glob.glob(os.path.join(home, ".claude/projects/*/*.jsonl")):
        if os.path.getmtime(path) < since.timestamp():
            continue
        session = os.path.basename(path)[:-6]
        for e in iter_jsonl(path):
            ts = parse_ts(e.get("timestamp"))
            if ts and ts < since:
                continue
            if e.get("isMeta") or e.get("isSidechain"):
                continue
            msg = e.get("message") or {}
            if e.get("type") == "user" and msg.get("role") == "user":
                content = msg.get("content")
                if isinstance(content, list) and any(
                        isinstance(c, dict) and c.get("type") == "tool_result" for c in content):
                    continue
                a.add_prompt(ts, session, text_of(content))
            elif e.get("type") == "assistant":
                for c in msg.get("content") or []:
                    if isinstance(c, dict) and c.get("type") == "tool_use":
                        a.tools[c.get("name", "?")] += 1
                        a.events.append((ts, "tool", c.get("name", "?")))
                        inp = c.get("input") or {}
                        a.add_action(session, c.get("name", "?"),
                                     inp.get("command", "") if c.get("name") == "Bash" else json.dumps(inp),
                                     shell=c.get("name") == "Bash")
                        if c.get("name") == "Skill":
                            sk = (c.get("input") or {}).get("skill", "?")
                            a.skills[sk] += 1
                            a.skill_sessions.add(session)
                            a.events.append((ts, "skill", sk))
            elif e.get("type") == "system" and "compact" in json.dumps(e)[:400].lower():
                a.compactions += 1
    return a


def codex(home, since):
    a = Agg("codex")
    for path in glob.glob(os.path.join(home, ".codex/sessions/**/*.jsonl"), recursive=True):
        if os.path.getmtime(path) < since.timestamp():
            continue
        session = os.path.basename(path)[:-6]
        for e in iter_jsonl(path):
            ts = parse_ts(e.get("timestamp"))
            if ts and ts < since:
                continue
            p = e.get("payload") if isinstance(e.get("payload"), dict) else e
            kind = p.get("type")
            if kind == "message" and p.get("role") == "user":
                a.add_prompt(ts, session, text_of(p.get("content")))
            elif kind == "user_message":
                a.add_prompt(ts, session, p.get("message", ""))
            elif kind in ("function_call", "custom_tool_call", "local_shell_call"):
                a.tools[p.get("name") or kind] += 1
                a.events.append((ts, "tool", p.get("name") or kind))
                blob = " ".join(str(p.get(k) or "") for k in ("arguments", "input", "action"))
                # the shell command sits inside JSON or JS: {"command": ["bash", "-lc", "..."]} or exec_command({cmd: "..."})
                cmds = [json.loads(f'"{s}"') for s in re.findall(r'\bcmd"?\s*:\s*"((?:\\.|[^"\\])*)"', blob)]
                cmds += [json.loads(f'"{s}"') for s in re.findall(r'"command":\s*\[[^\]]*?"((?:\\.|[^"\\])*)"\s*\]', blob)]
                if "*** Begin Patch" in blob or not cmds:
                    a.add_action(session, p.get("name") or kind, blob)
                for cmd in cmds:
                    a.add_action(session, p.get("name") or kind, cmd, shell=True)
    # de-duplicate: codex logs a user turn as both message and user_message
    seen, uniq = set(), []
    for t in a.prompts:
        k = (t[1], t[2][:200])
        if k not in seen:
            seen.add(k); uniq.append(t)
    a.prompts = uniq
    for session, steps in a.timeline.items():
        seen, kept = set(), []
        for s in steps:
            if s[0] == "prompt" and s[1][:200] in seen:
                continue
            if s[0] == "prompt":
                seen.add(s[1][:200])
            kept.append(s)
        a.timeline[session] = kept
    return a


def cursor(home, since):
    a = Agg("cursor")
    dbs = [os.path.join(home, "Library/Application Support/Cursor/User/globalStorage/state.vscdb"),
           os.path.join(home, ".config/Cursor/User/globalStorage/state.vscdb")]
    for db in dbs:
        if not os.path.exists(db):
            continue
        try:
            con = sqlite3.connect(f"file:{db}?mode=ro", uri=True)
            rows = con.execute(
                "SELECT key, value FROM cursorDiskKV WHERE key LIKE 'bubbleId:%'").fetchall()
        except Exception as ex:
            print(f"cursor: could not read {db}: {ex}", file=sys.stderr)
            continue
        for key, val in rows:
            try:
                b = json.loads(val)
            except Exception:
                continue
            if b.get("type") != 1:            # 1 = user bubble
                continue
            ts = parse_ts(b.get("createdAt") or (b.get("timingInfo") or {}).get("clientStartTime"))
            if ts and ts < since:
                continue
            a.add_prompt(ts, key.split(":")[1], b.get("text", ""))
        con.close()
    return a


USER_REQUEST = re.compile(r"<USER_REQUEST>(.*?)</USER_REQUEST>", re.S)
AG_BLOCKS = re.compile(r"<(ADDITIONAL_METADATA|USER_SETTINGS_CHANGE)>.*?</\1>", re.S)


def antigravity(home, since):
    """Antigravity CLI (agy), plus the app on versions that write the same transcripts."""
    a = Agg("antigravity")
    seen = set()
    # the backup folder only duplicates conversations, so it's left out
    for root in (".gemini/antigravity-cli", ".gemini/antigravity", ".gemini/antigravity-ide"):
        for conv in glob.glob(os.path.join(home, root, "brain/*/")):
            session = os.path.basename(conv.rstrip("/"))
            logs = os.path.join(conv, ".system_generated/logs")
            # the short transcript trims content, so prefer the full one
            path = next((p for p in (os.path.join(logs, "transcript_full.jsonl"),
                                     os.path.join(logs, "transcript.jsonl")) if os.path.exists(p)), None)
            if session in seen or not path or os.path.getmtime(path) < since.timestamp():
                continue
            seen.add(session)
            fallback = dt.datetime.fromtimestamp(os.path.getmtime(path), dt.timezone.utc)
            for e in iter_jsonl(path):
                ts = parse_ts(e.get("created_at")) or fallback
                if ts < since:
                    continue
                if e.get("type") == "USER_INPUT" and e.get("source") == "USER_EXPLICIT":
                    text = str(e.get("content") or "")
                    m = USER_REQUEST.search(text)
                    a.add_prompt(ts, session, (m.group(1) if m else AG_BLOCKS.sub("", text)).strip())
                elif e.get("type") == "PLANNER_RESPONSE":
                    for c in e.get("tool_calls") or []:
                        name = c.get("name", "?") if isinstance(c, dict) else "?"
                        a.tools[name] += 1
                        a.events.append((ts, "tool", name))
    return a


def claude_export(path, since):
    """claude.ai data export (Settings > Privacy > Export data): conversations.json."""
    a = Agg("claude_ai")
    try:
        convos = json.load(open(path, encoding="utf-8"))
    except Exception as ex:
        print(f"claude export: could not read {path}: {ex}", file=sys.stderr)
        return a
    for c in convos:
        for m in c.get("chat_messages", []):
            if m.get("sender") != "human":
                continue
            ts = parse_ts(m.get("created_at"))
            if ts and ts < since:
                continue
            text = m.get("text") or text_of(m.get("content"))
            a.add_prompt(ts, c.get("uuid", "?"), text)
    return a


def chatgpt_export(path, since):
    """ChatGPT data export (Settings > Data controls > Export): conversations.json."""
    a = Agg("chatgpt")
    try:
        convos = json.load(open(path, encoding="utf-8"))
    except Exception as ex:
        print(f"chatgpt export: could not read {path}: {ex}", file=sys.stderr)
        return a
    for c in convos:
        for node in (c.get("mapping") or {}).values():
            m = node.get("message") or {}
            if (m.get("author") or {}).get("role") != "user":
                continue
            ts = parse_ts(m.get("create_time"))
            if ts and ts < since:
                continue
            parts = (m.get("content") or {}).get("parts") or []
            text = " ".join(p for p in parts if isinstance(p, str))
            a.add_prompt(ts, c.get("id") or c.get("conversation_id", "?"), text)
    return a


def gemini_export(path, since, gap_minutes=30):
    """Gemini web app, from Google Takeout (My Activity > Gemini Apps, JSON format): MyActivity.json.

    The export logs one record per prompt with no conversation id, so prompts less than
    gap_minutes apart are grouped into one session.
    """
    a = Agg("gemini_web")
    try:
        records = json.load(open(path, encoding="utf-8"))
    except Exception as ex:
        hint = " (choose JSON, not HTML, for My Activity in Takeout)" if path.endswith(".html") else ""
        print(f"gemini export: could not read {path}: {ex}{hint}", file=sys.stderr)
        return a
    prompts = []
    for rec in records if isinstance(records, list) else []:
        title = (rec.get("title") or "") if isinstance(rec, dict) else ""
        if not title.startswith("Prompted "):     # skips feedback, Gem edits, extension use
            continue
        ts = parse_ts(rec.get("time"))
        if ts and ts >= since:
            prompts.append((ts, title[len("Prompted "):].strip()))
    prompts.sort(key=lambda t: t[0])
    session, last = None, None
    for ts, text in prompts:
        if last is None or (ts - last).total_seconds() > gap_minutes * 60:
            session = "gemini-" + ts.strftime("%Y%m%dT%H%M%S")
        last = ts
        a.add_prompt(ts, session, text)
    return a


# Usage: tokens weighted by relative list price, new input = 1. An estimate; it compares sessions with each other.
WEIGHTS = {"claude_code": {"input": 1, "write_5m": 1.25, "write_1h": 2, "read": 0.1, "output": 5},
           "codex": {"input": 1, "read": 0.1, "output": 8}}
LONG_LINE = 150_000   # a session is long once its context passes this. A chosen line, not a measured limit
UNUSED_DAYS = 60      # a skill counts as unused after this many days without a run
LIMIT_HIT = re.compile(r"usage limit|rate.?limit|limit reached|5-hour limit|weekly limit", re.I)


def _turn(source, ctx, usage, out_rows):
    w = WEIGHTS[source]
    reread = min(usage, max(0, ctx - LONG_LINE) * w["read"])
    out_rows.append((ctx, usage, reread))


def usage_by_session(home, since):
    """Per-session usage from the token counts Claude Code and Codex log. Other tools don't record tokens."""
    out, limit_hits = {}, 0
    for path in glob.glob(os.path.join(home, ".claude/projects/*/*.jsonl")):
        if os.path.getmtime(path) < since.timestamp():
            continue
        turns, seen, w = [], set(), WEIGHTS["claude_code"]
        for e in iter_jsonl(path):
            ts = parse_ts(e.get("timestamp"))
            if ts and ts < since:
                continue
            if e.get("isApiErrorMessage") and LIMIT_HIT.search(json.dumps(e.get("message"))[:2000]):
                limit_hits += 1
            msg = e.get("message") or {}
            u = msg.get("usage") if e.get("type") == "assistant" and not e.get("isSidechain") else None
            if not u or msg.get("id") in seen:
                continue
            seen.add(msg.get("id"))
            write = u.get("cache_creation_input_tokens", 0)
            write_1h = (u.get("cache_creation") or {}).get("ephemeral_1h_input_tokens", 0)
            ctx = u.get("input_tokens", 0) + write + u.get("cache_read_input_tokens", 0)
            cost = (u.get("input_tokens", 0) * w["input"] + (write - write_1h) * w["write_5m"] + write_1h * w["write_1h"]
                    + u.get("cache_read_input_tokens", 0) * w["read"] + u.get("output_tokens", 0) * w["output"])
            _turn("claude_code", ctx, cost, turns)
        if turns:
            out[("claude_code", os.path.basename(path)[:-6])] = turns
    for path in glob.glob(os.path.join(home, ".codex/sessions/**/*.jsonl"), recursive=True):
        if os.path.getmtime(path) < since.timestamp():
            continue
        turns, last, w = [], None, WEIGHTS["codex"]
        for e in iter_jsonl(path):
            p = e.get("payload") if isinstance(e.get("payload"), dict) else {}
            if p.get("type") != "token_count" or not p.get("info"):
                continue
            total, u = p["info"].get("total_token_usage"), p["info"].get("last_token_usage") or {}
            if not total or total == last:
                continue
            last = total
            inp, cached, out_t = u.get("input_tokens", 0), u.get("cached_input_tokens", 0), u.get("output_tokens", 0)
            _turn("codex", inp, (inp - cached) * w["input"] + cached * w["read"] + out_t * w["output"], turns)
        if turns:
            out[("codex", os.path.basename(path)[:-6])] = turns
    sessions = {k: {"usage": sum(t[1] for t in v), "reread": sum(t[2] for t in v), "turns": len(v),
                    "peak": max(t[0] for t in v), "start_tokens": v[0][0]} for k, v in out.items()}
    return sessions, limit_hits


def starting_context(home, metered):
    """What loads before the first message in Claude Code, from the setup it logs. Sizes are text length / 4, an estimate."""
    cutoff = dt.datetime.now().timestamp() - UNUSED_DAYS * 86400
    runs, listed, files, system, oldest = collections.Counter(), {}, {}, [], dt.datetime.now().timestamp()
    recent = {s for (src, s) in metered if src == "claude_code"}
    for path in glob.glob(os.path.join(home, ".claude/projects/*/*.jsonl")):
        if os.path.getmtime(path) < cutoff:
            continue
        oldest = min(oldest, os.path.getmtime(path), os.path.getctime(path))
        in_window = os.path.basename(path)[:-6] in recent
        for e in iter_jsonl(path):
            for c in (e.get("message") or {}).get("content") or [] if e.get("type") == "assistant" else []:
                if isinstance(c, dict) and c.get("type") == "tool_use" and c.get("name") == "Skill":
                    runs[(c.get("input") or {}).get("skill", "?")] += 1
            if e.get("type") == "user":
                m = SLASH.search(text_of((e.get("message") or {}).get("content")))
                if m:
                    runs[m.group(1)] += 1
            a = e.get("attachment")
            if not in_window or not isinstance(a, dict):
                continue
            if a.get("type") == "skill_listing" and a.get("isInitial", True):
                for line in (a.get("content") or "").splitlines():
                    m = re.match(r"- ([^\s(:]+(?::[^\s(:]+)?)", line)
                    if m:
                        listed[m.group(1)] = len(line)
            elif a.get("type") == "instructions":
                for f in a.get("files") or []:
                    if isinstance(f, dict) and f.get("path"):
                        files[f["path"]] = f.get("content") or ""
            elif a.get("type") == "prompt_snapshot":
                system.append(len(json.dumps(a.get("systemPrompt"))))
    starts = sorted(v["start_tokens"] for k, v in metered.items() if k[0] == "claude_code")
    if not starts:
        return None
    ran = {n.split(":")[-1] for n in runs} | set(runs)
    mine = set(os.listdir(os.path.join(home, ".claude/skills"))) if os.path.isdir(os.path.join(home, ".claude/skills")) else set()
    unused_mine, plugins = [], collections.defaultdict(lambda: [0, 0])
    unused_chars = 0
    for name, chars in listed.items():
        if ":" in name:
            g = plugins[name.split(":")[0]]
            g[0] += chars
            g[1] += name in ran or name.split(":")[-1] in ran
        elif name in mine and name not in ran:
            unused_mine.append(name)
            unused_chars += chars
    unused_plugins = sorted(n for n, (_, r) in plugins.items() if not r)
    unused_chars += sum(plugins[n][0] for n in unused_plugins)
    words = {p: set(re.findall(r"[a-z]{4,}", c.lower())) for p, c in files.items()}
    copies = [{"path": b.replace(home, "~"), "copy_of": a.replace(home, "~"), "tokens": len(files[b]) // 4}
              for a in files for b in files
              if a < b and words[a] and words[b] and len(words[a] & words[b]) / len(words[a] | words[b]) >= 0.8]
    gain = unused_chars / 4
    typical = starts[len(starts) // 2]
    return {
        "typical_tokens": typical,
        "parts": {"tool_instructions": sorted(system)[len(system) // 2] // 4 if system else None,
                  "skill_list": sum(listed.values()) // 4, "instruction_files": sum(len(c) for c in files.values()) // 4},
        "skills_listed": len(listed), "skills_run": sum(1 for n in listed if n in ran or n.split(":")[-1] in ran),
        "unused_skills": sorted(unused_mine), "unused_plugins": unused_plugins, "unused_days": UNUSED_DAYS,
        "log_days": int((dt.datetime.now().timestamp() - oldest) / 86400),
        "gain_tokens": int(gain), "gain_of_start": round(gain / typical, 3),
        "instruction_copies": copies,
    }


def usage_summary(sessions, metered, limit_hits, home):
    """The numbers usage findings need: where usage went, compared only with the user's own typical session."""
    rows = [r for r in sessions if r.get("usage")]
    if not rows:
        return None
    total = sum(r["usage"] for r in rows)
    per_req = sorted(r["usage"] / r["prompts"] for r in rows)
    long_ = [r for r in rows if r["long"]]
    long_usage = sum(r["usage"] for r in long_)
    cc = [r for r in rows if r["source"] == "claude_code"]
    start = starting_context(home, metered)
    if start and cc:
        # share of Claude Code usage spent loading and re-reading the starting context
        start["share_of_usage"] = round(sum(min(r["start_tokens"], r["peak"]) * 0.1 * r["turns"] for r in cc)
                                        / sum(r["usage"] for r in cc), 3)
        start["gain_of_usage"] = round(start["gain_tokens"] * 0.1 * sum(r["turns"] for r in cc) / sum(r["usage"] for r in cc), 4)
    biggest = sorted(rows, key=lambda r: -r["usage"])[:3]
    return {
        "metered_sessions": len(rows), "long_line": LONG_LINE, "long_sessions": len(long_),
        "long_share": round(long_usage / total, 3),
        "typical_request": round(per_req[len(per_req) // 2]),
        "long_request_vs_typical": round(long_usage / sum(r["prompts"] for r in long_) / per_req[len(per_req) // 2], 1) if long_ else None,
        "reread_share_of_long": round(sum(r["reread"] for r in long_) / long_usage, 3) if long_usage else None,
        "biggest": [{"source": r["source"], "date": r["start"].astimezone().strftime("%b %-d"), "share": round(r["usage"] / total, 3),
                     "prompts": r["prompts"], "peak": r["peak"], "first": clean(r["first"], 120)} for r in biggest],
        "limit_hits": limit_hits,
        "starting_context": start,
    }


def week_of(ts):
    d = ts.astimezone().date()
    return (d - dt.timedelta(days=d.weekday())).isoformat()


def weekly_trend(aggs):
    """One row per week (Monday) across all tools: the metrics the coach charts over time."""
    rows = collections.defaultdict(lambda: {
        "prompts": 0, "sessions": set(), "days": set(), "chars": [], "short": 0,
        "corrections": 0, "by_tool": collections.Counter(), "skills": collections.Counter(),
        "tool_calls": 0, "session_turns": collections.Counter()})
    for a in aggs:
        for ts, session, text in a.prompts:
            if not ts:
                continue
            r = rows[week_of(ts)]
            r["prompts"] += 1
            r["sessions"].add((a.name, session))
            r["days"].add(ts.astimezone().date())
            r["chars"].append(len(text))
            r["short"] += len(text) < 40
            r["corrections"] += bool(CORRECTION.search(text))
            r["by_tool"][a.name] += 1
            r["session_turns"][(a.name, session)] += 1
        for ts, kind, name in a.events:
            if not ts:
                continue
            r = rows[week_of(ts)]
            if kind == "skill":
                r["skills"][name] += 1
            else:
                r["tool_calls"] += 1
    out = []
    for wk in sorted(rows):
        r = rows[wk]
        n, s = r["prompts"], len(r["sessions"])
        chars = sorted(r["chars"])
        out.append({
            "week": wk,
            "sessions": s,
            "active_days": len(r["days"]),
            "prompts": n,
            "prompts_per_session": round(n / s, 1) if s else 0,
            "median_prompt_chars": chars[len(chars) // 2] if chars else 0,
            "short_prompt_share": round(r["short"] / n, 2) if n else 0,
            "correction_rate": round(r["corrections"] / n, 3) if n else 0,
            "one_turn_session_share": round(sum(1 for v in r["session_turns"].values() if v == 1) / s, 2) if s else 0,
            "distinct_skills": len(r["skills"]),
            "skill_runs": sum(r["skills"].values()),
            "agent_tool_calls": r["tool_calls"],
            "prompts_by_tool": dict(r["by_tool"]),
        })
    return out


def coverage(aggs):
    """Earliest and latest data per source, so the report can mark gaps honestly."""
    cov = {}
    for a in aggs:
        stamps = [ts for ts, _, _ in a.prompts if ts]
        cov[a.name] = {"first": min(stamps).date().isoformat(), "last": max(stamps).date().isoformat()} if stamps else None
    return cov


def data_scope(home, aggs, export_paths):
    """What each source can show, so the report can mark data it can't see and say why."""
    now = dt.datetime.now()
    cov = coverage(aggs)
    try:
        retention = json.load(open(os.path.join(home, ".claude/settings.json"))).get("cleanupPeriodDays", 30)
    except Exception:
        retention = 30
    logs = glob.glob(os.path.join(home, ".claude/projects/*/*.jsonl"))
    oldest = dt.datetime.fromtimestamp(min(os.path.getmtime(p) for p in logs)) if logs else None
    # logs reaching back to the retention limit mean older ones were deleted
    at_edge = bool(oldest and (now - oldest).days >= retention - 3)
    local = {
        "claude_code": os.path.isdir(os.path.join(home, ".claude/projects")),
        "codex": os.path.isdir(os.path.join(home, ".codex/sessions")),
        "cursor": any(os.path.exists(os.path.join(home, p)) for p in (
            "Library/Application Support/Cursor/User/globalStorage/state.vscdb", ".config/Cursor/User/globalStorage/state.vscdb")),
        "antigravity": os.path.isdir(os.path.join(home, ".gemini/antigravity-cli")),
    }
    sources = []
    for sid, present in local.items():
        row = {"id": sid, "state": "logs" if present else "not_found"}
        if sid == "claude_code" and present and at_edge:
            row["cut"] = oldest.date().isoformat()
        sources.append(row)
    for sid, path in (("claude_ai", export_paths.get("claude")), ("chatgpt", export_paths.get("chatgpt")),
                      ("gemini_web", export_paths.get("gemini"))):
        path = os.path.expanduser(path) if path else None
        if path and os.path.exists(path):
            c = cov.get(sid)
            sources.append({"id": sid, "state": "export",
                            "to": (c or {}).get("last") or dt.date.fromtimestamp(os.path.getmtime(path)).isoformat()})
        else:
            sources.append({"id": sid, "state": "missing"})
    return {"retention_days": retention, "oldest_claude_log": oldest.date().isoformat() if oldest else None,
            "at_retention_edge": at_edge, "sources": sources}


def classify(source, prompts):
    """Label a session by what the work was for, mainly from its opening message."""
    # opening message first; follow-ups only as fallback, minus "check your work" phrasing
    for text in (prompts[0], CHECK.sub(" ", " ".join(prompts[:3]))):
        scores = {name: len(rx.findall(text)) for name, rx in CATEGORIES}
        if source in CODING_TOOLS:
            scores["prototyping"] += 1
        best = max(scores.values())
        if best:
            return next(name for name, _ in CATEGORIES if scores[name] == best)
    return "consultation"


def is_briefed(first):
    cues = sum(bool(rx.search(first)) for rx in (GOAL, CONTEXT, DONE))
    return len(first) >= 120 and cues >= 2


def content_words(text):
    return {w for w in re.findall(r"[a-z]{4,}", text.lower())}


def agent_checks(steps):
    """Walk one session's log: did a check run after the last edit, and was anything shipped
    (a commit, push or deploy, or "ship it" from the user) while edits were still unchecked?"""
    last_edit = last_check = -1
    pending, ships, samples = [], 0, []
    for i, (kind, detail) in enumerate(steps):
        if kind == "edit":
            last_edit = i
            pending.append(detail)
        elif kind == "check":
            last_check = i
            pending = []
        elif pending and (kind == "ship" or (kind == "prompt" and len(detail) < 80 and ACCEPT.match(detail))):
            ships += 1
            samples.append({"shipped": clean(detail, 80) if kind == "prompt" else f"agent ran: {detail}",
                            "unchecked_edits": sorted(set(pending))[:5]})
            pending = []
    return {"edited": last_edit >= 0, "agent_checked": last_edit >= 0 and last_check > last_edit,
            "unchecked_ships": ships, "unchecked_samples": samples}


def sessions_of(aggs, metered=None):
    out, metered = [], metered or {}
    for a in aggs:
        by = collections.defaultdict(list)
        for ts, session, text in a.prompts:
            by[session].append((ts, text))
        for session, items in by.items():
            items.sort(key=lambda t: t[0] or dt.datetime.min.replace(tzinfo=dt.timezone.utc))
            texts = [t for _, t in items]
            start = next((ts for ts, _ in items if ts), None)
            if not start:
                continue
            category = classify(a.name, texts)
            out.append({
                "source": a.name, "session": session, "start": start, "category": category,
                "first": texts[0], "prompts": len(texts),
                "briefed": is_briefed(texts[0]),
                "corrections": sum(bool(CORRECTION.search(t)) for t in texts[1:]),
                "refinements": sum(bool(REFINE.search(t)) and not CORRECTION.search(t) for t in texts[1:]),
                "checked": any(CHECK.search(t) for t in texts),
                "build": category in BUILD_CATEGORIES,
                "retyped": sum(bool(STYLE.search(t)) for t in texts),
                "skilled": session in a.skill_sessions,
                "restart": False,
                **agent_checks(a.timeline.get(session, [])),
                **_usage_fields(metered.get((a.name, session))),
            })
    # a restart: same tool and kind of work, within 48h, opening on mostly the same words
    out.sort(key=lambda r: r["start"])
    for i, r in enumerate(out):
        words = content_words(r["first"])
        for prev in reversed(out[:i]):
            if (r["start"] - prev["start"]).total_seconds() > 48 * 3600:
                break
            if prev["source"] != r["source"] or prev["category"] != r["category"]:
                continue
            pw = content_words(prev["first"])
            if words and pw and len(words & pw) / len(words | pw) >= 0.35:
                r["restart"] = True
                break
    return out


def _usage_fields(m):
    if not m:
        return {}
    return {"usage": m["usage"], "reread": m["reread"], "peak": m["peak"], "start_tokens": m["start_tokens"],
            "turns": m.get("turns", 0), "long": m["peak"] > LONG_LINE}


def session_cube(sessions):
    """Additive weekly rows by source and kind of work, so the report can filter and recompute."""
    keys = ("sessions", "prompts", "briefed", "corrections", "refinements", "build", "checked",
            "restarts", "retyped", "skilled", "edited", "agent_checked", "unchecked_ships",
            "metered", "usage", "long_usage", "start_tokens")
    cube = collections.defaultdict(lambda: dict.fromkeys(keys, 0))
    for r in sessions:
        row = cube[(week_of(r["start"]), r["source"], r["category"])]
        row["sessions"] += 1
        row["prompts"] += r["prompts"]
        row["briefed"] += r["briefed"]
        row["corrections"] += r["corrections"]
        row["refinements"] += r["refinements"]
        row["build"] += r["build"]
        row["checked"] += r["checked"] and r["build"]
        row["restarts"] += r["restart"]
        row["retyped"] += r["retyped"]
        row["skilled"] += r["skilled"]
        row["edited"] += r["edited"]
        row["agent_checked"] += r["agent_checked"]
        row["unchecked_ships"] += r["unchecked_ships"]
        if r.get("usage"):
            row["metered"] += 1
            row["usage"] += round(r["usage"])
            row["long_usage"] += round(r["usage"]) if r["long"] else 0
            row["start_tokens"] += r["start_tokens"]
    return [{"week": w, "source": s, "category": c, **v} for (w, s, c), v in sorted(cube.items())]


def label_samples(sessions, n=12):
    """Recent sessions with their labels, for the coach to spot-check the classifier."""
    recent = sorted(sessions, key=lambda r: r["start"], reverse=True)[:n]
    return [{"source": r["source"], "category": r["category"], "briefed": r["briefed"],
             "restart": r["restart"], "first": clean(r["first"], 160)} for r in recent]


def checks_summary(sessions, n=6):
    """Agent-side checks for the window. Only Claude Code and Codex log tool calls."""
    rows = [r for r in sessions if r["source"] in ("claude_code", "codex")]
    edited = [r for r in rows if r["edited"]]
    samples = [{"source": r["source"], "date": r["start"].date().isoformat(), "first": clean(r["first"], 120), **s}
               for r in sorted(rows, key=lambda r: r["start"], reverse=True) for s in r["unchecked_samples"]]
    return {"sessions_with_edits": len(edited),
            "agent_checked": sum(r["agent_checked"] for r in edited),
            "unchecked_ships": sum(r["unchecked_ships"] for r in rows),
            "unchecked_samples": samples[:n],
            "note": "Counts checks the agent ran (tests, builds, lint, browser, a verifying subagent). "
                    "Checks you did yourself outside the session don't show up."}


def installed_skills(home):
    found = {}
    for pat in (".claude/skills/*/SKILL.md", ".codex/skills/*/SKILL.md",
                ".agents/skills/*/SKILL.md", ".claude/plugins/**/skills/*/SKILL.md"):
        for p in glob.glob(os.path.join(home, pat), recursive=True):
            name = os.path.basename(os.path.dirname(p))
            found[name] = {
                "path": p.replace(home, "~"),
                "days_since_edit": int((dt.datetime.now().timestamp() - os.path.getmtime(p)) / 86400),
                "lines": sum(1 for _ in open(p, encoding="utf-8", errors="ignore")),
            }
    return found


def context_files(home):
    out = {}
    for label, rel in (("claude_global", ".claude/CLAUDE.md"), ("codex_global", ".codex/AGENTS.md"),
                       ("agents_global", ".agents/AGENTS.md"), ("cursor_rules", ".cursor/rules"),
                       ("antigravity_global", ".gemini/GEMINI.md")):
        p = os.path.join(home, rel)
        if os.path.isdir(p):
            files = sorted(glob.glob(os.path.join(p, "*.md*")))
            blob = b"".join(open(f, "rb").read() for f in files)
        elif os.path.isfile(p):
            blob = open(p, "rb").read()
        else:
            out[label] = None
            continue
        out[label] = {"path": rel, "bytes": len(blob),
                      "sha1": hashlib.sha1(blob).hexdigest()[:10],
                      "days_since_edit": int((dt.datetime.now().timestamp() - os.path.getmtime(p)) / 86400)}
    settings = os.path.join(home, ".claude/settings.json")
    try:
        out["claude_cleanupPeriodDays"] = json.load(open(settings)).get("cleanupPeriodDays", 30)
    except Exception:
        out["claude_cleanupPeriodDays"] = "default (30)"
    return out


def repeated_phrases(prompts, n=6, min_count=3):
    """Word n-grams (n..n+2) that recur across 3+ distinct sessions: likely restated rules."""
    by_gram = collections.defaultdict(set)
    for _, session, text in prompts:
        words = re.findall(r"[a-z']+", SECRET.sub(" ", text).lower())
        grams = set()
        for size in (n, n + 2):
            for i in range(len(words) - size + 1):
                grams.add(" ".join(words[i:i + size]))
        for g in grams:
            by_gram[g].add(session)
    hits = sorted(((len(s), g) for g, s in by_gram.items() if len(s) >= min_count), reverse=True)
    kept = []
    for c, g in hits:
        gw = set(g.split())
        # drop near-duplicates: overlapping windows of the same sentence
        if not any(len(gw & set(k.split())) / len(gw) > 0.5 for _, k in kept):
            kept.append((c, g))
    return [{"phrase": g, "sessions": c} for c, g in kept[:10]]


def summarize(a, n_samples):
    prompts = a.prompts
    lengths = [len(t) for _, _, t in prompts]
    by_session = collections.Counter(s for _, s, _ in prompts)
    corrections = [p for p in prompts if CORRECTION.search(p[2])]
    firsts = {}
    for ts, s, t in sorted(prompts, key=lambda p: (p[1], p[0] or dt.datetime.min.replace(tzinfo=dt.timezone.utc))):
        firsts.setdefault(s, t)
    longest = sorted(by_session.items(), key=lambda kv: -kv[1])[:3]
    return {
        "sessions": len(a.sessions),
        "active_days": len(a.days),
        "prompts": len(prompts),
        "median_prompt_chars": sorted(lengths)[len(lengths) // 2] if lengths else 0,
        "short_prompt_share": round(sum(l < 40 for l in lengths) / len(lengths), 2) if lengths else 0,
        "one_turn_sessions": sum(1 for c in by_session.values() if c == 1),
        "peak_hours": [h for h, _ in a.hours.most_common(3)],
        "top_tools": a.tools.most_common(10),
        "skills_used": a.skills.most_common(),
        "slash_commands": a.slash.most_common(10),
        "compactions": a.compactions,
        "correction_count": len(corrections),
        "correction_samples": [clean(t, 200) for _, _, t in corrections[:n_samples]],
        "opening_prompt_samples": [clean(t) for t in list(firsts.values())[:n_samples]],
        "longest_sessions_turns": [c for _, c in longest],
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=7)
    ap.add_argument("--home", default=os.path.expanduser("~"))
    ap.add_argument("--samples", type=int, default=5)
    ap.add_argument("--out")
    ap.add_argument("--trend", action="store_true",
                    help="add a weekly series (use with --days 365) for 12-month trends")
    ap.add_argument("--claude-export", help="path to claude.ai export conversations.json")
    ap.add_argument("--chatgpt-export", help="path to ChatGPT export conversations.json")
    ap.add_argument("--gemini-export", help="path to Google Takeout My Activity/Gemini Apps/MyActivity.json")
    args = ap.parse_args()
    since = dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=args.days)

    aggs = [claude_code(args.home, since), codex(args.home, since), cursor(args.home, since),
            antigravity(args.home, since)]
    if args.claude_export:
        aggs.append(claude_export(os.path.expanduser(args.claude_export), since))
    if args.chatgpt_export:
        aggs.append(chatgpt_export(os.path.expanduser(args.chatgpt_export), since))
    if args.gemini_export:
        aggs.append(gemini_export(os.path.expanduser(args.gemini_export), since))
    all_prompts = [p for a in aggs for p in a.prompts]
    skills = installed_skills(args.home)
    used = collections.Counter()
    for a in aggs:
        used.update(a.skills)
        used.update({k.split(":")[-1]: v for k, v in a.slash.items()})
    result = {
        "window_days": args.days,
        "generated": dt.datetime.now().isoformat(timespec="minutes"),
        "tools": {a.name: summarize(a, args.samples) for a in aggs},
        "repeated_instructions": repeated_phrases(all_prompts),
        "installed_skills": skills,
        "unused_skills_this_window": sorted(s for s in skills if used[s] == 0),
        "context_files": context_files(args.home),
        "coverage": coverage(aggs),
    }
    metered, limit_hits = usage_by_session(args.home, since)
    sessions = sessions_of(aggs, metered)
    result["usage"] = usage_summary([r for r in sessions if r["start"] >= since], metered, limit_hits, args.home)
    result["agent_checks"] = checks_summary([r for r in sessions if r["start"] >= since])
    result["label_samples"] = label_samples(sessions)
    result["scope"] = data_scope(args.home, aggs, {"claude": args.claude_export, "chatgpt": args.chatgpt_export,
                                                   "gemini": args.gemini_export})
    if args.trend:
        result["cube"] = session_cube(sessions)
    text = json.dumps(result, indent=2, default=str)
    if args.out:
        with open(args.out, "w") as f:
            f.write(text)
    print(text)


if __name__ == "__main__":
    main()
