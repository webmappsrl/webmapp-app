> Ticket: oc:8023

# Plan — GitHub Action Mobile

## Struttura del lavoro

Il piano è diviso in due fasi sequenziali:
- **Fase A**: porta la suite di test a verde in locale (prerequisito bloccante per Fase B)
- **Fase B**: crea i workflow GitHub Actions

I commit sono istruzioni per il developer — non vengono eseguiti automaticamente.

---

## Fase A — Verifica e fix test esistenti

### Step A.1 — Fix `karma.conf.js` di `webmapp-app`

**File:** `core/karma.conf.js`

Il file usa `browsers: ['Chrome']` senza rilevamento CI. I submoduli usano già il pattern corretto. Aggiornare:

```js
// in cima al file, dopo module.exports = function(config) {
const isCI = process.env.CI || process.env.CHROME_HEADLESS;

// nella config:
autoWatch: !isCI,
browsers: isCI ? ['ChromeHeadlessNoSandbox'] : ['Chrome'],
customLaunchers: {
  ChromeHeadlessNoSandbox: {
    base: 'ChromeHeadless',
    flags: ['--no-sandbox', '--disable-web-security'],
  },
},
singleRun: !!isCI,
restartOnFileChange: !isCI,
```

### Step A.2 — Esegui unit test app e documenta fallimenti

```bash
cd core
npx ng test --configuration=ci --no-watch 2>&1 | tee /tmp/test-app.log
```

Per ogni test rosso: valutare se è un fix rapido (import mancante, mock da aggiornare) o un problema architetturale da skippare con `xit`/`xdescribe` + commento motivato.

### Step A.3 — Esegui unit test wm-core e documenta fallimenti

```bash
cd core/src/app/shared/wm-core
npm install --legacy-peer-deps
npx ng test wm-core --configuration=ci --no-watch 2>&1 | tee /tmp/test-wm-core.log
```

### Step A.4 — Esegui unit test map-core e documenta fallimenti

```bash
cd core/src/app/shared/map-core
npm install --legacy-peer-deps
npx ng test map-core --configuration=ci --no-watch 2>&1 | tee /tmp/test-map-core.log
```

### Step A.5 — Esegui test E2E Cypress e documenta fallimenti

```bash
cd core
ionic serve &
npx cypress run --browser chrome --headless 2>&1 | tee /tmp/test-e2e.log
```

### Step A.6 — Fix test (o skip esplicito)

Per ogni test rosso trovato negli step precedenti:
- **Fix rapido** (mock, import, config): correggere direttamente
- **Test con logica di business da rivedere**: skipparli con `xit` o `xdescribe` e aggiungere un commento `// TODO oc:8023: skippato perché ...`
- **Documentare** ogni decisione di skip in `notes.md`

**Commit dopo Fase A completata:**
```
fix(oc:8023): fix failing tests and add CI headless chrome support
```

---

## Fase B — Setup GitHub Actions

### Step B.1 — Crea `.github/workflows/test-unit.yml`

Tre job paralleli, ognuno rilanciabile indipendentemente. Usa `cache: 'npm'` su `core/package-lock.json` per ridurre i tempi di install.

```yaml
name: Unit Tests

on:
  push:
    branches:
      - develop
  pull_request:
  workflow_call:

jobs:
  test-app:
    runs-on: ubuntu-latest
    name: webmapp-app unit tests
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true
      - name: Update submodules
        run: git submodule update --init --recursive
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: core/package-lock.json
      - name: Install dependencies
        working-directory: core
        run: npm ci
      - name: Setup Chrome
        uses: browser-actions/setup-chrome@v1
      - name: Run tests
        working-directory: core
        run: npx ng test --configuration=ci
        env:
          CI: true

  test-wm-core:
    runs-on: ubuntu-latest
    name: wm-core unit tests
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true
      - name: Update submodules
        run: git submodule update --init --recursive
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: core/package-lock.json
      - name: Install app dependencies
        working-directory: core
        run: npm ci
      - name: Install wm-core dependencies
        working-directory: core/src/app/shared/wm-core
        run: npm install --legacy-peer-deps
      - name: Setup Chrome
        uses: browser-actions/setup-chrome@v1
      - name: Run wm-core tests
        working-directory: core/src/app/shared/wm-core
        run: npx ng test wm-core --configuration=ci
        env:
          CI: true

  test-map-core:
    runs-on: ubuntu-latest
    name: map-core unit tests
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true
      - name: Update submodules
        run: git submodule update --init --recursive
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: core/package-lock.json
      - name: Install app dependencies
        working-directory: core
        run: npm ci
      - name: Install map-core dependencies
        working-directory: core/src/app/shared/map-core
        run: npm install --legacy-peer-deps
      - name: Setup Chrome
        uses: browser-actions/setup-chrome@v1
      - name: Run map-core tests
        working-directory: core/src/app/shared/map-core
        run: npx ng test map-core --configuration=ci
        env:
          CI: true
```

> **Nota**: se `core/package-lock.json` non esiste, `npm ci` fallisce. In quel caso usare `npm install` e committare il `package-lock.json` generato.

### Step B.2 — Crea `.github/workflows/test-e2e.yml`

```yaml
name: E2E Tests

on:
  push:
    branches:
      - develop
  pull_request:
  workflow_call:

jobs:
  e2e:
    runs-on: ubuntu-latest
    name: E2E tests (Cypress)
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true
      - name: Update submodules
        run: git submodule update --init --recursive
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: core/package-lock.json
      - name: Install dependencies
        working-directory: core
        run: npm ci
      - name: Install Ionic CLI
        run: npm install -g @ionic/cli@7.2.1
      - name: Create cypress.env.json
        run: |
          echo '{ "email": "${{ secrets.TEST_EMAIL }}", "password": "${{ secrets.TEST_PASSWORD }}" }' > core/cypress.env.json
      - name: Create posthog.json fallback
        run: |
          if [ ! -f posthog.json ]; then
            echo '{ "POSTHOG_KEY": "", "POSTHOG_HOST": "" }' > posthog.json
          fi
      - name: Inject appId in environment.ts
        run: |
          sed -i '0,/appId: [0-9]\+/s//appId: 52/' core/src/environments/environment.ts
      - name: Verify appId injection
        run: grep -q 'appId: 52' core/src/environments/environment.ts || (echo "ERROR: appId injection failed" && exit 1)
      - name: Setup Chrome
        uses: browser-actions/setup-chrome@v1
      - name: Run Cypress E2E
        uses: cypress-io/github-action@v6
        with:
          browser: chrome
          headed: false
          start: ionic serve
          working-directory: core
          wait-on: http://localhost:8100
          wait-on-timeout: 280
          install: false
          config: >-
            defaultCommandTimeout=5000,pageLoadTimeout=10000,viewportWidth=412,viewportHeight=832,testIsolation=false
        env:
          CI: true
      - name: Upload screenshots on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: cypress-screenshots
          path: core/cypress/screenshots
      - name: Upload videos on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: cypress-videos
          path: core/cypress/videos
```

### Step B.3 — Crea `.github/workflows/preview.yml`

Adattato da `wm-webapp` con path `core/` e guard fork.

```yaml
name: Surge Preview

on:
  pull_request_target:
    types: [opened, synchronize, reopened, closed]
  push:
    branches:
      - develop

jobs:
  preview:
    if: >
      (github.event_name == 'push') ||
      (github.event_name == 'pull_request_target' &&
       github.event.action != 'closed' &&
       github.event.pull_request.head.repo.full_name == github.repository)
    runs-on: ubuntu-latest
    name: Deploy Surge preview
    timeout-minutes: 15
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          submodules: true
          ref: ${{ github.event.pull_request.head.sha || github.sha }}
      - name: Update submodules
        run: git submodule update --init --recursive
      - name: Extract --id and --shard from commit message
        run: |
          if [ "${{ github.event_name }}" == "pull_request_target" ]; then
            COMMIT_MSG=$(git show -s --format=%B ${{ github.event.pull_request.head.sha }})
            PR_NUMBER="${{ github.event.pull_request.number }}"
          else
            COMMIT_MSG=$(git show -s --format=%B ${{ github.sha }})
            PR_NUMBER=$(gh pr list --head "${{ github.ref_name }}" --json number --jq '.[0].number' 2>/dev/null || echo "")
          fi

          ID=$(echo "$COMMIT_MSG" | grep -oP '(?<=--id )\d+' | head -1) || true
          SHARD=$(echo "$COMMIT_MSG" | grep -oP '(?<=--shard )[a-zA-Z0-9-]+' | head -1) || true
          ID=${ID:-52}
          SHARD=${SHARD:-maphub}

          if [ -n "$PR_NUMBER" ]; then
            DOMAIN="${ID}.${SHARD}.pr-${PR_NUMBER}.surge.sh"
          else
            DOMAIN="${ID}.${SHARD}.pr-develop.surge.sh"
          fi

          echo "SURGE_DOMAIN=$DOMAIN" >> $GITHUB_ENV
        env:
          GH_TOKEN: ${{ github.token }}
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: core/package-lock.json
      - name: Install dependencies
        working-directory: core
        run: npm ci
      - name: Install Ionic CLI
        run: npm install -g @ionic/cli@7.2.1
      - name: Create posthog.json fallback
        run: |
          if [ ! -f posthog.json ]; then
            echo '{ "POSTHOG_KEY": "", "POSTHOG_HOST": "" }' > posthog.json
          fi
      - name: Inject appId from --id param
        run: |
          APP_ID=$(echo "${{ env.SURGE_DOMAIN }}" | grep -oP '^\d+' | head -1)
          APP_ID=${APP_ID:-52}
          sed -i "0,/appId: [0-9]\+/s//appId: ${APP_ID}/" core/src/environments/environment.ts
          grep -q "appId: ${APP_ID}" core/src/environments/environment.ts || (echo "ERROR: appId injection failed" && exit 1)
      - name: Build
        working-directory: core
        run: ionic build
      - name: Deploy to Surge
        uses: dswistowski/surge-sh-action@v1
        with:
          domain: ${{ env.SURGE_DOMAIN }}
          project: ./core/www
          login: ${{ secrets.SURGE_EMAIL }}
          token: ${{ secrets.SURGE_TOKEN }}
      - name: Add preview link to summary
        run: |
          echo "## Surge Preview" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "[${{ env.SURGE_DOMAIN }}](http://${{ env.SURGE_DOMAIN }})" >> $GITHUB_STEP_SUMMARY

  teardown:
    if: >
      github.event_name == 'pull_request_target' &&
      github.event.action == 'closed' &&
      github.event.pull_request.head.repo.full_name == github.repository
    runs-on: ubuntu-latest
    name: Teardown Surge preview
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.sha }}
      - name: Compute domain to teardown
        run: |
          COMMIT_MSG=$(git show -s --format=%B ${{ github.event.pull_request.head.sha }})
          ID=$(echo "$COMMIT_MSG" | grep -oP '(?<=--id )\d+' | head -1) || true
          SHARD=$(echo "$COMMIT_MSG" | grep -oP '(?<=--shard )[a-zA-Z0-9-]+' | head -1) || true
          ID=${ID:-52}
          SHARD=${SHARD:-maphub}
          echo "SURGE_DOMAIN=${ID}.${SHARD}.pr-${{ github.event.pull_request.number }}.surge.sh" >> $GITHUB_ENV
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Install Surge CLI
        run: npm install -g surge
      - name: Teardown
        run: npx surge teardown ${{ env.SURGE_DOMAIN }}
        env:
          SURGE_LOGIN: ${{ secrets.SURGE_EMAIL }}
          SURGE_TOKEN: ${{ secrets.SURGE_TOKEN }}
```

### Step B.4 — Crea `.github/workflows/deploy_prod.yml`

```yaml
name: Deploy

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write

jobs:
  unit-tests:
    uses: ./.github/workflows/test-unit.yml
    secrets: inherit

  e2e-tests:
    uses: ./.github/workflows/test-e2e.yml
    secrets: inherit

  build-and-deploy:
    needs: [unit-tests, e2e-tests]
    runs-on: ubuntu-latest
    name: Build and Deploy
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true
      - name: Update submodules
        run: git submodule update --init --recursive
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: core/package-lock.json
      - name: Install dependencies
        working-directory: core
        run: npm ci
      - name: Install Ionic CLI
        run: npm install -g @ionic/cli@7.2.1
      - name: Create posthog.json fallback
        run: |
          if [ ! -f posthog.json ]; then
            echo '{ "POSTHOG_KEY": "", "POSTHOG_HOST": "" }' > posthog.json
          fi
      - name: Setup SSH key
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.SSH_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan -p ${{ secrets.SSH_PORT }} ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts
      - name: Configure SSH alias
        run: |
          cat >> ~/.ssh/config << EOF
          Host server
            HostName ${{ secrets.SSH_HOST }}
            User ${{ secrets.SSH_USER }}
            Port ${{ secrets.SSH_PORT }}
            IdentityFile ~/.ssh/id_rsa
            StrictHostKeyChecking no
          EOF
      - name: Deploy
        working-directory: core
        run: npm run deploy-to-web
      - name: Health check
        run: |
          for i in 1 2 3; do
            curl -f --max-time 15 https://1.camminiditalia.mobile.webmapp.it/ && break
            echo "Attempt $i failed, retrying in 10s..."
            sleep 10
          done
```

### Step B.5 — Rimuovi `.github/workflows/pr_test.yml`

Eliminare il file — i suoi trigger (`pull_request`) e responsabilità sono ora coperti da `test-unit.yml` e `test-e2e.yml`.

**Commit dopo Fase B completata:**
```
feat(oc:8023): add CI/CD workflows (unit tests, e2e, surge preview, deploy)
```

---

## Secrets da configurare manualmente

Prima che i workflow funzionino, aggiungere in **Settings → Secrets and variables → Actions** del repo:

| Secret | Descrizione |
|--------|-------------|
| `SURGE_EMAIL` | Email account Surge |
| `SURGE_TOKEN` | Token Surge (da `surge token`) |
| `SSH_HOST` | Hostname del server di produzione |
| `SSH_USER` | Utente SSH |
| `SSH_PORT` | Porta SSH (solitamente 22) |
| `SSH_KEY` | Chiave privata SSH (contenuto del file `~/.ssh/id_rsa`) |

> `TEST_EMAIL` e `TEST_PASSWORD` sono già presenti (usati dal `pr_test.yml` attuale).

---

## Note sull'implementazione

- **`npm ci` vs `npm install`**: se `core/package-lock.json` non esiste, tutti i job falliranno su `npm ci`. In quel caso: eseguire `cd core && npm install` localmente, committare `package-lock.json`, poi i workflow funzioneranno.
- **`deploy-to-web` esclude gli assets**: lo script usa `--exclude 'assets'` — gli asset statici non vengono sovrascritti ad ogni deploy. Se un deploy include nuovi asset, eseguire manualmente `deploy-to-web-assets`.
- **Rollback**: in caso di deploy rotto, rilanciare `deploy_prod.yml` via `workflow_dispatch` su un commit precedente, oppure intervenire via SSH direttamente sul server.
