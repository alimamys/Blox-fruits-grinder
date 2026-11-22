#!/usr/bin/env bash
# Cloud container only: the session proxy port changes when the container restarts, and Gradle (Android
# builds) must use the current one, or downloads such as the Google Play Billing library fail with
# "Could not resolve all files for configuration ':unityLibrary:releaseCompileClasspath'".
# Rewrites the proxy port in ~/.gradle/gradle.properties from $HTTPS_PROXY. Not needed on a normal computer.
set -e
PORT=$(echo "${HTTPS_PROXY:-$https_proxy}" | sed -n 's#.*:\([0-9][0-9]*\)/*$#\1#p')
[ -n "$PORT" ] || { echo "no HTTPS_PROXY set"; exit 0; }
F="$HOME/.gradle/gradle.properties"
mkdir -p "$HOME/.gradle"; touch "$F"
for k in https http; do
  grep -q "^systemProp.$k.proxyHost=" "$F" || echo "systemProp.$k.proxyHost=127.0.0.1" >> "$F"
  if grep -q "^systemProp.$k.proxyPort=" "$F"; then sed -i "s/^systemProp.$k.proxyPort=.*/systemProp.$k.proxyPort=$PORT/" "$F"
  else echo "systemProp.$k.proxyPort=$PORT" >> "$F"; fi
done
echo "gradle proxy port set to $PORT"
