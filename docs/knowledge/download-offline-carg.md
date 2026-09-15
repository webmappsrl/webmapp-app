# Download offline dei tile e `hitMapUrl` (shard carg)

## Come funziona oggi

Il flusso è: `wm-download` (in `map.page.html`) → `wm-download-panel` → la funzione `downloadOverlay()` definita in `map-core` (`src/utils/localForage.ts`) e importata da `@map-core/utils`, invocata dentro `start()`.

Per lo shard carg l'`overlayXYZ` è **hardcoded** nel template (`https://carg.geosciences-ir.it/storage/cargmap/`), e sovrascrive il default `https://api.webmapp.it/tiles` del componente.

`IMAP.hitMapUrl` vive in `wm-core` (`types/config.ts`), **non in `wm-types`** come si potrebbe assumere. È letto dal `config.json` di qualsiasi backend tramite il selettore `confMAPHitMapUrl`, ma oggi lo valorizza solo carg.

## L'invariante che lega due repo

Visualizzazione e download sono percorsi di codice separati che puntano alla stessa origine:
`downloadOverlay()` costruisce `${overlayXYZ}/${tile}.png` a partire dal valore che il template
passa, mentre il tile layer lo prende dalla propria base URL in `map-core`. Due sorgenti per lo
stesso dato, in due repo diversi.

L'obbligo che ne discende — tenerli allineati — sta in
[.claude/rules/download-offline.md](../../.claude/rules/download-offline.md), dove si carica
toccando il template della mappa.

## Trappole

- **Esistono due `downloadOverlay` omonimi**, ed è il motivo per cui leggere il nome non basta: quello in `map.page.ts` è uno stub inerte, uno dei tre trigger di `showDownload$`; il download vero è la funzione in `map-core`, gated su `overlayUrls`/`overlayGeometry` non nulli — condizione vera solo per carg.
- **`hitMapUrl` ha un effetto collaterale sulla home**: oltre al download, controlla la visibilità della searchbar in `wm-core` (`home.component.html`, condizione `hitMapUrl == null`).

## Debito noto

- **Due interfacce `IMAP` divergenti** invece di un'unica fonte di verità in `wm-types`: quella di `wm-core` ha `hitMapUrl`, quella di `map-core` no.
- **`overlayXYZ` resta specifico di carg**, non configurabile per altri shard. Una generalizzazione va trattata in un ticket dedicato.
