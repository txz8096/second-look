#!/usr/bin/env python3
"""Check a second look report against the second look design system before publishing.

Usage: python3 check_report.py REPORT.html [--template report-template.html]
Exit 0 when it passes; prints each problem and exits 1 otherwise.
"""
import argparse, datetime as dt, hashlib, html as htmllib, json, os, re, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_TEMPLATE = os.path.join(os.path.dirname(HERE), "report-template.html")

FONT_LINK = "family=Familjen+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500"
REQUIRED_IDS = ["overview", "side", "part-1", "part-2", "part-3", "trends", "report-issue"]
SECTION_ORDER = ["overview", "part-2", "part-3", "part-1"]
REQUIRED_TEXT = [
    "How you brief AI and set up your apps",
    "Keep your skills current",
    "How your habits are changing",
    "Report an issue",
    "github.com/txz8096/second-look/issues/new",
]
# how sure, for patterns, fixes and skill findings alike
CHIPS = {"Sure", "Likely", "Hunch"}
PILLS = {
    "Stale", "Review", "Minor", "Current", "Behind", "Broken", "Duplicate", "Not checked",
    "High", "Medium", "Low",
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
    "Part 1 of 3": "no part numbers",
    'class="last-list"': "fixes from the last review now sit in .last-group cards",
    'id="glance"': "the at-a-glance table was removed; the numbers live in the charts",
    'id="start-here"': "the Start here line was removed; the plan says where to start",
    'id="toc"': "the floating contents menu was replaced by the sidebar",
    "Compare the fixes": "merged into the plan; each fix is its Try block plus one plan row",
    "review will check</span>": "the separate next-review fold was merged into the plan rows",
    'class="diff"': "skill fixes are prompts they can paste into their AI app, not diffs",
    "Geist": "old font",
    '"Inter"': "old font",
}

# left over from the template's sample; the template itself is exempt
SAMPLE = {
    "CUBE = sampleCube()": "the charts still use the template's sample data; replace sampleCube() with the collector's cube",
    "Streak redesign starts": "MILESTONES still holds the template's sample milestones; use the person's own, or []",
    "This is a sample report": "the sidebar note still says this is a sample report",
    "report-opt-sample": "the report menu still holds the template's sample dates; run report_menu.py, or on claude.ai use a plain label",
    "you’ve gotten better at explaining what you want": "the summary is still the template's sample text",
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
    # the session term card defines "session" in the one word the page otherwise avoids
    text = text.replace("One conversation with an AI, from your first message until you start a new one.", " ")
    problems = []
    for pattern, why in LINT:
        for word in sorted({m.group(0) for m in re.finditer(pattern, text, re.I)}):
            problems.append(f'found "{word}" in the page text: {why}. If it is a name or their own words, keep it: put a name in <code> and their words in curly quotes')
    return problems


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
        problems.append(f"CUBE repeats {repeated} rows for the same week, app and kind of work, which double-counts them; a week and app in the cube replaces the same one in history.json")
    for row in cube:
        if "days" not in row:
            continue
        days = row["days"]
        week = to_date(row["week"])
        if not isinstance(days, list) or not week:
            problems.append("CUBE daily totals must be a list within a valid week")
            continue
        dates = [to_date(str(day.get("date", ""))) if isinstance(day, dict) else None for day in days]
        if any(day is None or not week <= day <= week + dt.timedelta(days=6) for day in dates) or len(dates) != len(set(dates)):
            problems.append("CUBE daily dates must be unique and fall within their parent week")
            continue
        for key, value in row.items():
            if not isinstance(value, (int, float)):
                continue
            values = [day.get(key, 0) for day in days]
            if any(not isinstance(v, (int, float)) or v < 0 for v in values) or abs(sum(values) - value) > 1e-6:
                problems.append(f"CUBE daily {key} totals do not match their weekly total")
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


def summary_problems(html):
    """The summary is plain words: what happened, with the numbers left to the charts."""
    m = re.search(r'<p class="summary">(.*?)</p>', html, re.S)
    if not m:
        return []
    problems = []
    if 'class="term"' in m.group(1):
        problems.append("the summary has term cards; write it in everyday words and leave the terms to the cards and charts")
    text = htmllib.unescape(re.sub(r"<[^>]+>", " ", m.group(1)))
    if re.search(r"\d\s*(%|pts?\b|percent\b|per 10\b)|\bin (ten|10)\b", text):
        problems.append("the summary quotes a metric; say what happened in words and leave the numbers to the charts")
    return problems


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
            elif cube:  # a claude.ai run with no export has no cube
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
    no_findings = bool(re.search(r'<div[^>]*id="part-2"[^>]*data-findings-state="none"', html))
    if 'id="plan"' not in html and not no_findings:
        problems.append('missing the plan (section id="plan") at the end of part 2')
    tries, saves = html.count('<section class="try"'), html.count('class="try-saves"')
    if tries != saves:
        problems.append(f'each Try this block needs one <p class="try-saves"> line saying what it saves (found {saves} of {tries})')
    for line in re.findall(r'<p class="try-saves">(.*?)</p>', html, re.S):
        if re.search(r"\babout\b", line, re.I) and 'class="saves-how"' not in line:
            problems.append(f'this saving needs its working in a <span class="saves-how">: "{re.sub(r"<[^>]+>", "", line).strip()}"')
    rows = len(re.findall(r'<li><a class="row-link"', html))
    if rows != html.count('class="plan-saves"'):
        problems.append('each plan row needs a <span class="plan-saves"> saying what the fix saves')
    cards = re.findall(r'<article\b[^>]*class="icard[^"]*"[^>]*>\s*<div class="ic-head">(?:<span class="rank">(\d+)</span>)?', html)
    if cards != [str(i + 1) for i in range(len(cards))]:
        problems.append('number the pattern cards 1, 2, 3 in order: <span class="rank">1</span> first in each .ic-head, matching the plan')
    for t in REQUIRED_TEXT:
        if t not in html:
            problems.append(f'missing "{t}"')
    # overview, then prompts, then skills, then habits last
    order = [html.find(f'id="{i}"') for i in SECTION_ORDER]
    if -1 not in order and order != sorted(order):
        problems.append("pages out of order: overview, briefs and setup, skills, then habits")
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
