import { defineConfig } from 'cypress';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

export default defineConfig({
  env: {
    database_url: process.env.DATABASE_URL,
    nextauth_secret: process.env.NEXTAUTH_SECRET,
    mobileViewportWidthBreakpoint: 414,
  },
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/tests/**/*.spec.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    chromeWebSecurity: false,
    viewportHeight: 1000,
    viewportWidth: 1280,
  },
});
