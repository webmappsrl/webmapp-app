> Ticket: oc:8702

# Notes — Passaporto: condivisione della tappa percorsa

## Divergenze dal piano, task per task

### Task 0 prerequisito CORS

In locale il disco media è minio, non `wmfe` di produzione: il CORS non si può verificare da qui.
Resta da controllare prima del rilascio (vedi Follow-up). Nel ramo web, se il `fetch` dell'immagine
fallisce, l'app apre `image_url` in una nuova scheda come ultimo ripiego.

### Task 1 trasparenza dei layer

Il piano indicava `$canvas->place(..., opacità)`, che in Intervention Image 2.7.2 non esiste
(`insert()` non ha l'opacità). Il layer si disegna su una copia del canvas e si fonde con
`imagecopymerge` a `round(opacity * 100)`; con opacità 1.0 si disegna direttamente, così
`render(UgcTrack …)` resta identico al pixel. L'hash di caratterizzazione è l'md5 del PNG: su
un'altra versione di GD o libpng può cambiare senza che il disegno sia cambiato.

### Task 4 asset

Sfondo e logo non sono stati forniti. Sfondo beige con curve di livello generato da script: si
sostituisce con il PNG definitivo senza toccare il codice. Il logo di Cammini d'Italia era stato
copiato da `instances/camminiditalia/resources/icon-only.png`; dopo la review finale si legge
invece dalla media `icon` dell'App del layer (vedi «Modifiche richieste dopo la review finale»).

Altre differenze dal piano emerse nel Task 4:
- i file di lingua stanno in `resources/lang/<lang>/passport_share.php`, perché `lang_path()` di
  questo repo punta lì, non a `lang/`;
- nei dati reali `ref` contiene già «Tappa …» (es. «Tappa 7b»): il prefisso si toglie e si rimette
  tradotto, altrimenti l'immagine diceva «Tappa Tappa 1»;
- il margine di circa il 30% intorno alla tappa: inizialmente ottenuto allargando il `focusBbox`
  in `camminiditalia` per compensare il 15% privato di `padBbox`; dopo la review del ticket
  `renderLayers` accetta il margine come parametro e `camminiditalia` passa 0,30 direttamente. Lo
  zoom delle tile è a scatti, quindi il margine effettivo può risultare più largo;
- il logo del cammino era inizialmente ritagliato in un cerchio bianco; dopo la review finale si
  disegna così com'è, in un riquadro `LOGO_BOX_SIZE` di 240 px;
- un `ref` che non comincia con «Tappa» né con una cifra (es. «Percorso urbano») si mostra così
  com'è, senza il prefisso «Tappa».

### Task 8 spec di caratterizzazione

Lo spec del Task 7 cambia solo nelle chiavi del mock di `LangService` (da `services.share.*` alle
chiavi in italiano), perché il cambio delle chiavi è voluto; il resto resta identico.


### Modifiche richieste dopo la review finale

Provando l'app in locale il developer ha chiesto, dopo l'approvazione del piano:
- **pagina pubblica senza link all'app**: solo immagine e dati (il segnaposto `config('app.url')`
  portava al login di Nova);
- **logo del cammino senza cerchio bianco**;
- **logo di Cammini d'Italia preso dal database** (media `icon` dell'App del layer, ripiego
  `icon_small`), senza file copiato nel repo;
- **condivisione web in un tocco**: il flusso a due tocchi non era intuitivo. Il tocco genera e
  condivide subito; se il browser rifiuta perché l'attivazione utente è scaduta (`NotAllowedError`)
  il pulsante diventa «Condividi ora». Un retry automatico non è possibile: il browser accetta
  `navigator.share` solo come reazione a un tocco recente. Sul desktop che non condivide file
  l'immagine si scarica con l'avviso «Immagine scaricata»;
- **cache sul backend**: se l'immagine della coppia utente-tappa esiste ed è stata generata con gli
  stessi dati, l'endpoint la restituisce senza ridisegnarla;
- **mappa più fine**, scelta fra cinque mockup (variante A): tappa gialla 6 px con bordo bianco
  2 px, cammino rosso 2 px al 60%, pallini 13 px con anello bianco 2 px. Una variante ancora più
  fine (5 px, pallini 11 px) è stata scartata perché si perdeva sulla mappa.

### Anteprima della condivisione al posto di «Condividi ora»

Provando sul web, il developer ha trovato che «Condividi ora» sembra un pulsante che non funziona.
Il secondo tocco nel browser non si può eliminare senza preparare l'immagine prima del tocco: il
browser apre `navigator.share` solo entro pochi secondi da un gesto, e la generazione può durarne di
più; un'attesa o un retry automatico peggiorano. La preparazione anticipata all'apertura della
pagina è stata scartata per il carico sul backend (16.000 utenti attivi), anche se limitata al web e
coperta dalla cache.

Si adotta un'**anteprima ovunque**, app nativa compresa: il tocco su «Condividi» apre una pagina
nella modale del passaporto con l'immagine generata e i pulsanti. Nel nativo c'è solo «Condividi»,
perché il foglio di sistema comprende già il salvataggio in galleria; un plugin per salvare in
galleria è stato scartato (dipendenza nativa nuova, permessi Foto, revisione degli store). Nel
browser ci sono «Condividi» (solo se il browser condivide file) e «Scarica». Lo stato «Condividi
ora» sparisce. Costo accettato: un tocco in più nel nativo, ripagato dal vedere l'immagine prima di
pubblicarla.

Come è stata realizzata:
- pagina nuova `wm-passport-share-preview`, spinta nell'`ion-nav` della modale con
  `host.openSharePreview(stage)`; la modale le passa `layerId`, che quindi non serve più alla pagina
  della tappa (il piano, Task 10, lo aggiungeva lì);
- `WmShareImageService` espone `prepareNative`/`shareNativePrepared` per il nativo e
  `prepareWeb`/`canShareFiles`/`shareWeb`/`downloadWeb` per il web; `shareNative`, usato dalla
  condivisione UGC dell'app, mantiene firma e comportamento;
- nel caso CORS l'anteprima mostra l'immagine da `image_url` e un solo pulsante «Apri immagine»;
- testi tolti: «Condividi ora», «Immagine scaricata»; aggiunti: «Condividi la tappa»,
  «Sto preparando l'immagine…», «Scarica», «Apri immagine»;
- nel nativo l'immagine si scarica due volte (una per mostrarla subito, una nella cache per il
  foglio di condivisione): accettato, l'anteprima compare prima.

### Aggiunte non previste dal piano

- `renderLayers` di `wm-package` accetta sui marker le chiavi opzionali `size`, `ringWidth` e
  `color`; i default (28 px, anello 4 px, verde/rosso) mantengono il comportamento del piano.
- `PassportStageShare::forUserAndTrack` intercetta `UniqueConstraintViolationException` e rilegge
  la riga, per due richieste contemporanee sulla stessa tappa; un accessor `app_id` (dall'app del
  layer) serve a `MediaObserver` di `wm-package`, che richiede un'app valida sui media.
- `compose()` riceve lo snapshot già calcolato dal controller (quarto argomento), così si calcola
  una volta sola.
- **Cache dell'immagine:** l'impronta dipende da layer e tappa (`updated_at`), numero e ultimo
  aggiornamento delle tappe del cammino, media del logo del layer e dell'icona dell'App, lingua e
  l'hash delle costanti di `StageShareLayout`, `StageShareIcons` e `StageShareText`, del contenuto
  dello sfondo, dei font e dei file di lingua `passport_share.php`. Cambiare una misura o lo sfondo
  rinnova la cache da solo; **`VERSION` va alzata solo quando cambia il codice che disegna**,
  compreso `MapRenderService` di `wm-package` (codice o costanti).
  Al primo deploy tutte le immagini già in cache vengono rigenerate una volta.

### Eventi PostHog della condivisione

La condivisione della tappa usa lo stesso evento della condivisione già esistente nell'app,
`contentShared`, con `content_type: 'passport-stage'`, `content_id` (id della tappa), `layer_id` e
la prop nuova `share_method` (`native-share`, `web-share`, `download`, `open-image`; tipo
`WmShareMethod` in `wm-types`). Parte solo ad azione compiuta: mai all'apertura dell'anteprima né
su annullamento. `download` vale sia per «Scarica» sia per il ripiego automatico quando la
condivisione del browser fallisce.

### Correzioni dalla review del ticket

- `/progress` non carica più la geometria delle tappe: sulla Via Francigena (99 tappe) i dati
  caricati scendono da 3,36 MB a 0,28 MB e la query da 19 a 10 ms; il JSON è identico.
- Una sola derivazione di `ref`, `from`, `to`, dislivelli e miniatura, condivisa da `progress` e
  dall'immagine; miniatura ordinata come in `toSearchableArray()`.
- `StageShareImageService` diviso in tre classi (icone e testo a parte), senza cambiamenti visivi
  (immagini identiche byte per byte prima e dopo).
- Formattazione e lingua in un posto solo: la pagina pubblica mostra il dislivello con «+» come
  l'immagine.
- Il nome della tappa senza `ref` va su due righe; se gli altri blocchi sono al massimo e due righe
  coprirebbero il logo in fondo, resta su una riga (rimpicciolita, poi «…»).
- Su cache hit `shared_at` si aggiorna alla condivisione più recente.
- Le condivisioni si cancellano via Eloquent quando si cancellano utente, cammino o tappa, così le
  media e i file non restano orfani. Non vale per le cancellazioni in blocco da query builder né
  per le cascate del database (es. cancellare un'App): lì media e file restano.

## Bug trovati

## Decisioni

- **Stima.** `wm-estimate` ha proposto Misurato 1,9h + Stimato 7,0h = 8,9h; il developer ha fissato
  il totale a 5h, scritto su Orchestrator.
- **Ordine delle fasi.** Il piano è stato scritto prima della stima, perché `wm-estimate` non stima
  senza `plan.md`.
- **Traduzioni di `services.share`.** Se ne spostano in `wm-core` due, `title` e `dialogTitle`:
  `url` è un indirizzo e resta il default nel codice, `text` non è letto da nessuno.

## Follow-up

- Lo spec di `wm-passport-share-preview` è fallito due volte per timeout di Jasmine (5 s), su test
  diversi, con la macchina carica; al giro successivo 112/112. Se in CI fallisce a intermittenza,
  alzare il timeout per quel file o rendere deterministici i suoi test asincroni.
- Nome del file condiviso: `<cammino>-<tappa>.png` (es. `cammino-grande-di-celestino-tappa-04.png`);
  griglia dei dati dell'immagine centrata come blocco, voce dispari al centro (layout versione 3).

- In `wm-core` `npm run test:single` non funziona (`Unknown argument: single-run`) e il submodule
  non ha `node_modules` propri: gli spec di `wm-core` in questo lavoro sono stati eseguiti dall'app
  con un tsconfig temporaneo. Da sistemare con un ticket a parte.

- Verificare il CORS del disco `wmfe` di produzione per l'origine della webapp camminiditalia
  (`curl -sI -H 'Origin: …' '<image_url>'`) prima del rilascio web.

- Il plugin `wm-skills` 1.5.1 cerca le call nella cartella Drive `1Q8VVlo9eO_niYkzaSD_go7-SZIBx8Wak`,
  che per l'account del developer non esiste; le call stanno in `1bAIBC-m5p1AlSKTLEpfPU9Zi1IdnFua_`
  e sono scorciatoie, che NotebookLM accetta senza leggerne il testo. Da correggere in
  `claude-marketplace` (`agents/wm-transcript-research.md`, `shared/verifica-citazioni.md`).
