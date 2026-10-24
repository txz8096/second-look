#!/usr/bin/env bash
# Install the second-look skill for Codex and Cursor (and optionally Claude Code).
#
#   curl -fsSL https://raw.githubusercontent.com/txz8096/second-look/main/install.sh | bash
#   bash install.sh [--claude] [--keep-history] [--uninstall]
#
# Default: copies the skill to ~/.agents/skills/second-look, which Codex and Cursor both read.
#   --claude        also copy it to ~/.claude/skills/second-look (for Claude Code without the plugin)
#   --keep-history  keep Claude Code transcripts for 365 days instead of 30, so the yearly view has data
#   --uninstall     remove the copies this script made (your ~/.second-look data stays)
set -euo pipefail

REPO="${SECOND_LOOK_REPO:-https://github.com/txz8096/second-look}"
REF="${SECOND_LOOK_REF:-main}"
SKILL_NAME="second-look"
want_claude=0; keep_history=0; uninstall=0
for arg in "$@"; do
  case "$arg" in
    --claude) want_claude=1 ;;
    --keep-history) keep_history=1 ;;
    --uninstall) uninstall=1 ;;
    -h|--help) sed -n '2,11p' "$0" 2>/dev/null || true; exit 0 ;;
    *) echo "Unknown option: $arg" >&2; exit 2 ;;
  esac
done

targets=("$HOME/.agents/skills/$SKILL_NAME")
[ "$want_claude" = 1 ] && targets+=("$HOME/.claude/skills/$SKILL_NAME")

if [ "$uninstall" = 1 ]; then
  for t in "$HOME/.agents/skills/$SKILL_NAME" "$HOME/.claude/skills/$SKILL_NAME"; do
    if [ -f "$t/SKILL.md" ] && grep -q "^name: $SKILL_NAME" "$t/SKILL.md"; then
      rm -rf "$t" && echo "Removed $t"
    fi
  done
  echo "Your profile, log and reports in ~/.second-look were left in place."
  exit 0
fi

# Find the skill files: next to this script when run from a clone, otherwise fetch the repo.
src=""
here="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || true)"
if [ -n "$here" ] && [ -f "$here/plugin/skills/$SKILL_NAME/SKILL.md" ]; then
  src="$here/plugin/skills/$SKILL_NAME"
else
  command -v git >/dev/null || { echo "git is required." >&2; exit 1; }
  tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
  git clone --quiet --depth 1 --branch "$REF" "$REPO" "$tmp/repo"
  src="$tmp/repo/plugin/skills/$SKILL_NAME"
fi

for t in "${targets[@]}"; do
  mkdir -p "$(dirname "$t")"
  rm -rf "$t"
  cp -R "$src" "$t"
  find "$t" -name '__pycache__' -prune -exec rm -rf {} + 2>/dev/null || true
  echo "Installed -> $t"
done

mkdir -p "$HOME/.second-look/exports/claude" "$HOME/.second-look/exports/chatgpt" "$HOME/.second-look/reports"

if [ "$keep_history" = 1 ]; then
  python3 - <<'PY'
import json, os
p = os.path.expanduser("~/.claude/settings.json")
s = json.load(open(p)) if os.path.exists(p) else {}
if s.get("cleanupPeriodDays", 30) < 365:
    s["cleanupPeriodDays"] = 365
    os.makedirs(os.path.dirname(p), exist_ok=True)
    json.dump(s, open(p, "w"), indent=2)
    print("Claude Code will now keep transcripts for 365 days.")
PY
fi

cat <<'EOF'

Done. Open Codex or Cursor and ask: "reflect on how I've been using AI".
For the yearly view, put conversations.json from your claude.ai and ChatGPT data exports in
~/.second-look/exports/claude and ~/.second-look/exports/chatgpt.
EOF
if [ "$want_claude" = 1 ]; then
  echo "Note: Cursor also reads ~/.claude/skills, so it may list second-look twice. That's harmless."
fi
