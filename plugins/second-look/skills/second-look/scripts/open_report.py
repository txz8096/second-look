#!/usr/bin/env python3
"""Open a finished report in the user's own browser.

Usage: python3 open_report.py REPORT.html

App preview panes (the Claude desktop app, IDE previews, Quick Look) often show local HTML
as a snapshot without scripts, and may keep an old copy after a rebuild. A real browser runs
the filters, copy buttons and hover details and always reads the current file.
Prints the command to run by hand when it can't open one. Also records the report as opened,
so a later request for a Second Look doesn't offer it again.
"""
import os, shlex, subprocess, sys

sys.dont_write_bytecode = True  # keep the skill folder free of __pycache__
from schedule import mark_opened


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__.strip())
    report = os.path.abspath(os.path.expanduser(sys.argv[1]))
    if not os.path.exists(report):
        sys.exit(f"{report} doesn't exist")

    try:
        mark_opened(report)
    except (OSError, ValueError):
        pass  # opening the report matters more than remembering it

    if sys.platform == "darwin":
        cmd = ["open", report]
    elif sys.platform.startswith("win"):
        cmd = None
    else:
        cmd = ["xdg-open", report]

    try:
        if cmd is None:
            os.startfile(report)
        else:
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=30)
        print(f"Opened {report} in your browser.")
    except (OSError, subprocess.SubprocessError):
        by_hand = f'start "" "{report}"' if cmd is None else shlex.join(cmd)
        print(f"Couldn't open a browser. Open it with: {by_hand}")


if __name__ == "__main__":
    main()
