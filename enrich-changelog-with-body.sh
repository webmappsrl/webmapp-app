#!/bin/bash

CHANGELOG="CHANGELOG.md"
TMPFILE="CHANGELOG.tmp"

rm -f "$TMPFILE"

while IFS= read -r line; do
  # Trasforma i riferimenti OC in link in ogni riga
  line=$(echo "$line" | sed -E 's/oc: *([0-9]+)/[OC\1](https:\/\/orchestrator\.maphub\.it\/resources\/customer-stories\/\1)/g')
  echo "$line" >> "$TMPFILE"
  # Cerca una riga con commit hash (es. ([abc1234](https://.../commit/abc1234)))
  if [[ $line =~ \(\[([a-f0-9]{7,40})\]\(https://github\.com/.*/commit/([a-f0-9]{7,40})\)\) ]]; then
    commit_sha="${BASH_REMATCH[1]}"
    # Leggi la prossima riga senza avanzare il ciclo
    read -r next_line
    # Se la prossima riga è il marker, copia il marker e tutte le righe indentate (descrizione già presente)
    if [[ "$next_line" == "<!-- COMMIT_DESC -->" ]]; then
      echo "$next_line" >> "$TMPFILE"
      while IFS= read -r desc_line; do
        if [[ "$desc_line" =~ ^[[:space:]] ]]; then
          echo "$desc_line" >> "$TMPFILE"
        else
          line="$desc_line"
          break
        fi
      done
    else
      # Prendi il body del commit (escludi la prima riga)
      body=$(git log -1 --pretty=%B "$commit_sha" | tail -n +2)
      if [[ -n "$body" ]]; then
        # Trasforma i riferimenti OC in link anche nel body
        body=$(echo "$body" | sed -E 's/oc: *([0-9]+)/[OC\1](https:\/\/orchestrator\.maphub\.it\/resources\/customer-stories\/\1)/g')
        # Aggiungi il marker e il body indentato
        echo "<!-- COMMIT_DESC -->" >> "$TMPFILE"
        while IFS= read -r body_line; do
          echo "    $body_line" >> "$TMPFILE"
        done <<< "$body"
      fi
      # Se avevamo letto una riga, la processiamo normalmente
      if [[ -n "$next_line" ]]; then
        echo "$next_line" >> "$TMPFILE"
      fi
    fi
  fi
done < "$CHANGELOG"

mv "$TMPFILE" "$CHANGELOG"
echo "CHANGELOG.md arricchito con le descrizioni dei commit (senza duplicati)!" 