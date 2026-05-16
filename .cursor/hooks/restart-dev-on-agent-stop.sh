#!/usr/bin/env bash
# After an Agent run completes, restart the local CRA dev server so the UI matches
# the latest tree (useful after multi-step edits outside hot-reload assumptions).
INPUT=$(cat || true)

status="completed"
if command -v python3 >/dev/null 2>&1; then
  status="$(
    printf '%s' "$INPUT" | python3 -c '
import json, sys
raw = sys.stdin.read().strip()
if not raw:
    print("completed")
else:
    try:
        print(json.loads(raw).get("status", "completed"))
    except Exception:
        print("completed")
'
  )" || status="completed"
fi

if [[ "$status" != "completed" ]]; then
  echo '{}'
  exit 0
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 0

mkdir -p "$PROJECT_ROOT/.cursor"

PACMAN_PORT="${PACMAN_DEV_PORT:-${PORT:-3000}}"
LOG="$PROJECT_ROOT/.cursor/dev-server.log"
PID_FILE="$PROJECT_ROOT/.cursor/dev-server.pid"

# Brief pause so any pending filesystem writes settle before restarting.
sleep 0.35

if PIDS="$(lsof -tiTCP:${PACMAN_PORT} -sTCP:LISTEN 2>/dev/null || true)"; then
  kill $PIDS 2>/dev/null || true
  sleep 0.75
fi

rm -f "$PID_FILE"

nohup env BROWSER=none PORT="$PACMAN_PORT" yarn start >>"$LOG" 2>&1 &
echo $! >"$PID_FILE"

echo '{}'
