# Run with bash; hook failures must never block Claude Code.
set -uo pipefail
command -v "${JQ_BIN:-jq}" >/dev/null 2>&1 || exit 0
input=$(cat)
session=$(printf '%s' "$input" | "${JQ_BIN:-jq}" -er '.session_id | select(type == "string" and test("^[A-Za-z0-9_-]+$"))' 2>/dev/null) || exit 0
event=$(printf '%s' "$input" | "${JQ_BIN:-jq}" -r '.hook_event_name // empty' 2>/dev/null) || exit 0
marker_dir="${TMPDIR:-${HOME}/.cache}/claude-confetti"
marker="$marker_dir/$session"

case "$event" in
  UserPromptSubmit)
    prompt=$(printf '%s' "$input" | "${JQ_BIN:-jq}" -er '.prompt | select(type == "string" and test("\\S"))' 2>/dev/null) || exit 0
    if [[ "$prompt" =~ ^[[:space:]]*/(clear|compact)([[:space:]]|$) ]]; then
      rm -f "$marker" 2>/dev/null
      exit 0
    fi
    (umask 077; mkdir -p "$marker_dir" && : > "$marker") 2>/dev/null
    ;;
  Stop)
    [ -f "$marker" ] || exit 0
    rm "$marker" 2>/dev/null || exit 0
    open "${RAYCAST_CONFETTI_URL:-raycast://extensions/raycast/raycast/confetti}" >/dev/null 2>&1 &
    ;;
  SessionStart)
    source=$(printf '%s' "$input" | "${JQ_BIN:-jq}" -r '.source // empty' 2>/dev/null)
    [ "$source" = compact ] || rm -f "$marker" 2>/dev/null
    ;;
  PreCompact)
    trigger=$(printf '%s' "$input" | "${JQ_BIN:-jq}" -r '.trigger // empty' 2>/dev/null)
    [ "$trigger" != manual ] || rm -f "$marker" 2>/dev/null
    ;;
esac
exit 0
