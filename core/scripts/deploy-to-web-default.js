#!/usr/bin/env node
/**
 * Deploy web condiviso multi-tenant: mobile.webmapp.it/ serve tutti gli shard
 * con lo stesso bundle — EnvironmentService decide lo shard a runtime leggendo
 * l'hostname (vedi wm-core/projects/wm-core/src/services/environment.service.ts).
 *
 * NOTA: --configuration=production NON è applicabile oggi — verificato che la
 * build fallisce con 19 errori di compilazione preesistenti (AOT/template type
 * checking più stretto, mai eseguito finora su questo repo perché nessuna build
 * ha mai usato --configuration=production). Va risolto come lavoro a parte,
 * prima di riprovare ad abilitarlo.
 */
const {run} = require('./lib/run');

const RSYNC_ARGS = ['-av', '--exclude', 'assets'];

run('ionic', ['build']);
run('rsync', [...RSYNC_ARGS, './www/*', 'server:/var/www/html/mobile.webmapp.it/']);
