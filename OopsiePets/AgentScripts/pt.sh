#!/usr/bin/env bash
# Run a PlayTest step: pt.sh <Method> [json-args]. Prints the step's result.
cd "$(dirname "$0")/.."
if [ -n "${2:-}" ]; then a=(--args "$2"); else a=(); fi
unity command script run --file AgentScripts/PlayTest.cs --entry "PlayTest.$1" "${a[@]}" --timeout 300 --result-only 2>&1 | python3 -I -c "
import json,sys
raw=sys.stdin.read()
try:
    d=json.loads(raw); print(d.get('result', d) if isinstance(d, dict) else d)
except Exception: print(raw[:1500])"
