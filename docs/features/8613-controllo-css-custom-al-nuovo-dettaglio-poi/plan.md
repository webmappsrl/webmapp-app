> Ticket: oc:8613

# Controllo CSS custom al nuovo dettaglio POI — webmapp-app

> ⚠️ **Registrazione a posteriori.** Questo piano non è stato scritto prima dell'esecuzione: il
> lavoro è nato da una segnalazione durante il QA («le Informazioni sono sotto al nome e non va
> bene») ed è proceduto per diagnosi. I task sotto sono ciò che è stato effettivamente eseguito,
> nell'ordine in cui è avvenuto — non una previsione. Le scoperte stanno in [notes.md](notes.md).

**Obiettivo:** riallineare i temi per-shard della mobile al markup del dettaglio POI cambiato da
oc:8406, **senza toccare codice applicativo o di libreria**.

**Vincolo:** mantenere la struttura dei custom CSS. Si rinominano i selettori, non si riscrivono
le regole e non si cambiano i valori di `order`.

---

## Task 1 — Inventario dei temi e individuazione di quelli impattati

- [x] Elencare i CSS custom della mobile: `camminiditalia/1.css`, `camminiditaliadev/1.css`
      (contenuto identico al primo), `geohub/75.css`
- [x] Stabilire quali toccano il dettaglio POI: **solo `75.css`**, con 26 `order`. Gli altri due
      (309 byte) riguardano home e mappa

## Task 2 — Elenco dei selettori scollegati

- [x] Confrontare i tag-elemento usati nei temi con i selector realmente dichiarati nel codice
- [x] Esito: 40 tag contro 124 selector reali

Comando (da rieseguire dopo ogni refactor che rinomina elementi del dettaglio):

```bash
grep -rhoE "selector: *'[^']+'" core/src/app --include="*.ts" | sed "s/selector: *'//;s/'$//" \
  | tr ',' '\n' | sed 's/^ *//;s/ *$//' | grep -E "^(wm|webmapp)-" | sort -u > /tmp/sel.txt
grep -ohE "(^|[ ,>~+])(wm|webmapp)-[a-z0-9-]+" core/src/theme/*/*.css | sed 's/^[ ,>~+]//' \
  | sort -u | comm -23 - /tmp/sel.txt
```

## Task 3 — Riallineamento dei selettori del dettaglio POI

- [x] `wm-feature-useful-urls` → `.wm-poi-properties-contacts` (`order: 9`, il difetto principale)
- [x] `wm-excerpt` → `.wm-excerpt` (`order: 7`)
- [x] `wm-tab-audio` → `wm-track-audio` (`order: 10`)
- [x] Quattro regole estetiche sullo stesso wrapper morto: separatore `::after`, titolo del
      blocco, `ion-item` e le sue label
- [x] `wm-tab-detail` (`order: 8`) lasciato invariato: non montato nel POI, inerte ma innocuo
- [x] `wm-config-detail` **non toccato**, su decisione esplicita del dev

## Task 4 — Orfano nel blocco del dettaglio traccia

- [x] `wm-track-properties wm-tab-audio` → `wm-track-audio` (`order: 13 !important` invariato).
      **Preesistente**, non causato da oc:8406

## Task 5 — Spaziatura sotto la linea di separazione

- [x] Diagnosi: `75.css` azzera `--wm-feature-details-margin`, e oc:8406 ha spostato la
      spaziatura dell'HTML incorporato dal padding a quel margine
- [x] `padding: 24px 16px !important` su `wm-inner-component-html` nel dettaglio POI

## Task 6 — Verifica

- [x] Audit rieseguito: **zero orfani** sui tre temi
- [x] Ordine verificato a schermo: descrizione(2) → tassonomie(3) → galleria(4) → info(5) →
      indicazioni(6) → Informazioni(9) → embedded(11)
- [x] Spaziatura misurata: **24px**, come in produzione su `75.mobile.webmapp.it`

## Commit

Un commit solo, scope `oc:8613` sul branch di oc:8406:

```
fix(oc:8613): riallinea il tema dell'app 75 al nuovo dettaglio POI
```
