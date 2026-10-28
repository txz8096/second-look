#!/usr/bin/env python3
"""Recurring second look reviews.

Three ways a review can recur, set up after the first report:

  app       A scheduled task in the Claude desktop app or the Codex app runs the review.
            This script only records the cadence, so `status` knows when the next one is due.
  headless  A daily local job (launchd on macOS, cron on Linux) runs `check`. When a review is
            due, it starts Claude Code or Codex without a window to run the review, then shows
            a notification that the report is ready.
  notify    The same daily job only shows a notification that a review is due.

Usage: python3 schedule.py set --days 14 --method app --app "Claude desktop"
       python3 schedule.py set --days 14 --method headless --agent claude
       python3 schedule.py set --days 14 --method notify
       python3 schedule.py off               stop recurring reviews
       python3 schedule.py status            print the current setting as JSON
       python3 schedule.py reviewed          record that a review just ran
       python3 schedule.py check             what the daily job runs
       python3 schedule.py refresh           after an update: refresh the daily job, keep the schedule
Add --dry-run (or set SECOND_LOOK_DRY_RUN=1) to print scheduler, agent and notification actions
without running them.
"""
import argparse, datetime as dt, json, os, plistlib, re, shutil, subprocess, sys

HOME = os.path.expanduser("~")
DIR = os.path.join(HOME, ".second-look")
STATE = os.path.join(DIR, "schedule.json")
PROFILE = os.path.join(DIR, "profile.md")
SKILL = os.path.join(HOME, ".agents", "skills", "second-look")
LABEL = "dev.secondlook.schedule"
PLIST = os.path.join(HOME, "Library", "LaunchAgents", LABEL + ".plist")
CRON_MARKER = "# second-look-schedule"
SCRIPT = os.path.abspath(__file__)
# The job runs a copy kept here: macOS blocks background jobs from reading ~/Documents and
# ~/Desktop, where a cloned skill may live.
JOB_SCRIPT = os.path.join(DIR, "schedule.py")
RETRY_DAYS = 2  # once due, notify or retry every 2 days until a review is recorded
STALE_EXPORT_DAYS = 90
# web apps that can't run the review: their history only arrives through these exports
EXPORTS = (("claude.ai", "claude/conversations.json"), ("ChatGPT", "chatgpt/conversations.json"),
           ("Gemini", "gemini/MyActivity.json"))
HEADLESS_TIMEOUT = 45 * 60

HEADLESS_PROMPT = (
    "Run a full second look review using the skill at ~/.agents/skills/second-look (read its "
    "SKILL.md first). Nobody is watching this run, so don't ask questions: if there's no profile, "
    "stop and write a one-line note to ~/.second-look/reports/needs-setup.txt. Otherwise build and "
    "check the report, save it to ~/.second-look/reports/, append the log entry, and run "
    "`python3 ~/.agents/skills/second-look/scripts/schedule.py reviewed`. Don't edit any file "
    "outside ~/.second-look."
)


def today():
    return dt.date.today()


def every(days):
    return "every day" if days == 1 else "every %d days" % days


def load():
    if os.path.exists(STATE):
        with open(STATE) as f:
            return json.load(f)
    return {"enabled": False, "every_days": 14, "method": None, "last_review": None, "start": None,
            "last_attempt": None}


def save(s):
    os.makedirs(DIR, exist_ok=True)
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


def job_on(dry):
    """Run `check` daily at 10:00. Returns a short description of the job."""
    os.makedirs(DIR, exist_ok=True)
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


def job_off(dry):
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
    if os.path.exists(JOB_SCRIPT) and not os.path.samefile(SCRIPT, JOB_SCRIPT) and not dry:
        os.remove(JOB_SCRIPT)


def agent_command(agent, path):
    if agent == "claude":
        return [path, "-p", HEADLESS_PROMPT, "--permission-mode", "acceptEdits",
                "--allowedTools", "Read Glob Grep Write Edit Bash(python3 *)",
                "--add-dir", DIR, SKILL]
    return [path, "exec", "--full-auto", "--skip-git-repo-check", "-C", DIR, HEADLESS_PROMPT]


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


def stale_exports():
    """A reminder line for exports over STALE_EXPORT_DAYS old, or "" when all are fresh."""
    old = []
    for name, rel in EXPORTS:
        path = os.path.join(DIR, "exports", rel)
        if os.path.exists(path):
            age = (dt.datetime.now().timestamp() - os.path.getmtime(path)) / 86400
            if age > STALE_EXPORT_DAYS:
                old.append(name)
    if not old:
        return ""
    names = old[0] if len(old) == 1 else ", ".join(old[:-1]) + " and " + old[-1]
    return (" Your %s export is over %d days old. Download a fresh one, then ask your assistant "
            "to add it." % (names, STALE_EXPORT_DAYS))


def run_headless(s, dry):
    cmd = agent_command(s["agent"], s["agent_path"])
    if dry:
        print("would run:", " ".join(cmd[:2]), "...")
        notify("Your second look report is ready in ~/.second-look/reports." + stale_exports(), dry)
        return
    os.makedirs(os.path.join(DIR, "reports"), exist_ok=True)
    log = os.path.join(DIR, "reports", "run-%s.log" % today().isoformat())
    with open(log, "w") as out:
        try:
            code = subprocess.run(cmd, cwd=DIR, stdout=out, stderr=subprocess.STDOUT,
                                  timeout=HEADLESS_TIMEOUT).returncode
        except (OSError, subprocess.TimeoutExpired) as e:
            out.write("\n%s\n" % e)
            code = 1
    if code == 0 and load().get("last_review") == today().isoformat():
        notify("Your second look report is ready in ~/.second-look/reports." + stale_exports(), dry)
    else:
        notify("Your scheduled review didn't finish. Ask your assistant for a second look. Details: " + log, dry)


def status(s):
    due = next_due(s)
    return {"enabled": bool(s.get("enabled")), "every_days": s["every_days"], "method": s.get("method"),
            "app": s.get("app"), "agent": s.get("agent"), "last_review": s.get("last_review"),
            "next_due": due.isoformat() if due else None}


def main():
    ap = argparse.ArgumentParser(description="Recurring second look reviews.")
    ap.add_argument("command", choices=["set", "off", "status", "reviewed", "check", "refresh"])
    ap.add_argument("--days", type=int, help="with set: days between reviews (1-365)")
    ap.add_argument("--method", choices=["app", "headless", "notify"], help="with set: how reviews recur")
    ap.add_argument("--app", help='with set --method app: which app, e.g. "Claude desktop" or "Codex app"')
    ap.add_argument("--agent", choices=["claude", "codex"], help="with set --method headless: which CLI runs it")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    a.dry_run = a.dry_run or os.environ.get("SECOND_LOOK_DRY_RUN") == "1"
    s = load()

    if a.command == "set":
        if not a.days or not 1 <= a.days <= 365:
            sys.exit("set needs --days between 1 and 365")
        method = a.method or s.get("method") or "notify"
        update = dict(enabled=True, every_days=a.days, method=method, last_attempt=None, start=today().isoformat())
        if method == "app":
            job_off(a.dry_run)
            update["app"] = a.app or s.get("app") or "the app's scheduled tasks"
            where = "a scheduled task in " + update["app"]
        else:
            if method == "headless":
                agent = a.agent or s.get("agent") or "claude"
                path = shutil.which(agent)
                if not path:
                    sys.exit("Couldn't find the %s command. Use --method notify instead." % agent)
                update.update(agent=agent, agent_path=path)
            job = job_on(a.dry_run)
            if not job:
                sys.exit("No scheduler found (needs macOS launchd or cron).")
            where = job
        s.update(update)
        save(s)
        set_profile_cadence(every(a.days))
        kind = {"app": "Reviews run", "headless": "Reviews run in the background", "notify": "Reminders"}[method]
        print("%s %s, next on %s (%s)." % (kind, every(a.days), next_due(s), where))
    elif a.command == "off":
        job_off(a.dry_run)
        was_app = s.get("method") == "app"
        s.update(enabled=False, last_attempt=None)
        save(s)
        set_profile_cadence("off")
        print("Recurring reviews off." + (" Also delete the scheduled task in %s." % s.get("app") if was_app else ""))
    elif a.command == "status":
        print(json.dumps(status(s), indent=2))
    elif a.command == "reviewed":
        s.update(last_review=today().isoformat(), last_attempt=None)
        save(s)
        due = next_due(s)
        print("Review recorded." + (" Next one on %s." % due if due else ""))
    elif a.command == "refresh":
        if s.get("enabled") and s.get("method") in ("headless", "notify"):
            if os.path.exists(JOB_SCRIPT) and not os.path.samefile(SCRIPT, JOB_SCRIPT):
                os.remove(JOB_SCRIPT)
            job_on(a.dry_run)
            print("Refreshed the daily job (%s)." % every(s["every_days"]))
    elif a.command == "check":
        due = next_due(s)
        if s.get("method") == "app" or not due or today() < due:
            return
        last = s.get("last_attempt")
        if last and (today() - dt.date.fromisoformat(last)).days < RETRY_DAYS:
            return
        if not a.dry_run:
            s["last_attempt"] = today().isoformat()
            save(s)
        if s.get("method") == "headless":
            run_headless(s, a.dry_run)
        else:
            notify("Your review is due. Ask your assistant for a second look." + stale_exports(), a.dry_run)


if __name__ == "__main__":
    main()
