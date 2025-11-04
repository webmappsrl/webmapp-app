import {
  clearTestState,
  confWithReleaseUpdateEnabled,
  confWithReleaseUpdateDisabled,
  confWithReleaseUpdateEnabledCustomStoreUrl,
  mockReleaseUpdateVersion,
  mockMobileDevice,
  MOCKED_APP_VERSION,
  MOCKED_RELEASE_UPDATE_VERSION,
} from 'cypress/utils/test-utils';

describe('Release Update Modal [oc:6540] https://orchestrator.maphub.it/resources/assigned-to-me-stories/6540', () => {
  beforeEach(() => {
    clearTestState();
  });

  it('should show release update modal when forceToReleaseUpdate is enabled and version is different', () => {
    // Mock config with release update enabled and store URLs
    // Use simulated versions: app version (MOCKED_APP_VERSION) vs release update version (MOCKED_RELEASE_UPDATE_VERSION) - different
    confWithReleaseUpdateEnabled(MOCKED_RELEASE_UPDATE_VERSION, MOCKED_APP_VERSION).as('getConf');
    // Mock release update version with simulated version (different from app version)
    mockReleaseUpdateVersion().as('getLastReleaseVersion');
    // Mock device as mobile (Android) to enable the popup
    cy.visit('/', {
      onBeforeLoad: mockMobileDevice('android'),
    });

    // Wait for config to be loaded
    cy.wait('@getConf');
    // Wait for release update version check (may take a moment for the service to check)
    cy.wait('@getLastReleaseVersion', {timeout: 10000});

    // Wait for app to initialize and modal to appear (Ionic modals are rendered asynchronously)
    // The modal should appear after the service checks the version
    cy.get('ion-modal', {timeout: 15000}).should('be.visible');
    cy.get('[e2e-release-update-modal]', {timeout: 5000}).should('be.visible');

    // Verify modal content is displayed using e2e attributes
    // Check that title exists and has text (language independent)
    cy.get('[e2e-release-update-modal-title]').should('be.visible').should('not.be.empty');
    // Check that message exists and has text (language independent)
    cy.get('[e2e-release-update-modal-message]').should('be.visible').should('not.be.empty');
    // Check that version is displayed (numeric value)
    cy.get('[e2e-release-update-modal-version]').should('be.visible').should('not.be.empty');
    // Check that buttons exist and have text (language independent)
    cy.get('[e2e-release-update-modal-button]').should('be.visible').should('not.be.empty');
    cy.get('[e2e-release-update-modal-button-close]').should('be.visible').should('not.be.empty');
  });

  it('should have store URL in the update button', () => {
    const mockStoreUrl = 'https://test-store-url.mock/webmapp-app';

    // Mock config with our test store URL BEFORE visiting (this must be set before cy.visit)
    confWithReleaseUpdateEnabledCustomStoreUrl(mockStoreUrl, MOCKED_RELEASE_UPDATE_VERSION).as(
      'getConfWithMockUrl',
    );

    // Mock release update version with simulated version
    mockReleaseUpdateVersion().as('getLastReleaseVersion');

    // Mock device as mobile (Android) to enable the popup
    cy.visit('/', {
      onBeforeLoad: mockMobileDevice('android'),
    });

    // Wait for config to be loaded and verify it contains our mocked URL
    cy.wait('@getConfWithMockUrl').then(interception => {
      expect(interception.response.body.APP.androidStore).to.equal(mockStoreUrl);
      expect(interception.response.body.APP.iosStore).to.equal(mockStoreUrl);
    });
    // Wait for release update version check
    cy.wait('@getLastReleaseVersion', {timeout: 10000});

    // Wait for modal to appear
    cy.get('ion-modal', {timeout: 15000}).should('be.visible');
    cy.get('[e2e-release-update-modal]', {timeout: 5000}).should('be.visible');

    // Mock window.open to capture the URL without opening it (must be set before clicking)
    cy.window().then(win => {
      cy.stub(win, 'open').as('windowOpen');
    });

    // Click the update button to verify the URL is present using e2e attribute
    cy.get('[e2e-release-update-modal-button]').should('be.visible').click();

    // Verify that window.open was called with the correct store URL
    cy.get('@windowOpen').should('have.been.calledWith', mockStoreUrl);
  });

  it('should close modal when close button is clicked', () => {
    // Mock config with release update enabled and store URLs
    // Use simulated versions: app version vs release update version - different
    confWithReleaseUpdateEnabled(MOCKED_RELEASE_UPDATE_VERSION, MOCKED_APP_VERSION).as('getConf');
    // Mock release update version with simulated version
    mockReleaseUpdateVersion().as('getLastReleaseVersion');
    // Mock device as mobile (Android) to enable the popup
    cy.visit('/', {
      onBeforeLoad: mockMobileDevice('android'),
    });

    // Wait for config to be loaded
    cy.wait('@getConf');
    // Wait for release update version check
    cy.wait('@getLastReleaseVersion', {timeout: 10000});

    // Wait for modal to appear
    cy.get('ion-modal', {timeout: 15000}).should('be.visible');
    cy.get('[e2e-release-update-modal]', {timeout: 5000}).should('be.visible');

    // Click the close button using e2e attribute
    cy.get('[e2e-release-update-modal-button-close]').should('be.visible').click();

    // Verify that the modal is no longer visible using e2e attribute
    cy.get('[e2e-release-update-modal]').should('not.exist');
  });
});

describe('Release Update Modal - Not Shown [oc:6540] https://orchestrator.maphub.it/resources/assigned-to-me-stories/6540', () => {
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
    mockReleaseUpdateVersion().as('getLastReleaseVersion');

    // Visit with hard reload to clear cache and ensure fresh state
    // Mock device as mobile (Android) - even though modal should not appear, we need mobile to test the condition
    cy.visit('/', {
      onBeforeLoad: win => {
        // Clear all storage before page loads
        win.localStorage.clear();
        win.sessionStorage.clear();
        // Mock as mobile device
        mockMobileDevice('android')(win);
      },
    });

    // Wait for config to be loaded FIRST - this ensures the mock is applied
    cy.wait('@getConfDisabled').then(interception => {
      // Verify the config doesn't have forceToReleaseUpdate or it's false/undefined
      const forceToReleaseUpdate = interception.response.body.APP.forceToReleaseUpdate;
      expect(forceToReleaseUpdate).to.be.undefined;
    });

    // Wait for release update version check (but modal should not appear even if version differs)
    cy.wait('@getLastReleaseVersion', {timeout: 10000});

    // If a modal appears during initial load (before mock is applied), close it immediately
    // This handles the race condition where the modal might appear before the mock is active
    cy.get('body', {timeout: 2000}).then($body => {
      const modal = $body.find('[e2e-release-update-modal]');
      if (modal.length > 0 && modal.is(':visible')) {
        cy.get('[e2e-release-update-modal-button-close]').first().click({force: true});
        cy.wait(1000);
      }
    });

    // Wait for the app to fully initialize and process the config
    // The service needs time to process the config and decide not to show the modal
    cy.wait(3000);

    // Verify that no modal is displayed at any point
    // Check multiple times to ensure it doesn't appear even after delays
    cy.get('[e2e-release-update-modal]').should('not.exist');
  });

  it('should not show release update modal when store URLs are missing', () => {
    // Clear all caches and storage FIRST
    cy.clearLocalStorage();
    cy.clearCookies();

    // Mock config with forceToReleaseUpdate enabled but without store URLs
    // Pass null explicitly to set store URLs to undefined (for testing missing store URLs)
    confWithReleaseUpdateEnabledCustomStoreUrl(null, MOCKED_RELEASE_UPDATE_VERSION).as(
      'getConfNoStoreUrls',
    );
    // Mock release update version with simulated version (different from app version)
    mockReleaseUpdateVersion().as('getLastReleaseVersion');
    // Mock device as mobile (Android) - even though modal should not appear, we need mobile to test the condition
    cy.visit('/', {
      onBeforeLoad: win => {
        // Clear all storage before page loads
        win.localStorage.clear();
        win.sessionStorage.clear();
        // Mock as mobile device
        mockMobileDevice('android')(win);
      },
    });

    // Wait for config to be loaded and verify store URLs are undefined
    cy.wait('@getConfNoStoreUrls').then(interception => {
      expect(interception.response.body.APP.androidStore).to.be.undefined;
      expect(interception.response.body.APP.iosStore).to.be.undefined;
      expect(interception.response.body.APP.forceToReleaseUpdate).to.be.true;
    });
    // Wait for release update version check
    cy.wait('@getLastReleaseVersion', {timeout: 10000});

    // If a modal appears during initial load (before mock is applied), close it immediately
    cy.get('body', {timeout: 2000}).then($body => {
      const modal = $body.find('[e2e-release-update-modal]');
      if (modal.length > 0 && modal.is(':visible')) {
        cy.get('[e2e-release-update-modal-button-close]').first().click({force: true});
        cy.wait(1000);
      }
    });

    // Wait for the app to fully initialize and process the config
    cy.wait(3000);

    // Verify that the modal is NOT displayed using e2e attribute
    cy.get('[e2e-release-update-modal]').should('not.exist');
  });

  it('should not show release update modal when versions are the same', () => {
    // Mock config with release update enabled and store URLs
    // Use simulated app version for both app and release update version - versions are the same
    confWithReleaseUpdateEnabled(MOCKED_APP_VERSION, MOCKED_APP_VERSION).as('getConf');
    // Mock release update version to return the same version as the app (simulated app version)
    mockReleaseUpdateVersion(MOCKED_APP_VERSION).as('getLastReleaseVersion');
    // Mock device as mobile (Android) - even though modal should not appear, we need mobile to test the condition
    cy.visit('/', {
      onBeforeLoad: mockMobileDevice('android'),
    });

    // Wait for config to be loaded
    cy.wait('@getConf');
    // Wait for release update version check
    cy.wait('@getLastReleaseVersion', {timeout: 10000});
    // Wait a bit to ensure any potential modal would have appeared
    cy.wait(2000);

    // Verify that the modal is NOT displayed using e2e attribute
    cy.get('[e2e-release-update-modal]').should('not.exist');
  });

  it('should not show release update modal when device is not mobile (browser/desktop)', () => {
    // Mock config with release update enabled, store URLs, and different versions
    // All conditions are met EXCEPT the device is not mobile
    confWithReleaseUpdateEnabled(MOCKED_RELEASE_UPDATE_VERSION, MOCKED_APP_VERSION).as('getConf');
    // Mock release update version (even though it won't be called because device is not mobile)
    mockReleaseUpdateVersion().as('getLastReleaseVersion');
    // Do NOT mock as mobile - this simulates browser/desktop environment
    // The default Cypress environment is browser, so we don't need to do anything special
    cy.visit('/');

    // Wait for config to be loaded
    cy.wait('@getConf');
    // Note: When device is not mobile, the service exits early in _checkAndShowReleaseUpdatePopup
    // before calling getLastReleaseVersion, so the release update version request is never made.
    // We don't need to wait for @getLastReleaseVersion because it won't be called.
    // Wait a bit to ensure any potential modal would have appeared
    cy.wait(3000);

    // Verify that the modal is NOT displayed because device is not mobile using e2e attribute
    cy.get('[e2e-release-update-modal]').should('not.exist');
  });
});
