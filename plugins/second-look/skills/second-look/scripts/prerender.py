#!/usr/bin/env python3
"""Draw a report's year charts into its HTML, so they show in viewers that block scripts.

Usage: python3 prerender.py REPORT.html

Runs the report once in headless Chrome (or Chromium, Edge, Brave), takes the rendered
"How your habits are changing" charts, the data-scope line above them and the phone-ready
tables, and writes them back into the file, with the charts marked data-static.
In a normal browser the script clears the marker and redraws with working filters.
Without a browser it changes nothing, says so and exits 0: the charts then draw only when
scripts run. When the browser runs but the report's own script draws nothing, it says so and
exits 1, because the charts won't draw in any browser.
"""
import os, re, shutil, subprocess, sys, tempfile
from html.parser import HTMLParser

MAC_APPS = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
]
COMMANDS = ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "microsoft-edge", "brave-browser"]
SECTION = re.compile(r'<section id="trends"[^>]*>.*?</section>', re.S)
SCOPE_LINE = re.compile(r'<p class="scope-line" id="scope-line">.*?</p>', re.S)
TABLE = re.compile(r'<div class="tbl">.*?</table></div>', re.S)
LEAD_PLOT = re.compile(r'(<div class="chart lead[^"]*"[^>]*>.*?<div class="chart-plot")', re.S)


def find_browser():
    env = os.environ.get("SECOND_LOOK_CHROME")
    if env and os.path.exists(env):
        return env
    for path in MAC_APPS:
        if os.path.exists(path):
            return path
    for cmd in COMMANDS:
        path = shutil.which(cmd)
        if path:
            return path
    return None



def element_by_id(source, element_id):
    class Finder(HTMLParser):
        def __init__(self):
            super().__init__()
            self.offsets = [0]
            for line in source.splitlines(keepends=True):
                self.offsets.append(self.offsets[-1] + len(line))
            self.start = self.end = None
            self.depth = 0

        def absolute_position(self):
            line, column = self.getpos()
            return self.offsets[line - 1] + column

        def handle_starttag(self, tag, attrs):
            if tag != "div":
                return
            if self.start is None and dict(attrs).get("id") == element_id:
                self.start = self.absolute_position()
                self.depth = 1
            elif self.depth:
                self.depth += 1

        def handle_endtag(self, tag):
            if tag == "div" and self.depth:
                self.depth -= 1
                if not self.depth:
                    self.end = self.absolute_position() + len("</div>")

    finder = Finder()
    finder.feed(source)
    return (finder.start, finder.end) if finder.start is not None and finder.end is not None else None


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__.strip())
    report = os.path.abspath(sys.argv[1])
    html = open(report, encoding="utf-8").read()
    if not SECTION.search(html):
        sys.exit(f'{report} has no <section id="trends">')

    browser = find_browser()
    if not browser:
        print("No Chrome, Chromium, Edge or Brave found. Charts will draw only when scripts run.")
        return

    with tempfile.TemporaryDirectory() as profile:
        run = subprocess.run(
            [browser, "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
             f"--user-data-dir={profile}", "--window-size=1280,2000", "--virtual-time-budget=5000",
             "--dump-dom", "file://" + report],
            capture_output=True, text=True, timeout=120)
    drawn = SECTION.search(run.stdout)
    if run.returncode != 0 or not drawn:
        print("The browser couldn't draw the charts. Charts will draw only when scripts run.")
        return
    if 'class="chart"' not in drawn.group(0):
        sys.exit("The report's chart script failed, so no charts were drawn. Open the file in a browser, "
                 "check the console for the error, fix it and run this again.")

    static = re.sub(r'^<section id="trends"[^>]*>', '<section id="trends" data-static="">', drawn.group(0))
    # a wide chart scrolls sideways on a phone, so the keyboard has to reach it
    static = LEAD_PLOT.sub(lambda m: m.group(1) + ' tabindex="0"', static)
    # outside the charts, the script's phone tables, so they stack with scripts off too
    outside = lambda text: TABLE.findall(SECTION.sub("", text))
    activity = element_by_id(run.stdout, "work-mix")
    original_activity = element_by_id(html, "work-mix")
    if activity and original_activity:
        html = html[:original_activity[0]] + run.stdout[activity[0]:activity[1]] + html[original_activity[1]:]
    written, stacked = outside(html), outside(run.stdout)
    if len(written) == len(stacked):
        it = iter(stacked)
        html = "".join(TABLE.sub(lambda _: next(it), part) if not SECTION.fullmatch(part) else part for part in re.split(f"({SECTION.pattern})", html, flags=re.S))
    html = SECTION.sub(lambda _: static, html, count=1)
    line = SCOPE_LINE.search(run.stdout)
    if line:
        html = SCOPE_LINE.sub(lambda _: line.group(0), html, count=1)
    open(report, "w", encoding="utf-8").write(html)
    print(f"Charts drawn into {report}.")


if __name__ == "__main__":
    main()
