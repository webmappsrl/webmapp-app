> Ticket: oc:9042

# Notes — webapp desktop: punti bianchi non cliccabili sulle track

## Deviazioni dal piano

Nessuna deviazione rilevante. Gli script sono stati verificati con `node --check` e caricandoli
con `run()` sostituito da una funzione che stampa gli argomenti: senza `--full` compongono
esattamente `-av --exclude assets` come prima, con `--full` solo `-av`.

## Bug trovati

- **`map-core/assets` mancante su `1.camminiditalia.mobile.webmapp.it`.** Il bug è nato in
  `wm-webapp`, che aveva copiato da qui `RSYNC_ARGS = ['-av', '--exclude', 'assets']`. Il pattern
  senza `/` iniziale esclude ogni cartella `assets` a qualunque profondità. Sull'host camminiditalia
  dell'app `map-core/assets/line-icon-arrow.png` rispondeva `500`, quindi sulle track restavano i
  dischi bianchi senza freccia. La health check della CI (`curl -f` sulla root) non se n'è accorta.
- **L'overview inizialmente verificava l'host sbagliato** (`mobile.camminiditalia.webmapp.it`, che
  non risponde): l'host servito dalla docroot `mobile.camminiditalia.webmapp.it/` è
  `1.camminiditalia.mobile.webmapp.it`. Corretto in challenge.

## Decisioni

- **Correzione manuale sul server, 25/11**: il dev ha caricato `core/src/app/shared/map-core/src/assets/`
  in `/var/www/html/mobile.camminiditalia.webmapp.it/map-core/assets/`. Verificata con `curl`: le
  tre icone rispondono `200 image/png` con lo stesso hash del repo.
- **Due deploy per target**, veloce (automatico) e completo (a mano), come in `wm-webapp`.
- **Challenge:** il dev ha rifiutato una procedura per il primo deploy completo e un controllo
  sugli asset nella health check. Il deploy completo lo lancia il team a mano.

## Follow-up

- Il primo `npm run deploy-to-web-default-full` cambierà per tutte le istanze di `mobile.webmapp.it`
  file che oggi sul server sono diversi dal repo: il font delle icone `webmapp.*` con il suo
  `style.css`, gli `i18n/*.ts`, `direction.svg`, `icons/passport-stamp.svg` (confronto del 25/11
  con il working tree del branch di oc:8998, non con `main`).
- `deploy-to-web-assets` diventa ridondante con `deploy-to-web-default-full`.
