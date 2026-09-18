> Ticket: oc:8406

# Unificare i componenti di dettaglio EcPoi — parte webmapp-app

## Cosa cambia

L'app smette di possedere il componente di dettaglio EcPoi e comincia a consumare
quello condiviso: `core/src/app/components/poi-properties/` viene rimosso e
`map.page.html:70` continua a montare `<wm-poi-properties>`, ma risolto da
`WmCoreModule` invece che da `PoiPropetiesModule` locale.

Eccezioni UX volute rispetto al vecchio locale:
- l'indirizzo del POI compare **sopra i contatti** (`wm-address`: icona pin + testo,
  senza label “Indirizzo”, link Maps) — non nei Dettagli tecnici;
- address / telefono / email sotto label **Contatti** (stile titolo allineato a
  «Link utili», i18n in wm-core); «Link utili» solo per `related_url`;
- i POI con più numeri di telefono hanno N link `tel:` validi.

## Perché

Prova della promozione: unico punto di montaggio storico `map.page.html:70`.
Assegnata a questo repo (non a wm-webapp) perché un fallimento sul primo
consumatore nuovo non distingerebbe spostamento vs integrazione popup.

## Requisiti

- [ ] `core/src/app/components/poi-properties/` rimosso (4 file)
- [ ] `PoiPropetiesModule` rimosso da `map.module.ts`
- [ ] `<wm-poi-properties>` risolto da `WmCoreModule` invece che dal modulo locale
- [ ] Intestazione rimossa dall'header del pannello — località, titolo e
      `wm-related-pois-navigator` li rende ora il componente condiviso. Il pulsante di
      chiusura, il ramo UGC e il ramo traccia restano al pannello
- [ ] Pin wm-core (ordine wm-types → wm-core → pin)
- [ ] Verifica build `--configuration production`
- [ ] Verifica manuale:
  - POI con indirizzo e **senza** quota — indirizzo nel gruppo «Informazioni» (icona +
    testo), **non** nel blocco dei dettagli tecnici
  - POI con `contact_phone` multiplo — N `tel:` distinti, nessuna etichetta del backend
  - POI qualsiasi — località sopra il titolo, tassonomie subito sotto, titolo **non**
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
| `core/src/app/pages/map/map.page.html` | markup invariato |
| `core/src/app/shared/wm-core` (gitlink) | bump pin |
