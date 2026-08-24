> Ticket: oc:8391

# Sostituire CSS custom home-layer con componente custom (camminiditalia)

## Cosa cambia
Il repo principale instrada, per lo shard `camminiditalia`, la variante
custom di `wm-home-layer` (implementata in wm-core, vedi overview dedicato in
quel repo) tramite il pattern `fileReplacements` già in uso per
`profile.page.ts`. Il blocco di regole CSS relativo a `wm-home-layer` viene
rimosso dai due file tema custom.

## Perché
Il CSS custom oggi applicato via selettori globali `!important` su un file
caricato a runtime (`MetaComponent`) è fragile e non verificato dal
compilatore. Spostando la personalizzazione in un componente Angular
dedicato (con `fileReplacements`), la stessa resa visiva diventa parte del
build type-checked, allineata al pattern già consolidato nel progetto.

## Requisiti
- [ ] Aggiungere una configuration `fileReplacements` per `camminiditalia` in
      `core/angular.json` (sia `architect.build.configurations` che
      `architect.serve.configurations`) che sostituisce
      `src/app/shared/wm-core/projects/wm-core/src/home/home-layer/home-layer.component.ts`
      con `home-layer.component.camminiditalia.ts`
- [ ] La configuration esistente `camminiditalia` (oggi con solo
      `profile.page.ts`) viene estesa con questa seconda entry, non duplicata
      in una configuration separata
- [ ] Selezione automatica della configuration lato dev/build nativo già
      gestita da `core/scripts/serve.js`/`gulpfile.js` esistenti — nessuna
      modifica necessaria lì (match su `shardName` già coprente
      `camminiditalia`/`camminiditaliadev`)
- [ ] Rimuovere il blocco di regole `wm-home-layer` (dal commento `oc:8305`
      fino alla regola `::before` del divisore, incluse) da
      `core/src/theme/camminiditalia/1.css` e
      `core/src/theme/camminiditaliadev/1.css` — le altre regole del file
      (`wm-home > .root`, `.wm-home-header-container`,
      `wm-map-details wm-status-filter`) restano intatte
- [ ] Verifica visiva: comportamento identico a oggi su camminiditalia (tab
      Home + pannello Mappa), nessuna regressione sugli altri shard
- [ ] **Vincolo di sequenza obbligatorio**: la PR con la nuova entry
      `fileReplacements` non va mergiata prima che (1) la PR wm-core con
      `home-layer.component.camminiditalia.ts` sia mergiata, e (2) il
      submodule wm-core in questo repo sia bumpato a un commit che include
      quel file. Il file non esiste oggi in nessun commit di wm-core
      (submodule pinnato a `RDO_ass_cammini_italia_2026_2`); mergiare prima
      rompe qualunque build/serve/deploy con `--configuration=camminiditalia`

## Rischi
- **Deploy web condiviso multi-tenant**: come documentato in
  `CLAUDE.md` → "Vincolo critico: il deploy web è condiviso multi-tenant",
  l'`EnvironmentService` decide lo shard a runtime via hostname — questo
  vale per il CSS runtime (`1.css`) ma **non per `fileReplacements`**, che è
  risolto a build-time. Il deploy web dedicato camminiditalia
  (`deploy-to-web-camminiditalia.js`) deve continuare a passare
  `--configuration=camminiditalia` per includere la variante; il deploy web
  generico condiviso non deve mai usarla — nessuna modifica prevista a questi
  script in questo ciclo, solo verifica che il comportamento attuale non
  cambi.
- **`--configuration=production` non applicabile oggi** (debito tecnico noto,
  19 errori preesistenti non correlati): questa feature aggiunge solo la
  configuration `camminiditalia`, non tocca `production` — nessuna
  interazione nuova con quel debito.
- **Nessuna pipeline CI builda con `--configuration=camminiditalia`** —
  verificato in `test-unit.yml`, `test-e2e.yml`, `preview.yml`,
  `deploy_prod.yml`: nessuno la esercita. L'unico punto che compila
  davvero quel ramo di codice è il deploy manuale
  (`deploy-to-web-camminiditalia`). Il vantaggio "type-checked" dichiarato
  nel `Perché` si materializza quindi solo in quel momento, non prima —
  accettato come debito noto, nessuna modifica ai workflow in questo ciclo.
- **Deploy dedicato senza health-check automatico, rollback manuale su due
  repo — rischio preesistente, non introdotto da questa feature**: a
  differenza di `deploy_prod.yml` (curl di verifica post-deploy),
  `deploy-to-web-camminiditalia.js` fa rsync diretto senza controllo. Un
  rollback dopo un deploy problematico richiede coordinamento manuale
  (revert CSS + revert `fileReplacements` + eventuale revert wm-core + nuovo
  giro manuale dello script). Il processo di deploy camminiditalia era già
  manuale prima di questo ticket — accettato come rischio noto, fuori scope.

## Out of scope
- Le altre regole CSS in `1.css` non relative a `wm-home-layer`.
- Qualsiasi modifica agli script di build/deploy (`serve.js`, `gulpfile.js`,
  `deploy-to-web-camminiditalia.js`) — il pattern `fileReplacements` è già
  automaticamente selezionato da questi script per lo shardName.
- Il pattern Base+estensione (specifico di wm-home-layer) resta un'eccezione
  da validare in questo ciclo — non viene promosso a policy generale in
  `CLAUDE.md` prima di verificarne il vantaggio reale (vedi overview wm-core
  e `notes.md`).

## Moduli toccati
- `core/angular.json` (nuova entry `fileReplacements` sulla configuration
  `camminiditalia` esistente)
- `core/src/theme/camminiditalia/1.css` (rimozione blocco `wm-home-layer`)
- `core/src/theme/camminiditaliadev/1.css` (rimozione blocco `wm-home-layer`)
- `CLAUDE.md` (nuova sezione "Criterio di scelta: a quale componente
  applicare il replace (foglia vs genitore)", sotto
  `## Personalizzazioni per-shard via fileReplacements` — a differenza del
  pattern Base+estensione, questo criterio è generale e riusabile
  indipendentemente dall'esito della validazione del pattern Base, quindi
  formalizzato subito su richiesta esplicita del developer, non rimandato)
