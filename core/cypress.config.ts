import {defineConfig} from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implementa gli eventi del nodo qui
    },
    baseUrl: 'http://localhost:8100',
    viewportWidth: 375,
    viewportHeight: 812,
    defaultCommandTimeout: 5000,
    testIsolation: false,
  },
});
