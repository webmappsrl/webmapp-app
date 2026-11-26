> Ticket: oc:9042

# webapp desktop: punti bianchi non cliccabili sulle track

## Cosa cambia

I due deploy web dell'app diventano, ciascuno, due comandi:

| Target | Veloce, senza `assets` (come oggi) | Completo, nuovo |
|---|---|---|
| `mobile.webmapp.it` | `npm run deploy-to-web-default` | `npm run deploy-to-web-default-full` |
| `1.camminiditalia.mobile.webmapp.it` (docroot `mobile.camminiditalia.webmapp.it/`) | `npm run deploy-to-web-camminiditalia` | `npm run deploy-to-web-camminiditalia-full` |

Ogni coppia punta allo stesso file in `core/scripts/`: con l'argomento `--full` l'`--exclude
assets` di rsync non viene passato, e il contenuto della build viene pubblicato per intero,
compresi `assets/` e `map-core/assets/`. `npm run deploy-to-web` (`core/scripts/deploy-to-web.js`)
e la CI di produzione (`.github/workflows/deploy_prod.yml:65`) restano sui deploy veloci.

È lo stesso intervento fatto in `wm-webapp` per lo stesso ticket (overview gemella nello stesso
slug, in quel repo).

## Perché

Il bug è emerso in `wm-webapp`: su `1.camminiditalia.webmapp.it` mancava
`map-core/assets/line-icon-arrow.png`, l'icona delle frecce del senso di percorrenza della track
selezionata, e restava visibile solo il disco bianco sotto la freccia. La causa era
`RSYNC_ARGS = ['-av', '--exclude', 'assets']`, copiato in oc:8512 da questo repo: un pattern
rsync senza `/` iniziale esclude **ogni** cartella `assets` a qualunque profondità, quindi anche
`map-core/assets/`.

Qui la stessa riga sta in `core/scripts/deploy-to-web-default.js:13` e
`core/scripts/deploy-to-web-camminiditalia.js:20`, con questi effetti verificati il 25/11:

| Host | `map-core/assets/line-icon-arrow.png` |
|---|---|
| `1.camminiditalia.mobile.webmapp.it` (build dedicata, `main.a563b9a6572c1add.js`; è l'host della health check in `.github/workflows/deploy_prod.yml:69`) | `500 text/html`: **il file manca, il bug è già in produzione** |
| `mobile.webmapp.it` | `200 image/png`, portata da un deploy precedente |

La health check della CI fa solo `curl -f` sulla root, quindi l'asset mancante non l'ha fermata. Su
entrambi gli host un asset nuovo o modificato non arriverebbe mai in produzione, e un server nuovo
resterebbe senza.

L'unico script che oggi pubblica asset, `deploy-to-web-assets` (`core/package.json:21`), copia
solo `www/assets/*` e solo verso `mobile.webmapp.it`: non copre `map-core/assets` né camminiditalia.

## Requisiti

- [ ] `npm run deploy-to-web-default-full` pubblica `www/` su `mobile.webmapp.it` senza escludere
      nessuna cartella `assets`
- [ ] `npm run deploy-to-web-camminiditalia-full` pubblica `www-camminiditalia/` nella docroot
      `/var/www/html/mobile.camminiditalia.webmapp.it/` senza escludere nessuna cartella `assets`
- [ ] `https://1.camminiditalia.mobile.webmapp.it/map-core/assets/line-icon-arrow.png` risponde
      `200 image/png`: subito con un caricamento manuale di `map-core/assets` sul server, poi
      garantito dal deploy completo
- [ ] `npm run deploy-to-web-default`, `npm run deploy-to-web-camminiditalia` e
      `npm run deploy-to-web` si comportano esattamente come oggi
- [ ] I due script spiegano nel commento di testa che `--exclude assets` esclude anche
      `map-core/assets/`, e quando serve il deploy completo
- [ ] La tabella Comandi del `CLAUDE.md` e `docs/knowledge/build-e-deploy-web.md` riportano i
      nuovi comandi
- [ ] Verifica con `node --check` sugli script e lettura del comando rsync composto nei due casi
      (senza lanciarlo contro il server)

## Rischi

- **Il primo deploy completo pubblica mesi di asset arretrati, per tutte le istanze.** Il 25/11,
  confrontando con `shasum` i file serviti da `mobile.webmapp.it` con il working tree (branch di
  oc:8998, non `main`), 14 file su 91 sono diversi: il font delle icone `webmapp.*` con il suo
  `style.css`, gli `i18n/*.ts`, `direction.svg`, `icons/passport-stamp.svg`. rsync sovrascrive
  senza tenere copie e non toglie nulla (niente `--delete`). Deciso dal dev: il deploy completo lo
  lancia il team a mano, senza procedure o controlli aggiuntivi nello script.
- **Un asset mancante non fa fallire nulla.** Il server risponde `500` (o `200` con l'`index.html`
  alla root) e la health check di `deploy_prod.yml:69` guarda solo la home: è così che il bug è
  arrivato in produzione su `1.camminiditalia.mobile.webmapp.it`. Accettato dal dev: nessun
  controllo sugli asset nella CI.
- **Il deploy veloce resta incompleto per costruzione**, come scelto dal dev: mitigato dal
  commento negli script e dalla riga nel `CLAUDE.md`.

## Out of scope

- Rimuovere o riscrivere `deploy-to-web-assets`, che diventa ridondante con
  `deploy-to-web-default-full`
- Cambiare cosa lanciano `npm run deploy-to-web` e la CI di produzione
- Controllo nella health check che un asset (per esempio `map-core/assets/line-icon-arrow.png`)
  arrivi come immagine dopo il deploy
- Modifiche a `map-core`

## Moduli toccati

Repo `webmapp-app`:

- `core/scripts/deploy-to-web-default.js` — argomento `--full`, commento di testa
- `core/scripts/deploy-to-web-camminiditalia.js` — argomento `--full`, commento di testa
- `core/package.json` — script `deploy-to-web-default-full` e `deploy-to-web-camminiditalia-full`
- `CLAUDE.md` — righe nella tabella Comandi
- `docs/knowledge/build-e-deploy-web.md` — i due deploy, la trappola del pattern
