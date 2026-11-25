#!/usr/bin/env node
/**
 * Deploy web condiviso multi-tenant: mobile.webmapp.it/ serve tutti gli shard
 * con lo stesso bundle — EnvironmentService decide lo shard a runtime leggendo
 * l'hostname (vedi wm-core/projects/wm-core/src/services/environment.service.ts).
 *
 * --configuration=production: gli errori di compilazione che bloccavano questa
 * configuration sono stati risolti da oc:8382 (dead code PoiPage, tipo IHIT,
 * collisione dipendenze domhandler); build verificata pulita su questo branch.
 *
 * Deploy veloce e deploy completo (oc:9042). Senza argomenti lo script
 * passa a rsync `--exclude assets`: un pattern senza `/` iniziale esclude
 * OGNI cartella `assets` a qualunque profondità, quindi non solo `assets/`
 * ma anche `map-core/assets/` (l'icona delle frecce sulle track: senza,
 * sulla mappa resta solo il disco bianco sotto la freccia). È il deploy di
 * `npm run deploy-to-web` e della CI. Con `--full`
 * (`npm run deploy-to-web-default-full`) l'esclusione non viene passata e
 * la build arriva per intera: si lancia a mano quando cambia un asset o
 * quando si prepara un server nuovo.
 */
const {run} = require('./lib/run');

const FULL = process.argv.includes('--full');
const RSYNC_ARGS = FULL ? ['-av'] : ['-av', '--exclude', 'assets'];

// `ionic build` non passa da `npm run build`, quindi il `prebuild` del package.json non
// scatta qui: il controllo sui temi va invocato a mano (oc:8613).
run('npm', ['run', 'check-themes']);

run('ionic', ['build', '--configuration=production']);
console.log(
  FULL
    ? '[deploy-to-web-default] deploy completo, assets compresi'
    : '[deploy-to-web-default] deploy veloce, cartelle assets escluse',
);
run('rsync', [...RSYNC_ARGS, './www/*', 'server:/var/www/html/mobile.webmapp.it/']);
