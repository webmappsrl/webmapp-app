#!/bin/bash

CHANGELOG="CHANGELOG.md"
TMPFILE="CHANGELOG.tmp"

rm -f "$TMPFILE"

while IFS= read -r line; do
  echo "$line" >> "$TMPFILE"
  # Cerca una riga con commit hash (es. ([abc1234](https://.../commit/abc1234)))
  if [[ $line =~ \(\[([a-f0-9]{7,40})\]\(https://github\.com/.*/commit/([a-f0-9]{7,40})\)\) ]]; then
    commit_sha="${BASH_REMATCH[1]}"
    # Prendi il body del commit (escludi la prima riga)
    body=$(git log -1 --pretty=%B "$commit_sha" | tail -n +2)
    if [[ -n "$body" ]]; then
      # Indenta ogni riga del body per markdown
      while IFS= read -r body_line; do
        echo "    $body_line" >> "$TMPFILE"
      done <<< "$body"
    fi
  fi
done < "$CHANGELOG"

mv "$TMPFILE" "$CHANGELOG"
echo "CHANGELOG.md arricchito con le descrizioni dei commit!" 