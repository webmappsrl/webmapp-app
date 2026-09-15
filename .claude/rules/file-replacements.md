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
