#!/usr/bin/env bash
# Starts the Unity Editor on the virtual display :99 (cloud container) and clicks
# "Continue anyway" on Unity's "running as root" warning. Usage: start_editor.sh <project>
set -u
export DISPLAY=:99 PATH="$HOME/.local/bin:$PATH"
PROJECT="${1:-$(cd "$(dirname "$0")/.." && pwd)}"
unity open "$PROJECT" --format json > /dev/null 2>&1
for i in $(seq 1 90); do
  for w in $(xdotool search --onlyvisible --name '^Warning$' 2>/dev/null); do
    eval "$(xdotool getwindowgeometry --shell "$w")"
    xdotool mousemove $((X + 280)) $((Y + 98)) click 1
    echo "clicked root warning"
    exit 0
  done
  sleep 2
done
echo "no warning dialog seen"
