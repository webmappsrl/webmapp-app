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
 */
const {run} = require('./lib/run');

const RSYNC_ARGS = ['-av', '--exclude', 'assets'];

run('ionic', [
  'build',
  '--configuration=production,camminiditalia',
  '--',
  '--output-path=www-camminiditalia',
]);
run('rsync', [
  ...RSYNC_ARGS,
  './www-camminiditalia/*',
  'server:/var/www/html/mobile.camminiditalia.webmapp.it/',
]);
