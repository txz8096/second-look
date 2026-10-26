#!/usr/bin/env python3
"""Local reminder for second look reviews.

A small job (launchd on macOS, cron on Linux) runs `check` once a day. When a review is due,
it shows a desktop notification. It never runs a review and never touches the network.

Usage: python3 reminder.py set --days 14     turn reminders on, or change how often
       python3 reminder.py off               turn reminders off
       python3 reminder.py status            print the current setting as JSON
       python3 reminder.py reviewed          record that a full review just ran
       python3 reminder.py check             what the daily job runs
Add --dry-run (or set SECOND_LOOK_DRY_RUN=1) to print scheduler and notification actions
without running them.
"""
import argparse, datetime as dt, json, os, plistlib, re, shutil, subprocess, sys

HOME = os.path.expanduser("~")
STATE = os.path.join(HOME, ".second-look", "reminder.json")
PROFILE = os.path.join(HOME, ".second-look", "profile.md")
LABEL = "dev.secondlook.reminder"
PLIST = os.path.join(HOME, "Library", "LaunchAgents", LABEL + ".plist")
CRON_MARKER = "# second-look-reminder"
SCRIPT = os.path.abspath(__file__)
# The job runs a copy kept here: macOS blocks background jobs from reading ~/Documents and
# ~/Desktop, where a cloned skill may live.
JOB_SCRIPT = os.path.join(HOME, ".second-look", "reminder.py")
NAG_EVERY_DAYS = 2  # once due, remind again every 2 days until a review is logged


def today():
    return dt.date.today()


def every(days):
    return "every day" if days == 1 else "every %d days" % days


def load():
    if os.path.exists(STATE):
        with open(STATE) as f:
            return json.load(f)
    return {"enabled": False, "every_days": 14, "last_review": None, "start": None, "last_notified": None}


def save(s):
    os.makedirs(os.path.dirname(STATE), exist_ok=True)
    with open(STATE, "w") as f:
        json.dump(s, f, indent=2)


def next_due(s):
    base = s.get("last_review") or s.get("start")
    if not s.get("enabled") or not base:
        return None
    return dt.date.fromisoformat(base) + dt.timedelta(days=s["every_days"])


def run(cmd, dry, check=True):
    if dry:
        print("would run:", " ".join(cmd))
        return 0
    return subprocess.run(cmd, check=check, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode


def schedule_on(dry):
    """Run `check` daily at 10:00. Returns a short description of the job."""
    os.makedirs(os.path.dirname(JOB_SCRIPT), exist_ok=True)
    if not (os.path.exists(JOB_SCRIPT) and os.path.samefile(SCRIPT, JOB_SCRIPT)):
        shutil.copy2(SCRIPT, JOB_SCRIPT)
    cmd = [sys.executable, JOB_SCRIPT, "check"]
    if sys.platform == "darwin":
        os.makedirs(os.path.dirname(PLIST), exist_ok=True)
        with open(PLIST, "wb") as f:
            plistlib.dump({"Label": LABEL, "ProgramArguments": cmd,
                           "StartCalendarInterval": {"Hour": 10, "Minute": 0}}, f)
        domain = "gui/%d" % os.getuid()
        run(["launchctl", "bootout", domain, PLIST], dry, check=False)
        run(["launchctl", "bootstrap", domain, PLIST], dry)
        return "launchd job " + PLIST
    if shutil.which("crontab"):
        line = "0 10 * * * %s %s" % (" ".join(cmd), CRON_MARKER)
        current = subprocess.run(["crontab", "-l"], capture_output=True, text=True).stdout
        lines = [l for l in current.splitlines() if CRON_MARKER not in l] + [line]
        if dry:
            print("would set crontab line:", line)
        else:
            subprocess.run(["crontab", "-"], input="\n".join(lines) + "\n", text=True, check=True)
        return "cron job (daily at 10:00)"
    return None


def schedule_off(dry):
    if sys.platform == "darwin":
        if os.path.exists(PLIST):
            run(["launchctl", "bootout", "gui/%d" % os.getuid(), PLIST], dry, check=False)
            if not dry:
                os.remove(PLIST)
    elif shutil.which("crontab"):
        current = subprocess.run(["crontab", "-l"], capture_output=True, text=True).stdout
        if CRON_MARKER in current:
            lines = [l for l in current.splitlines() if CRON_MARKER not in l]
            if dry:
                print("would remove the second look crontab line")
            else:
                subprocess.run(["crontab", "-"], input="\n".join(lines) + "\n", text=True, check=True)
    if os.path.exists(JOB_SCRIPT) and not dry:
        os.remove(JOB_SCRIPT)


def set_profile_cadence(value):
    if not os.path.exists(PROFILE):
        return
    with open(PROFILE) as f:
        text = f.read()
    line = "cadence: " + value
    text = re.sub(r"(?m)^cadence:.*$", line, text) if re.search(r"(?m)^cadence:", text) else text.rstrip("\n") + "\n" + line + "\n"
    with open(PROFILE, "w") as f:
        f.write(text)


def notify(message, dry):
    if dry:
        print("would notify:", message)
        return
    if sys.platform == "darwin":
        script = 'display notification "%s" with title "second look"' % message.replace('"', "'")
        subprocess.run(["osascript", "-e", script], check=False)
    elif shutil.which("notify-send"):
        subprocess.run(["notify-send", "second look", message], check=False)
    else:
        print(message)


def status(s):
    due = next_due(s)
    return {"enabled": bool(s.get("enabled")), "every_days": s["every_days"], "last_review": s.get("last_review"),
            "next_due": due.isoformat() if due else None}


def main():
    ap = argparse.ArgumentParser(description="Local reminder for second look reviews.")
    ap.add_argument("command", choices=["set", "off", "status", "reviewed", "check"])
    ap.add_argument("--days", type=int, help="with set: days between reviews (1-365)")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    a.dry_run = a.dry_run or os.environ.get("SECOND_LOOK_DRY_RUN") == "1"
    s = load()

    if a.command == "set":
        if not a.days or not 1 <= a.days <= 365:
            sys.exit("set needs --days between 1 and 365")
        job = schedule_on(a.dry_run)
        if not job:
            sys.exit("No scheduler found (needs macOS launchd or cron). Reminders are off.")
        s.update(enabled=True, every_days=a.days, start=s.get("start") or today().isoformat(), last_notified=None)
        save(s)
        set_profile_cadence(every(a.days))
        print("Reminders on: %s, next on %s (%s)." % (every(a.days), next_due(s), job))
    elif a.command == "off":
        schedule_off(a.dry_run)
        s.update(enabled=False, last_notified=None)
        save(s)
        set_profile_cadence("off")
        print("Reminders off. Turn them back on any time with: reminder.py set --days 14")
    elif a.command == "status":
        print(json.dumps(status(s), indent=2))
    elif a.command == "reviewed":
        s.update(last_review=today().isoformat(), last_notified=None)
        save(s)
        due = next_due(s)
        print("Review recorded." + (" Next reminder on %s." % due if due else ""))
    elif a.command == "check":
        due = next_due(s)
        if not due or today() < due:
            return
        last = s.get("last_notified")
        if last and (today() - dt.date.fromisoformat(last)).days < NAG_EVERY_DAYS:
            return
        notify("Your review is due. Ask your assistant for a second look.", a.dry_run)
        if not a.dry_run:
            s["last_notified"] = today().isoformat()
            save(s)


if __name__ == "__main__":
    main()
