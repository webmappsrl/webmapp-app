> Ticket: oc:8382

# Notes — Fix build --prod per deploy e deploy-to-web (webmapp-app + wm-webapp)

## Deviazioni dal piano

- **`core/src/app/pages/poi/utils.ts` non era dead code come il resto della cartella `pages/poi`.** Il piano (Task 1) prevedeva la rimozione integrale della cartella `pages/poi/` come parte della pulizia di `PoiPage`. La build di verifica post-rimozione ha rivelato un nuovo errore non previsto: `core/src/app/pages/map/map.page.ts:19:55 - error TS2307: Cannot find module '../poi/utils'`. `map.page.ts` (pagina viva, non correlata a `PoiPage`) importava da lì tre funzioni di callback Swiper (`beforeInit`, `setTranslate`, `setTransition`) per un effetto fade. La ricerca iniziale di riferimenti a `pages/poi` (grep su `"pages/poi\|PoiPageModule\|PoiPage\b"`) non aveva individuato questo import perché il path relativo (`'../poi/utils'`) non contiene la stringa `pages/poi`. Fix: il file è stato spostato (non ricreato da zero, contenuto invariato) in `core/src/app/pages/map/utils.ts`, e l'import in `map.page.ts` aggiornato al nuovo path relativo `./utils`.
- **Il fix `IHIT`→`Hit` in `downloaded-tracks-box.component.ts` non si è fermato al solo cambio di tipo, come già previsto nell'overview/plan aggiornati durante la Fase: challenge**: `open(id: number)` è stato allargato a `open(id: number | string)` in coincidenza col cambio tipo, come pianificato — nessuna sorpresa qui, la previsione della challenge si è rivelata corretta.
- **Task aggiuntivo non previsto dal piano originale (Task 2b): fix di una collisione di dipendenze (`domhandler`) che impediva il completamento della build `--prod` anche dopo la risoluzione di tutti gli errori TypeScript.** Vedi sezione "Bug trovati" per il dettaglio tecnico completo. Aggiunto sia a `plan.md` (Task 2b) sia a `overview.md` (sezione Moduli toccati) a lavoro concluso, per coerenza con quanto effettivamente fatto.

## Bug trovati

### Build `--configuration production` falliva in fase "Generating index html" anche a zero errori TypeScript

Dopo aver risolto tutti i 17 errori TS/Angular (Task 1+2), `ionic build --configuration production` continuava a fallire (`EXIT_CODE=1`) con:

```
✖ Index html generation failed.
document.documentElement?.setAttribute is not a function
```

**Diagnosi (rigorosa, non per tentativi):**
1. Riprodotto identico su Node 20.19.0 e 22.22.0 — escluso un problema di versione Node.
2. Riprodotto identico anche con `index.html` "corretto" (script spostato dentro `<head>`, poi ripristinato all'originale perché non era la causa) — escluso un problema di markup.
3. Patchato temporaneamente (e poi ripristinato) `node_modules/@angular-devkit/build-angular/src/builders/browser/index.js` per stampare lo stack completo dell'errore → tracciato fino a `beasties/dist/index.cjs` (libreria di inlining CSS critico usata da `@angular/build` quando `optimization: true`), funzione `createDocument`.
4. Riprodotto in isolamento totale (script Node standalone, nessun Angular/webpack) chiamando `beasties.process()` direttamente sul nostro `index.html` — fallisce identico al primo tentativo in un processo pulito, escludendo teorie legate a chiamate multiple nello stesso processo.
5. Causa reale, confermata confrontando i prototipi: il progetto aveva **due copie fisiche incompatibili di `domhandler`** in `node_modules` — `4.3.1` (portata da `@capacitor/assets@3.0.5` → `node-html-parser@5.4.2`, dependency pinnata esatta, mai richiamata da `gulpfile.js` in questo progetto) e `5.0.3` (richiesta da `beasties`/`htmlparser2`, entrambi usati da `@angular/build` per l'inlining critical CSS). Le due major sono incompatibili tra loro, quindi npm non poteva dedupllicarle. Risultato: l'elemento `<html>` parsato da `htmlparser2` aveva un prototipo `Element` diverso dalla classe `domhandler.Element` che `beasties` tenta di estendere con `setAttribute` — il binding fallisce silenziosamente per una guardia interna di `beasties` (`let extended = false` a livello di modulo, la property viene aggiunta al prototipo sbagliato).
6. Verificato che il bug è presente identico anche nell'ultima versione disponibile di `beasties` (0.4.3) — un aggiornamento della libreria non lo avrebbe risolto. `@angular/build@20.3.14` pinna comunque `beasties` a `0.3.5` esatto, quindi non era nemmeno banale forzarne una versione diversa.

**Fix scelto (dopo discussione con il dev, che ha esplicitamente chiesto di non disabilitare `inlineCritical` e di risolvere la causa reale):** aggiunto un campo `overrides` scoped in `core/package.json` per forzare `node-html-parser` (unica dipendenza che porta la vecchia `domhandler@4.3.1`, tramite `@capacitor/assets`) alla versione `^9.0.1`, che dipende da `css-select@^5.1.0` → `domhandler@^5.0.2`, compatibile con la versione richiesta da `beasties`. Dopo `npm install`, `npm ls domhandler` mostra un'unica copia deduplicata (`5.0.3`), e la build `--prod` completa con successo **con `inlineCritical` pienamente attivo** (verificato: `www/index.html` generato contiene effettivamente un `<style>` con il CSS critico inlineato).

Rischio di regressione valutato e ritenuto trascurabile: `@capacitor/assets` non è mai invocato (né via `require` né via CLI) in nessuno script di questo progetto (verificato con grep su `gulpfile.js`); l'unico uso di `node-html-parser` al suo interno (`dist/platforms/pwa/index.js`, mai eseguito in questo progetto) si limita ad API stabili (`parse`, `querySelector`, `querySelectorAll`) invariate tra major. Il diff di `package-lock.json` conferma che l'override è puramente deduplicativo: -158/+46 righe, tutte relative alla stessa catena di pacchetti (`domhandler`, `css-select`, `domutils`, `dom-serializer`, `he`→`entities`), nessun pacchetto estraneo toccato.

## Decisioni

- **Rimozione totale di `PoiPage`/route `poi`** (invece di "ripararla" contro l'attuale API di `wm-map`): confermata dal dev dopo verifica che nessuna pagina/deep-link vi punta (Fase: reverse-interaction, domanda 2).
- **Nessun tocco a `SharedModule`** (export mancante di `WmCoreModule`): confermato dal dev come debito tecnico accettato, non affrontato in questo ciclo (Fase: reverse-interaction, domanda 5) — annotato anche in `CLAUDE.md` (Fase: update-context).
- **Rischio "nessun rollback atomico, rsync diretto in produzione"** (emerso in Fase: challenge, asse "worst case"): accettato esplicitamente dal dev come rischio pre-esistente dell'architettura di deploy, non affrontato in questo ciclo.
- **Fix della collisione `domhandler` invece di disabilitare `inlineCritical`**: il dev ha esplicitamente richiesto di investigare una soluzione che non rinunciasse alla feature, invece di accettare il workaround inizialmente proposto. La soluzione trovata (npm `overrides` scoped) è più pulita e non richiede nessun compromesso sulle ottimizzazioni di produzione.
- **PR unica per repo con commit separati** (Task 1, Task 2, Task 2b, Task 3/4): confermato dal dev in Fase: challenge, asse "rischi architetturali", per permettere un rollback mirato.

## Follow-up

- Debito tecnico noto, non affrontato in questo ciclo: `SharedModule` (`core/src/app/components/shared/shared.module.ts:37`) importa `WmCoreModule` ma non lo ri-esporta. Un futuro consumer che tenti di usare `wm-image-gallery`/`wm-related-urls`/`wm-track-audio` fuori da `WmCoreModule` diretto incapperà nello stesso errore di build "not a known element" incontrato in questo ticket con `PoiPage`.
- Nessuna modifica ai budget bundle (`angular.json`, `maximumWarning: 2mb`): la build `--prod` di `webmapp-app` produce un bundle di 3.02MB, sopra la soglia di warning ma sotto quella di errore (5mb) — stesso ordine di grandezza del warning già presente in `wm-webapp` (2.91MB). Nessuna azione richiesta in questo ciclo, ma se il bundle continuasse a crescere converrebbe rivedere la soglia o investigare cosa lo fa superare i 2MB.
- Verifica Surge preview (home + sezione downloaded-tracks in webmapp-app, home shard camminiditalia in wm-webapp) è un gate manuale non eseguito durante l'implementazione — da completare dal dev prima del merge, come da Requisiti in `overview.md`.
