> Ticket: oc:8613

# Controllo CSS custom delle istanze al nuovo dettaglio POI — webmapp-app

## Cosa cambia

oc:8406 ha rinominato e rispaziato gli elementi del dettaglio di un POI. I temi per-shard
prendono di mira quegli elementi **per nome**, quindi alcune loro regole hanno smesso di
agganciarsi: questo ticket le riallinea, **senza toccare il codice** di oc:8406.

Nasce dallo scrum del 21/09/2026: «quando modifichiamo dei componenti c'abbiamo dei CSS
customizzati che vanno rivisti». Questo cantiere copre la parte **mobile**; la webapp ha il
proprio, lavorato dall'agente su quel repo.

## Perché

Un selettore CSS che non corrisponde a nulla **non è un errore per nessuno strumento**: né
build, né test, né lint. Su `geohub/75.css` il risultato è stato che il blocco dei contatti è
comparso sotto al titolo invece che in fondo — in flexbox un figlio senza `order` vale 0, e lo
0 precede qualunque valore positivo — e che il riquadro dell'HTML incorporato si è attaccato
alla linea di separazione.

## Requisiti

- [x] **Dove vivono i CSS custom** — era un punto aperto del ticket. Risposta: in `core/src/theme/<shard>/<appId>.css`, dentro il repo, serviti come asset statici; `meta.component.ts:50` (wm-core) costruisce l'URL a runtime. Le copie in `instances/*/` sono artefatti di build
- [x] **Il nome dell'istanza «Ville»** — altro punto aperto. È l'app **75**, «Ville e Giardini Medicei», tema `geohub/75.css`
- [x] Inventario dei temi della mobile: `camminiditalia/1.css`, `camminiditaliadev/1.css` (identico), `geohub/75.css`
- [x] Solo `75.css` riordina il dettaglio POI; gli altri due toccano home e mappa, e non sono impattati
- [x] Selettori riallineati ai nomi nuovi, **mantenendo invariati tutti i valori di `order`**
- [x] Spaziatura sotto la linea di separazione ripristinata come in produzione (24px)
- [x] Audit finale senza orfani su tutti e tre i temi
- [x] Solo modifiche CSS: nessun file di `wm-core` o dell'app toccato

## Rischi

- **`!important` necessario, non di comodo**: la regola del tema e quella del componente hanno
  la **stessa** specificità, e il CSS del componente Angular è iniettato dopo il foglio
  statico, quindi a parità vincerebbe lui. Verificato: senza `!important` la regola c'era e non
  si applicava.
- **`wm-config-detail` volutamente non toccato**: non esisteva quando il tema è stato scritto e
  non sarà presente su questa app. Resta senza `order`, quindi in cima — ma ha altezza 0 e non
  sposta nulla. Se un domani venisse popolato su questa app, comparirebbe nel posto sbagliato.
- **La regola di wm-core che ha causato il secondo difetto resta com'è**: presuppone che
  `--wm-feature-details-margin` sia valorizzata. Oggi solo il 75 la azzera; qualunque tema
  futuro che faccia lo stesso avrà lo stesso problema.

## Out of scope

- Qualsiasi modifica al codice di oc:8406, che ha una PR aperta.
- La parte **webapp**: sei temi, nessuno dei quali tocca il dettaglio POI. Lavorata sull'altro repo.
- **Condividere i temi fra i due prodotti**: fattibile — entrambi gli `angular.json` copiano già
  asset da un submodule — ma rimandata dal dev, perché un file unico non renderebbe identici i
  due prodotti finché il contenitore della webapp non è allineato.
- Il dettaglio della traccia, salvo un orfano preesistente corretto perché identico (vedi notes).
- Il ramo UGC, già rinviato a un ticket dedicato.

## Moduli toccati

| File | Operazione |
|---|---|
| `core/src/theme/geohub/75.css` | 8 selettori riallineati + 1 regola di spaziatura |
