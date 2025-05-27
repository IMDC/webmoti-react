import { defineConfig } from 'cypress';

export default defineConfig({
  video: false,
  defaultCommandTimeout: 60000,
  retries: 2,
  e2e: {
    baseUrl: 'http://localhost:3000',
    // this avoids responsive layout changes
    viewportWidth: 1400,
    viewportHeight: 800,
    // don't clear browser each test
    testIsolation: false,
  },
});
