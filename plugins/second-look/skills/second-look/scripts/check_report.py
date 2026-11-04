#!/usr/bin/env python3
"""Check a second look report against the second look design system before publishing.

Usage: python3 check_report.py REPORT.html [--template report-template.html]
Exit 0 when it passes; prints each problem and exits 1 otherwise.
"""
import argparse, datetime as dt, decimal, hashlib, html as htmllib, json, math, os, re, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_TEMPLATE = os.path.join(os.path.dirname(HERE), "report-template.html")

FONT_LINK = "family=Familjen+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500"
REQUIRED_IDS = ["start-here", "glance", "part-1", "part-2", "part-3", "trends", "report-issue", "toc"]
SECTION_ORDER = ["part-2", "part-3", "part-1", "report-issue"]
REQUIRED_TEXT = [
    "Learn from the way you work with AI",
    "Improve your prompts and setup",
    "Keep your skills current",
    "How your habits are changing",
    "Report an issue",
    "github.com/txz8096/second-look/issues/new",
]
# how sure, for patterns, fixes and skill findings alike
CHIPS = {"Sure", "Likely", "Hunch"}
PILLS = {
    "Stale", "Review", "Minor", "Current", "Behind", "Broken", "Duplicate", "Not checked",
    "High", "Medium", "Low", "Keep", "Revise", "Drop",
}
FORBIDDEN = {
    "Personalize goals": "goals box was removed",
    'id="goal-': "goals box was removed",
    'id="more-charts"': "the More metrics dropdown was replaced by chart groups",
    "Change now": "slot labels were removed",
    'class="slot"': "slot labels were removed",
    "<dt>How sure</dt>": "the How sure row was removed from cards",
    "How we know this": "removed from cards",
    "How we'll know it worked": "removed from Try this blocks",
    'id="expand-all"': "Expand all / Collapse all was removed",
    'class="sample"': "no sample-data chips on real reports",
    'data-theme="light"': "the report is dark only",
    "Part 1 of 3": "no part numbers",
    "Compare the fixes": "merged into the plan; each fix is its Try block plus one plan row",
    "review will check</span>": "the separate next-review fold was merged into the plan rows",
    'class="diff"': "skill fixes are prompts they can paste into their AI tool, not diffs",
    "Geist": "old font",
    '"Inter"': "old font",
}

# left over from the template's sample; the template itself is exempt
SAMPLE = {
    "CUBE = sampleCube()": "the charts still use the template's sample data; replace sampleCube() with the collector's cube",
    "Streak redesign starts": "MILESTONES still holds the template's sample milestones; use the person's own, or []",
    "Sample data. A real report": "the footer still says the page uses sample data",
    "Your sessions start clearer than a year ago": "the summary is still the template's sample text",
    "Check the job tracker and summarize what changed": "the automation list still holds the template's sample rows",
}
WEEK = re.compile(r"\d{4}-\d{2}-\d{2}$")
# the source ids the template's script can draw; any other id stops every chart
SOURCES = {"claude_ai", "claude_code", "codex", "cursor", "antigravity", "chatgpt", "gemini_web"}


# words that don't belong on the page; quotes from their sessions and code blocks are left out of this check
# a hyphen, dot or slash joins a word into a name (chat-summary, tokens.json), which belongs to them
LINT = [
    (r"(?<![\w./-])(crucial|robust|seamless|groundbreaking|transformative|vibrant|leverage|synergy|paramount|multifaceted|myriad|delve|tapestry)(?![\w/-]|\.\w)", "a banned word"),
    (r"\bnot just\b", "\"not just\" phrasing; state the point"),
    (r"\bthe coach\b", "say second look"),
    (r"(?<![\w./-])(?:chats?|conversations?)(?![\w/-]|\.\w)", "say session"),
    (r"(?<![\w./-])tokens?(?![\w/-]|\.\w)", "say usage, or describe the size"),
    (r"(?<![\w./-])cycles?(?![\w/-]|\.\w)", 'say "since your last review", or "last 4 weeks" for a 4-week number'),
]


def lint_problems(html):
    text = re.sub(r"<(style|script|svg|pre|blockquote|code|title|q)\b.*?</\1>", " ", html, flags=re.S | re.I)
    text = re.sub(r"<!--.*?-->", " ", text, flags=re.S)
    text = htmllib.unescape(re.sub(r"<[^>]+>", " ", text))
    text = re.sub(r"“[^”]*”|‘[^’]*’|„[^“”]*[“”]|「[^」]*」|\"[^\"\n]*\"", " ", text)
    problems = []
    for pattern, why in LINT:
        for word in sorted({m.group(0) for m in re.finditer(pattern, text, re.I)}):
            problems.append(f'found "{word}" in the page text: {why}. If it is a name or their own words, keep it: put a name in <code> and their words in curly quotes')
    return problems


def js_round(v):
    return math.floor(v + 0.5)


def signed(r, unit):
    return ("+" if r > 0 else "−" if r < 0 else "") + unit(abs(r))


# the six glance rows, in order, worked out the way the trends script works them out.
# The last field is what the row's sessions are counted from; Sessions per week counts itself, so it has no floor
GLANCE = [
    ("Sessions per week", "sessions", None, "count", None),
    ("Briefed starts", "briefed", "briefable", "pct", "briefable"),
    ("Corrections", "corrections", "prompts", "per10", "sessions"),
    ("Restarts", "restarts", "sessions", "pct", "sessions"),
    ("Rules retyped per week", "retyped", None, "count", "sessions"),
    ("Long-session share", "long_usage", "usage", "pct", "metered"),
]
# a change needs this many sessions in each 4-week window, as in the charts and tables
MIN_CHANGE = 10


def tenths(v):  # toFixed(1): an exact tie rounds up
    return str(decimal.Decimal(v).quantize(decimal.Decimal("0.1"), rounding=decimal.ROUND_HALF_UP))


def count_text(v):  # a fraction under 10 keeps its decimal, so a 4-week average never rounds into a change
    return tenths(v) if v < 10 and js_round(v * 10) % 10 else f"{js_round(v):,}"


def plain(x):  # toLocaleString on a number with at most one decimal
    return f"{x:,.1f}".rstrip("0").rstrip(".")


def fmt_value(kind, v):
    return {"pct": lambda: f"{js_round(v * 100)}%", "per10": lambda: tenths(v * 10), "count": lambda: count_text(v)}[kind]()


def change(kind, a, b):
    """What the "Change" column prints and whether it counts as moved, from the two rounded numbers."""
    if kind == "pct":
        r = js_round(b * 100) - js_round(a * 100)
        return signed(r, lambda x: f"{x} pt" + ("" if x == 1 else "s")), abs(r) >= 2
    if kind == "per10":
        r = round(float(tenths(b * 10)) - float(tenths(a * 10)), 1)
        return signed(r, lambda x: f"{x:.1f}"), r != 0
    sa, sb = (float(count_text(x).replace(",", "")) for x in (a, b))
    r = round(sb - sa, 1)
    if sa < 10:
        return signed(r, plain), abs(r) >= 0.5
    p = js_round(r / sa * 100)
    return signed(p, lambda x: f"{x}%"), abs(p) >= 5


def glance_numbers(cube, end):
    """Each row's last 4 weeks, the 4 before and the change: the numbers in the charts' table."""
    end -= dt.timedelta(days=end.weekday())
    start = end - dt.timedelta(weeks=51)
    # history saved before "briefable" existed counts every session
    rows = [(to_date(r["week"]), {**r, "briefable": r.get("briefable", r.get("sessions"))}) for r in cube]
    rows = [(d, r) for d, r in rows if d and start <= d <= end]
    out = []
    for name, num, den, kind, sample in GLANCE:
        weeks_with = sorted({d for d, r in rows if (r.get(den or "sessions") or 0) > 0})
        first = weeks_with[0] if weeks_with else None

        def window(a, b):
            part = [r for d, r in rows if a <= d <= b]
            n = sum(r.get(num) or 0 for r in part)
            if den:
                t = sum(r.get(den) or 0 for r in part)
                if den in ("sessions", "briefable") and t < 5:
                    return None
                return n / t if t else None
            if first is None:
                return None
            weeks = sum(1 for k in range(4) if a + dt.timedelta(weeks=k) >= first)
            return n / weeks if weeks else None

        now = window(end - dt.timedelta(weeks=3), end)
        then = window(end - dt.timedelta(weeks=7), end - dt.timedelta(weeks=4)) if first and first <= end - dt.timedelta(weeks=7) else None

        def enough(a, b):
            return sample is None or sum(r.get(sample) or 0 for d, r in rows if a <= d <= b) >= MIN_CHANGE

        comparable = then is not None and enough(end - dt.timedelta(weeks=3), end) and enough(end - dt.timedelta(weeks=7), end - dt.timedelta(weeks=4))
        out.append((name, kind, now, then, comparable))
    return out


def glance_problems(block, cube, end):
    """A pasted cube fixes the glance: same windows and same numbers as the charts' table."""
    rows = re.findall(r'class="stat( moved)?">.*?<b>(.*?)</b>(?:<span class="delta">(.*?)</span>)?', block, re.S)
    if len(rows) != 6:
        return []  # the row count has its own message
    problems = []
    for (moved, value, delta), (name, kind, now, then, comparable) in zip(rows, glance_numbers(cube, end)):
        value, delta = value.strip(), delta.strip()
        if value == "Not measured" and now is not None:
            problems.append(f'the glance says {name} is "Not measured"; the cube\'s last 4 weeks give {fmt_value(kind, now)}')
            continue
        if now is None:
            if value != "Not measured" and value:
                problems.append(f'the glance says {name} is {value}, but the cube has too little in the last 4 weeks to show it; write "Not measured" or leave it empty')
            continue
        want = fmt_value(kind, now)
        if value != want:
            problems.append(f"the glance says {name} is {value}; the cube's last 4 weeks give {want}")
        if not comparable:
            if delta:
                problems.append(f'the glance shows a change for {name} ({delta}), but a change needs {MIN_CHANGE} sessions in each of two 4-week windows; leave it empty')
            if moved:
                problems.append(f'the {name} row is marked moved with nothing to compare; use class="stat"')
            continue
        want_d, want_moved = change(kind, then, now)
        if delta != want_d:
            problems.append(f'the glance says {name} changed by "{delta}"; the cube gives "{want_d}"')
        if want_moved != bool(moved):
            problems.append(f'the {name} row should use class="{"stat moved" if want_moved else "stat"}": a change marks the row only past the noise floor')
    return problems


def window_label_problems(block, end):
    def day(d):
        return f"{d.strftime('%b')} {d.day}"
    end -= dt.timedelta(days=end.weekday())
    now = f"{day(end - dt.timedelta(weeks=3))} – {day(end + dt.timedelta(days=6))}"
    then = f"{day(end - dt.timedelta(weeks=7))} – {day(end - dt.timedelta(weeks=4) + dt.timedelta(days=6))}"
    label = re.search(r'<span class="muted">(.*?)</span>', block, re.S)
    text = label.group(1) if label else ""
    if now not in text or (" vs " in text and then not in text):
        return [f'the glance label should read "{now} vs {then}" (or "{now}" when nothing earlier exists), from END']
    return []


def to_date(s):
    try:
        return dt.date.fromisoformat(s)
    except ValueError:
        return None


def cube_problems(cube, end):
    """The data has to reach the report's END, and every id has to be one the script knows."""
    problems = []
    unknown = sorted({str(r["source"]) for r in cube if str(r["source"]) not in SOURCES})
    if unknown:
        problems.append(f"CUBE has sources the script can't draw: {', '.join(unknown)}")
    keys = [(r["week"], r["source"], r["category"]) for r in cube]
    repeated = len(keys) - len(set(keys))
    if repeated:
        problems.append(f"CUBE repeats {repeated} rows for the same week, tool and kind of work, which double-counts them; a week and tool in the cube replaces the same one in history.json")
    if not end:
        return problems
    end -= dt.timedelta(days=end.weekday())
    start = end - dt.timedelta(weeks=51)
    days = [to_date(r["week"]) for r in cube if (r.get("sessions") or 0) > 0]
    days = [d for d in days if d]
    if not any(start <= d <= end for d in days):
        problems.append(f"no CUBE row with sessions falls in the 52 weeks up to END ({end}), so every chart would be empty")
    elif max(days) > end + dt.timedelta(days=7):
        problems.append(f"END ({end}) is stale: the CUBE runs to {max(days)}, so its newest weeks would be dropped; END is the Monday of the last complete week")
    # the week in progress reads as a quiet full week. A new user with nothing earlier has only that week to show
    today = dt.date.today()
    if end >= today - dt.timedelta(days=today.weekday()) and any(d < end for d in days):
        problems.append(f"END ({end}) is the week in progress or later, so a part week would read as a quiet full week; END is the Monday of the last complete week")
    return problems


def sampled_glance(html):
    g = re.search(r'id="glance".*?</section>', html, re.S)
    return bool(g) and "Sample of" in g.group(0)


def glance_is_scoped(html):
    tag = re.search(r'<section\b[^>]*\bid="glance"[^>]*>', html)
    return bool(tag) and "data-scoped" in tag.group(0)


def summary_problems(html):
    """The summary may tell the year's story, with its own dates; every number shown with a change stays on the 4-week window."""
    m = re.search(r'<p class="summary">(.*?)</p>', html, re.S)
    if not m:
        return []
    text = htmllib.unescape(re.sub(r"<[^>]+>", " ", re.sub(r'<span class="term-card".*?</span>', " ", m.group(1), flags=re.S)))
    if re.search(r"\byear ago\b", text) and not re.search(r"\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.? (\d{1,2}, )?20\d\d\b", text):
        return ['the summary says "a year ago" with no date; give the earlier number its own month and year ("up from three in ten in Nov 2025")']
    return []


def script_problems(html):
    """The trends data slot and, when node is installed, a syntax check of the inline script."""
    problems = []
    if not re.search(r'const END = "\d{4}-\d{2}-\d{2}";', html):
        problems.append('the trends script needs END = "YYYY-MM-DD", the Monday of the last complete week')
    end_m = re.search(r'const END = "(\d{4}-\d{2}-\d{2})";', html)
    end = to_date(end_m.group(1)) if end_m else None
    if end_m and not end:
        problems.append(f'END ("{end_m.group(1)}") isn\'t a real date')
    scope_m = re.search(r"const SCOPE = (\{.*?\});\n", html, re.S)
    if scope_m:
        try:
            ids = [str(s.get("id")) for s in json.loads(scope_m.group(1)).get("sources", [])]
        except (ValueError, AttributeError):
            ids = []  # not plain JSON; the syntax check below still runs
        unknown = sorted(set(ids) - SOURCES)
        if unknown:
            problems.append(f"SCOPE has sources the script can't draw: {', '.join(unknown)}")
    at = html.find("const CUBE = ")
    if at == -1:
        problems.append("the trends script has no CUBE; keep the template's data slot")
    elif html[at + 13] == "[":
        try:
            cube, _ = json.JSONDecoder().raw_decode(html, at + 13)
        except ValueError:
            cube = None  # not plain JSON; the syntax check below still runs
        if cube is not None:
            bad = [r for r in cube if not (isinstance(r, dict) and WEEK.match(str(r.get("week", ""))) and r.get("source") and r.get("category"))]
            if bad:
                problems.append(f'{len(bad)} CUBE rows lack the collector\'s "week" (YYYY-MM-DD), "source" and "category"; paste the cube as collect.py writes it')
            elif cube or not sampled_glance(html):  # a claude.ai run with no export has a sampled glance and no cube
                problems += cube_problems(cube, end)
    node = shutil.which("node")
    scripts = re.findall(r"<script>(.*?)</script>", html, re.S)
    if node and scripts:
        with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
            f.write("\n".join(scripts))
        try:
            run = subprocess.run([node, "--check", f.name], capture_output=True, text=True, timeout=30)
        finally:
            os.unlink(f.name)
        if run.returncode != 0:
            err = next((l for l in run.stderr.splitlines() if "Error" in l), run.stderr.strip()[:200])
            problems.append(f"the inline script has a syntax error, so no charts will draw: {err}")
    return problems


def style_of(html):
    m = re.findall(r"<style>(.*?)</style>", html, re.S)
    return m


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("report")
    ap.add_argument("--template", default=DEFAULT_TEMPLATE)
    a = ap.parse_args()
    html = open(a.report, encoding="utf-8").read()
    # charts drawn by prerender.py are the template script's own output; check only what was written
    html = re.sub(r'(<section id="trends" data-static="">).*?(</section>)', r"\1\2", html, count=1, flags=re.S)
    problems = []

    styles = style_of(html)
    if len(styles) != 1:
        problems.append(f"expected exactly one <style> block, found {len(styles)}")
    if os.path.exists(a.template):
        tstyle = style_of(open(a.template, encoding="utf-8").read())
        if styles and tstyle:
            h = lambda s: hashlib.sha256(s.encode()).hexdigest()
            if h(styles[0]) != h(tstyle[0]):
                problems.append("the <style> block differs from report-template.html; copy it unchanged")
    else:
        problems.append(f"template not found at {a.template}; can't compare styles")

    if not re.match(r"\s*<!doctype html>", html, re.I):
        problems.append("missing <!doctype html> on the first line; without it the browser lays the page out in quirks mode")
    if not re.search(r'<html lang="', html):
        problems.append('missing <html lang="..."> from the template')
    if not re.search(r'<main[ >]', html):
        problems.append('missing <main class="wrap"> from the template')
    if not re.search(r'<meta charset="utf-8">', html, re.I):
        problems.append('missing <meta charset="utf-8">; without it browsers garble the dashes, dots and quotes')
    if not re.search(r'<meta name="viewport" content="width=device-width', html, re.I):
        problems.append('missing <meta name="viewport">; without it phones shrink the report to desktop width and the text is too small to read')
    if FONT_LINK not in html:
        problems.append("missing the Google Fonts link for Familjen Grotesk and IBM Plex Mono")
    if 'class="brand-logo"' not in html:
        problems.append("missing the second look logo in the header")
    if 'rel="icon"' not in html:
        problems.append("missing the favicon link from the template's <head>")
    for i in REQUIRED_IDS:
        if f'id="{i}"' not in html:
            problems.append(f'missing section id="{i}"')
    if 'id="plan"' not in html:
        problems.append('missing the plan (section id="plan") at the end of part 2')
    cards = re.findall(r'<article\b[^>]*class="icard[^"]*"[^>]*>\s*<div class="ic-head">(?:<span class="rank">(\d+)</span>)?', html)
    if cards != [str(i + 1) for i in range(len(cards))]:
        problems.append('number the pattern cards 1, 2, 3 in order: <span class="rank">1</span> first in each .ic-head, matching the plan')
    for t in REQUIRED_TEXT:
        if t not in html:
            problems.append(f'missing "{t}"')
    # prompts, then skills, then habits last, then the report-an-issue line
    order = [html.find(f'id="{i}"') for i in SECTION_ORDER]
    if -1 not in order and order != sorted(order):
        problems.append("parts out of order: prompts and setup, skills, habits, then report an issue")
    markup = re.sub(r"<style>.*?</style>", "", html, flags=re.S)
    for needle, why in FORBIDDEN.items():
        if needle in markup:
            problems.append(f'found "{needle}": {why}')
    if re.search(r"<script[^>]+src=", html):
        problems.append("external scripts aren't allowed; keep the template's inline script")
    is_template = os.path.exists(a.template) and os.path.samefile(a.report, a.template)
    if not is_template:
        for needle, why in SAMPLE.items():
            if needle in markup:
                problems.append(why)
    problems += script_problems(html)

    for label in re.findall(r'class="conf [a-z]+">([^<]+)<', html):
        if label.strip() not in CHIPS:
            problems.append(f'unknown how-sure chip "{label.strip()}"')
    for label in re.findall(r'class="pill [a-z0-9]+">([^<]+)<', html):
        if label.strip() not in PILLS:
            problems.append(f'unknown state pill "{label.strip()}"')

    # status colours never grade the user's habits
    if re.search(r'class="[^"]*\b(up-bad|down-good|chg-good|chg-bad)\b', html):
        problems.append("green/red change classes used on the user's numbers; changes are plain text")

    problems += lint_problems(markup)
    problems += summary_problems(html)

    # the glance needs six stats, each with a meaning line
    g = re.search(r'id="glance".*?</section>', html, re.S)
    if g:
        # a scoped or sampled review reads other rows than the cube, so only its row count is checked
        free = glance_is_scoped(html) or sampled_glance(html)
        # its heading names its own scope, so only a plain review must say "Last 4 weeks"
        if not free and "Last 4 weeks at a glance" not in g.group(0):
            problems.append('missing "Last 4 weeks at a glance"; a review that isn\'t scoped or sampled keeps that heading')
        end_m = re.search(r'const END = "(\d{4}-\d{2}-\d{2})";', html)
        end = to_date(end_m.group(1)) if end_m else None
        if end and not free:
            problems += window_label_problems(g.group(0), end)
            at = html.find("const CUBE = ")
            if at != -1 and html[at + 13] == "[":
                try:
                    cube, _ = json.JSONDecoder().raw_decode(html, at + 13)
                    problems += glance_problems(g.group(0), cube, end)
                except (ValueError, TypeError, KeyError, AttributeError):
                    pass  # the data slot has its own messages
        stats = len(re.findall(r'class="stat(?: moved)?"', g.group(0)))
        whys = g.group(0).count('class="why"')
        if stats != 6 or whys != 6:
            problems.append(f"the glance needs 6 stats each with a meaning line (found {stats} stats, {whys} lines)")
        cards = g.group(0).count('class="term-card"')
        if cards < 5:
            problems.append(f"each habit stat in the glance needs its term card from the template (found {cards} of 5)")

    if problems:
        try:
            import signal
            signal.signal(signal.SIGPIPE, signal.SIG_DFL)
        except (AttributeError, ValueError):
            pass
        print("Design check failed:")
        for p in problems:
            print(" -", p)
        sys.exit(1)
    print("Design check passed.")


if __name__ == "__main__":
    main()
