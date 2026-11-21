#!/usr/bin/env bash
# Recompile the project in the running Editor and print any compile errors.
export PATH="$HOME/.local/bin:$PATH"
cd "$(dirname "$0")/.."
unity command script recompile --format json >/dev/null 2>&1
sleep 2
for i in $(seq 1 90); do
  out=$(unity command script recompile_status --format json 2>/dev/null)
  st=$(echo "$out" | python3 -I -c "import json,sys; print(json.load(sys.stdin).get('status'))" 2>/dev/null)
  case "$st" in completed|up_to_date|idle) break;; esac
  sleep 3
done
echo "$out" | python3 -I -c "
import json,sys; d=json.load(sys.stdin); print('status', d.get('status'), 'failed', d.get('failed'))
for e in (d.get('errors') or [])[:60]: print(e if isinstance(e,str) else e)" | cut -c1-300
