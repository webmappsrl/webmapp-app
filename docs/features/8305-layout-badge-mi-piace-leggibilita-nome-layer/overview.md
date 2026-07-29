> Ticket: oc:8305

# Ricerca: sistemare layout del badge "mi piace" e leggibilità del nome del layer

## Cosa cambia

- `core/src/theme/camminiditalia/1.css` (theme CSS caricato dinamicamente solo per lo shard camminiditalia, via `<link>` iniettato da `MetaComponent` in wm-core su `theme/${shardName}/${appId}.css`) viene estesa per trasformare la schermata di apertura layer (`wm-home-layer`, dettaglio cammino) da overlay-su-foto a un layout con foto "pulita" in alto e una fascia bianca sotto contenente logo + divisore verticale + titolo — replicando il mockup fornito dal cliente come commento sul ticket oc:8164. Nessuna modifica al componente condiviso `home-layer.component.*` in wm-core: il default per le altre istanze (es. Forestas) resta invariato.
- `core/src/app/pages/favourites/favourites-layers/favourites-layers.component.scss`: l'altezza fissa `176px` impostata su `wm-layer-box` viene aggiornata per restare coerente con la nuova altezza uniforme decisa nel fix di wm-core (oc:8305, overview wm-core).

## Perché

Il cliente Cammini d'Italia ha richiesto (commento su oc:8164, con mockup allegato) una grafica differente per la schermata di apertura layer, "per avere una comunicazione coerente con gli altri canali". Realizzarla come override CSS instance-specific evita di introdurre una variante nel componente condiviso `home-layer`, usato anche da altre istanze che non hanno richiesto questo redesign — stesso principio già seguito per altre personalizzazioni in `theme/<shard>/`.

## Requisiti

- [ ] `theme/camminiditalia/1.css` replica il mockup: foto senza overlay testuale, fascia bianca sotto con logo (a sinistra), divisore verticale arancione, titolo in testo scuro — realizzato con CSS Grid sulle classi globali esistenti (`ViewEncapsulation.None`: `.wm-box-title`, `.wm-home-layer-logo-overlay`), senza alcuna modifica a `home-layer.component.html`/`.scss` in wm-core
- [ ] Il cuoricino "mi piace" resta overlay sulla foto (in alto, posizione attuale), non entra nella fascia bianca
- [ ] Nessun'altra istanza (Forestas, ecc.) è impattata visivamente — il layout di default di `home-layer` resta quello attuale
- [ ] `favourites-layers.component.scss` aggiornato con la nuova altezza uniforme di `wm-layer-box` (valore deciso in fase di piano, coordinato con la modifica in wm-core)

## Rischi

- **Fragilità dell'override CSS-only**: l'override in `1.css` dipende dalla struttura DOM attuale di `home-layer.component.html` (titolo/logo/cuoricino come sibling diretti dentro `wm-img`). Se in futuro quel template viene modificato in wm-core per un motivo non legato a camminiditalia, l'override rischia di rompersi silenziosamente — nessun test automatico coprirà questa regressione visiva (nessun test e2e su questa schermata per questa istanza). Verificato in fase di challenge che geohub ha già un proprio override indipendente su `wm-home-layer` (nasconde la foto, destruttura il titolo): conferma che l'approccio CSS-only è già un pattern in uso nel progetto, e restando isolati in `1.css` non c'è interferenza tra i due shard.
- **Coordinamento tra due repo sul valore di altezza**: il valore di altezza uniforme scelto in wm-core (`layer-box.component.scss`) deve essere applicato identico anche qui (`favourites-layers.component.scss`) — rischio di disallineamento se i due branch/PR non vengono aggiornati in sincronia. Mitigazione: commento esplicito in entrambi i file che referenzia l'altro percorso + oc:8305 (nessuna CSS custom property condivisa tra i repo oggi, costruirla è fuori scope).
- **Nessun kill-switch**: il redesign camminiditalia non ha un flag di attivazione — è già isolato per costruzione (CSS caricato solo per quello shard), quindi un rollback riguarda solo camminiditalia e non altre istanze; resta comunque un rollback binario (revert + redeploy del file CSS), non graduale.
- **Cache-busting assente su `theme/<shard>/<id>.css`** (`meta.component.ts` in wm-core, nessun query param di versione sul link): limite pre-esistente dell'infrastruttura theme condivisa, non introdotto da questo ticket. Un aggiornamento di `1.css` non è garantito raggiungere tutti i client con cache calda in tempi deterministici. Fuori scope: risolverlo toccherebbe codice wm-core condiviso da tutti gli shard.

## Out of scope

- Testo "Sentieri"→"Tappe": operazione sul `config.json` gestito da backend/Nova per lo shard camminiditalia, non da questo repo — segnalato come follow-up operativo per chi gestisce quella configurazione.
- Modifiche al componente condiviso `home-layer` in wm-core (nessun cambiamento di default per le altre istanze).
- Cache-busting su `theme/<shard>/<id>.css`: limite pre-esistente dell'infrastruttura, non risolto in questo ciclo.

## Moduli toccati

- `core/src/theme/camminiditalia/1.css`
- `core/src/app/pages/favourites/favourites-layers/favourites-layers.component.scss`
