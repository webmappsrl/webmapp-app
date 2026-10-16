> Ticket: oc:8743

# Notes — webmapp-app

## Decisioni

- `modal-save` non è cambiato: salva `recordedFeature.geometry`, che ora contiene i soli punti
  tenuti dalla pulizia (con meno di 2 punti tenuti, i punti grezzi validi, per non perdere la
  registrazione).
- In `modal-success` sono stati tolti `trackAvgSpeed` e `trackTopSpeed`, mai mostrati dal template;
  `trackDate` resta la data corrente, come faceva `getDate` della copia di geoutils eliminata.
- Distanza a 2 decimali in plancia e riepilogo, velocità media a 1 decimale: uguali al pannello.

## Follow-up

- Dopo il merge dei submodule, aggiornare i puntatori di wm-core, map-core e wm-types.
- La durata della plancia (cronometro, senza le pause) può differire da «Durata» del pannello
  (dal primo all'ultimo punto): la pausa è fuori da questo ticket.

Le note complete del lavoro stanno in wm-core, cantiere con lo stesso slug.
