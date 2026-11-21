#!/usr/bin/env bash
# Cloud container only: (re)start the virtual display and the Unity Editor after a machine restart,
# dismiss Unity's "Scene Backup Detected" prompt (Delete: the scene is rebuilt by the builder) and wait
# until the Editor answers commands. Usage: restart_editor.sh
cd "$(dirname "$0")/.."
export DISPLAY=:99 PATH="$HOME/.local/bin:$PATH"
pgrep -x Xvfb >/dev/null || (Xvfb :99 -screen 0 1920x1200x24 >/dev/null 2>&1 &)
sleep 2
nohup bash AgentScripts/start_editor.sh "$PWD" >/dev/null 2>&1 &
for i in $(seq 1 90); do
  W=$(xdotool search --onlyvisible --name 'Scene Backup Detected' 2>/dev/null | head -1)
  if [ -n "$W" ]; then
    eval "$(xdotool getwindowgeometry --shell "$W")"
    xdotool mousemove $((X + 535)) $((Y + 103)) click 1
    echo "dismissed scene backup prompt"
  fi
  if timeout 15 unity command script recompile_status --format json 2>/dev/null | grep -q '"status"'; then
    echo "editor ready"
    exit 0
  fi
  sleep 6
done
echo "editor did not answer"; exit 1
