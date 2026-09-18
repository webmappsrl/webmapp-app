# Release Please: quando propone la versione sbagliata

Il workflow usa `google-github-actions/release-please-action@v3` in simple mode
(`release-type: node`). Lo stato è tracciato con i tag `v{version}` e le GitHub Releases.

**La regola che previene il problema**: non fare **mai** un rollback manuale della versione dopo
che una PR di release-please è stata mergiata. Se serve cambiare versione, si usa `release-as`.

## Diagnosi

```bash
# 1. le release GitHub: la "Latest" è il punto di partenza
gh release list --repo webmappsrl/webmapp-app --limit 10

# 2. PR aperte di release-please
gh pr list --repo webmappsrl/webmapp-app

# 3. i commit feat/fix dall'ultimo tag
git log v3.1.13..HEAD --oneline | grep -E "^[a-f0-9]+ (feat|fix)"
```

## La causa più comune

La PR di release-please viene mergiata a mano e poi la versione viene rollbackata.
Release-please considera la versione della PR mergiata come «ultima release» e calcola da lì.

## Forzare una versione

1. Chiudi la PR sbagliata: `gh pr close <N> --repo webmappsrl/webmapp-app`
2. Cancella il branch:
   `gh api repos/webmappsrl/webmapp-app/git/refs/heads/release-please--branches--main--components--webmapp-app -X DELETE`
3. Aggiungi `release-as: X.Y.Z` in `.github/workflows/release_please.yml` e pusha:

   ```yaml
   - uses: google-github-actions/release-please-action@v3
     with:
       release-type: node
       package-name: webmapp-app
       release-as: 3.1.14   # ← temporaneo
   ```

4. Aspetta la PR corretta e mergiala.
5. **Subito dopo il merge**: rimuovi `release-as` e pusha.
