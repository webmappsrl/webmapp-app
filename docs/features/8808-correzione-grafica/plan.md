> Ticket: oc:8808

# Correzione grafica — piano di implementazione

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** nell'alert che conferma lo scarto di una registrazione di traccia, «da Webmapp» diventa «dai nostri server» in tutte le 7 lingue.

**Architecture:** solo valori di traduzione nei file `core/src/assets/i18n/*.ts` dell'app, chiave `pages.register.modalexit.text`. Nessun cambio di codice, nessun submodule.

**Tech Stack:** Angular 20, ngx-translate (file `.ts` compilati nel bundle).

**Spec:** [overview.md](overview.md)

## Global Constraints

- Branch `feature/oc-8808-correzione-grafica` creato da `develop`; PR verso `develop`.
- `core/src/environments/environment.ts` è modificato in locale e **non** va nel commit.
- Si cambia solo la porzione «da Webmapp» (e gli equivalenti); il resto della frase resta identico.
- Nessun'altra occorrenza di «Webmapp» nei file i18n va toccata (crediti, licenza, disclaimer, coins).
- Nessun commit automatico: il commit si fa solo dopo il via libera esplicito del dev.

## Review Focus

- Apostrofi: `it.ts` usa l'apostrofo tipografico `’`, `fr.ts` l'apostrofo escapato `\'` — vanno conservati così.
- L'alert compare solo per le tracce: con un POI (`isWaypoint: true`) «ESCI SENZA SALVARE» chiude senza alert, e resta così.

---

### Task 1: Branch

- [ ] **Step 1:** mettere da parte la modifica locale e creare il branch

```bash
git stash push core/src/environments/environment.ts
git fetch origin && git checkout -b feature/oc-8808-correzione-grafica origin/develop
git stash pop
```

Expected: branch creato, `environment.ts` di nuovo modificato in locale. Se lo `stash pop` va in conflitto, fermarsi e chiedere al dev.

- [ ] **Step 2:** verificare che la chiave su `develop` sia ancora quella attesa

Run: `grep -n "da Webmapp\|from Webmapp\|von Webmapp\|de Webmapp\|do Webmapp\|nga Webmapp" core/src/assets/i18n/*.ts`
Expected: 7 righe, una per file, tutte nella chiave `modalexit.text`.

### Task 2: Testi

**Files:** Modify `core/src/assets/i18n/{it,en,de,es,fr,pr,sq}.ts` — chiave `pages.register.modalexit.text`

- [ ] **Step 1:** sostituire i valori con questi testi esatti

| File | Nuovo valore |
|---|---|
| it.ts | `Completando l’azione la traccia verrà eliminata dal tuo profilo e dai nostri server. L’operazione non può essere annullata.` |
| en.ts | `By completing the action, the track will be deleted from your profile and from our servers. The operation cannot be canceled.` |
| de.ts | `Durch das Beenden der Aktion wird die Strecke aus Ihrem Profil und von unseren Servern gelöscht. Der Vorgang kann nicht rückgängig gemacht werden.` |
| es.ts | `Al finalizar la acción, la ruta se eliminará de tu perfil y de nuestros servidores. La operación no se puede deshacer.` |
| fr.ts | `En complétant l\'action, la piste sera supprimée de votre profil et de nos serveurs. L\'opération ne peut pas être annulée.` |
| pr.ts | `Ao finalizar a ação, a rota será excluída do seu perfil e dos nossos servidores. A operação não pode ser desfeita.` |
| sq.ts | `Duke përfunduar veprimin gjurma do të fshihet nga profili yt dhe nga serverat tanë. Operacioni nuk mund të anulohet.` |

- [ ] **Step 2:** verificare che non resti nulla

Run: lo stesso `grep` del Task 1, Step 2.
Expected: nessuna riga.

- [ ] **Step 3:** verificare che il diff tocchi solo quelle 7 righe

Run: `git diff --stat -- core/src/assets/i18n/`
Expected: 7 file, 1 riga cambiata ciascuno.

- [ ] **Step 4:** lint e build

Run (da `core/`): `npm run lint` e `npm run build`
Expected: nessun errore nuovo.

- [ ] **Step 5:** verifica manuale (dev)

Registrare una traccia, fermarla, nella modale di salvataggio toccare «ESCI SENZA SALVARE»: l'alert «Elimina per sempre?» mostra il nuovo testo. Ripetere cambiando lingua almeno su en.

- [ ] **Step 6:** commit — solo dopo il via libera del dev

```bash
git add core/src/assets/i18n/ docs/features/8808-correzione-grafica/
git commit -m "fix(oc:8808): testo neutro nella conferma di eliminazione registrazione"
```
