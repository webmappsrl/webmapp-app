> Ticket: oc:8743

# App: dettagli tecnici e mappa delle tracce UGC dai dati del server, calcolo al volo con la stessa pulizia GPS se non sincronizzate

## Cosa cambia

La pulizia GPS e il calcolo dei dati tecnici delle tracce UGC stanno in un solo punto di wm-core
(overview nel cantiere con lo stesso slug in `core/src/app/shared/wm-core/docs/features/`). In
questo repo cambiano i punti dell'app che oggi calcolano per conto loro:

- **Salvataggio** (`components/shared/modal-save/modal-save.component.ts`): la `geometry` della
  traccia contiene solo i punti tenuti dalla pulizia; `properties.locations` resta grezzo.
- **Plancia di registrazione** (`components/track-recorder-component/`): distanza e velocità media
  vengono dai punti tenuti, con le stesse funzioni di wm-core.
- **Riepilogo dopo il salvataggio** (`components/modal-success/`): distanza, dislivello e tempo
  vengono dalle stesse funzioni del pannello «Dettagli tecnici», non più dalla copia di
  `GeoutilsService` dell'app.
- **Copia di `GeoutilsService` dell'app** (`services/geoutils.service.ts`): eliminata.
  `recording-btn` passa al `formatTime` di wm-core; da `card-big` si toglie l'iniezione mai usata.

## Perché

Appena finita una registrazione con GPS disturbato, l'utente vede numeri e linee falsati, e
numeri diversi in punti diversi dell'app (plancia, riepilogo, pannello) perché ciascuno calcola a
modo suo. Con un solo calcolo, uguale a quello del backend, i numeri coincidono ovunque e cambiano
solo quando arrivano quelli del server (DEM per il dislivello).

## Requisiti

- [ ] La geometria salvata coincide con la linea disegnata a fine registrazione.
- [ ] Plancia, riepilogo e pannello mostrano gli stessi valori per la stessa traccia non
      sincronizzata.
- [ ] Nessun calcolo di distanza, tempo, dislivello o velocità delle tracce resta in questo repo.
- [ ] `core/src/app/services/geoutils.service.ts` non esiste più e il build passa.
- [ ] [UX] Un valore `null` si mostra «—» (velocità media in plancia: già così).

## Rischi

- [UX] La velocità attuale nella plancia viene dal GPS grezzo e può superare la velocità massima
  calcolata sui punti puliti.
- La geometria salvata ha meno punti delle `locations`: chi legge le due insieme supponendo la
  stessa lunghezza si rompe (da verificare nella challenge).


## Out of scope

- Avviso di segnale GPS scarso.
- Immagine di condivisione sui social.
- La pausa della registrazione, che oggi ferma solo il cronometro (dettaglio nell'overview di wm-core).
- La copia locale di `ugc-track-data` in wm-webapp (`UgcDetailsModule`, non importato da nessuno).

## Moduli toccati

- `core/src/app/components/shared/modal-save/modal-save.component.ts`
- `core/src/app/components/track-recorder-component/track-recorder.component.ts|html`
- `core/src/app/components/modal-success/modal-success.component.ts|html`
- `core/src/app/components/shared/recording-btn/recording-btn.component.ts`
- `core/src/app/components/cards/card-big/card-big.component.ts`
- `core/src/app/services/geoutils.service.ts` (eliminato)
