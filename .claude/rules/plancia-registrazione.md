---
paths:
  - "core/src/app/components/track-recorder-component/**"
---

# Trappole: plancia di registrazione

Il perché sta in [docs/knowledge/registrazione-traccia.md](../../docs/knowledge/registrazione-traccia.md).

- **In pausa i punti continuano a entrare nella registrazione**: `_addLocationToRecording` di
  `GeolocationService` non guarda la pausa, quindi `recordedKeptLocations$` emette anche in pausa.
  Il controllo su `isPaused` in `_onKeptLocations` deve restare nel componente: toglierlo fa
  ridurre la plancia in pausa (oc:8798).
