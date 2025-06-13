#!/bin/bash

CHANGELOG="CHANGELOG.md"
TMPFILE="CHANGELOG.tmp"

# Test con la riga di esempio
TEST_LINE="* add flow line quote feature oc:4955 ([#93](https://github.com/webmappsrl/webmapp-app/issues/93)) ([ae05a25](https://github.com/webmappsrl/webmapp-app/commit/"
echo "Test con la riga di esempio:"
echo "Originale: $TEST_LINE"
TEST_RESULT=$(echo "$TEST_LINE" | sed -E 's/oc[: ]*([0-9]+)([^0-9]|$)/<a href="https:\/\/orchestrator\.maphub\.it\/resources\/customer-stories\/\1" target="_blank" rel="noopener noreferrer">OC[\1]<\/a>\2/g')
echo "Trasformata: $TEST_RESULT"
echo "---"

# Test con le righe problematiche
TEST_LINE1="* Add tests for favorites functionality oc:4990 ([#92](https://github.com/webmappsrl/webmapp-app/issues/92)) ([5541a52](https://github.com/webmappsrl/webmapp-app/commit/5541a527ecaf9edba0f1987015167cbc42920c8c))"
TEST_LINE2="* add tests for visualizing sync badge  oc:5003 ([#95](https://github.com/webmappsrl/webmapp-app/issues/95)) ([e30f69b](https://github.com/webmappsrl/webmapp-app/commit/"
TEST_LINE3="* Aggiunto componente wm-updated-at per visualizzare la data di aggiornamento nei titoli delle proprietà UGC e delle tracce. oc: 5331"
TEST_LINE4="* Update translations in app component and app module oc: 5343"
TEST_LINE5="* updates to use EnviromentService and update gulpfile oc: 5108"
echo "Test con le righe problematiche:"
echo "Originale 1: $TEST_LINE1"
TEST_RESULT1=$(echo "$TEST_LINE1" | sed -E 's/oc[: ]*([0-9]+)([^0-9]|$)/<a href="https:\/\/orchestrator\.maphub\.it\/resources\/customer-stories\/\1" target="_blank" rel="noopener noreferrer">OC[\1]<\/a>\2/g')
echo "Trasformata 1: $TEST_RESULT1"
echo "Originale 2: $TEST_LINE2"
TEST_RESULT2=$(echo "$TEST_LINE2" | sed -E 's/oc[: ]*([0-9]+)([^0-9]|$)/<a href="https:\/\/orchestrator\.maphub\.it\/resources\/customer-stories\/\1" target="_blank" rel="noopener noreferrer">OC[\1]<\/a>\2/g')
echo "Trasformata 2: $TEST_RESULT2"
echo "Originale 3: $TEST_LINE3"
TEST_RESULT3=$(echo "$TEST_LINE3" | sed -E 's/oc[: ]*([0-9]+)([^0-9]|$)/<a href="https:\/\/orchestrator\.maphub\.it\/resources\/customer-stories\/\1" target="_blank" rel="noopener noreferrer">OC[\1]<\/a>\2/g')
echo "Trasformata 3: $TEST_RESULT3"
echo "Originale 4: $TEST_LINE4"
TEST_RESULT4=$(echo "$TEST_LINE4" | sed -E 's/oc[: ]*([0-9]+)([^0-9]|$)/<a href="https:\/\/orchestrator\.maphub\.it\/resources\/customer-stories\/\1" target="_blank" rel="noopener noreferrer">OC[\1]<\/a>\2/g')
echo "Trasformata 4: $TEST_RESULT4"
echo "Originale 5: $TEST_LINE5"
TEST_RESULT5=$(echo "$TEST_LINE5" | sed -E 's/oc[: ]*([0-9]+)([^0-9]|$)/<a href="https:\/\/orchestrator\.maphub\.it\/resources\/customer-stories\/\1" target="_blank" rel="noopener noreferrer">OC[\1]<\/a>\2/g')
echo "Trasformata 5: $TEST_RESULT5"
echo "---"

rm -f "$TMPFILE"

while IFS= read -r line; do
  # Trasforma i riferimenti OC in link in ogni riga (si ferma appena finisce la sequenza numerica)
  line=$(echo "$line" | sed -E 's/oc[: ]*([0-9]+)([^0-9]|$)/<a href="https:\/\/orchestrator\.maphub\.it\/resources\/customer-stories\/\1" target="_blank" rel="noopener noreferrer">OC[\1]<\/a>\2/g')
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
          # Trasforma i riferimenti OC in link anche nella descrizione
          desc_line=$(echo "$desc_line" | sed -E 's/oc[: ]*([0-9]+)([^0-9]|$)/<a href="https:\/\/orchestrator\.maphub\.it\/resources\/customer-stories\/\1" target="_blank" rel="noopener noreferrer">OC[\1]<\/a>\2/g')
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
        body=$(echo "$body" | sed -E 's/oc[: ]*([0-9]+)([^0-9]|$)/<a href="https:\/\/orchestrator\.maphub\.it\/resources\/customer-stories\/\1" target="_blank" rel="noopener noreferrer">OC[\1]<\/a>\2/g')
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