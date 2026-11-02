// Trasformazioni dei file Android generati da Capacitor per attivare R8 nella release (oc:8892).
// Funzioni pure, senza accesso al filesystem: le usa il gulpfile in _updateAndroidFiles().

const RELEASE_BLOCK = /release\s*\{[^}]*\}/;
const MINIFY = /minifyEnabled\s+(true|false)/;
const DEFAULT_PROGUARD = /getDefaultProguardFile\('proguard-android(-optimize)?\.txt'\)/;
const FULL_MODE_LINE = /^android\.enableR8\.fullMode=.*$\n?/gm;

/**
 * Attiva o disattiva R8 nel blocco `buildTypes.release` di un build.gradle, lasciando intatto il
 * resto del file (compreso il blocco `debug`).
 * Con R8 attivo: `minifyEnabled true` e `proguard-android-optimize.txt`, perché
 * `proguard-android.txt` contiene `-dontoptimize` e lascerebbe l'ottimizzazione a zero.
 * Con R8 disattivo (`--skip-r8`): `minifyEnabled false` e `proguard-android.txt`, come il template.
 * @param {string} content contenuto di instances/<app>/android/app/build.gradle
 * @param {boolean} enabled true per attivare R8, false per la build di emergenza senza R8
 * @returns {string} il contenuto modificato
 * @throws {Error} se il blocco release non contiene i testi attesi: meglio fermare la build che
 *   produrre in silenzio una release senza R8
 */
function applyR8ToBuildGradle(content, enabled) {
  const release = content.match(RELEASE_BLOCK);
  if (!release || !MINIFY.test(release[0])) {
    throw new Error(
      'build.gradle: nessun "minifyEnabled" nel blocco release, impossibile configurare R8',
    );
  }
  if (!DEFAULT_PROGUARD.test(release[0])) {
    throw new Error(
      "build.gradle: nessun getDefaultProguardFile('proguard-android...') nel blocco release, impossibile configurare R8",
    );
  }
  const proguardFile = enabled ? 'proguard-android-optimize.txt' : 'proguard-android.txt';
  const updated = release[0]
    .replace(MINIFY, `minifyEnabled ${enabled}`)
    .replace(DEFAULT_PROGUARD, `getDefaultProguardFile('${proguardFile}')`);
  return content.replace(release[0], () => updated);
}

/**
 * Imposta R8 in modalità compatibile in gradle.properties: dal plugin Android 8 il default è la
 * full mode, più aggressiva nel rimuovere e rinominare codice. Toglie ogni valore precedente e
 * lascia una sola riga `android.enableR8.fullMode=false` in fondo al file.
 * @param {string} content contenuto di instances/<app>/android/gradle.properties
 * @returns {string} il contenuto modificato, terminato da un a-capo
 */
function ensureR8CompatMode(content) {
  const rest = content.replace(FULL_MODE_LINE, '').replace(/\s+$/, '');
  return (rest ? rest + '\n' : '') + 'android.enableR8.fullMode=false\n';
}

module.exports = {applyR8ToBuildGradle, ensureR8CompatMode};
