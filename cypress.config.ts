import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // setupNodeEvents(on, config) {
    //   implement node event listeners here
    // },
    baseUrl: 'http://localhost:3000',
    chromeWebSecurity: false,
    env: {
      //set email and password from the .env file
      "GOOGLE_USER": process.env.TESTING_EMAIL,
      "GOOGLE_PW": process.env.TESTING_PASSWORD, 
      "COOKIE_NAME": "next-auth.session-token",
      "SITE_NAME": "http://localhost:3000"
    },
  },
});
