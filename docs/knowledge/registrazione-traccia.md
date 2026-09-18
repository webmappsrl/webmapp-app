# Il box di registrazione di una traccia

## Come funziona oggi

`wm-track-recorder` mostra due badge — distanza dal punto di **partenza** e dal punto di **arrivo** della traccia ufficiale selezionata — nello spazio laterale del blocco centrale. I valori vengono dai selettori già esistenti di `wm-core` (`trackDistanceCovered`, `trackRemainingDistance`, `trackPositionStale`): nessun calcolo nuovo, nessuno stato dedicato alla registrazione.

I badge compaiono solo se c'è una traccia selezionata in quel momento. Nessuna persistenza, nessun «pin»: chiudendo il pannello di dettaglio spariscono.

`recordStart()` dispaccia `setMapDetailsStatus({status: 'onlyTitle'})`: all'avvio della registrazione un pannello aperto si riduce al titolo invece di restare espanso sopra la mappa, **senza** azzerare `currentEcTrack` — quindi le distanze restano disponibili.

## Perché così

- **I due badge non sono «km percorsi»** (oc:8284), ed è la confusione da evitare: misurano la posizione GPS corrente proiettata sulla traccia ufficiale, non quanto è stato camminato in questa sessione. `length`, la riga già esistente, è il dato della registrazione reale.
- **Il layout è una «flex sandwich»** (oc:8284): due colonne laterali `flex:1` **sempre presenti** nel markup, che restano vuote quando il valore è `null`. Avendo lo stesso `flex`, il blocco centrale resta centrato sia con i badge sia senza — identico a com'era nel caso più comune. Preferita a due varianti di markup con `*ngIf/else`, che sarebbero due cose da tenere sincronizzate.
- **`showSuffix` è un `@Input()` nuovo sul badge condiviso** (oc:8284, `wm-core`): a `false` il badge mostra solo la distanza, senza «da te», ridondante qui dove l'etichetta dice già PARTENZA o ARRIVO. Il default resta `true` per non toccare l'uso esistente.
- **Nessuna nuova scala tipografica né nuove chiavi i18n** (oc:8284): le etichette riusano `from`/`to`, già introdotte da oc:8177.

## Cosa è stato provato e ritirato

Tre iterazioni su device reale hanno **annullato** buona parte di un primo restyling (oc:8284), e vale la pena saperlo prima di riproporlo:

- **Colore semantico per-azione sui tre pulsanti**: introdotto e poi ripristinato al neutro originale su richiesta esplicita. È rimasta solo la forma circolare 38×38px.
- **Icone direzionali accanto a PARTENZA/ARRIVO**: rimosse dopo la prima iterazione, troppo rumore visivo.
- **L'etichetta «IN MOVIMENTO» è stata eliminata**, non rinominata: resta il solo timer. La chiave `pages.register.time` è orfana e lasciata nei file di lingua.
- **Il blocco centrale è sceso da 23px a 21px**: con le colonne laterali affiancate risultava troppo dominante.
