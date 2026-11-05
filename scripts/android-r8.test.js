// Test delle funzioni che attivano R8 nella build Android di release (oc:8892).
// Esecuzione dalla root: `npm run test:gulp` oppure `node --test scripts/*.test.js`.
const test = require('node:test');
const assert = require('node:assert/strict');
const {applyR8ToBuildGradle, ensureR8CompatMode} = require('./android-r8');

// Blocco buildTypes del template generato da `npx cap add android` (Capacitor 7).
const TEMPLATE = `android {
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}`;

const TEMPLATE_CON_DEBUG = `android {
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
        debug {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}`;

test('attiva R8 nella release', () => {
  const result = applyR8ToBuildGradle(TEMPLATE, true);
  assert.match(result, /minifyEnabled true/);
  assert.match(result, /getDefaultProguardFile\('proguard-android-optimize\.txt'\)/);
  assert.doesNotMatch(result, /'proguard-android\.txt'/);
});

// Nomi dei test senza lettere accentate: il runner `node --test` di Node 18 non li accetta.
test('idempotente', () => {
  const once = applyR8ToBuildGradle(TEMPLATE, true);
  assert.equal(applyR8ToBuildGradle(once, true), once);
});

test('--skip-r8 torna indietro', () => {
  assert.equal(applyR8ToBuildGradle(applyR8ToBuildGradle(TEMPLATE, true), false), TEMPLATE);
});

test('non tocca il blocco debug', () => {
  const debugBlock = TEMPLATE_CON_DEBUG.slice(TEMPLATE_CON_DEBUG.indexOf('debug {'));
  const result = applyR8ToBuildGradle(TEMPLATE_CON_DEBUG, true);
  assert.ok(result.endsWith(debugBlock));
  assert.match(result, /release \{\s*minifyEnabled true/);
});

test('fallisce senza il blocco release', () => {
  assert.throws(() => applyR8ToBuildGradle('android {}', true), /minifyEnabled/);
});

test('fallisce senza proguardFiles di default', () => {
  const senzaProguard = `buildTypes {
        release {
            minifyEnabled false
        }
    }`;
  assert.throws(() => applyR8ToBuildGradle(senzaProguard, true), /proguard-android/);
});

test('fullMode: aggiunge la riga', () => {
  assert.equal(
    ensureR8CompatMode('android.useAndroidX=true\n'),
    'android.useAndroidX=true\nandroid.enableR8.fullMode=false\n',
  );
});

test('fullMode: senza a-capo finale', () => {
  assert.equal(
    ensureR8CompatMode('android.useAndroidX=true'),
    'android.useAndroidX=true\nandroid.enableR8.fullMode=false\n',
  );
});

test('fullMode: sostituisce un valore true', () => {
  const result = ensureR8CompatMode('android.enableR8.fullMode=true\nandroid.useAndroidX=true\n');
  assert.equal(result.match(/android\.enableR8\.fullMode/g).length, 1);
  assert.match(result, /^android\.enableR8\.fullMode=false$/m);
  assert.match(result, /^android\.useAndroidX=true$/m);
});

test('fullMode: idempotente', () => {
  const once = ensureR8CompatMode('android.useAndroidX=true\n');
  assert.equal(ensureR8CompatMode(once), once);
});
