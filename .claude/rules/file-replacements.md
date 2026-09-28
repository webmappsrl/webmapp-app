---
paths:
  - "core/angular.json"
  - "core/src/app/**"
  - "core/scripts/**"
---

# Trappole: `fileReplacements` e varianti di shard

La procedura sta in
[docs/howto/personalizzazioni-per-shard.md](../../docs/howto/personalizzazioni-per-shard.md), il
perché delle scelte in
[docs/knowledge/temi-e-varianti-di-shard.md](../../docs/knowledge/temi-e-varianti-di-shard.md).

- **`fileReplacements` accetta solo `.ts`, `.js` e `.json`, mai `.html`.** È un vincolo di schema di
  Angular, verificato empiricamente (`Schema validation failed … must match pattern`). Per
  sostituire un template si sostituisce il `.ts` del componente, che lo referenzia via
  `templateUrl`.

- **La variante non può importare la classe dal file originale per estenderla.**
  `fileReplacements` reindirizza *qualsiasi* riferimento a quel path, quindi l'import diventa
  circolare e punta a se stesso: errore `TS2506`, verificato. Una base condivisa richiederebbe un
  terzo file mai soggetto a `fileReplacements`.

- **Non estrarre una classe base in un terzo file**, in questo repo. È stato provato due volte, su
  `home.component.ts` e su `profile.page.ts`, e scartato entrambe le volte dal developer dopo
  revisione: preferenza confermata, non provvisoria. La variante duplica per intero la logica del
  file originale — la duplicazione è il costo accettato perché il file condiviso resti identico a
  prima per tutti gli altri shard, senza dipendenze nuove che si troverebbero comunque nel bundle.

- **Una configuration va dichiarata due volte**, sotto `architect.build.configurations` e sotto
  `architect.serve.configurations`: dimenticare la seconda fa fallire `ng serve --configuration=X`.

- **Il deploy web è un solo bundle condiviso da tutti i clienti.** `EnvironmentService.init()`
  (`wm-core`) decide lo shard **a runtime** leggendo `window.location.hostname` — l'`environment.ts`
  statico conta solo per `localhost`. Quindi buildare il deploy generico con
  `--configuration=<shard>` pubblicherebbe il template dedicato **a tutti**. Serve un deploy web
  separato, con la propria build e il proprio target rsync. È il vincolo più costoso da scoprire
  tardi.

- **`serve.js` legge lo `shardName` una volta sola, all'avvio.** Cambiare `environment.ts` a server
  acceso ricompila il bundle ma **non** rilegge la configuration: i `fileReplacements` restano
  quelli del lancio. Si ottiene così uno stato incoerente e convincente — il tema del nuovo shard
  si carica, il titolo della pagina è giusto, e le varianti compilate sono quelle vecchie. Per
  passare a uno shard con configuration propria il riavvio è **obbligatorio**, e l'ordine è
  vincolato: prima `environment.ts`, poi il riavvio.

- **Il tema che risponde 200 non prova che la build sia giusta**, perché è un asset statico servito
  comunque. L'unica prova è contare la variante compilata:

      curl -s http://localhost:<porta>/main.js | grep -c wm-searchbar-camminiditalia-panel

  Diverso da zero significa configuration attiva; zero significa build generica. Misurato in
  diretta sotto oc:8613: prima del riavvio tema `200` e variante `0`, dopo il riavvio variante `6`.

- **Fermare un processo non dà conferma di averlo fermato.** `kill` non protesta se il PID è
  sbagliato, e non protesta se il PID non esiste: in entrambi i casi il comando **sembra
  riuscito**. Sotto oc:8613 questo è successo due volte in mezz'ora, dai due lati opposti:

      lsof -ti tcp:<porta> | head -1     elenca anche i CLIENT connessi, browser compreso
                                         → si termina un processo a caso (a me: un figlio di Chrome)
      pgrep -f "ng serve --port <porta>" la configuration si infila in mezzo al comando, che e'
                                         `ng serve --configuration=<shard> --port <porta>`
                                         → non trova niente, e il server vecchio resta in piedi

  Il modo robusto per identificarlo è chiedere chi **ascolta** — `lsof -ti -sTCP:LISTEN -a -i
  tcp:<porta>` — e attendere che quella query torni vuota prima di rilanciare, perché un `curl`
  può fallire un istante senza che la porta sia libera.

  **Ma la regola generale non è la formula, è la verifica**: l'unica prova che un processo sia
  stato davvero sostituito è che qualcosa **dopo** cambi. Qui la prova è il conteggio della
  variante compilata descritto sopra — la seconda volta è stato quello, e solo quello, ad
  accorgersi che il server vecchio non era mai morto.
