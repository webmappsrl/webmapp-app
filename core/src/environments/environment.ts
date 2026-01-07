import { Environment, redirects, shards } from "@wm-types/environment";

export const environment: Environment = {
  production: false,
  debug: true,
  appId: 1,
  shardName: 'camminiditalia',
  shards,
  redirects,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error'; // Included with Angular CLI.
