# Condivisione di un percorso registrato

## Come funziona oggi

`ShareService.shareTrackToStories(track)` è **l'unico punto di orchestrazione**: lo chiamano sia il pannello proprietà traccia in `wm-core` sia la schermata di successo post-registrazione. Manda al backend solo l'`uuid` — statistiche, mappa e compositing sono lato server — scarica l'immagine e chiama `Share.share()` generico. Nessun plugin nativo custom.

Entrambi i pulsanti restano **disabilitati finché la traccia non ha un `properties.id`** dal backend.

## Perché così

- **Il gating sulla sincronizzazione è nato da un test reale** (oc:8183): prima, il dispatch di `syncUgcTracks()`/`syncUgcPois()` avveniva solo **dopo** la chiusura di `ModalSuccessComponent`, quindi la sincronizzazione non partiva nemmeno finché l'utente restava su quella schermata. È stato anticipato a un `tap()` subito dopo il salvataggio locale, così il gating ha la possibilità di risolversi mentre l'utente è ancora lì col pulsante davanti.
- **Due trattamenti visivi diversi per lo stesso stato** (oc:8183): nel pannello proprietà si usa il `[disabled]` nativo di Ionic; nel chip di `ModalSuccessComponent`, sovrapposto all'angolo di una card bianca su sfondo scuro, **non si può**, perché l'opacità che Ionic applica ai disabilitati fa trasparire il bordo della card sottostante. Lì si usa uno swap di colore di sfondo piatto. Stesso principio — un bottone grigio classico — con la tecnica giusta per ciascun contesto.
- **Niente spinner per «in attesa di sincronizzazione»** (oc:8183): farebbe pensare a un'operazione già in corso. Lo spinner resta al solo stato `GENERATING`.
- **Alert esplicativo se il tap arriva comunque** (oc:8183), guardia sincrona oltre al `[disabled]`: evita di mostrare all'utente un 404 grezzo.
- **I messaggi nativi di `@capacitor/share` sono tradotti** (oc:8183): `NATIVE_SHARE_ERROR_TRANSLATIONS` mappa stringhe come `'Share canceled'`, verificate nel sorgente installato del plugin — iOS e Android sono identici.
- **Nessun feedback di successo dedicato** (oc:8183): la chiusura del native share sheet è già un segnale. Solo l'errore ha un trattamento esplicito.
