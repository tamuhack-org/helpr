// describe('template spec', () => {
//   it('finds the login page', () => {
//     cy.visit('localhost:3000/login');
//     cy.contains('Log in with Google');
//   });
// });

describe('Google', function () {
  beforeEach(function () {
    cy.visit('localhost:3000/login');
    cy.contains('Log in with Google');
    cy.loginByGoogleApi();
  });

  it('shows onboarding', function () {
    cy.visit('localhost:3000/');
  });
});

// describe('Login page', () => {
//   before(() => {
//     cy.log(`Visiting https://company.tld`);
//     cy.visit('http://localhost:3000/api/auth/callback/google');
//   });
//   it('Login with Google', () => {
//     const username = 'helprtesting@gmail.com';
//     const password = 'pyqroz-4vAkcu-vutsyv';
//     const loginUrl = 'http://localhost:3000';
//     const cookieName = 'next-auth.session-token';
//     const socialLoginOptions = {
//       username,
//       password,
//       loginUrl,
//       headless: true,
//       logs: false,
//       isPopup: true,
//       loginSelector: `[id^=login]`,
//       postLoginSelector: '.unread-count',
//     };

//     cy.log("Logging in with Google's social login");

//     return cy
//       .task('GoogleSocialLogin', socialLoginOptions)
//       .then(({ cookies }) => {
//         cy.clearCookies();

//         const cookie = cookies
//           .filter((cookie) => cookie.name === cookieName)
//           .pop();
//         if (cookie) {
//           cy.setCookie(cookie.name, cookie.value, {
//             domain: cookie.domain,
//             expiry: cookie.expires,
//             httpOnly: cookie.httpOnly,
//             path: cookie.path,
//             secure: cookie.secure,
//           });

//           Cypress.Cookies.defaults({
//             preserve: cookieName,
//           });

//           // remove the two lines below if you need to stay logged in
//           // for your remaining tests
//           cy.visit('/api/auth/signout');
//           cy.get('form').submit();
//         }
//       });
//   });
// });

export {};
