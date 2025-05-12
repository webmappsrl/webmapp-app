import {defineConfig} from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implementa gli eventi del nodo qui
    },
    baseUrl: 'http://localhost:8100',
    viewportWidth: 414,
    viewportHeight: 896,
    defaultCommandTimeout: 5000,
    testIsolation: false,
    video: true,
  },
});
