#!/usr/bin/env python3
"""Check a second look report against the second look design system before publishing.

Usage: python3 check_report.py REPORT.html [--template report-template.html]
Exit 0 when it passes; prints each problem and exits 1 otherwise.
"""
import argparse, hashlib, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_TEMPLATE = os.path.join(os.path.dirname(HERE), "report-template.html")

FONT_LINK = "family=Familjen+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500"
REQUIRED_IDS = ["glance", "part-1", "part-2", "part-3", "trends", "report-issue", "toc"]
SECTION_ORDER = ["part-2", "part-3", "part-1", "report-issue"]
REQUIRED_TEXT = [
    "Learn from the way you work with AI",
    "This cycle at a glance",
    "Improve your prompts and context",
    "Keep your skills current",
    "How your behavior is changing",
    "Report an issue",
    "github.com/txz8096/second-look/issues/new",
]
CHIPS = {
    "Clear pattern", "Likely pattern", "Unconfirmed",
    "Likely to help", "Might help", "Worth testing",
    "Confirmed", "Clear", "Possible", "Cause unclear", "Not measured",
}
PILLS = {
    "Stale", "Review", "Minor", "Current", "Behind", "Broken", "Duplicate", "Not checked",
    "High", "Medium", "Low", "Keep", "Revise", "Drop", "Gap",
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
    "Geist": "old font",
    '"Inter"': "old font",
}


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
    for t in REQUIRED_TEXT:
        if t not in html:
            problems.append(f'missing "{t}"')
    # prompts, then skills, then behavior last
    order = [html.find(f'<div class="part" id="{i}"') for i in SECTION_ORDER]
    if -1 not in order and order != sorted(order):
        problems.append("parts out of order: prompts and context, skills, behavior, then report an issue")
    markup = re.sub(r"<style>.*?</style>", "", html, flags=re.S)
    for needle, why in FORBIDDEN.items():
        if needle in markup:
            problems.append(f'found "{needle}": {why}')
    if re.search(r"<script[^>]+src=", html):
        problems.append("external scripts aren't allowed; keep the template's inline script")

    for label in re.findall(r'class="conf [a-z]+">([^<]+)<', html):
        if label.strip() not in CHIPS:
            problems.append(f'unknown how-sure chip "{label.strip()}"')
    for label in re.findall(r'class="pill [a-z0-9]+">([^<]+)<', html):
        if label.strip() not in PILLS:
            problems.append(f'unknown state pill "{label.strip()}"')

    # status colours never grade the user's habits
    if re.search(r'class="[^"]*\b(up-bad|down-good|chg-good|chg-bad)\b', html):
        problems.append("green/red change classes used on the user's numbers; changes are plain text")

    # the glance needs six stats, each with a meaning line
    g = re.search(r'id="glance".*?</section>', html, re.S)
    if g:
        stats = g.group(0).count('class="stat"')
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
