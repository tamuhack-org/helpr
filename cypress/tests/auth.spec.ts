import { testCreds } from '../support/testData';

describe('given an unauthenticated session', () => {
  // before(() => {
  //   cy.resetDatabase();
  // });

  beforeEach(() => {
    cy.loginNextAuth(testCreds);
    cy.visit('http://localhost:3000');
  });

  describe('when generating a valid JWT and visiting the site', () => {
    it('should show the home page of an authenticated user', () => {
      cy.findByLabelText('logout-button').should('be.visible');
    });
  });
});
