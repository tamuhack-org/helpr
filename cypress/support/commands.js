// Import Cypress Percy plugin command (https://docs.percy.io/docs/cypress)
import '@percy/cypress';

// Import react-testing-library plugin commands
import '@testing-library/cypress/add-commands';

// Import commands for third-party auth providers
import './auth-provider-commands/nextAuth';

// Custom command to make taking snapshots with full name
// formed from the test title + suffix easier
// cy.visualSnapshot() // default full test title
// cy.visualSnapshot('clicked') // full test title + ' - clicked'
// also sets the width and height to the current viewport
Cypress.Commands.add('visualSnapshot', (maybeName) => {
  // @ts-expect-error Known Cypress function
  let snapshotTitle = cy.state('runnable').fullTitle();

  if (maybeName) {
    snapshotTitle = snapshotTitle + ' - ' + maybeName;
  }

  cy.percySnapshot(snapshotTitle, {
    // @ts-expect-error Known Cypress function
    widths: [cy.state('viewportWidth')],
    // @ts-expect-error Known Cypress function
    minHeight: cy.state('viewportHeight'),
  });
});

// Custom command for resetting the database with original seed data using Prisma.
Cypress.Commands.add('resetDatabase', () => {
  const log = Cypress.log({
    displayName: 'RESET DATABASE',
    message: ['♻️ Resetting the Database'],
    autoEnd: false,
  });

  cy.exec(
    'npx prisma db push --force-reset --accept-data-loss --skip-generate',
    {
      log: false,
      env: { DATABASE_URL: Cypress.env('database_url') },
    }
  ).then(() => {
    log.snapshot();
    log.end();
  });
});

Cypress.Commands.add('resetSeedDatabase', () => {
  cy.resetDatabase().then(() => {
    const log = Cypress.log({
      displayName: 'SEED DATABASE',
      message: ['🌱 Seeding the Database'],
      autoEnd: false,
    });

    cy.exec('npx prisma db seed', {
      log: false,
      env: { DATABASE_URL: Cypress.env('database_url') },
    }).then(() => {
      log.snapshot();
      log.end();
    });
  });
});
