#!/usr/bin/env python3
"""Fill the "Latest report" menu in every saved report.

Usage: python3 report_menu.py REPORT.html

Lists the dated reports in REPORT.html's folder (YYYY-MM-DD.html, newest first) and writes that
list into each report that has the menu, so older reports can reach newer ones too. Links are
relative, so they work from a file:// path with scripts off. With one report, the menu is a plain
label. Reports from before the menu are listed but left unchanged, and only the menu changes in
the others, so a past report keeps its findings.
"""
import datetime, os, re, sys

DATED = re.compile(r"^(\d{4}-\d{2}-\d{2})\.html$")
SLOT = re.compile(r"<!-- report-menu -->.*?<!-- /report-menu -->", re.S)
CHEVRON = ('<svg class="report-chev" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" '
           'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>')


def nice(stamp):
    d = datetime.date.fromisoformat(stamp)
    return f"{d:%b} {d.day}, {d.year}"


def menu(stamp, stamps):
    label = "Latest report" if stamp == stamps[0] else "Earlier report"
    # the year drops on the narrowest phones, so the bar still fits
    day, year = nice(stamp).split(", ")
    head = f'<span class="report-pick-t">{label}</span> <span class="report-date">{day}<span class="report-year">, {year}</span></span>'
    if len(stamps) == 1:
        return f'<!-- report-menu --><p class="report-pick">{head}</p><!-- /report-menu -->'
    rows = []
    for s in stamps:
        current = ' aria-current="page"' if s == stamp else ""
        note = '<span class="report-opt-note">Latest</span>' if s == stamps[0] else ""
        rows.append(f'<li><a class="report-opt" href="{s}.html"{current}>{nice(s)}{note}</a></li>')
    return ('<!-- report-menu --><details class="report-menu" id="report-menu">'
            f'<summary class="report-pick">{head}{CHEVRON}</summary>'
            f'<ul class="report-list">{"".join(rows)}</ul></details><!-- /report-menu -->')


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__.strip())
    report = os.path.abspath(os.path.expanduser(sys.argv[1]))
    if not os.path.exists(report):
        sys.exit(f"{report} doesn't exist")
    folder = os.path.dirname(report)
    stamps = sorted((m.group(1) for m in map(DATED.match, os.listdir(folder)) if m), reverse=True)
    if not DATED.match(os.path.basename(report)):
        sys.exit(f"{os.path.basename(report)} isn't named YYYY-MM-DD.html, so it can't join the menu")
    changed = 0
    for stamp in stamps:
        path = os.path.join(folder, stamp + ".html")
        html = open(path, encoding="utf-8").read()
        if not SLOT.search(html):
            continue
        new = SLOT.sub(lambda _: menu(stamp, stamps), html, count=1)
        if new != html:
            open(path, "w", encoding="utf-8").write(new)
            changed += 1
    print(f"Report menu lists {len(stamps)} report{'s' if len(stamps) != 1 else ''}; updated {changed} file{'s' if changed != 1 else ''}.")


if __name__ == "__main__":
    main()
