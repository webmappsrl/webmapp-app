---
paths:
  - "core/src/app/pages/map/map.page.html"
  - "core/src/app/pages/map/map.page.scss"
  - "core/src/app/components/shared/gps-alert/**"
---

# Trappole: avvisi sullo stato del GPS sulla mappa

Il perché sta in
[docs/knowledge/8766-mappa-indicazione-di-segnale-gps-scarso-posizione-non-disponibile-o-poco-affidabile.md](../../docs/knowledge/8766-mappa-indicazione-di-segnale-gps-scarso-posizione-non-disponibile-o-poco-affidabile.md).

- **Un figlio `position: fixed` di un elemento nello slot `fixed` di `ion-content` resta largo 0 px**:
  Ionic dà un `transform` all'host, che diventa il contenitore. Rendi l'host un livello assoluto a
  tutto schermo con `pointer-events: none` e posiziona dentro in `absolute` (oc:8766).
- **Non mettere il badge dentro `ion-fab-button`**: viene tagliato. Va figlio di `ion-fab`, accanto
  al bottone, e deve restare nel DOM anche spento perché l'animazione dell'avviso ci atterra e ne
  legge misure e posizione dal CSS (oc:8766).
- **La pulsazione del bottone della posizione sta in `map.page.scss`**: messa nel foglio di un
  componente con `ViewEncapsulation.None`, esisterebbe solo finché quel componente è montato
  (oc:8766).
- **Un'animazione Web Animations con `fill: 'forwards'` prevale sugli stili inline**: annullala
  prima di misurare o riposizionare l'elemento, altrimenti salta (la scheda saltava di metà della
  sua larghezza all'inizio del volo) (oc:8766).
- **Negli spec, in Chrome headless senza focus le animazioni non avanzano**: aspettarne la fine va
  in timeout; portale a termine con `animation.finish()` (oc:8766).
