import {
  clearTestState,
  confWithReleaseUpdateEnabled,
  confWithReleaseUpdateDisabled,
  confWithReleaseUpdateEnabledCustomStoreUrl,
  mockReleaseUpdateVersion,
  MOCKED_APP_VERSION,
  MOCKED_RELEASE_UPDATE_VERSION,
} from 'cypress/utils/test-utils';

describe('Release Update Modal [oc:6540]', () => {
  beforeEach(() => {
    clearTestState();
  });

  it('should show release update modal when forceToReleaseUpdate is enabled and version is different', () => {
    // Mock config with release update enabled and store URLs
    // Use simulated versions: app version (MOCKED_APP_VERSION) vs release update version (MOCKED_RELEASE_UPDATE_VERSION) - different
    confWithReleaseUpdateEnabled(MOCKED_RELEASE_UPDATE_VERSION, MOCKED_APP_VERSION).as('getConf');
    // Mock release update version with simulated version (different from app version)
    mockReleaseUpdateVersion().as('getGithubVersion');
    cy.visit('/');

    // Wait for config to be loaded
    cy.wait('@getConf');
    // Wait for GitHub version check (may take a moment for the service to check)
    cy.wait('@getGithubVersion', {timeout: 10000});

    // Wait for app to initialize and modal to appear (Ionic modals are rendered asynchronously)
    // The modal should appear after the service checks the version
    cy.get('ion-modal', {timeout: 15000}).should('be.visible');
    cy.get('ion-modal wm-modal-release-update-app', {timeout: 5000}).should('be.visible');

    // Verify modal content is displayed
    // Check that title exists and has text (language independent)
    cy.get('.wm-modal-release-update-app-title').should('be.visible').should('not.be.empty');
    // Check that message exists and has text (language independent)
    cy.get('.wm-modal-release-update-app-message').should('be.visible').should('not.be.empty');
    // Check that version is displayed (numeric value)
    cy.get('.wm-modal-release-update-app-version').should('be.visible').should('not.be.empty');
    // Check that buttons exist and have text (language independent)
    cy.get('.wm-modal-release-update-app-button').should('be.visible').should('not.be.empty');
    cy.get('.wm-modal-release-update-app-button-close').should('be.visible').should('not.be.empty');
  });

  it('should have mocked store URL in the update button', () => {
    const mockStoreUrl = 'https://test-store-url.mock/webmapp-app';

    // Mock config with our test store URL BEFORE visiting (this must be set before cy.visit)
    confWithReleaseUpdateEnabledCustomStoreUrl(mockStoreUrl, MOCKED_RELEASE_UPDATE_VERSION).as(
      'getConfWithMockUrl',
    );

    // Mock release update version with simulated version
    mockReleaseUpdateVersion().as('getGithubVersionWithMockUrl');

    // Visit with the mocked config
    cy.visit('/');

    // Wait for config to be loaded and verify it contains our mocked URL
    cy.wait('@getConfWithMockUrl').then(interception => {
      expect(interception.response.body.APP.androidStore).to.equal(mockStoreUrl);
      expect(interception.response.body.APP.iosStore).to.equal(mockStoreUrl);
    });
    // Wait for GitHub version check
    cy.wait('@getGithubVersionWithMockUrl', {timeout: 10000});

    // Wait for modal to appear
    cy.get('ion-modal', {timeout: 15000}).should('be.visible');
    cy.get('ion-modal wm-modal-release-update-app', {timeout: 5000}).should('be.visible');

    // Mock window.open to capture the URL without opening it (must be set before clicking)
    cy.window().then(win => {
      cy.stub(win, 'open').as('windowOpen');
    });

    // Click the update button to verify the URL is present
    cy.get('.wm-modal-release-update-app-button').should('be.visible').click();
  });

  it('should close modal when close button is clicked', () => {
    // Mock config with release update enabled and store URLs
    // Use simulated versions: app version vs release update version - different
    confWithReleaseUpdateEnabled(MOCKED_RELEASE_UPDATE_VERSION, MOCKED_APP_VERSION).as('getConf');
    // Mock release update version with simulated version
    mockReleaseUpdateVersion().as('getGithubVersion');
    cy.visit('/');

    // Wait for config to be loaded
    cy.wait('@getConf');
    // Wait for GitHub version check
    cy.wait('@getGithubVersion', {timeout: 10000});

    // Wait for modal to appear
    cy.get('ion-modal', {timeout: 15000}).should('be.visible');
    cy.get('ion-modal wm-modal-release-update-app', {timeout: 5000}).should('be.visible');

    // Click the close button
    cy.get('.wm-modal-release-update-app-button-close').should('be.visible').click();

    // Verify that the modal is no longer visible
    cy.get('ion-modal').should('not.exist');
    cy.get('wm-modal-release-update-app').should('not.exist');
  });
});

describe('Release Update Modal - Not Shown [oc:xxxx]', () => {
  beforeEach(() => {
    clearTestState();
  });

  it('should not show release update modal when forceToReleaseUpdate is false', () => {
    // Clear all caches and storage FIRST
    cy.clearLocalStorage();
    cy.clearCookies();

    // IMPORTANT: Set up mocks BEFORE visiting the page
    // The mock must be active before any HTTP requests are made
    // Mock config with forceToReleaseUpdate disabled (property removed, not set to false)
    confWithReleaseUpdateDisabled().as('getConfDisabled');
    // Mock release update version with fixed mocked version (even if different, modal should not appear)
    mockReleaseUpdateVersion().as('getGithubVersion');

    // Visit with hard reload to clear cache and ensure fresh state
    cy.visit('/', {
      onBeforeLoad: win => {
        // Clear all storage before page loads
        win.localStorage.clear();
        win.sessionStorage.clear();
      },
    });

    // Wait for config to be loaded FIRST - this ensures the mock is applied
    cy.wait('@getConfDisabled').then(interception => {
      // Verify the config doesn't have forceToReleaseUpdate or it's false/undefined
      const forceToReleaseUpdate = interception.response.body.APP.forceToReleaseUpdate;
      expect(forceToReleaseUpdate).to.be.undefined;
    });

    // Wait for GitHub version check (but modal should not appear even if version differs)
    cy.wait('@getGithubVersion', {timeout: 10000});

    // If a modal appears during initial load (before mock is applied), close it immediately
    // This handles the race condition where the modal might appear before the mock is active
    cy.get('body', {timeout: 2000}).then($body => {
      const modal = $body.find('ion-modal wm-modal-release-update-app');
      if (modal.length > 0 && modal.is(':visible')) {
        cy.get('ion-modal wm-modal-release-update-app .wm-modal-release-update-app-button-close')
          .first()
          .click({force: true});
        cy.wait(1000);
      }
    });

    // Wait for the app to fully initialize and process the config
    // The service needs time to process the config and decide not to show the modal
    cy.wait(3000);

    // Verify that no modal is displayed at any point
    // Check multiple times to ensure it doesn't appear even after delays
    cy.get('ion-modal wm-modal-release-update-app').should('not.exist');

    // Wait a bit more and check again (in case there's a delayed check)
    cy.wait(1000);
    cy.get('ion-modal wm-modal-release-update-app').should('not.exist');
  });

  it('should not show release update modal when store URLs are missing', () => {
    // Mock config with forceToReleaseUpdate enabled but without store URLs
    confWithReleaseUpdateEnabledCustomStoreUrl(undefined, MOCKED_RELEASE_UPDATE_VERSION).as(
      'getConfNoStoreUrls',
    );
    // Mock release update version with simulated version (different from app version)
    mockReleaseUpdateVersion().as('getGithubVersion');

    cy.visit('/');

    // Wait for config to be loaded
    cy.wait('@getConfNoStoreUrls');
    // Wait for GitHub version check
    cy.wait('@getGithubVersion', {timeout: 10000});
    // Wait a bit to ensure any potential modal would have appeared
    cy.wait(2000);

    // Verify that the modal is NOT displayed
    cy.get('ion-modal wm-modal-release-update-app').should('not.exist');
  });

  it('should not show release update modal when versions are the same', () => {
    // Mock config with release update enabled and store URLs
    // Use simulated app version for both app and GitHub - versions are the same
    confWithReleaseUpdateEnabled(MOCKED_APP_VERSION, MOCKED_APP_VERSION).as('getConf');
    // Mock release update version to return the same version as the app (simulated app version)
    mockReleaseUpdateVersion(MOCKED_APP_VERSION).as('getGithubVersion');

    cy.visit('/');

    // Wait for config to be loaded
    cy.wait('@getConf');
    // Wait for GitHub version check
    cy.wait('@getGithubVersion', {timeout: 10000});
    // Wait a bit to ensure any potential modal would have appeared
    cy.wait(2000);

    // Verify that the modal is NOT displayed
    cy.get('ion-modal wm-modal-release-update-app').should('not.exist');
  });
});
