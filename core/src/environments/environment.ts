// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  analyticsId: '285809815',
  geohubId: 29,
  apiCarg: 'https://carg.maphub.it',
  elasticApi: 'https://elastic-json.webmapp.it/v2/search',
  osm2caiApi: 'https://osm2cai.cai.it',
  api: 'https://geohub.webmapp.it',
  awsApi: 'https://wmfe.s3.eu-central-1.amazonaws.com/geohub',
  // api: 'http://127.0.0.1:8000',
  //elasticApi: 'http://localhost:3000/v2/search'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error'; // Included with Angular CLI.
