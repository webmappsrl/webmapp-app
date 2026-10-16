---
paths:
  - "core/angular.json"
  - "core/tsconfig.spec.json"
  - "core/karma.conf.js"
  - "core/src/**/*.spec.ts"
---

# Trappole: test unitari dell'app

- **Uno spec in una cartella nuova va aggiunto a due elenchi**: `include` di `tsconfig.spec.json`
  e `architect.test.options.include` di `angular.json`. Senza il primo lo spec non compila; senza
  il secondo `npm run test`, e quindi la CI, non lo esegue, in silenzio: lanciato con `--include`
  passa, nella suite completa non c'è. Controlla che il totale della suite cresca del numero di
  test aggiunti (plancia-registrazione-riducibile: la suite restava a 116 con 28 test nuovi).
- **L'host di TestBed è un `div`**: gli stili di un componente con `ViewEncapsulation.None`
  annidati sotto il suo selettore (es. `wm-track-recorder { … }`) non si applicano alla fixture.
  Per misurare posizioni o stili calcolati, sposta `fixture.nativeElement` dentro un elemento con
  quel tag, attaccato a `document.body` (plancia-registrazione-riducibile).
- **In locale servono Node 22 e una config Karma con timeout più alti**: con il Node 18 di default
  Angular CLI 20 non parte; con `ChromeHeadless` e spec lunghi Karma si scollega (`DISCONNECTED`,
  ping timeout). Una config locale che estende `karma.conf.js` con `pingTimeout`,
  `browserNoActivityTimeout` e `browserDisconnectTimeout` alti risolve (oc:8766).
- **Le animazioni infinite non si possono `finish()`**: `document.getAnimations().forEach(a =>
  a.finish())` lancia `InvalidStateError` se c'è una pulsazione CSS infinita nel DOM. Filtra per
  `effect.getComputedTiming().endTime !== Infinity` (plancia-registrazione-riducibile).
