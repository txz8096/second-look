#!/usr/bin/env bash
# Installs the second look skill for Claude Code, Codex and Cursor.
#
#   curl -fsSL https://raw.githubusercontent.com/txz8096/second-look/main/install.sh | bash
#
# Options:
#   --yes            keep Claude Code history for a year without asking
#   --no-retention   leave Claude Code's history setting alone
set -euo pipefail

REPO="txz8096/second-look"
SKILL_PATH="plugins/second-look/skills/second-look"
HOME_DIR="$HOME/.second-look"
SHARED="$HOME/.agents/skills/second-look"

retention="ask"
for arg in "$@"; do
  case "$arg" in
    --yes) retention="yes" ;;
    --no-retention) retention="no" ;;
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

command -v python3 >/dev/null || { echo "second look needs python3. Install it, then run this again." >&2; exit 1; }

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

echo "second look reads these on your computer, and nothing leaves it:"
echo "  ~/.claude/projects        Claude Code sessions"
echo "  ~/.codex/sessions         Codex sessions"
echo "  Cursor's local database   Cursor chats"
echo "  ~/.second-look/exports    claude.ai and ChatGPT exports you add"
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
settings="$HOME/.claude/settings.json"
current="$(python3 -c 'import json,os,sys; p=sys.argv[1]; print(json.load(open(p)).get("cleanupPeriodDays", 30) if os.path.exists(p) else 30)' "$settings" 2>/dev/null || echo 30)"
if [ -d "$HOME/.claude" ] && [ "$current" -lt 365 ] && [ "$retention" != "no" ]; then
  if [ "$retention" = "ask" ]; then
    if [ -r /dev/tty ]; then
      printf "\nClaude Code deletes sessions after %s days. Keep them for a year instead? [Y/n] " "$current"
      read -r reply < /dev/tty || reply="n"
      case "$reply" in [nN]*) retention="no" ;; *) retention="yes" ;; esac
    else
      retention="no"
      echo "Left Claude Code's history setting alone. Run with --yes to keep a year of sessions."
    fi
  fi
  if [ "$retention" = "yes" ]; then
    python3 - "$settings" <<'PY'
import json, os, sys
p = sys.argv[1]
s = json.load(open(p)) if os.path.exists(p) else {}
s["cleanupPeriodDays"] = 365
os.makedirs(os.path.dirname(p), exist_ok=True)
with open(p, "w") as f:
    json.dump(s, f, indent=2)
PY
    echo "Set cleanupPeriodDays to 365 in $settings"
  fi
fi

mkdir -p "$HOME_DIR/exports/claude" "$HOME_DIR/exports/chatgpt" "$HOME_DIR/reports"

cat <<EOF

Done. Ask your assistant for "a second look", or type /second-look in Claude Code.

Optional, for your claude.ai and ChatGPT history:
  claude.ai  Settings > Privacy > Export data
  ChatGPT    Settings > Data controls > Export data
Each one emails you a zip. Put its conversations.json in
  $HOME_DIR/exports/claude/   or   $HOME_DIR/exports/chatgpt/
EOF
