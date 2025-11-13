// TODO: Fix the release update modal tests - cannot mock isAppMobile to true in DeviceService
// because it depends on Ionic Platform service injected in Angular, not accessible via window.Ionic.Platform


// import {
//   clearTestState,
//   confWithReleaseUpdateEnabled,
//   confWithReleaseUpdateDisabled,
//   confWithReleaseUpdateEnabledCustomStoreUrl,
//   mockReleaseUpdateVersion,
//   mockMobileDevice,
//   MOCKED_APP_VERSION,
//   MOCKED_RELEASE_UPDATE_VERSION,
// } from 'cypress/utils/test-utils';


// describe.skip('Release Update Modal [oc:6540] https://orchestrator.maphub.it/resources/assigned-to-me-stories/6540', () => {
//   beforeEach(() => {
//     clearTestState();
//   });

//   it('should show release update modal when forceToReleaseUpdate is enabled and version is different', () => {
//     // Mock config with release update enabled and store URLs
//     // Use simulated versions: app version (MOCKED_APP_VERSION) vs release update version (MOCKED_RELEASE_UPDATE_VERSION) - different
//     confWithReleaseUpdateEnabled(MOCKED_RELEASE_UPDATE_VERSION, MOCKED_APP_VERSION).as('getConf');
//     // Mock release update version with simulated version (different from app version)
//     mockReleaseUpdateVersion().as('getLastReleaseVersion');
//     // Mock device as mobile (Android) to enable the popup
//     cy.visit('/', {
//       onBeforeLoad: mockMobileDevice('android'),
//     });

//     // Wait for config to be loaded
//     cy.wait('@getConf');
//     // Wait for release update version check (may take a moment for the service to check)
//     cy.wait('@getLastReleaseVersion', {timeout: 10000});

//     // Wait for app to initialize and modal to appear (Ionic modals are rendered asynchronously)
//     // The modal should appear after the service checks the version
//     cy.get('ion-modal', {timeout: 15000}).should('be.visible');
//     cy.get('[e2e-release-update-modal]', {timeout: 5000}).should('be.visible');

//     // Verify modal content is displayed using e2e attributes
//     // Check that title exists and has text (language independent)
//     cy.get('[e2e-release-update-modal-title]').should('be.visible').should('not.be.empty');
//     // Check that message exists and has text (language independent)
//     cy.get('[e2e-release-update-modal-message]').should('be.visible').should('not.be.empty');
//     // Check that version is displayed (numeric value)
//     cy.get('[e2e-release-update-modal-version]').should('be.visible').should('not.be.empty');
//     // Check that buttons exist and have text (language independent)
//     cy.get('[e2e-release-update-modal-button]').should('be.visible').should('not.be.empty');
//     cy.get('[e2e-release-update-modal-button-close]').should('be.visible').should('not.be.empty');
//   });

//   it('should have store URL in the update button', () => {
//     const mockStoreUrl = 'https://test-store-url.mock/webmapp-app';

//     // Mock config with our test store URL BEFORE visiting (this must be set before cy.visit)
//     confWithReleaseUpdateEnabledCustomStoreUrl(mockStoreUrl, MOCKED_RELEASE_UPDATE_VERSION).as(
//       'getConfWithMockUrl',
//     );

//     // Mock release update version with simulated version
//     mockReleaseUpdateVersion().as('getLastReleaseVersion');

//     // Mock device as mobile (Android) to enable the popup
//     cy.visit('/', {
//       onBeforeLoad: mockMobileDevice('android'),
//     });

//     // Wait for config to be loaded and verify it contains our mocked URL
//     cy.wait('@getConfWithMockUrl').then(interception => {
//       expect(interception.response.body.APP.androidStore).to.equal(mockStoreUrl);
//       expect(interception.response.body.APP.iosStore).to.equal(mockStoreUrl);
//     });
//     // Wait for release update version check
//     cy.wait('@getLastReleaseVersion', {timeout: 10000});

//     // Wait for modal to appear
//     cy.get('ion-modal', {timeout: 15000}).should('be.visible');
//     cy.get('[e2e-release-update-modal]', {timeout: 5000}).should('be.visible');

//     // Mock window.open to capture the URL without opening it (must be set before clicking)
//     cy.window().then(win => {
//       cy.stub(win, 'open').as('windowOpen');
//     });

//     // Click the update button to verify the URL is present using e2e attribute
//     cy.get('[e2e-release-update-modal-button]').should('be.visible').click();

//     // Verify that window.open was called with the correct store URL
//     cy.get('@windowOpen').should('have.been.calledWith', mockStoreUrl);
//   });

//   it('should close modal when close button is clicked', () => {
//     // Mock config with release update enabled and store URLs
//     // Use simulated versions: app version vs release update version - different
//     confWithReleaseUpdateEnabled(MOCKED_RELEASE_UPDATE_VERSION, MOCKED_APP_VERSION).as('getConf');
//     // Mock release update version with simulated version
//     mockReleaseUpdateVersion().as('getLastReleaseVersion');
//     // Mock device as mobile (Android) to enable the popup
//     cy.visit('/', {
//       onBeforeLoad: mockMobileDevice('android'),
//     });

//     // Wait for config to be loaded
//     cy.wait('@getConf');
//     // Wait for release update version check
//     cy.wait('@getLastReleaseVersion', {timeout: 10000});

//     // Wait for modal to appear
//     cy.get('ion-modal', {timeout: 15000}).should('be.visible');
//     cy.get('[e2e-release-update-modal]', {timeout: 5000}).should('be.visible');

//     // Click the close button using e2e attribute
//     cy.get('[e2e-release-update-modal-button-close]').should('be.visible').click();

//     // Verify that the modal is no longer visible using e2e attribute
//     cy.get('[e2e-release-update-modal]').should('not.exist');
//   });
// });

// describe.skip('Release Update Modal - Not Shown [oc:6540] https://orchestrator.maphub.it/resources/assigned-to-me-stories/6540', () => {
//   beforeEach(() => {
//     clearTestState();
//   });

//   it('should not show release update modal when forceToReleaseUpdate is false', () => {
//     cy.clearLocalStorage();
//     cy.clearCookies();

//     // Mock config with forceToReleaseUpdate disabled
//     confWithReleaseUpdateDisabled().as('getConfDisabled');

//     // Mock device as mobile (Android) - required to test the condition
//     cy.visit('/', {
//       onBeforeLoad: win => {
//         win.localStorage.clear();
//         win.sessionStorage.clear();
//         mockMobileDevice('android')(win);
//       },
//     });

//     // Wait for config to be loaded and verify forceToReleaseUpdate is disabled
//     cy.wait('@getConfDisabled').then(interception => {
//       const forceToReleaseUpdate = interception.response.body.APP.forceToReleaseUpdate;
//       expect(forceToReleaseUpdate).to.be.undefined;
//     });

//     // Wait for app to process the new config
//     cy.wait(2000);

//     // If a modal appeared briefly (from cached config), close it
//     // This handles the race condition where a modal might appear before the new config is processed
//     cy.get('body').then($body => {
//       const modal = $body.find('[e2e-release-update-modal]');
//       if (modal.length > 0 && modal.is(':visible')) {
//         cy.get('[e2e-release-update-modal-button-close]').first().click({force: true});
//         cy.wait(1000);
//       }
//     });

//     // Verify that the modal is NOT displayed
//     cy.get('[e2e-release-update-modal]').should('not.exist');
//   });

//   it('should not show release update modal when versions are the same', () => {
//     // Mock config with release update enabled and store URLs
//     confWithReleaseUpdateEnabled().as('getConf');
//     // Mock both versions to be the same (0.0.1):
//     // - App version: 0.0.1 (from package.json, which equals MOCKED_APP_VERSION)
//     // - GitHub version: mocked to return MOCKED_APP_VERSION (0.0.1)
//     // When versions are the same, checkIfUpdateNeeded returns false and modal should not appear
//     mockReleaseUpdateVersion(MOCKED_APP_VERSION);
//     // Mock device as mobile (Android) - required for the check to run
//     cy.visit('/', {
//       onBeforeLoad: mockMobileDevice('android'),
//     });

//     // Wait for config to be loaded
//     cy.wait('@getConf');
//     // Wait for release update version check
//     cy.wait(3000);

//     // Verify that the modal is NOT displayed using e2e attribute
//     cy.get('[e2e-release-update-modal]').should('not.exist');
//   });

//   it('should not show release update modal when device is not mobile (browser/desktop)', () => {
//     // Mock config with release update enabled, store URLs, and different versions
//     // All conditions are met EXCEPT the device is not mobile
//     confWithReleaseUpdateEnabled(MOCKED_RELEASE_UPDATE_VERSION, MOCKED_APP_VERSION).as('getConf');
//     // Do NOT mock as mobile - this simulates browser/desktop environment
//     // The default Cypress environment is browser, so we don't need to do anything special
//     cy.visit('/');

//     // Wait for config to be loaded
//     cy.wait('@getConf');
//     // Wait for app to initialize
//     // Since device is not mobile, the effect won't trigger and modal won't appear
//     cy.wait(3000);

//     // Verify that the modal is NOT displayed
//     cy.get('[e2e-release-update-modal]').should('not.exist');
//   });
// });
