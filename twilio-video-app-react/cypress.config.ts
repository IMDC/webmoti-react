import { defineConfig } from 'cypress';
import setupNodeEvents from './cypress/plugins/index.js';

export default defineConfig({
  video: false,
  defaultCommandTimeout: 60000,
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'cypress/reporter-config.json',
  },
  retries: 2,
  e2e: {
    setupNodeEvents(on, config) {
      return setupNodeEvents(on, config);
    },
    baseUrl: 'http://localhost:3000',
  },
});
