#!/usr/bin/env node
/**
 * Deploy web dedicato a camminiditalia: mobile.camminiditalia.webmapp.it/
 * riceve un bundle separato dal deploy condiviso, necessario perché
 * fileReplacements/--configuration di Angular agiscono a compile-time — un
 * bundle con home.component.camminiditalia.ts "baked in" non può essere
 * servito dal deploy condiviso, altrimenti lo vedrebbero anche gli altri
 * clienti (vedi angular.json, configuration "camminiditalia").
 *
 * --output-path=www-camminiditalia: cartella separata da www/ per non
 * sovrascrivere l'output della build generica quando i due script girano
 * in sequenza (vedi deploy-to-web.js).
 *
 * --configuration=production,camminiditalia: combinazione mai testata prima
 * di oc:8382 (che aveva verificato solo "production" da solo); build
 * verificata pulita su questo branch dopo il merge del fix.
 *
 * Deploy veloce e deploy completo (oc:9042). Senza argomenti lo script
 * passa a rsync `--exclude assets`: un pattern senza `/` iniziale esclude
 * OGNI cartella `assets` a qualunque profondità, quindi non solo `assets/`
 * ma anche `map-core/assets/` (l'icona delle frecce sulle track: senza,
 * sulla mappa resta solo il disco bianco sotto la freccia). È il deploy di
 * `npm run deploy-to-web` e della CI. Con `--full`
 * (`npm run deploy-to-web-camminiditalia-full`) l'esclusione non viene passata e
 * la build arriva per intera: si lancia a mano quando cambia un asset o
 * quando si prepara un server nuovo.
 */
const {run} = require('./lib/run');

const FULL = process.argv.includes('--full');
const RSYNC_ARGS = FULL ? ['-av'] : ['-av', '--exclude', 'assets'];

// `ionic build` non passa da `npm run build`, quindi il `prebuild` del package.json non
// scatta qui: il controllo sui temi va invocato a mano (oc:8613).
run('npm', ['run', 'check-themes']);

run('ionic', [
  'build',
  '--configuration=production,camminiditalia',
  '--',
  '--output-path=www-camminiditalia',
]);
console.log(
  FULL
    ? '[deploy-to-web-camminiditalia] deploy completo, assets compresi'
    : '[deploy-to-web-camminiditalia] deploy veloce, cartelle assets escluse',
);
run('rsync', [
  ...RSYNC_ARGS,
  './www-camminiditalia/*',
  'server:/var/www/html/mobile.camminiditalia.webmapp.it/',
]);
