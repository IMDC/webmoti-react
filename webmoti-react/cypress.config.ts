import { defineConfig } from 'cypress';
import setupParticipantTasks from './cypress/plugins/index.js';

export default defineConfig({
  video: false,
  defaultCommandTimeout: 60000,
  retries: 2,
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'cypress/reporter-config.json',
  },
  e2e: {
    // this avoids responsive layout changes
    viewportWidth: 1400,
    viewportHeight: 800,
    // don't clear browser each test
    testIsolation: false,
    // this is for cy.task
    setupNodeEvents(on, config) {
      return setupParticipantTasks(on, config);
    },
  },
});
