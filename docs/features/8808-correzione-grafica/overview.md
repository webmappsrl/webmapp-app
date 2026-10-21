> Ticket: oc:8808

# Correzione grafica

## Cosa cambia
Il messaggio di conferma che compare quando l'utente scarta una registrazione di traccia appena
conclusa («ESCI SENZA SALVARE» o «Elimina registrazione» nella modale di salvataggio) non dice più
«verrà eliminata dal tuo profilo e da Webmapp», ma «verrà eliminata dal tuo profilo e dai nostri
server». La modifica vale in tutte e 7 le lingue dell'app.

## Perché
Il cliente (Cammini d'Italia) segnala che il nome «Webmapp» nel messaggio non ha senso per chi usa
la sua app, e propone di mettere «Cammini d'Italia». Le note di sviluppo indicano invece una frase
neutra, «dai nostri server»: il testo di default è comune a tutte le istanze brandizzate, e un nome
di brand sarebbe sbagliato per tutte le altre. Un override per singola istanza sarebbe possibile
(`TRANSLATIONS` nella config dell'app, applicato da `LangService` di wm-core), ma la scelta è un
testo neutro valido per tutti.

In quel momento la traccia esiste solo sul dispositivo: la conferma cancella i punti in locale
(`removeCurrentUgcTrackLocations()`), non tocca profilo né server. La frase quindi non descrive
alla lettera l'operazione; è stato proposto un testo che lo facesse («la registrazione verrà
eliminata»), e il dev ha scelto di restare sulla formulazione delle note di sviluppo.

## Requisiti
- [ ] La chiave `pages.register.modalexit.text` dice «dai nostri server» (o equivalente) al posto di
  «da Webmapp» in it, en, de, es, fr, pr, sq
- [ ] Il resto della frase («L'operazione non può essere annullata») resta invariato
- [ ] Nessun'altra stringa che nomina Webmapp viene toccata (crediti, licenza, disclaimer, coins)

## Rischi
- La stringa è condivisa da tutte le app: il cambio si vede su ogni istanza. È voluto, ed è il
  motivo per cui il testo è neutro.
- Il testo parla di profilo e server per una traccia che non è mai stata caricata (vedi «Perché»):
  scelta consapevole, accettata.
- Le traduzioni sono compilate nel bundle: un ripensamento richiede una nuova release sugli store.

## Out of scope
- Le altre occorrenze di «Webmapp» nei file i18n (crediti, licenza mappa, disclaimer, Webmapp
  Coins): sono corrette così.

## Moduli toccati
Repo principale (`webmapp-app`), nessun submodule:
- `core/src/assets/i18n/it.ts`, `en.ts`, `de.ts`, `es.ts`, `fr.ts`, `pr.ts`, `sq.ts` — chiave
  `pages.register.modalexit.text`
