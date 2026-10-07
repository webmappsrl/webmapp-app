> Ticket: oc:8703

# Notes — Passaporto: tab con cammini completati e in corso

Note d'insieme del lavoro sui quattro repo (webmapp-app, wm-core, camminiditalia, wm-package).
Le note di dettaglio di wm-core e del backend stanno nei rispettivi `notes.md`, nella cartella con
lo stesso slug.

## Deviazioni dal piano

- **Passaporto a timbri invece delle sezioni Completati / In corso.** Deciso dal dev dopo
  l'approvazione dei primi overview: tutti i cammini della config, in corso → completati → non
  iniziati in grigio; il tocco su un timbro grigio apre il dettaglio. Overview e wireframe
  (viste 5b e 5c) aggiornati prima del piano.
- **Task 2 riscritto due volte** (backend): prima senza tabelle né pagine pubbliche, poi con una
  **tabella polimorfica** `passport_shares` per tappe e cammini, al posto di
  `passport_stage_shares` di oc:8702. La migration di oc:8702 è stata modificata e poi
  **rinominata** in `2026_10_05_100000_create_passport_shares_table.php` (non è in produzione;
  rollback fatto in locale e su `camminiditalia_testing`).
- **Immagine del cammino come la vista 7**: cammino rosso, pallini ai cambi di tappa, etichette
  «Tappa {ref}» e uscite solo col GPS. Le etichette hanno richiesto un parametro `labels` in
  `MapRenderService::renderLayers()` di **wm-package**, non previsto dal piano.
- **Icona della voce**: SVG dedicato `assets/icons/passport-stamp.svg` (libretto con timbro, scelto
  dal dev fra varie proposte) con `<ion-icon src>`, invece di un glifo del font.

## Bug trovati

- **Ricaricando la PWA su `/passport` da loggato si finiva in Home**: `isLogged` vale `false`
  finché `me()` non risponde. Trovato dalla review strutturata; corretto con `resolvedLogin$`
  (login noto = utente loggato oppure nessun `access_token`) in guardia e pagina, con test.
- **La pagina del tab ascoltava il logout anche fuori dal tab** (Ionic tiene in memoria le pagine
  dei tab): un logout dal Profilo mandava in Home, e dopo un secondo login restava uno spinner.
  Ora il login si ascolta solo fra `ionViewWillEnter` e `ionViewWillLeave`.
- Loghi dei timbri tagliati: `wm-img` ha globalmente `min-width/min-height` 100px.

## Decisioni

- Griglia dei timbri `auto-fill`: larghezza minima `clamp(92px, 26vw, 150px)`, anello
  `clamp(76px, 22vw, 108px)` — 3 per riga sui telefoni, più colonne sui tablet (richiesta del dev).
- Pulsanti e badge nel colore primario dell'app (`--wm-color-primary`, sfondo chiaro con
  `color-mix` perché `--wm-color-primary-rgb` non è affidabile); anelli e chip «Completato» verdi.
- Etichetta tedesca della tab bar «Pass»; francese e tedesco non sono oggi lingue dei cammini, il
  controllo a 320px in quelle lingue è stato saltato su indicazione del dev.
- Stima rivista prima dell'esecuzione: 5,5h (2,0h misurate di pianificazione + 3,5h), con
  l'implementazione affidata a Claude e il dev in review.
- Il workflow ha lasciato commit e push a una decisione esplicita del dev.

## Follow-up

- **Rilascio**: merge della PR di wm-package e puntatore del submodule aggiornato prima del deploy
  del backend; backend in produzione prima della build per gli store e di
  `deploy-to-web-camminiditalia`.
- Pulizie lasciate per scelta del dev: fuso orario dell'app (dispositivo) diverso dal server
  (Europe/Rome); test md5 byte-identico dell'immagine della tappa da verificare in CI; nessuna
  foreign key sulla tappa in `passport_shares`; i due `compose()` delle immagini separati.
- Pubblicare il wireframe aggiornato su `gh-pages` come `index.html` a ticket approvato.
- Verificare sulla config di produzione che ogni layer di camminiditalia sia un cammino.
