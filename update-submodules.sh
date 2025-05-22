#!/bin/bash

set -e

BASE_PATH="core/src/app/shared"
SUBMODULES=("map-core" "wm-core" "wm-types")
HAS_CHANGES=false

git fetch --recurse-submodules
git submodule update --remote --merge

for NAME in "${SUBMODULES[@]}"; do
  SUBMODULE_PATH="${BASE_PATH}/${NAME}"
  echo "🔍 Controllo aggiornamenti per $SUBMODULE_PATH"

  OLD_COMMIT=$(git ls-tree HEAD "$SUBMODULE_PATH" | awk '{print $3}')

  cd "$SUBMODULE_PATH"
  NEW_COMMIT=$(git rev-parse HEAD)
  CHANGELOG=$(git log --pretty=format:"- %s" "${OLD_COMMIT}..${NEW_COMMIT}" || echo "")
  cd - > /dev/null

  if [[ "$OLD_COMMIT" != "$NEW_COMMIT" && -n "$CHANGELOG" ]]; then
    echo "✅ Cambiamenti trovati in $NAME: $OLD_COMMIT → $NEW_COMMIT"
    git add "$SUBMODULE_PATH"
    git commit -m "chore($NAME): bump to ${NEW_COMMIT:0:7}" -m "$CHANGELOG"
    HAS_CHANGES=true
  else
    echo "ℹ️ Nessun cambiamento rilevante per $NAME"
  fi
done

if [ "$HAS_CHANGES" = true ]; then
  echo "🚀 Commit effettuati. Ora puoi fare 'git push' per inviarli."
else
  echo "✅ Nessun aggiornamento da committare."
fi
