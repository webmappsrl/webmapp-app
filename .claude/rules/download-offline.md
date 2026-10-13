---
paths:
  - "core/src/app/pages/map/**"
  - "core/src/app/pages/poi/**"
---

# Trappole: download offline dei tile e import di `pages/poi/`

Il contesto sta in
[docs/knowledge/download-offline-carg.md](../../docs/knowledge/download-offline-carg.md) e
[docs/knowledge/build-e-deploy-web.md](../../docs/knowledge/build-e-deploy-web.md).

- **`overlayXYZ` e il tile layer di `map-core` devono puntare alla stessa origine.** La
  costante `overlayXYZ` di `MapPageBase` (`pages/map/map.page.base.ts`, letta da entrambi i template
  della mappa, oc:8762) e la base URL in `map-core` (`src/directives/hit-map.directive.ts`) sono
  due percorsi di codice separati: `downloadOverlay()` costruisce `${overlayXYZ}/${tile}.png`, e se
  divergono l'utente **vede un tileset e ne scarica un altro**. Niente in CI se ne accorge, e
  l'altro file sta in un repo che questo non vede cambiare.

- **Ci sono due `downloadOverlay` omonimi, non confonderli.** Il metodo in `map.page.base.ts` è uno
  stub inerte — un log e l'apertura del pannello — mentre il download vero è la funzione in `map-core`,
  gated su `overlayUrls`/`overlayGeometry` non nulli: condizione vera solo per lo shard carg.

- **`hitMapUrl` non serve solo al download**: controlla anche la visibilità della searchbar in
  `wm-core` (`home.component.html`, condizione `hitMapUrl == null`).

- **Prima di dichiarare morta una cartella di `pages/`, cerca gli import relativi**
  (`'../poi/...'`), non solo le occorrenze della stringa o il nome del modulo: `pages/poi/` è già
  stato scambiato per codice morto quando `map.page.ts` ne importava `utils.ts`. Oggi
  (oc:8762) nessun file importa più `pages/poi/`.
