#!/usr/bin/env python3
"""Evidence collector for the second-look skill.

Reads local session logs from Claude Code, Codex and Cursor and prints a compact JSON
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
CODING_TOOLS = {"claude_code", "codex", "cursor"}
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
        return dt.datetime.fromisoformat(str(v).replace("Z", "+00:00"))
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
    # de-duplicate: codex logs a user turn as both message and user_message
    seen, uniq = set(), []
    for t in a.prompts:
        k = (t[1], t[2][:200])
        if k not in seen:
            seen.add(k); uniq.append(t)
    a.prompts = uniq
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


def sessions_of(aggs):
    out = []
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


def session_cube(sessions):
    """Additive weekly rows by source and kind of work, so the report can filter and recompute."""
    keys = ("sessions", "prompts", "briefed", "corrections", "refinements", "build", "checked",
            "restarts", "retyped", "skilled")
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
    return [{"week": w, "source": s, "category": c, **v} for (w, s, c), v in sorted(cube.items())]


def label_samples(sessions, n=12):
    """Recent sessions with their labels, for the coach to spot-check the classifier."""
    recent = sorted(sessions, key=lambda r: r["start"], reverse=True)[:n]
    return [{"source": r["source"], "category": r["category"], "briefed": r["briefed"],
             "restart": r["restart"], "first": clean(r["first"], 160)} for r in recent]


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
                       ("agents_global", ".agents/AGENTS.md"), ("cursor_rules", ".cursor/rules")):
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
    args = ap.parse_args()
    since = dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=args.days)

    aggs = [claude_code(args.home, since), codex(args.home, since), cursor(args.home, since)]
    if args.claude_export:
        aggs.append(claude_export(os.path.expanduser(args.claude_export), since))
    if args.chatgpt_export:
        aggs.append(chatgpt_export(os.path.expanduser(args.chatgpt_export), since))
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
    sessions = sessions_of(aggs)
    result["label_samples"] = label_samples(sessions)
    if args.trend:
        result["cube"] = session_cube(sessions)
    text = json.dumps(result, indent=2, default=str)
    if args.out:
        with open(args.out, "w") as f:
            f.write(text)
    print(text)


if __name__ == "__main__":
    main()
