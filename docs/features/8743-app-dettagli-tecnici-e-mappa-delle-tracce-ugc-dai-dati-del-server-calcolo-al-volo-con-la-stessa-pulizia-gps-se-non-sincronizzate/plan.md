> Ticket: oc:8743

# Piano — parte di webmapp-app

Il piano completo, con interfacce, test e ordine dei task, sta in wm-core:
`docs/features/8743-app-dettagli-tecnici-e-mappa-delle-tracce-ugc-dai-dati-del-server-calcolo-al-volo-con-la-stessa-pulizia-gps-se-non-sincronizzate/plan.md`. Qui solo i task che toccano questo repo.

- **Task 7** — plancia (`track-recorder`), riepilogo (`modal-success`), `recording-btn` e `card-big` passano a wm-core; si elimina `core/src/app/services/geoutils.service.ts`. `modal-save` non cambia: salva `recordedFeature.geometry`, che dal Task 6 contiene solo i punti tenuti. Commit: `feat(oc:8743): plancia e riepilogo con i dati tecnici di wm-core`.
- Dopo il merge dei submodule: aggiornare i puntatori di wm-core, map-core e wm-types.
