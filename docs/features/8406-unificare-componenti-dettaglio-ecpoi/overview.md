> Ticket: oc:8406

# Unificare i componenti di dettaglio EcPoi — parte webmapp-app

## Stato raggiunto

- Cartella locale `core/src/app/components/poi-properties/` rimossa; `<wm-poi-properties>`
  risolto da `WmCoreModule`.
- Intestazione (località, titolo, `wm-related-pois-navigator`) nel componente condiviso;
  chiusura e branching UGC/traccia restano al pannello mappa.
- Indirizzo / telefoni / email / link sotto un solo titolo **«Informazioni»** (wm-core), non
  «Contatti» + «Link utili».
- `address` solo (niente `address_link`); Maps via `encodeURIComponent` su `address`.
- Cronologia completa: [notes.md](notes.md). Knowledge: `wm-core/docs/knowledge/dettaglio-poi.md`.

## Cosa cambia

L'app smette di possedere il componente di dettaglio EcPoi e comincia a consumare
quello condiviso: `core/src/app/components/poi-properties/` viene rimosso e
`map.page.html` continua a montare `<wm-poi-properties>`, ma risolto da
`WmCoreModule` invece che da `PoiPropetiesModule` locale.

Eccezioni UX volute rispetto al vecchio locale (poi refine in corso d'opera — vedi Stato
raggiunto):
- l'indirizzo del POI compare con i contatti (`wm-address`: icona pin + testo, senza label
  “Indirizzo”, link Maps) — non nei Dettagli tecnici;
- address / telefono / email / `related_url` sotto label **Informazioni**;
- i POI con più numeri di telefono hanno N link `tel:` validi.

## Perché

Prova della promozione: unico punto di montaggio storico nel pannello mappa.
Assegnata a questo repo (non a wm-webapp) perché un fallimento sul primo
consumatore nuovo non distingerebbe spostamento vs integrazione popup.

## Requisiti

- [x] `core/src/app/components/poi-properties/` rimosso (4 file)
- [x] `PoiPropetiesModule` rimosso da `map.module.ts`
- [x] `<wm-poi-properties>` risolto da `WmCoreModule` invece che dal modulo locale
- [x] Intestazione rimossa dall'header del pannello — località, titolo e
      `wm-related-pois-navigator` li rende ora il componente condiviso. Il pulsante di
      chiusura, il ramo UGC e il ramo traccia restano al pannello
- [ ] Pin wm-core (ordine wm-types → wm-core → pin) — bump gitlink ancora da committare sul parent
- [ ] Verifica build `--configuration production`
- [ ] Verifica manuale:
  - POI con indirizzo e **senza** quota — indirizzo nel gruppo «Informazioni» (icona +
    testo), **non** nel blocco dei dettagli tecnici
  - POI con `contact_phone` multiplo — N `tel:` distinti, nessuna etichetta del backend
  - POI qualsiasi — località sopra il titolo, tassonomie subito sotto, titolo **non**
    duplicato
  - ~~POI con `config_detail` — accordion presente~~ **non verificabile**: il campo esiste
    solo sullo shard dev di Cammini d'Italia (vedi notes.md)
- [ ] Nessuna regressione sul branching dei quattro fratelli in `map.page.html`

## Rischi

- Branching pannello MapPage (quattro fratelli).
- `SharedModule` non ri-esporta `WmCoreModule` — verifica production.
- Rollback: delete locale + pin, nessun `OPTIONS.*`.

## Out of scope

- Logica wm-core (vedi overview gemella).
- wm-webapp fase C.
- Merge verso `develop`.
- Gli altri tre componenti fratelli del pannello.

## Moduli toccati

| File | Operazione |
|---|---|
| `core/src/app/components/poi-properties/` (4 file) | **eliminato** |
| `core/src/app/pages/map/map.module.ts` | rimozione import |
| `core/src/app/pages/map/map.page.html` | markup aggiornato (header spostato nel componente) |
| `core/src/app/shared/wm-core` (gitlink) | bump pin |
