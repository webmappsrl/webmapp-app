# aggregate_submodule_changelog.sh
# Aggiungi log di debug all'inizio
echo "Esecuzione dello script di aggregazione del changelog dei submodules..."

AGGREGATED_CHANGELOG="AGGREGATED_CHANGELOG.md"
CHANGELOG="CHANGELOG.md"

> $AGGREGATED_CHANGELOG

echo "# Aggregated Submodule Changelog" > $AGGREGATED_CHANGELOG

submodules=("core/src/shared/map-core" "core/src/shared/wm-core" "core/src/shared/wm-types")

for submodule in "${submodules[@]}"; do
  echo "Controllo cambiamenti per il submodule: $submodule"
  if git diff HEAD^ HEAD -- "$submodule" | grep -q 'Subproject commit'; then
    echo "Trovati cambiamenti in $submodule"
    echo -e "\n## Changes in $submodule" >> $AGGREGATED_CHANGELOG

    previous_commit=$(git log -1 --pretty=format:"%h" HEAD^ -- "$submodule")
    current_commit=$(git log -1 --pretty=format:"%h" HEAD -- "$submodule")
    (cd $submodule && git log --oneline "$previous_commit".."$current_commit") >> $AGGREGATED_CHANGELOG
  else
    echo "Nessun cambiamento trovato in $submodule"
  fi
done

if [ -f $CHANGELOG ]; then
  cat $AGGREGATED_CHANGELOG >> $CHANGELOG
else
  mv $AGGREGATED_CHANGELOG $CHANGELOG
fi

echo "Aggregated changelog added to $CHANGELOG."
