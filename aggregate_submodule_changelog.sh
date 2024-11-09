#!/bin/bash

# Trova l'ultimo tag
last_tag=$(git describe --tags --abbrev=0)
echo "Ultimo tag trovato: $last_tag"

# Elenco dei submodules
submodules=("core/src/app/shared/map-core" "core/src/app/shared/wm-core" "core/src/app/shared/wm-types")

# Stampa una riga vuota per separazione
echo ""
echo "Commit che aggiornano i submodules e i relativi messaggi interni del submodule:"

# Variabili per accumulare i messaggi di commit per ogni submodule
map_core_messages=""
wm_core_messages=""
wm_types_messages=""

# Salva il risultato di `git log` in una variabile temporanea
log_output=$(git log "$last_tag"..HEAD --oneline)

# Usa un ciclo `while` per leggere ogni riga della variabile `log_output`
while IFS= read -r commit_line; do
  commit_hash=$(echo "$commit_line" | awk '{print $1}')
  commit_message=$(echo "$commit_line" | cut -d' ' -f2-)
  echo "Analizzando commit $commit_hash: $commit_message"  # Debug: Stampa il commit corrente

  for submodule in "${submodules[@]}"; do
    # Controlla se il commit modifica un submodule cercando 'Subproject commit'
    if git show "$commit_hash" -- "$submodule" | grep -q 'Subproject commit'; then
      echo "Trovato aggiornamento per $submodule nel commit $commit_hash: $commit_message"

      # Ottieni il nuovo hash del commit del submodule con awk
      new_commit=$(git show "$commit_hash" -- "$submodule" | awk '/\+Subproject commit/ {print $3}')

      # Verifica se abbiamo un nuovo hash del submodule
      if [ -n "$new_commit" ]; then
        echo "  Nuovo hash del submodule: $new_commit"  # Debug: Stampa il nuovo hash

        # Ottieni il messaggio del commit del submodule
        submodule_message=$(git -C "$submodule" log -1 --format="%s" "$new_commit")
        echo "  Messaggio del commit del submodule ($submodule): $submodule_message"  # Debug: Stampa il messaggio del commit

        # Aggiungi il messaggio del commit alla variabile appropriata per ogni submodule
        case $submodule in
          "core/src/app/shared/map-core")
            map_core_messages+="\n  - $submodule_message"
            ;;
          "core/src/app/shared/wm-core")
            wm_core_messages+="\n  - $submodule_message"
            ;;
          "core/src/app/shared/wm-types")
            wm_types_messages+="\n  - $submodule_message"
            ;;
        esac
      else
        echo "  Errore: impossibile trovare il nuovo commit per $submodule nel commit $commit_hash"
      fi
    else
      echo "  Nessun aggiornamento per $submodule nel commit $commit_hash"  # Debug: Se non trova un aggiornamento del submodule
    fi
  done
done <<< "$log_output"

# Costruisci la sezione da aggiungere al changelog
changelog_update=""

if [ -n "$map_core_messages" ]; then
  changelog_update+="\n### Aggiornamenti per core/src/app/shared/map-core:$map_core_messages"
fi

if [ -n "$wm_core_messages" ]; then
  changelog_update+="\n### Aggiornamenti per core/src/app/shared/wm-core:$wm_core_messages"
fi

if [ -n "$wm_types_messages" ]; then
  changelog_update+="\n### Aggiornamenti per core/src/app/shared/wm-types:$wm_types_messages"
fi

# Stampa per debug cosa conterrà changelog_update
echo -e "\nContenuto da aggiungere a CHANGELOG.md:\n$changelog_update\n"

# Modifica il changelog solo se ci sono aggiornamenti da aggiungere
if [ -n "$changelog_update" ]; then
  temp_file=$(mktemp)

  # Leggi CHANGELOG.md riga per riga
  while IFS= read -r line; do
    echo "$line" >> "$temp_file"
    # Trova l'ultimo tag e aggiungi i nuovi aggiornamenti subito dopo
    if [[ $line == "## [$last_tag]"* ]]; then
      printf "%b\n" "$changelog_update" >> "$temp_file"
    fi
  done < CHANGELOG.md

  # Sovrascrivi CHANGELOG.md con il contenuto aggiornato
  mv "$temp_file" CHANGELOG.md

  echo "Aggiornamenti aggiunti a CHANGELOG.md sotto la release $last_tag"
else
  echo "Nessun aggiornamento dei submodules da aggiungere al changelog."
fi
