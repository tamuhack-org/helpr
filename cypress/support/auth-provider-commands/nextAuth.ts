import { v4 as uuidv4 } from 'uuid';
import { encode } from 'next-auth/jwt';
import type { JWT } from 'next-auth/jwt';

// Custom command for automagically authenticating using next-auth cookies.
// Note: this function leaves you on a blank page, so you must call cy.visit()
// afterwards, before continuing with your test.
Cypress.Commands.add(
  'loginNextAuth',
  ({ userId, name, email, provider }: any) => {
    Cypress.log({
      displayName: 'NEXT-AUTH LOGIN',
      message: [`🔐 Authenticating | ${name}`],
    });

    const dateTimeNow = Math.floor(Date.now() / 1000);
    const expiry = dateTimeNow + 30 * 24 * 60 * 60; // 30 days
    const cookieName = 'next-auth.session-token';
    const cookieValue: JWT = {
      sub: userId,
      name: name,
      email: email,
      provider: provider,
      picture: `https://via.placeholder.com/200/7732bb/c0392b.png?text=${name}`,
      tokenType: 'Bearer',
      accessToken: 'dummy',
      iat: dateTimeNow,
      exp: expiry,
      jti: uuidv4(),
    };

    // https://docs.cypress.io/api/utilities/promise#Waiting-for-Promises
    cy.wrap(null, { log: false }).then(() => {
      return new Cypress.Promise(async (resolve, reject) => {
        try {
          const encryptedCookieValue = await encode({
            token: cookieValue,
            secret: Cypress.env('nextauth_secret'),
          });

          Cypress.log({
            displayName: 'ENCRYPTED COOKIE VALUE',
            message: encryptedCookieValue,
          });

          cy.setCookie(cookieName, encryptedCookieValue, {
            log: false,
            httpOnly: true,
            path: '/',
            expiry: expiry,
          });

          resolve();
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err);
          Cypress.log({
            displayName: 'ERROR!',
            message: err,
          });
          reject();
        }
      });
    });
  }
);
