#!/usr/bin/env bash
# Installs the second look skill for Claude Code, Codex and Cursor.
#
#   curl -fsSL https://raw.githubusercontent.com/txz8096/second-look/main/install.sh | bash
#
# Options (after "bash -s --" when piping from curl):
#   --check          show what was found and what would change, then exit without changing anything
#   --yes            keep Claude Code history for a year without asking
#   --no-retention   leave Claude Code's history setting alone
#   --remind DAYS    remind you to run a review every DAYS days (a local notification)
#   --no-remind      don't set up a reminder
set -euo pipefail

REPO="txz8096/second-look"
SKILL_PATH="plugins/second-look/skills/second-look"
HOME_DIR="$HOME/.second-look"
SHARED="$HOME/.agents/skills/second-look"
SETTINGS="$HOME/.claude/settings.json"

mode="install"
retention="ask"
remind="ask"
while [ $# -gt 0 ]; do
  case "$1" in
    --check) mode="check" ;;
    --yes) retention="yes" ;;
    --no-retention) retention="no" ;;
    --remind)
      shift
      case "${1:-}" in ''|*[!0-9]*) echo "--remind needs a number of days, like --remind 14" >&2; exit 1 ;; esac
      remind="$1" ;;
    --no-remind) remind="no" ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
  shift
done

command -v python3 >/dev/null || { echo "second look needs python3. Install it, then run this again." >&2; exit 1; }

# Claude Code's current history setting, in days.
current_retention="$(python3 -c 'import json,os,sys; p=sys.argv[1]; print(json.load(open(p)).get("cleanupPeriodDays", 30) if os.path.exists(p) else 30)' "$SETTINGS" 2>/dev/null || echo 30)"

# Prints which tools and exports are on this computer, and what an install would change.
report() {
  python3 - "$HOME" "$current_retention" <<'PY'
import datetime as dt, glob, json, os, sys
home, retention = sys.argv[1], int(sys.argv[2])

def sessions(pattern):
    files = glob.glob(os.path.join(home, pattern), recursive=True)
    if not files:
        return "no sessions yet"
    oldest = dt.date.fromtimestamp(min(os.path.getmtime(f) for f in files))
    return f"{len(files)} session{'' if len(files) == 1 else 's'} since {oldest:%b %d, %Y}"

cursor_db = [p for p in (
    "Library/Application Support/Cursor/User/globalStorage/state.vscdb",
    ".config/Cursor/User/globalStorage/state.vscdb") if os.path.exists(os.path.join(home, p))]
tools = [
    ("Claude Code", os.path.isdir(os.path.join(home, ".claude")), "~/.claude/projects", lambda: sessions(".claude/projects/*/*.jsonl")),
    ("Codex", os.path.isdir(os.path.join(home, ".codex")), "~/.codex/sessions", lambda: sessions(".codex/sessions/**/*.jsonl")),
    ("Cursor", os.path.isdir(os.path.join(home, ".cursor")) or bool(cursor_db), "Cursor's local database",
     lambda: "chat database found" if cursor_db else "no chat database yet"),
]
exports = [(name, os.path.join(home, ".second-look/exports", d, "conversations.json")) for name, d in
           (("claude.ai export", "claude"), ("ChatGPT export", "chatgpt"))]

print("Found on this computer (second look reads these when you ask for a review):")
found = []
for name, present, where, detail in tools:
    if present:
        found.append(name)
        print(f"  {name:<18}{where}: {detail()}")
    else:
        print(f"  {name:<18}not installed")
for name, path in exports:
    print(f"  {name:<18}" + ("found" if os.path.exists(path) else "not added (optional)"))

print("\nAn install will:")
print("  Copy the skill to ~/.agents/skills/second-look")
for name in found:
    folder = {"Claude Code": "~/.claude", "Codex": "~/.codex", "Cursor": "~/.cursor"}[name]
    print(f"  Link it into {folder}/skills for {name}")
print("  Create ~/.second-look for your profile, reports and exports")
if "Claude Code" in found and retention < 365:
    print(f"  Ask before changing Claude Code's history from {retention} to 365 days")
    print("    (Claude Code deletes older sessions; the 12-month view needs them kept)")
reminder = os.path.join(home, ".second-look", "reminder.json")
state = json.load(open(reminder)) if os.path.exists(reminder) else {}
if state.get("enabled"):
    n = state["every_days"]
    print("  Keep your reminder to review " + ("every day" if n == 1 else f"every {n} days"))
else:
    print("  Ask whether to remind you to review every 14 days")
    print("    (a notification on this computer; change or stop it any time)")
PY
}

has_tty() { [ -t 0 ] || { [ -r /dev/tty ] && : < /dev/tty; } 2>/dev/null; }

if [ "$mode" = "check" ]; then
  report
  echo
  echo "Nothing was changed. To install, run without --check. To answer the questions up front, add"
  echo "--yes or --no-retention (history) and --remind 14 or --no-remind (reminder)."
  exit 0
fi

# Use the files next to this script when run from a clone; otherwise download them.
here="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || true)"
if [ -n "$here" ] && [ -f "$here/$SKILL_PATH/SKILL.md" ]; then
  src="$here/$SKILL_PATH"
else
  tmp="$(mktemp -d)"
  trap 'rm -rf "$tmp"' EXIT
  curl -fsSL "https://github.com/$REPO/archive/refs/heads/main.tar.gz" | tar -xz -C "$tmp"
  src="$(echo "$tmp"/*/"$SKILL_PATH")"
fi

report
echo

# One shared copy, linked into each tool that's installed.
mkdir -p "$(dirname "$SHARED")"
rm -rf "$SHARED"
cp -R "$src" "$SHARED"
echo "Installed to $SHARED"

link() {
  local tool_dir="$1" name="$2" dest="$1/skills/second-look"
  [ -d "$tool_dir" ] || return 0
  mkdir -p "$tool_dir/skills"
  if [ -e "$dest" ] && [ ! -L "$dest" ]; then
    echo "Skipped $name: $dest already exists and isn't a link. Remove it and run this again."
    return 0
  fi
  ln -sfn "$SHARED" "$dest"
  echo "Linked for $name: $dest"
}
link "$HOME/.claude" "Claude Code"
link "$HOME/.codex" "Codex"
link "$HOME/.cursor" "Cursor"

# Claude Code deletes sessions after 30 days by default. A 12-month view needs them kept.
if [ -d "$HOME/.claude" ] && [ "$current_retention" -lt 365 ] && [ "$retention" != "no" ]; then
  if [ "$retention" = "ask" ]; then
    if has_tty; then
      printf "\nClaude Code deletes sessions after %s days. Keep them for a year instead? [Y/n] " "$current_retention"
      read -r reply < /dev/tty || reply="n"
      case "$reply" in [nN]*) retention="no" ;; *) retention="yes" ;; esac
    else
      retention="no"
      echo "Left Claude Code's history setting alone. Run with --yes to keep a year of sessions."
    fi
  fi
  if [ "$retention" = "yes" ]; then
    python3 - "$SETTINGS" <<'PY'
import json, os, sys
p = sys.argv[1]
s = json.load(open(p)) if os.path.exists(p) else {}
s["cleanupPeriodDays"] = 365
os.makedirs(os.path.dirname(p), exist_ok=True)
with open(p, "w") as f:
    json.dump(s, f, indent=2)
PY
    echo "Set cleanupPeriodDays to 365 in $SETTINGS"
  fi
fi

mkdir -p "$HOME_DIR/exports/claude" "$HOME_DIR/exports/chatgpt" "$HOME_DIR/reports"

# Optional reminder: a daily local job that shows a notification when a review is due.
reminder="$SHARED/scripts/reminder.py"
reminder_on="$(python3 "$reminder" status | python3 -c 'import json,sys; s=json.load(sys.stdin); print(s["every_days"] if s["enabled"] else "")')"
if [ "$remind" = "ask" ]; then
  if [ -n "$reminder_on" ]; then
    remind="keep"
  elif has_tty; then
    printf "\nRemind you to run a review every 14 days? Enter another number of days, or n for no. [14] "
    read -r reply < /dev/tty || reply="n"
    case "$reply" in
      ''|[yY]*) remind="14" ;;
      [nN]*) remind="no" ;;
      *[!0-9]*) echo "Not a number, so no reminder was set."; remind="no" ;;
      *) remind="$reply" ;;
    esac
  else
    remind="no"
    echo "No reminder set. Run with --remind 14 to get a reminder every 14 days."
  fi
fi
case "$remind" in
  keep)
    python3 "$reminder" set --days "$reminder_on" >/dev/null  # refreshes the job's copy of reminder.py
    [ "$reminder_on" = 1 ] && echo "Reminder unchanged: every day." || echo "Reminder unchanged: every $reminder_on days." ;;
  no) [ -n "$reminder_on" ] && python3 "$reminder" off ;;
  *) python3 "$reminder" set --days "$remind" || echo "Couldn't set up the reminder on this system." ;;
esac

cat <<EOF

Done. Ask your assistant for "a second look", or type /second-look in Claude Code.
To change or stop the reminder, ask your assistant ("remind me monthly", "stop the reminders").

Optional, for your claude.ai and ChatGPT history:
  claude.ai  Settings > Privacy > Export data
  ChatGPT    Settings > Data controls > Export data
Each one emails you a zip. Put its conversations.json in
  $HOME_DIR/exports/claude/   or   $HOME_DIR/exports/chatgpt/
EOF
