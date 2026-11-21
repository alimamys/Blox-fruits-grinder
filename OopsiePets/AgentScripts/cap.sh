#!/usr/bin/env bash
# Capture the Game view at portrait 540x960. Usage: cap.sh <out.png>
cd "$(dirname "$0")/.." && unity command capture game_view --width 540 --height 960 --output-path "$1" --result-only >/dev/null 2>&1 && echo "saved $1"
