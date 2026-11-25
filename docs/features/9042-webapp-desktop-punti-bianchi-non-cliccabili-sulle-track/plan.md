> Ticket: oc:9042

# Deploy web completi — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** aggiungere `npm run deploy-to-web-default-full` e
`npm run deploy-to-web-camminiditalia-full`, che pubblicano la build senza escludere nessuna
cartella `assets`, lasciando invariati i deploy veloci.

**Architecture:** come in `wm-webapp`: ognuno dei due script in `core/scripts/` legge l'argomento
`--full` da `process.argv`; con `--full` rsync riceve solo `-av`, senza `-av --exclude assets`
come oggi. I nuovi comandi npm sono gli stessi script con `--full`. Nessun file nuovo.

**Tech Stack:** Node (script CommonJS in `core/scripts/`), rsync, npm scripts.

**Spec:** [overview.md](overview.md). Il gemello in `wm-webapp` ha il suo plan nello stesso slug.

## Global Constraints

- `npm run deploy-to-web`, `npm run deploy-to-web-default`, `npm run deploy-to-web-camminiditalia`
  e `.github/workflows/deploy_prod.yml` non cambiano comportamento.
- `deploy-to-web-assets`, `deploy-to-web-verbose`, `deploy-cai-to-web` non si toccano.
- Nessuna esecuzione contro il server durante il plan.
- Commenti e documentazione in italiano, identificatori in inglese; stessi nomi di costanti e
  stesso messaggio di log di `wm-webapp`, per tenere allineati i gemelli.
- Nessun controllo aggiuntivo negli script: deciso dal dev in challenge.
- Commit: `fix(oc:9042): …`, solo dopo approvazione esplicita del dev.

## Review Focus

- Senza argomenti, entrambi gli script compongono esattamente `['-av', '--exclude', 'assets']` →
  Task 1, Step 2.
- Con `--full` arrivano `assets/` e `map-core/assets/` → semantica già provata nel plan di
  `wm-webapp` (Task 1, Step 1); qui Task 1, Step 2.
- `core/scripts/deploy-to-web.js` resta sui deploy veloci → Task 1, Step 3.

---

### Task 1: argomento `--full` nei due script e comandi npm

**Files:**
- Modify: `core/scripts/deploy-to-web-default.js:13` (`RSYNC_ARGS`) e commento di testa
- Modify: `core/scripts/deploy-to-web-camminiditalia.js:20` (`RSYNC_ARGS`) e commento di testa
- Modify: `core/package.json:17-18` (due righe nuove)

**Interfaces:**
- Produces: `npm run deploy-to-web-default-full` = `node scripts/deploy-to-web-default.js --full`;
  `npm run deploy-to-web-camminiditalia-full` = `node scripts/deploy-to-web-camminiditalia.js --full`;
  in entrambi `const FULL = process.argv.includes('--full')`.

- [ ] **Step 1: Implementare `FULL` e `RSYNC_ARGS` nei due script**

Stessa forma di `wm-webapp`: `RSYNC_ARGS = FULL ? ['-av'] : ['-av', '--exclude', 'assets']`, la
riga di log con il nome dello script (`[deploy-to-web-default]`, `[deploy-to-web-camminiditalia]`)
e il paragrafo nel commento di testa sulla trappola del pattern e su quando lanciare il `-full`.

In `core/package.json`, dopo le righe 17 e 18:
`"deploy-to-web-default-full": "node scripts/deploy-to-web-default.js --full",`
`"deploy-to-web-camminiditalia-full": "node scripts/deploy-to-web-camminiditalia.js --full",`

- [ ] **Step 2: Verificare sintassi e comandi, senza lanciare nulla**

```bash
cd core
node --check scripts/deploy-to-web-default.js && node --check scripts/deploy-to-web-camminiditalia.js
node -e "const s=require('./package.json').scripts; console.log(s['deploy-to-web-default-full'], '|', s['deploy-to-web-camminiditalia-full'])"
grep -n "RSYNC_ARGS\|FULL" scripts/deploy-to-web-*.js
```

Atteso: nessun errore; i due comandi con `--full`; `RSYNC_ARGS` con i due rami in entrambi i file.

- [ ] **Step 3: Rileggere il diff**

`git diff core/scripts core/package.json`: build, destinazioni e `check-themes` invariati;
`deploy-to-web.js` e `lib/run.js` non toccati.

- [ ] **Step 4: Commit (solo dopo approvazione del dev)**

```bash
git add core/scripts/deploy-to-web-default.js core/scripts/deploy-to-web-camminiditalia.js core/package.json
git commit -m "fix(oc:9042): deploy web completi con gli assets"
```

### Task 2: documentazione

**Files:**
- Modify: `CLAUDE.md:54-55` (tabella Comandi)
- Modify: `docs/knowledge/build-e-deploy-web.md` (tabella «Il deploy aggiunge e sovrascrive», riga ~32)
  — il testo passa da `wm-context-guard` in `update-context`

- [ ] **Step 1: Righe nella tabella Comandi del `CLAUDE.md`**

Dopo le due righe di deploy web:
`| Deploy web completo, assets compresi | npm run deploy-to-web-default-full / npm run deploy-to-web-camminiditalia-full — a mano, quando cambia un asset o su un server nuovo |`

- [ ] **Step 2: Pagina di conoscenza**

Nella tabella dei deploy, i due `-full`; sotto, la trappola del pattern non ancorato, il caso di
`1.camminiditalia.mobile.webmapp.it` senza `map-core/assets` (`500` fino al 25/11, caricata a mano)
e la scelta del dev di tenere veloce il deploy automatico.

- [ ] **Step 3: Commit (solo dopo approvazione del dev)**

```bash
git add CLAUDE.md docs/knowledge/build-e-deploy-web.md docs/features/9042-webapp-desktop-punti-bianchi-non-cliccabili-sulle-track/
git commit -m "docs(oc:9042): deploy web completi e trappola del pattern rsync"
```
