#!/bin/bash

# Nome del file changelog aggregato temporaneo
AGGREGATED_CHANGELOG="AGGREGATED_CHANGELOG.md"
CHANGELOG="CHANGELOG.md"

# Pulizia del file temporaneo
> $AGGREGATED_CHANGELOG

echo "# Aggregated Submodule Changelog" > $AGGREGATED_CHANGELOG

# Elenco dei submodules
submodules=("core/src/shared/map-core" "core/src/shared/wm-core" "core/src/shared/wm-types")

# Itera sui submodules e raccoglie i commit recenti solo se il submodule è stato aggiornato
for submodule in "${submodules[@]}"; do
  # Controlla se il submodule è cambiato nel commit più recente del repository principale
  if git diff HEAD^ HEAD -- "$submodule" | grep -q 'Subproject commit'; then
    echo -e "\n## Changes in $submodule" >> $AGGREGATED_CHANGELOG

    # Identifica i commit nel submodule dalla revisione precedente alla revisione corrente
    previous_commit=$(git log -1 --pretty=format:"%h" HEAD^ -- "$submodule")
    current_commit=$(git log -1 --pretty=format:"%h" HEAD -- "$submodule")
    (cd $submodule && git log --oneline "$previous_commit".."$current_commit") >> $AGGREGATED_CHANGELOG
  fi
done

# Aggiungi il contenuto del changelog aggregato al changelog principale
if [ -f $CHANGELOG ]; then
  cat $AGGREGATED_CHANGELOG >> $CHANGELOG
else
  mv $AGGREGATED_CHANGELOG $CHANGELOG
fi

echo "Aggregated changelog added to $CHANGELOG."
