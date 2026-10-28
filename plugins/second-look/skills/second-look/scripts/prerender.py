#!/usr/bin/env python3
"""Draw a report's year charts into its HTML, so they show in viewers that block scripts.

Usage: python3 prerender.py REPORT.html

Runs the report once in headless Chrome (or Chromium, Edge, Brave), takes the rendered
"Habits over the last year" section and the data-scope line above it, and writes them back
into the file, marked data-static.
In a normal browser the script clears the marker and redraws with working filters.
Without a browser it changes nothing, says so and exits 0: the charts then draw only when
scripts run.
"""
import os, re, shutil, subprocess, sys, tempfile

MAC_APPS = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
]
COMMANDS = ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "microsoft-edge", "brave-browser"]
SECTION = re.compile(r'<section id="trends"[^>]*>.*?</section>', re.S)
SCOPE_LINE = re.compile(r'<p class="scope-line" id="scope-line">.*?</p>', re.S)


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
    if run.returncode != 0 or not drawn or 'class="chart"' not in drawn.group(0):
        print("The browser couldn't draw the charts. Charts will draw only when scripts run.")
        return

    static = re.sub(r'^<section id="trends"[^>]*>', '<section id="trends" data-static="">', drawn.group(0))
    html = SECTION.sub(lambda _: static, html, count=1)
    line = SCOPE_LINE.search(run.stdout)
    if line:
        html = SCOPE_LINE.sub(lambda _: line.group(0), html, count=1)
    open(report, "w", encoding="utf-8").write(html)
    print(f"Charts drawn into {report}.")


if __name__ == "__main__":
    main()
