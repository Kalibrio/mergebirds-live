#!/bin/sh
# Birdwatch v1 installer — run by a DreamHost panel cron as the hosting user.
# args: $1 = rollup token, $2 = deploy ssh public key
set -e
BASE="https://mergebirds.kalibrio.com/backend"
DOC="$HOME/mb-events.kalibrio.com"
mkdir -p "$DOC" "$HOME/mb-data" "$HOME/.ssh"
curl -fsS "$BASE/index.php.txt" -o "$DOC/index.php"
curl -fsS "$BASE/htaccess.txt" -o "$DOC/.htaccess"
[ -n "$1" ] && printf '%s' "$1" > "$HOME/mb-data/rollup-token.txt"
if [ -n "$2" ] && ! grep -qF "$2" "$HOME/.ssh/authorized_keys" 2>/dev/null; then
  printf '%s\n' "$2" >> "$HOME/.ssh/authorized_keys"
fi
chmod 700 "$HOME/.ssh"; chmod 600 "$HOME/.ssh/authorized_keys" 2>/dev/null || true
date -u > "$HOME/mb-data/setup-done.txt"
