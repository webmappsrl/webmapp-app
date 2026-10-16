# Avvisi sullo stato del GPS sulla mappa

Fonte di verità per lo stato del GPS (come si calcola, come si comporta il watcher per
piattaforma): [la pagina di conoscenza oc:8766 di wm-core](../../core/src/app/shared/wm-core/docs/knowledge/8766-mappa-indicazione-di-segnale-gps-scarso-posizione-non-disponibile-o-poco-affidabile.md).
Qui c'è solo come l'app lo mostra.

## Come funziona oggi

`GpsAlertService` (`services/gps-alert.service.ts`) traduce `gpsStatus$` di wm-core in regole
d'interfaccia; `webmapp-gps-alert` disegna l'avviso in alto sulla mappa, `webmapp-gps-badge` il
badge sul bottone della posizione (`locate-outline` in `map.page.html`). Vale per tutte le istanze
dell'app.

- **Ricerca:** il bottone pulsa; dopo 8 s senza fix compare «Ricerca del segnale GPS…», al massimo
  una volta per avvio dell'app.
- **Segnale debole** (solo sui telefoni): l'avviso resta 4 s, poi in circa 0,7 s il testo sfuma, la
  scheda si stringe attorno alle tacche e vola fino al badge giallo. Un avviso per episodio:
  finché il badge è acceso non ricompare. Uscendo da `poor` il badge diventa verde per 5 s.
- **Passaggio in background** (schermo bloccato, Centro di controllo su iOS): l'episodio resta
  sospeso; se entro 15 s dal rientro il segnale è ancora scarso torna il badge giallo, senza avviso.
- **Permesso negato / localizzazione spenta:** avviso fisso e badge rosso. «Apri impostazioni App»
  solo per il permesso, perché porta alla pagina dell'app e non all'interruttore della
  localizzazione. Un avviso chiuso non ricompare fino al prossimo avvio. Da desktop la
  localizzazione spenta non si mostra.
- **`prefers-reduced-motion`:** niente volo né pulsazione, solo dissolvenza.
- **Con la registrazione attiva** (plancia-registrazione-riducibile): la scheda compare 8px sotto la
  plancia di registrazione aperta, o sotto la linguetta se è ridotta, ma mai più in alto di
  safe-area + 72px. La posizione arriva da `RecorderPanelLayoutService` come variabile CSS
  `--wm-gps-alert-top` sull'host, e lo SCSS usa `top: max(…)`. Il volo verso il badge parte dalla
  posizione corrente della scheda.
- **PostHog:** `gpsAlertShown` con `kind` (e `accuracy` per il segnale debole) parte dal servizio
  dell'app, non da wm-core, così la webapp non manda eventi.

I vincoli di montaggio di avviso e badge (slot `fixed` di `ion-content`, badge figlio di
`ion-fab`, pulsazione in `map.page.scss`) sono trappole: stanno in `.claude/rules/avvisi-gps.md`.

## Perché così

- **Le regole in un servizio, il disegno nei componenti** (oc:8766): «una volta per episodio»,
  «una volta per avvio» e «solo sui telefoni» si testano senza DOM, con `fakeAsync`.
- **Un passaggio in background non chiude l'episodio** (oc:8766): altrimenti chi cammina con
  segnale scarso rivedeva l'avviso a ogni sblocco del telefono.
- **Il verde solo uscendo da `poor`** (oc:8766): un riavvio del watcher non prova che il segnale
  sia tornato buono.
- **Un servizio dell'app fra plancia e avviso** (plancia-registrazione-riducibile): in
  `map.page.html` i due componenti non sono imparentati, e l'altezza della plancia cambia con la
  traccia selezionata, la pausa e la riduzione; un secondo valore fisso si sarebbe disallineato.
- **Con la sola posizione approssimativa e un solo fix nessun avviso** (oc:8766): limite accettato;
  il pallino mostra comunque un cerchio di precisione molto ampio.

## Come ci siamo arrivati

- **Avviso al centro dello schermo** (oc:8766, superata): copriva il pallino quando la mappa è
  centrata sulla posizione; ora parte in alto, sotto la barra di stato.
- **Un popup bloccante** (oc:8766, scartata): chi cammina non deve fermarsi a chiuderlo.
- **Spegnere il badge giallo quando il watcher si ferma** (oc:8766, superata): vedi «Passaggio in
  background».
