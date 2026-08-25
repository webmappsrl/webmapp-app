#!/usr/bin/env node
/**
 * Deploy web condiviso multi-tenant: mobile.webmapp.it/ serve tutti gli shard
 * con lo stesso bundle — EnvironmentService decide lo shard a runtime leggendo
 * l'hostname (vedi wm-core/projects/wm-core/src/services/environment.service.ts).
 *
 * --configuration=production: gli errori di compilazione che bloccavano questa
 * configuration sono stati risolti da oc:8382 (dead code PoiPage, tipo IHIT,
 * collisione dipendenze domhandler); build verificata pulita su questo branch.
 */
const {run} = require('./lib/run');

const RSYNC_ARGS = ['-av', '--exclude', 'assets'];

run('ionic', ['build', '--configuration=production']);
run('rsync', [...RSYNC_ARGS, './www/*', 'server:/var/www/html/mobile.webmapp.it/']);
