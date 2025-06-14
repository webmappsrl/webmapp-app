# Changelog

## [3.0.9](https://github.com/webmappsrl/webmapp-app/compare/v3.0.8...v3.0.9) (2025-06-13)


### Bug Fixes

* check all complete by filter values ([2dfed99](https://github.com/webmappsrl/webmapp-app/commit/2dfed9993369bc45bf27ae752643c2791a3d0609))
* correct hitmap dispatch ([61806ae](https://github.com/webmappsrl/webmapp-app/commit/61806ae163a5fc498883c4f187442a34ad4fda3f))
* correct hitmap sho ([36b3e25](https://github.com/webmappsrl/webmapp-app/commit/36b3e25ac7fec49647f74ac2efb36c717eaa0e25))
* test anchor button by attribute ([cd630b8](https://github.com/webmappsrl/webmapp-app/commit/cd630b88ac6e77b051dcf181ccf9463c7ec84216))


### Miscellaneous

* **ci:** ✨ add release workflow for minor versions ([3f86c15](https://github.com/webmappsrl/webmapp-app/commit/3f86c15f17c3d85a528fe606e08e043a2bc31275))
<!-- COMMIT_DESC -->
    
    - Introduce a new GitHub Actions workflow to automate releases for minor version updates.
    - The workflow triggers on pushes to branches that match the pattern 'v[0-9]+.[0-9]+'.
    - Permissions are set to allow writing to contents and pull requests.
    - Utilize the Release Please Action to manage the release process, specifying `node` as the release type and `webmapp-app` as the package name.
    - Define changelog sections for features, bug fixes, and miscellaneous updates.
    - Customize the pull request title and header for clarity and automation acknowledgment.
* update test-e2e ([7e0a230](https://github.com/webmappsrl/webmapp-app/commit/7e0a23081c98cfa5717eef6d0abdf66b8d963eca))
* update tests e2e ([8a9819b](https://github.com/webmappsrl/webmapp-app/commit/8a9819b31d1e29a9ab12e3f283ecf03da60bbe85))
<!-- COMMIT_DESC -->
    
    Add test for tracks edges
## [3.0.8](https://github.com/webmappsrl/webmapp-app/compare/v3.0.7...v3.0.8) (2025-05-16)


### Bug Fixes

* Management of Map details status, added test e2e <a href="https://orchestrator.maphub.it/resources/customer-stories/5500" target="_blank" rel="noopener noreferrer">OC[5500]</a> ([#127](https://github.com/webmappsrl/webmapp-app/issues/127)) ([b2af206](https://github.com/webmappsrl/webmapp-app/commit/b2af206af304a2edff04a1f20714c33bcb87391c))
<!-- COMMIT_DESC -->
    
    * fix: Management of Map details status, added test e2e
    
    * ...
* test e2e ([0e98a16](https://github.com/webmappsrl/webmapp-app/commit/0e98a167976339e8d4dc40304c8b3363e48c674d))


### Miscellaneous

* clean code ([2e67a27](https://github.com/webmappsrl/webmapp-app/commit/2e67a274518a76698802f4c4dba0ab3afb9979ca))
* remove useless excerpt ([425331a](https://github.com/webmappsrl/webmapp-app/commit/425331aa73d58f92fd96c55990206dbdb013269a))

## [3.0.7](https://github.com/webmappsrl/webmapp-app/compare/v3.0.6...v3.0.7) (2025-05-09)


### Bug Fixes

* Aggiunto componente wm-updated-at per visualizzare la data di aggiornamento nei titoli delle proprietà UGC e delle tracce. <a href="https://orchestrator.maphub.it/resources/customer-stories/5331" target="_blank" rel="noopener noreferrer">OC[5331]</a> ([b035933](https://github.com/webmappsrl/webmapp-app/commit/b035933758d8b9ef2886867c97c0369c7671a027))
* change TranslationService with LangService ([abca6d1](https://github.com/webmappsrl/webmapp-app/commit/abca6d11555c50ab73cf48fe7d0af3f8aae66065))
* translate ([367e507](https://github.com/webmappsrl/webmapp-app/commit/367e5078115a82fe6b7813910fbc3170d912a242))

### Miscellaneous

* add test for map control routes <a href="https://orchestrator.maphub.it/resources/customer-stories/5468" target="_blank" rel="noopener noreferrer">OC[5468]</a> ([f2db44f](https://github.com/webmappsrl/webmapp-app/commit/f2db44f7c61beea98792f8eb0d46c6c7f8af9924))
* add translation for profile.pages.ts ([#126](https://github.com/webmappsrl/webmapp-app/issues/126)) ([abca6d1](https://github.com/webmappsrl/webmapp-app/commit/abca6d11555c50ab73cf48fe7d0af3f8aae66065))
* aggiungi supporto per la registrazione dei video nei test di Cypress ([2083372](https://github.com/webmappsrl/webmapp-app/commit/20833723aa00bd783116d020df02a2aee19ef8dc))
* modifica il workflow di test per caricare i video di Cypress in caso di errore ([bd54968](https://github.com/webmappsrl/webmapp-app/commit/bd54968a1807bcb4e771dbd69f78d991f355608b))
* update git ignore ([78ea077](https://github.com/webmappsrl/webmapp-app/commit/78ea077d0b70ba9c5d6ae9c4df193aa0e6ac1f04))
## [3.0.6](https://github.com/webmappsrl/webmapp-app/compare/v3.0.5...v3.0.6) (2025-04-24)


### Bug Fixes

* Updated submodule core/src/app/shared/wm-core ([8105af2](https://github.com/webmappsrl/webmapp-app/commit/8105af2158c43ff4660b60a94763dc6a11d1eef4))
## [3.0.5](https://github.com/webmappsrl/webmapp-app/compare/v3.0.4...v3.0.5) (2025-04-24)


### Miscellaneous

* handling generate app with shard ([918af1b](https://github.com/webmappsrl/webmapp-app/commit/918af1b659a770bbae2d8ab8fada926b56f092aa))
* Update appId in environment.ts ([158720b](https://github.com/webmappsrl/webmapp-app/commit/158720b2a2e438cd3269eb872fc2a89e506f5970))
* update environment ([5a78a57](https://github.com/webmappsrl/webmapp-app/commit/5a78a5747524a1f3a1350dea5acbf13ae2d60881))
* Update map-details.component.ts and map.page.ts ([2e04d55](https://github.com/webmappsrl/webmapp-app/commit/2e04d55e72c0cf592f9e9eb892d951c9d5423b34))
* update test-utils and map-details component ([8c51817](https://github.com/webmappsrl/webmapp-app/commit/8c518175db308bfc57a6048ce1ad3d1e3f42e6fd))
<!-- COMMIT_DESC -->
    
    - Updated the import statement in test-utils.ts to include openLayer and openTrack functions.
    - Refactored the code in map-details.component.ts to use the updated openLayer and openTrack functions from test-utils.ts.
    - Changed the click event handler in map-details.component.html to call the back() function instead of none().
    - Added a new function back() in map-details.component.ts to handle navigating back from the details page.
    - Modified the logic in MapPage class in map.page.ts to dispatch setMapDetailsStatus with 'background' status when there is no popup.
* Update translations in app component and app module oc: 5343 ([#118](https://github.com/webmappsrl/webmapp-app/issues/118)) ([69cd697](https://github.com/webmappsrl/webmapp-app/commit/69cd697f399ae996632cf2eb1952f6b723768a59))
* updates to use EnviromentService and update gulpfile <a href="https://orchestrator.maphub.it/resources/customer-stories/5108" target="_blank" rel="noopener noreferrer">OC[5108]</a> ([#107](https://github.com/webmappsrl/webmapp-app/issues/107)) ([643ad41](https://github.com/webmappsrl/webmapp-app/commit/643ad414461dba0c25bb81fdabf23fdca49d6301))
<!-- COMMIT_DESC -->
    
    * chore: updates to use EnviromentService
    
    - Added import for EnvironmentService in communication.service.ts, geohub.service.ts, and share.service.ts
    - Injected EnvironmentService in the constructors of CommunicationService, GeohubService, and ShareService
    - Updated API URLs to use the origin property from EnvironmentService instead of hardcoding them
    
    chore: Update app.module.ts
    
    - Removed unused imports and providers
    - Added initialization of EnvironmentService in AppModule constructor
    
    Updated submodule core/src/app/shared/wm-core
    
    chore: Update gulpfile.js
    
    This commit updates the gulpfile.js file with the following changes:
    - Added a new option to set the shard name to work with
    - Modified the update() function to include the shard name parameter
    - Updated the build() and buildAndroid() functions to include the shard name parameter
    - Updated the buildIos() function to include the shard name parameter
    
    chore: Update appId value in environment.ts file
    
    The appId value in the environment.ts file was updated from 75 to 3. This change ensures that the correct application ID is used for the geohub shard.
    
    chore: Update share service to use environment variable
    
    The share service has been updated to use the `shareLink` property from the `EnvironmentService` instead of retrieving the host dynamically. This change ensures that the correct base link is used for sharing functionality.
    
    * chore: Update shard URL handling in gulpfile.js
    
    - Refactored the code to handle shard URLs more efficiently
    - Added error handling for missing shards in the environment configuration file
    
    * Updated submodule core/src/app/shared/wm-core
    
    * chore: Update e2e tests
    
    - Added `confURL` and `meUrl` imports to relevant files
    - Updated the `apiLogin` URL in the `e2eLogin` function
    
    ---------
    
    Co-authored-by: bongiu <peppedeka@gmail.com>
## [3.0.4](https://github.com/webmappsrl/webmapp-app/compare/v3.0.3...v3.0.4) (2025-03-12)


### Miscellaneous

* Update subproject commit reference ([de21d37](https://github.com/webmappsrl/webmapp-app/commit/de21d373cecd849e8c994b30f668ae8be57aaf9c))
* Updated submodule core/src/app/shared/map-core ([a366a28](https://github.com/webmappsrl/webmapp-app/commit/a366a289da1e90b0f5179385dbe8080a9195a6ce))

## [3.0.3](https://github.com/webmappsrl/webmapp-app/compare/v3.0.2...v3.0.3) (2025-03-12)


### Bug Fixes

* disable form when add photos <a href="https://orchestrator.maphub.it/resources/customer-stories/4104" target="_blank" rel="noopener noreferrer">OC[4104]</a> ([239af5f](https://github.com/webmappsrl/webmapp-app/commit/239af5f9b086ebe877993aaba02023d5f4ecc3ad))
<!-- COMMIT_DESC -->
    
    - Fixed a bug in the save button's disabled state in modal-save.component.html
    - Added private methods _addFormError and _removeFormError to handle form errors in modal-save.component.ts
    - Updated addPhotos method to handle photo loading and validation in both modal-save.component.ts and modal-waypoint-save.component.ts
## [3.0.2](https://github.com/webmappsrl/webmapp-app/compare/v3.0.1...v3.0.2) (2025-03-12)


### Miscellaneous

* Update map page HTML ([3bf9737](https://github.com/webmappsrl/webmapp-app/commit/3bf97379f96bb90f9da902745f7a066f76227385))
<!-- COMMIT_DESC -->
    
    - Added event listener for opening popups
    - Adjusted indentation and spacing for better readability
## [3.0.1](https://github.com/webmappsrl/webmapp-app/compare/v3.0.0...v3.0.1) (2025-03-12)


### Miscellaneous

* Add PR test workflow ([#100](https://github.com/webmappsrl/webmapp-app/issues/100)) ([996bb4a](https://github.com/webmappsrl/webmapp-app/commit/996bb4aa6686b2b15f1124b67d708c097a40d133))
<!-- COMMIT_DESC -->
    
    - Added a new workflow file `pr_test.yml` for testing pull requests
    - The workflow runs on the `develop` and `oc_5019` branches
    - The steps include checking out the repository, setting up Node.js, installing dependencies, installing Ionic CLI, creating a Cypress environment file, updating geohubId in environment.ts, running Cypress tests using Chrome browser with specific configurations, and uploading Cypress screenshots on failure.
    
    chore: Update PR test workflow configuration
* add test for visualizing related poi in track detail ([5bde1da](https://github.com/webmappsrl/webmapp-app/commit/5bde1da88682ff04b3dc6fa41684ea515656789a))
* add translations <a href="https://orchestrator.maphub.it/resources/customer-stories/5066" target="_blank" rel="noopener noreferrer">OC[5066]</a> ([e6ee79e](https://github.com/webmappsrl/webmapp-app/commit/e6ee79ebc219878e25dbafcb89498a5ecf51c6b0))
<!-- COMMIT_DESC -->
    
    This commit adds the German Spanish Portuguese and Albanian translation for various components and pages in the application. It includes translations for activities, side menu, card track, map, search bar, slope chart, generic messages, modals, settings page, download list page, favourites page, home page, itinerary page, map page, photo detail page, photo list page, profile page and register page.
* **e2e:** add tests for My paths tabs ([b571bef](https://github.com/webmappsrl/webmapp-app/commit/b571befe7ef7123037b56132bc8ec06c1e9c3045))
* Update e2e tests ([5165002](https://github.com/webmappsrl/webmapp-app/commit/5165002c26c32a746943c1d93bdad5aec0f92360))
<!-- COMMIT_DESC -->
    
    - Increased the wait time for filter results from 250ms to 500ms in the distance-and-duration-filters.cy.ts file.
    - Increased the timeout for finding the download button from 10 seconds to 12.5 seconds in the download-ec-track.cy.ts file.
    - Modified the test-utils.ts file to ensure that the email input field has focus before clearing and typing.
    
    These changes improve reliability and stability in test execution.
* Update e2e tests ([3c6a870](https://github.com/webmappsrl/webmapp-app/commit/3c6a87098044fda9faa127d55b91fab573679667))
* Update PR test workflow configuration ([996bb4a](https://github.com/webmappsrl/webmapp-app/commit/996bb4aa6686b2b15f1124b67d708c097a40d133))
<!-- COMMIT_DESC -->
    
    - Added a new workflow file `pr_test.yml` for testing pull requests
    - The workflow runs on the `develop` and `oc_5019` branches
    - The steps include checking out the repository, setting up Node.js, installing dependencies, installing Ionic CLI, creating a Cypress environment file, updating geohubId in environment.ts, running Cypress tests using Chrome browser with specific configurations, and uploading Cypress screenshots on failure.
    
    chore: Update PR test workflow configuration
## [3.0.0](https://github.com/webmappsrl/webmapp-app/compare/v2.12.16...v3.0.0) (2025-02-28)


### ⚠ BREAKING CHANGES

* This update may introduce breaking changes in the codebase due to changes in the @capacitor/device library.

### Features

* add e2e test for orientation and location buttons <a href="https://orchestrator.maphub.it/resources/customer-stories/4989" target="_blank" rel="noopener noreferrer">OC[4989]</a> ([#94](https://github.com/webmappsrl/webmapp-app/issues/94)) ([fa100bb](https://github.com/webmappsrl/webmapp-app/commit/fa100bb1a533f29d7fff3e5f1b13668ba6440479))
<!-- COMMIT_DESC -->
    
    Added a new e2e test file to test the visualization of the orientation and location buttons. The test verifies that the buttons are displayed correctly on the map page.
* **map:** replace JSON display with custom component ([904c7af](https://github.com/webmappsrl/webmapp-app/commit/904c7af0702385f8b037ffde5fb15eba197bd259))
* **tabs:** update URL handling for home tab <a href="https://orchestrator.maphub.it/resources/customer-stories/4907" target="_blank" rel="noopener noreferrer">OC[4907]</a> ([bff6c43](https://github.com/webmappsrl/webmapp-app/commit/bff6c432845a7f33a16b750cf08849d71401eef1))
<!-- COMMIT_DESC -->
    
    This commit updates the URL handling logic for the home tab in the tabs page. Now, when the home tab is selected, the current query parameters are cleared and the URL is updated accordingly. This ensures that any previous tracking or point of interest information is removed from the URL.

### Bug Fixes

* Add dynamic title for UGC POI properties in map page ([#74](https://github.com/webmappsrl/webmapp-app/issues/74)) ([f6d70be](https://github.com/webmappsrl/webmapp-app/commit/f6d70be98eb34e8ba276e9d6bfc8eaaef8889c63))
<!-- COMMIT_DESC -->
    
    - Added an *ngIf condition to display the title based on the presence of currentUgcPoiProperties$.
    - The title now shows the name of the UGC POI properties using wmtrans translation.
    
    This commit enhances the map page by dynamically displaying a title for UGC POI properties when available.
* **ec:** add loadEcPois action to app.component.ts ([27cf0fe](https://github.com/webmappsrl/webmapp-app/commit/27cf0fe30d6b208be7590176012a93efecbd74b4))
* **tabs:** add functionality to go to home page ([6b69d46](https://github.com/webmappsrl/webmapp-app/commit/6b69d466a25bfd1af64abd0d1fcbbee2f31c1dc2))
<!-- COMMIT_DESC -->
    
    This commit adds the functionality to go to the home page when the current tab is 'home' and the user clicks on it again. It dispatches the action to navigate to the home page using the `goToHome()` method from `user-activity.action`.

### Miscellaneous

* Add custom Cypress commands and test utilities ([b78c697](https://github.com/webmappsrl/webmapp-app/commit/b78c697d4a7d72f4428d92a757c2ecdf1d2b9213))
<!-- COMMIT_DESC -->
    
    This commit adds a new file `commands.ts` in the `core/cypress/support` directory, which contains custom Cypress commands for login, drag, dismiss, and visit. It also adds a new file `e2e.ts` in the same directory, which imports the `commands.ts` file.
    
    Additionally, this commit introduces a new file `test-utils.ts` in the `core/cypress/utils` directory. This file includes functions for clearing test state, logging into the application, and navigating to different pages.
    
    These changes aim to improve code organization and provide reusable functionality for end-to-end testing.
* Add cypress.config.ts and update package-lock.json ([#87](https://github.com/webmappsrl/webmapp-app/issues/87)) ([19ac578](https://github.com/webmappsrl/webmapp-app/commit/19ac578881c9760526bba0fc6e4ca029e6fea5ae))
* Add display of UGC POI properties in map page ([50a188b](https://github.com/webmappsrl/webmapp-app/commit/50a188bd85147c4f081cc8186b2db16ed39aee45))
<!-- COMMIT_DESC -->
    
    - Added code to display UGC POI properties in the map page HTML template.
    - Updated the TypeScript file to select and subscribe to the current UGC POI properties from the store.
* add distance and duration filters test oc:4925 ([#90](https://github.com/webmappsrl/webmapp-app/issues/90)) ([20c8184](https://github.com/webmappsrl/webmapp-app/commit/20c818442ec9a361ba61f4b70689c49a0249fbab))
* add e2e test for downloading ec-track <a href="https://orchestrator.maphub.it/resources/customer-stories/4974" target="_blank" rel="noopener noreferrer">OC[4974]</a> ([#91](https://github.com/webmappsrl/webmapp-app/issues/91)) ([f6b4aa6](https://github.com/webmappsrl/webmapp-app/commit/f6b4aa61b37363fb734564ef1bad94aeab277206))
<!-- COMMIT_DESC -->
    
    * chore: add e2e test for downloading ec-track
    
    This commit adds a new e2e test file `download-ec-track.cy.ts` that tests the functionality of downloading an ec-track. The test verifies that the download button is visible, downloads the track, and checks if the downloaded track is displayed correctly in the downloads section.
    
    The test uses helper functions `getDownloadButton()` and `getGoToDownloadsButton()` to locate and interact with the relevant elements on the page.
    
    These changes aim to ensure that the download feature for ec-tracks is working as expected.
    
    * chore: Update download-ec-track.cy.ts
    
    - Replace hardcoded track name with dynamic data
    - Reduce timeout for 'Go to Downloads' button to improve test performance
* add e2e test for non-accessible track ([#85](https://github.com/webmappsrl/webmapp-app/issues/85)) ([75ef1be](https://github.com/webmappsrl/webmapp-app/commit/75ef1be58dea125681b8eced6f7788df0da0ce69))
* Add e2e tests for sharing track and poi <a href="https://orchestrator.maphub.it/resources/customer-stories/4927" target="_blank" rel="noopener noreferrer">OC[4927]</a> ([#86](https://github.com/webmappsrl/webmapp-app/issues/86)) ([9fbe96e](https://github.com/webmappsrl/webmapp-app/commit/9fbe96ef086e9f01e7ad3e62d2ba3cedcea94a59))
<!-- COMMIT_DESC -->
    
    * chore: Add e2e tests for sharing track and poi <a href="https://orchestrator.maphub.it/resources/customer-stories/4927" target="_blank" rel="noopener noreferrer">OC[4927]</a>
    
    This commit adds end-to-end tests for sharing a track and a point of interest (poi). The tests ensure that the share button is correctly displayed when selecting a track or poi, and that clicking on the share button opens the share window. The test utils file is also added, which contains helper functions for navigating to the home page, opening layers, pois, and tracks.
    
    * chore: Remove unnecessary wait in share-track-and-poi.cy.ts
    
    The code changes remove the unnecessary wait(1000) statements in the 'Should open share window when click on share button' test case. This improves the efficiency of the test by eliminating unnecessary delays.
    
    ---------
    
    Co-authored-by: peppedeka <peppedeka@gmail.com>
* add flow line quote feature oc:4955 ([#93](https://github.com/webmappsrl/webmapp-app/issues/93)) ([ae05a25](https://github.com/webmappsrl/webmapp-app/commit/ae05a259e4654ca0ddab35bc8dab8b9977a3f712))
* add import UGC test ([#96](https://github.com/webmappsrl/webmapp-app/issues/96)) ([013656d](https://github.com/webmappsrl/webmapp-app/commit/013656df93aefebfd6581b6360aeba49718a19a1))
<!-- COMMIT_DESC -->
    
    This commit adds a new test for importing user-generated content (UGC). The test includes steps to open the import UGC feature, select a file to import, visualize a preview map, and pre-populate the form with track title and description.
* add login offline e2e test ([#97](https://github.com/webmappsrl/webmapp-app/issues/97)) ([f6fc436](https://github.com/webmappsrl/webmapp-app/commit/f6fc436d4762061870ec5c9b2e37e78352148ec3))
* Add subproject commit 493779ecb1d24800a5ba0016a89d20ea5b9c82aa to wm-types ([dbcd331](https://github.com/webmappsrl/webmapp-app/commit/dbcd3317f7386613c4b92fa5b7feea9532cbe956))
* Add tests for favorites functionality oc:4990 ([#92](https://github.com/webmappsrl/webmapp-app/issues/92)) ([5541a52](https://github.com/webmappsrl/webmapp-app/commit/5541a527ecaf9edba0f1987015167cbc42920c8c))
* add tests for visualizing sync badge  <a href="https://orchestrator.maphub.it/resources/customer-stories/5003" target="_blank" rel="noopener noreferrer">OC[5003]</a> ([#95](https://github.com/webmappsrl/webmapp-app/issues/95)) ([e30f69b](https://github.com/webmappsrl/webmapp-app/commit/e30f69b40ca6dee72b4d059b2fc87ba3a7286af1))
<!-- COMMIT_DESC -->
    
    This commit adds new test cases to visualize the sync badge in the application. The tests cover scenarios where the track is synchronized and not synchronized, and verify that the correct icon is displayed based on the synchronization status.
* Add UGC synchronization oc:4835 ([2ebdb59](https://github.com/webmappsrl/webmapp-app/commit/2ebdb59953ee9f85006253af8d875a0beef03228))
* **favourites:** update URL handling in open method ([771ae2e](https://github.com/webmappsrl/webmapp-app/commit/771ae2e23c192bf7c642ddccde1ad99f0e015681))
<!-- COMMIT_DESC -->
    
    This commit updates the URL handling in the open method of the FavouritesPage class. Instead of using the `updateURL` method, it now uses the `changeURL` method with the 'map' parameter. This change improves the consistency and clarity of the code.
* **map:** start navigation on view enter ([81ec700](https://github.com/webmappsrl/webmapp-app/commit/81ec70095d3c49cc111903469aac79c40f56598d))
* **map:** start navigation on view enter ([4759c30](https://github.com/webmappsrl/webmapp-app/commit/4759c3079a47cb5bcfbbfa40b1266dedaaa6841d))
<!-- COMMIT_DESC -->
    
    This commit adds a call to the `_geolocationSvc.startNavigation()` method in the `ionViewWillEnter` lifecycle hook of the `MapPage` component. This ensures that navigation is started when the page is entered.
* offline refactor and info device ([f3543ba](https://github.com/webmappsrl/webmapp-app/commit/f3543baba527d3098eba5d3759009de891621173))
* **poi-properties:** add excerpt display to properties <a href="https://orchestrator.maphub.it/resources/customer-stories/4183" target="_blank" rel="noopener noreferrer">OC[4183]</a> ([#66](https://github.com/webmappsrl/webmapp-app/issues/66)) ([d5a9e47](https://github.com/webmappsrl/webmapp-app/commit/d5a9e47af5d59467a2eeffd6d40881c0306da72a))
<!-- COMMIT_DESC -->
    
    Include an excerpt component in the POI properties view. This enhancement allows for better presentation of property information by displaying excerpts when available.
* Refactor setCurrentTab method in TabsPage ([4923386](https://github.com/webmappsrl/webmapp-app/commit/49233867842a1a8811f57c5ad9088a34ef3e75e8))
* Refactor waypoint.page.ts ([70290f6](https://github.com/webmappsrl/webmapp-app/commit/70290f62e98d8563c68bdca789e206b3d324b651))
<!-- COMMIT_DESC -->
    
    - Remove unnecessary condition in ngOnInit()
    - Always start navigation in ngOnInit()
* Refactor waypoint.page.ts ([34153c4](https://github.com/webmappsrl/webmapp-app/commit/34153c462b8c1c6a7cafbbfc05f864b860352fd2))
* Remove form component and related files ([d20dc40](https://github.com/webmappsrl/webmapp-app/commit/d20dc4073757094655d7ca264caf003f2e9b1f6b))
<!-- COMMIT_DESC -->
    
    This commit removes the form component and its associated HTML, SCSS, and TypeScript files. The form component was no longer needed in the project.
    
    Updated submodule core/src/app/shared/wm-core
* Remove image gallery component and related files ([4802fef](https://github.com/webmappsrl/webmapp-app/commit/4802fef0a9a3721d0af5afc957a636c91a9e3663))
* Remove LangService provider from multiple components <a href="https://orchestrator.maphub.it/resources/customer-stories/4781" target="_blank" rel="noopener noreferrer">OC[4781]</a> ([2fced83](https://github.com/webmappsrl/webmapp-app/commit/2fced8332f7d09098decedb89097978e67a93997))
<!-- COMMIT_DESC -->
    
    - Removed the LangService provider from app.component.ts, modal-store-success.component.ts, download.component.ts, and register.page.ts.
* Remove modalphotos module and related components ([5123443](https://github.com/webmappsrl/webmapp-app/commit/512344316e52d93bda1a99038326a5ccb694c3e0))
* Remove search-bar component and related files ([0216cd8](https://github.com/webmappsrl/webmapp-app/commit/0216cd880c8aa89e7ae4a121cf7d831468fa4306))
<!-- COMMIT_DESC -->
    
    This commit removes the search-bar component along with its HTML, SCSS, spec, and TypeScript files. The search-bar component was no longer needed in the codebase.
* Remove search-list component ([#73](https://github.com/webmappsrl/webmapp-app/issues/73)) ([4cb91d6](https://github.com/webmappsrl/webmapp-app/commit/4cb91d632578c7d84bfe714376ff84fc5742b9fe))
* Remove tracklist, trackdetail, waypointlist, waypointdetail pages and related files <a href="https://orchestrator.maphub.it/resources/customer-stories/4611" target="_blank" rel="noopener noreferrer">OC[4611]</a> ([#72](https://github.com/webmappsrl/webmapp-app/issues/72)) ([6652001](https://github.com/webmappsrl/webmapp-app/commit/6652001c945677a9575c47fb6ccf8eccc603fb7c))
<!-- COMMIT_DESC -->
    
    * chore: Remove tracklist, trackdetail, waypointlist, waypointdetail pages and related files
    
    This commit removes the trackdetail page, its routing module, module file, HTML template, SCSS file, and TypeScript file. The corresponding routes in the app-routing.module.ts file have also been removed.
    
    chore: Update modal-success.component.ts
    
    - Added import statement for UrlHandlerService from '@wm-core/services/url-handler.service'
    - Injected UrlHandlerService in the constructor
    - Updated openTrack() method to use UrlHandlerService instead of NavController for navigation
    - Updated openWaypoint() method to use UrlHandlerService instead of NavController for navigation
    
    * Updated submodule core/src/app/shared/wm-core
    
    * chore: Update modal-save.component.ts
    
    - Changed the return type of the openModalSuccess() method from Promise<void> to Promise<any>.
    - Added a return statement for modaSuccess.onDidDismiss() in the openModalSuccess() method.
    - Modified the subscribe callback function in the remove() method to await dismiss before dispatching syncUgcTracks().
* Remove unnecessary code in MapDetailsComponent and MapPage ([00794ca](https://github.com/webmappsrl/webmapp-app/commit/00794cad1dd6c5accc06082a6722545d13eaf2d1))
* Remove unnecessary trackElevationChartHover event listener ([#78](https://github.com/webmappsrl/webmapp-app/issues/78)) ([98003b5](https://github.com/webmappsrl/webmapp-app/commit/98003b57ff87d66b8a4facb5dd5d0ceefdd1d941))
<!-- COMMIT_DESC -->
    
    The code changes in this commit involve removing the trackElevationChartHover event listener from two templates in the map.page.html file. This event listener is no longer needed and has been causing unnecessary overhead.
* Remove unused code and files related to saving photos oc: 4892 ([4c99a2d](https://github.com/webmappsrl/webmapp-app/commit/4c99a2d8453a63c932f20940d062da48583d7f7c))
* Remove unused code and start geolocation service ([d84f7ba](https://github.com/webmappsrl/webmapp-app/commit/d84f7ba6f5ea9a53dc7f3dbf254a8b695f25a98f))
<!-- COMMIT_DESC -->
    
    This commit removes unused code related to geolocation from the app component and home page. It also starts the geolocation service in the map page.
* Remove unused imports in modal-save.component.ts ([bf79bae](https://github.com/webmappsrl/webmapp-app/commit/bf79bae87ab870db72638fe37bbf327339293416))
* Remove unused variable and refactor setCurrentTab method ([e2a8a21](https://github.com/webmappsrl/webmapp-app/commit/e2a8a214501db0a1650736b3adf255ece12e800f))
<!-- COMMIT_DESC -->
    
    - Removed the unused variable "currentTab" in the TabsPage class.
    - Refactored the setCurrentTab method to use the _urlHandlerSvc.getCurrentPath() instead of this.currentTab.
* Update @capacitor/device to version 6.0.2 ([b2d9b61](https://github.com/webmappsrl/webmapp-app/commit/b2d9b611907b5a93581ca2595ed19c875330b45b))
* Update app.component.ts ([#84](https://github.com/webmappsrl/webmapp-app/issues/84)) ([c038c0d](https://github.com/webmappsrl/webmapp-app/commit/c038c0d698021e7e2f5dd6e94d1d0a3cdc1e5655))
<!-- COMMIT_DESC -->
    
    - Imported Observable and from from the rxjs library
    - Added a subscription to getUgcLoadedOnce() and dispatched setUgcLoaded action if ugcLoadedOnce is true
* Update CameraService reference in ModalWaypointSaveComponent ([d654b9b](https://github.com/webmappsrl/webmapp-app/commit/d654b9b03d133d877abb9c467395ee12cabf8d82))
* Update CameraService reference in ModalWaypointSaveComponent ([c082bbd](https://github.com/webmappsrl/webmapp-app/commit/c082bbd9b5186978892b2c5418959f8798e5186b))
<!-- COMMIT_DESC -->
    
    - Replaced the reference to `_photoSvc` with `_cameraSvc` for consistency and clarity.
    - Updated the `addPhotos()` method to use `_cameraSvc.getPhotos()` instead of `_photoSvc.getPhotos()`.
    - Updated the `addPhotos()` method to use `_cameraSvc.getPhotoData()` instead of `_photoSvc.getPhotoData()`.
    - Added a new method `backToSuccess()` to handle dismissing the modal and returning to success state.
    - Modified the subscription in `saveUgcPoi()` to await dismissal of the modal before dispatching `syncUgcPois()`.
* Update card-track.component.ts and downloadlist.page.ts oc:4740,4745,4739,4741,4727 ([#75](https://github.com/webmappsrl/webmapp-app/issues/75)) ([c355cc8](https://github.com/webmappsrl/webmapp-app/commit/c355cc804f05f5f0256be409ff4805577ddfd43b))
* Update dependencies and imports in modal-save.component.ts <a href="https://orchestrator.maphub.it/resources/customer-stories/4781" target="_blank" rel="noopener noreferrer">OC[4781]</a> ([1bd18b9](https://github.com/webmappsrl/webmapp-app/commit/1bd18b9b42cc24d38f5d69df52386027a669e8bb))
<!-- COMMIT_DESC -->
    
    - Removed unused import of TranslateService
    - Added import of LangService from @wm-core/localization/lang.service
    - Updated references to TranslateService with LangService
* Update geohubId in environment.ts ([ca801a2](https://github.com/webmappsrl/webmapp-app/commit/ca801a27c7a957d512cbd5dc8b6a86f2a3ee0eb2))
* Update geohubId in environment.ts ([6fcc054](https://github.com/webmappsrl/webmapp-app/commit/6fcc054a14392f74dd9b482f46c8d7387829beb9))
<!-- COMMIT_DESC -->
    
    The geohubId value in the environment.ts file has been changed from 29 to 26. This update ensures that the correct geohubId is used for the application.
* Update geolocation service usage ([7de0e27](https://github.com/webmappsrl/webmapp-app/commit/7de0e27f049436691335ce604b81ad06b8b702d0))
* Update geolocation service usage ([ca16cd8](https://github.com/webmappsrl/webmapp-app/commit/ca16cd8b1f7941791774a805e85638037f9d7411))
<!-- COMMIT_DESC -->
    
    - Replace `reset` method with `stopAll` in `SettingsComponent`
    - Replace `start` method with `startNavigation` in `MapPage`, `RegisterPage`, and `WaypointPage`
    
    These changes ensure that the geolocation service is used correctly and consistently throughout the codebase.
* Update home page template and component ([84028fd](https://github.com/webmappsrl/webmapp-app/commit/84028fd9ff0aef3e8276d7e190f8e22e2c006cec))
* Update map page and translations ([831266d](https://github.com/webmappsrl/webmapp-app/commit/831266dd32d31d8a7b4c9611d57a7ba5f9e15697))
<!-- COMMIT_DESC -->
    
    - Removed the display of currentPoiProperties in map.page.html
    - Updated translations for "Conferma" to "Confirm" in en.json, fr.json, and it.json
    - Added translation for "Link utili" as "Useful links" in en.json, fr.json, and it.json
* Update map page HTML ([35babcc](https://github.com/webmappsrl/webmapp-app/commit/35babccf0ddeef5dbaa3e899977ac28269db652e))
* Update map page HTML and TypeScript files ([88de3e3](https://github.com/webmappsrl/webmapp-app/commit/88de3e35c3a340334c4ab4c217dbacb1f953abd9))
<!-- COMMIT_DESC -->
    
    - Added a new ng-container in the HTML file to display a favorite button for authenticated users
    - Updated the TypeScript file to handle the favorite button functionality by checking if a track is already marked as favorite
* Update map page HTML and TypeScript files ([b2db519](https://github.com/webmappsrl/webmapp-app/commit/b2db519a5cfe48d6a9420b652d7e9cb5b94deafb))
* Update map page HTML and TypeScript files ([14be90d](https://github.com/webmappsrl/webmapp-app/commit/14be90dcbc06a0027ea4c70d0909039a855b2330))
<!-- COMMIT_DESC -->
    
    - Updated the map.page.html file to use the currentEcTrackProperties$ observable for retrieving the track ID.
    - Updated the map.page.ts file to add the currentEcTrackProperties$ observable and assign it to the currentEcTrackProperties variable.
* Update map page HTML and TypeScript files ([322a56b](https://github.com/webmappsrl/webmapp-app/commit/322a56b51ff22f10ae4721ca744653e42e11a2a6)), closes [#123](https://github.com/webmappsrl/webmapp-app/issues/123)
* Update map page layout and functionality ([d61fbb3](https://github.com/webmappsrl/webmapp-app/commit/d61fbb31f0edb2b41fa8fd86745c1f679cd0d1b2))
<!-- COMMIT_DESC -->
    
    - Removed unnecessary code related to track preview
    - Updated the layout of the map page
    - Added new functionality for navigating and recording tracks
* Update map-details component styles and logic ([#79](https://github.com/webmappsrl/webmapp-app/issues/79)) ([060469b](https://github.com/webmappsrl/webmapp-app/commit/060469b9893badf53f3e3ffdbefdcaf1de3bd7db))
* Update map-details.component.scss and map.page.html ([#76](https://github.com/webmappsrl/webmapp-app/issues/76)) ([437043a](https://github.com/webmappsrl/webmapp-app/commit/437043a07fd32d6b13c581a096ac7127ee2145a8))
<!-- COMMIT_DESC -->
    
    - Adjusted the top position of ion-card-content in map-details.component.scss
    - Added a ng-template block for wm-track-properties in map.page.html
* Update map-details.component.ts ([#81](https://github.com/webmappsrl/webmapp-app/issues/81)) ([f77e39b](https://github.com/webmappsrl/webmapp-app/commit/f77e39b9c05743dd6dd43d9bc277005fae6d4968))
* Update map-details.component.ts, map.page.html, and map.page.ts ([3202f90](https://github.com/webmappsrl/webmapp-app/commit/3202f9057429ad41f36bbef69c62d85576ba213f))
<!-- COMMIT_DESC -->
    
    - Removed unnecessary imports and variables
    - Refactored ngAfterViewInit() method in MapDetailsComponent
    - Removed unused code in MapPage class
    - Updated methods in MapPage class for better readability
* Update map.page.html ([c5d67dc](https://github.com/webmappsrl/webmapp-app/commit/c5d67dcf94e6716ce80aa09663c966dd7c130bee))
* Update map.page.ts ([2bec469](https://github.com/webmappsrl/webmapp-app/commit/2bec469e80c27b983c705c0b71910bd5441b8ecc))
<!-- COMMIT_DESC -->
    
    - Added logic to handle currentPoiProperties subscription
    - Updated params object with additional properties for ugc_poi and poi
    - Removed unnecessary code in openPopup method
    chore: Update map.page.ts
    
    - Added logic to handle currentPoiProperties subscription
    - Updated params object with additional properties for ugc_poi and poi
    - Removed unnecessary code in openPopup method
* Update modal-save.component.html and modal-save.component.ts ([9ff8870](https://github.com/webmappsrl/webmapp-app/commit/9ff8870409446d6f2617491fd0d3db203b4af026))
* Update modal-save.component.ts ([#71](https://github.com/webmappsrl/webmapp-app/issues/71)) ([86ed979](https://github.com/webmappsrl/webmapp-app/commit/86ed979ed51129fef61e20db61645ef68d65e8c4))
<!-- COMMIT_DESC -->
    
    This commit updates the code in modal-save.component.ts file. The changes include:
    - Importing the 'from' and 'Observable' functions from the 'rxjs' library.
    - Adding the 'saveUgcTrack' function to the import statement from '@wm-core/utils/localForage'.
    - Importing the 'take' and 'switchMap' functions from the 'rxjs/operators' library.
    - Adding the '_store' parameter to the constructor of ModalSaveComponent.
    - Modifying the backToSuccess() method to return a Promise<boolean> instead of void.
    - Modifying the saveTrack() method to use observables and dispatch actions using Redux store.
    
    These changes aim to improve code functionality and maintainability.
* Update modal-success.component.html ([f4e5cca](https://github.com/webmappsrl/webmapp-app/commit/f4e5ccaa11b4dcd971fc6241a5253710ea2a112f))
* Update modal-waypoint-save.component.ts ([#70](https://github.com/webmappsrl/webmapp-app/issues/70)) ([5883c79](https://github.com/webmappsrl/webmapp-app/commit/5883c793abf0dbb5c81f4b564e0c579aea6779cf))
<!-- COMMIT_DESC -->
    
    - Import the 'from' operator from 'rxjs'
    - Add the 'saveUgcPoi' function to the import statement from '@wm-core/utils/localForage'
    - Remove the import of 'UgcService' from '@wm-core/store/features/ugc/ugc.service'
    - Add the 'switchMap' and 'take' operators to the pipe in line 143
    - Dispatch a syncUgcPois action after dismissing the modal and opening the success modal
* Update photo limit to 3 ([8d8fc17](https://github.com/webmappsrl/webmapp-app/commit/8d8fc1739b38da4856d569806d9ca62f88ea7e09))
* Update poi-properties component <a href="https://orchestrator.maphub.it/resources/customer-stories/4837" target="_blank" rel="noopener noreferrer">OC[4837]</a> ([#88](https://github.com/webmappsrl/webmapp-app/issues/88)) ([1955d5d](https://github.com/webmappsrl/webmapp-app/commit/1955d5dd4388360b89487ba95105ece0a478a6d7))
<!-- COMMIT_DESC -->
    
    * chore: Update poi-properties component
    
    - Added conditional rendering for wm-tab-detail and wm-feature-useful-urls based on the values of showTechnicalDetails$ and showUsefulUrls$
    - Updated set properties method to update the values of showTechnicalDetails$ and showUsefulUrls$
    
    * fix(map): update class name for useful URLs item
    
    - Changed the class name from "wm-track-useful-urls-item" to "wm-feature-useful-urls-item" in the map page HTML file.
    - This change reflects a more accurate description of the item's purpose.
* Update release_please.yml workflow ([aea66d5](https://github.com/webmappsrl/webmapp-app/commit/aea66d5d00442ff82fe01f325d50968332174c21))
* Update release_please.yml workflow ([76af493](https://github.com/webmappsrl/webmapp-app/commit/76af493db8d7159c357a1a8c4edf9826cf1d0ac1))
<!-- COMMIT_DESC -->
    
    - Added step to check out code with submodules
    - Updated Release Please Action version to v3
    - Enabled monorepo tags for webmapp-app package
    - Modified pull request title pattern for releases
* Update settings component ([#80](https://github.com/webmappsrl/webmapp-app/issues/80)) ([a2ea10a](https://github.com/webmappsrl/webmapp-app/commit/a2ea10afad16f1f545ab7443b036304b410dcfc0))
* Update settings.component.html ([292e626](https://github.com/webmappsrl/webmapp-app/commit/292e626821f943cc302431245514bcd0576baf6e))
<!-- COMMIT_DESC -->
    
    - Fixed a syntax error in the ngIf condition for record_track_show.
* Update setTrackElevationChartHoverElements parameter type ([d2d2da5](https://github.com/webmappsrl/webmapp-app/commit/d2d2da5b2a11f2675232379aa6bedf2c2edb7887))
* Update submodules in .gitmodules file ([5fe1d74](https://github.com/webmappsrl/webmapp-app/commit/5fe1d74fa4723b595b8623efb5ac52cf1d6c0777))
<!-- COMMIT_DESC -->
    
    - Added submodule "core/src/app/shared/wm-types"
    - Updated URL for submodule "core/src/app/shared/wm-core"
* Update subproject ([a8221c4](https://github.com/webmappsrl/webmapp-app/commit/a8221c493a5ad88e7cb951c08cc6c2af6b319b4f))
* Update subproject commit reference ([bc0d614](https://github.com/webmappsrl/webmapp-app/commit/bc0d61456cda6aac19472a99805456897ad34747))
* Update subproject imports ([2320916](https://github.com/webmappsrl/webmapp-app/commit/2320916004c5341a410774ebb8dc4a8ddc9283c1))
* Update subproject <a href="https://orchestrator.maphub.it/resources/customer-stories/5000" target="_blank" rel="noopener noreferrer">OC[5000]</a> ([05e87e6](https://github.com/webmappsrl/webmapp-app/commit/05e87e6707e05017c11f1dfefaed1b24ff39231b))
<!-- COMMIT_DESC -->
    
    - Removed unused import in register.page.ts
    - Updated wmMapGeojson binding in waypoint.page.html
    - Removed unused import and variable in waypoint.page.ts
    - Refactored onChangeLocation method to update geojson and locationString
* Update subproject oc:5000 ([8fd839b](https://github.com/webmappsrl/webmapp-app/commit/8fd839bd3e36a0c191215e4868fa49aa69c9d5e7))
* Update tabs.page.html and tabs.page.ts ([8829b2e](https://github.com/webmappsrl/webmapp-app/commit/8829b2e210ec1578d84a23c27c6a56244ddf86e8))
<!-- COMMIT_DESC -->
    
    - Reordered the click event and tab attributes in ion-tab-button elements in tabs.page.html
    - Removed unused import statement from tabs.page.ts
    - Renamed _urlHandlerService to _urlHandlerSvc in tabs.page.ts
* Update tabs.page.html and tabs.page.ts ([7047d30](https://github.com/webmappsrl/webmapp-app/commit/7047d30af1146ebaf1735bfa657d85963b00d1d4))
* Update tabs.page.ts to reset additional query parameters <a href="https://orchestrator.maphub.it/resources/customer-stories/4907" target="_blank" rel="noopener noreferrer">OC[4907]</a> ([#89](https://github.com/webmappsrl/webmapp-app/issues/89)) ([540007c](https://github.com/webmappsrl/webmapp-app/commit/540007cc361cd137760763b8266a70ec80c17051))
<!-- COMMIT_DESC -->
    
    This commit updates the tabs.page.ts file to reset the "ugc_track" and "ugc_poi" query parameters along with "track" and "poi". This ensures that all relevant query parameters are properly reset when navigating to the home tab.
* Update test-utils.ts ([153a6f2](https://github.com/webmappsrl/webmapp-app/commit/153a6f2fdb1fb9f462fb38f2c044492443c940aa))
* Update track properties component and map details component ([f25a957](https://github.com/webmappsrl/webmapp-app/commit/f25a957595be24d28f0941181499c1e6e403c6ad))
<!-- COMMIT_DESC -->
    
    - Updated the track-properties.component.html file to use optional chaining operator for accessing nested properties.
    - Renamed the map-track-details.component.html, map-track-details.component.scss, and map-track-details.component.ts files to map-details.component.html, map-details.component.scss, and map-details.component.ts respectively.
    - Updated the references to the renamed files in the code.
    - Removed the unused map-track-details.component.spec.ts file.
    - Updated the imports in the map.module.ts file to reflect the renamed components.
    - Updated the template in the map.page.html file to use wm-map-details instead of wm-map-track-details and updated related bindings accordingly.
    - Added a new bottom-right section with two ion-fab buttons for location-related actions.
    - Updated some method names and event handlers in the map.page.ts file to reflect changes made in other files.
* Update waypoint.page.ts ([29a7ba7](https://github.com/webmappsrl/webmapp-app/commit/29a7ba7037b19ceea5e4b96177cbbf4b8d1445a4))
* Update waypoint.page.ts ([680b325](https://github.com/webmappsrl/webmapp-app/commit/680b32594af1141788ea3b12a457a262f18bc762))
<!-- COMMIT_DESC -->
    
    - Added a condition to start navigation only if the current mode is not 'recording'
    - Improved efficiency by avoiding unnecessary calls to startNavigation()
## [2.12.16](https://github.com/webmappsrl/webmapp-app/compare/v2.12.15...v2.12.16) (2024-11-01)


### Miscellaneous

* make release ([808ee25](https://github.com/webmappsrl/webmapp-app/commit/808ee257c904af326fb38dc69a532fcbd8fb5527))
## [2.12.15](https://github.com/webmappsrl/webmapp-app/compare/v2.12.14...v2.12.15) (2024-10-31)


### Bug Fixes

* add condition to onlyTitle method in navigation <a href="https://orchestrator.maphub.it/resources/customer-stories/4211" target="_blank" rel="noopener noreferrer">OC[4211]</a> ([37ddb19](https://github.com/webmappsrl/webmapp-app/commit/37ddb19f1ebe69cbf0ba46194df6fd6dcbc98e0c))
<!-- COMMIT_DESC -->
    
    This commit adds a condition to the `navigation` method in the `MapPage` component. The `onlyTitle` method of the `mapTrackDetailsCmp` will now be called only if the map is focused and the track details component is open.

### Miscellaneous

* Update modal-waypoint-save.component.html <a href="https://orchestrator.maphub.it/resources/customer-stories/3938" target="_blank" rel="noopener noreferrer">OC[3938]</a> ([#54](https://github.com/webmappsrl/webmapp-app/issues/54)) ([df305e5](https://github.com/webmappsrl/webmapp-app/commit/df305e5494dae42e4e169431d13c2c0c7f1c4720))
<!-- COMMIT_DESC -->
    
    - Changed the back button to use an ion-button with a chevron-back icon
    - Updated the color of the button to dark
* Update profile page with delete account functionality oc: 4117 ([#55](https://github.com/webmappsrl/webmapp-app/issues/55)) ([2e04e76](https://github.com/webmappsrl/webmapp-app/commit/2e04e767964e14ad331c32814aa1b2bcd054a74d))
* Update register page UI <a href="https://orchestrator.maphub.it/resources/customer-stories/4103" target="_blank" rel="noopener noreferrer">OC[4103]</a> ([#53](https://github.com/webmappsrl/webmapp-app/issues/53)) ([72f16d8](https://github.com/webmappsrl/webmapp-app/commit/72f16d847d63bb77618483188972c3d6832d4e57))
<!-- COMMIT_DESC -->
    
    - Added a new map component
    - Updated the layout of the bottom buttons
    - Adjusted the position and style of the orientation button
## [2.12.14](https://github.com/webmappsrl/webmapp-app/compare/v2.12.13...v2.12.14) (2024-10-25)


### Miscellaneous

* Add geolocation service to home and map pages <a href="https://orchestrator.maphub.it/resources/customer-stories/4113" target="_blank" rel="noopener noreferrer">OC[4113]</a> ([37903a7](https://github.com/webmappsrl/webmapp-app/commit/37903a78f46f1a95f9ddccc1d370615609f11ab7))
<!-- COMMIT_DESC -->
    
    This commit adds the GeolocationService to the home and map pages. The GeolocationService is used to retrieve the user's current location.
## [2.12.13](https://github.com/webmappsrl/webmapp-app/compare/v2.12.12...v2.12.13) (2024-10-25)


### Miscellaneous

* Add 'cai_scale' translation to Italian language file <a href="https://orchestrator.maphub.it/resources/customer-stories/4097" target="_blank" rel="noopener noreferrer">OC[4097]</a> ([221acd9](https://github.com/webmappsrl/webmapp-app/commit/221acd97ab02b14c8bd2e85363fdc1c0056d3ea5))
<!-- COMMIT_DESC -->
    
    Include translation for 'cai_scale' in the Italian language file.
* **i18n:** Remove unused translation key "cai_scale" ([127ba20](https://github.com/webmappsrl/webmapp-app/commit/127ba20c21da694c651506d16e907333cbb9116c))
* Remove unnecessary code for overlay URL and reorganize lifecyc… ([#49](https://github.com/webmappsrl/webmapp-app/issues/49)) ([c9d25f5](https://github.com/webmappsrl/webmapp-app/commit/c9d25f54c1cfa5216ca8687e11a7bbcdd798dbe8))
<!-- COMMIT_DESC -->
    
    * chore: Remove unnecessary code for overlay URL and reorganize lifecycle hooks <a href="https://orchestrator.maphub.it/resources/customer-stories/4098" target="_blank" rel="noopener noreferrer">OC[4098]</a>
    
    - Removed unused overlay URL in HTML template
    - Reorganized ngOnInit and ngOnDestroy methods for better readability
    
    * chore: Remove unused enableOverLay$ BehaviorSubject and optimize ngOnInit in MapPage
    
    Removed the unused enableOverLay$ BehaviorSubject and optimized the ngOnInit method in MapPage for better performance.
* Update subproject with changes to use SKU instead of ID in app configuration. Fix issues related to missing app ID oc: 4170 ([#51](https://github.com/webmappsrl/webmapp-app/issues/51)) ([c03b4c5](https://github.com/webmappsrl/webmapp-app/commit/c03b4c5f98ffa0c3b866376bc28acb3e0a461625))

## [2.12.12](https://github.com/webmappsrl/webmapp-app/compare/v2.12.11...v2.12.12) (2024-09-27)


### Miscellaneous

* change environment ([42fcb8b](https://github.com/webmappsrl/webmapp-app/commit/42fcb8b5645fc686197197a81fa580fd9ea2c3db))
## [2.12.11](https://github.com/webmappsrl/webmapp-app/compare/v2.12.10...v2.12.11) (2024-09-19)


### Miscellaneous

* Comment out console.log statements and unused code ([88c6830](https://github.com/webmappsrl/webmapp-app/commit/88c683017ac3076fb1419c0271084f297f29e25d))
<!-- COMMIT_DESC -->
    
    This commit comments out the console.log statement in the getUrlFile function and removes unused code in the build function.
* Remove android.permission.MANAGE_EXTERNAL_STORAGE from permissions array ([786cfec](https://github.com/webmappsrl/webmapp-app/commit/786cfec343d07a51ac123b647e91359ff995a5ea))
* Remove unnecessary code and fix condition in MapPage ([db89915](https://github.com/webmappsrl/webmapp-app/commit/db899154bf3c0e1a67b753d3da9cf8242079b599))
<!-- COMMIT_DESC -->
    
    - Removed unnecessary code in AppComponent
    - Fixed a condition in setWmMapFeatureCollection method of MapPage
## [2.12.10](https://github.com/webmappsrl/webmapp-app/compare/v2.12.9...v2.12.10) (2024-09-17)


### Miscellaneous

* Update Android platform and remove storage permission request <a href="https://orchestrator.maphub.it/resources/customer-stories/3969" target="_blank" rel="noopener noreferrer">OC[3969]</a> ([7e3845f](https://github.com/webmappsrl/webmapp-app/commit/7e3845f4f7824ff2759f119e9be368368a82b0f8))
<!-- COMMIT_DESC -->
    
    - Updated compileSdkVersion and targetSdkVersion in gulpfile.js to 33
    - Removed the requestStoragePermission() function from trackdetail.page.ts
* Update dependencies and build configuration ([1292745](https://github.com/webmappsrl/webmapp-app/commit/12927457694258da5d887f49506c6169dd67b19d))

## [2.12.9](https://github.com/webmappsrl/webmapp-app/compare/v2.12.8...v2.12.9) (2024-09-13)


### Miscellaneous

* Update Android platform versions in gulpfile.js ([51f230e](https://github.com/webmappsrl/webmapp-app/commit/51f230e475755b9759fea53b7158a18bc38e3c84))
<!-- COMMIT_DESC -->
    
    Update the compileSdkVersion and targetSdkVersion in the gulpfile.js to version 34.
## [2.12.8](https://github.com/webmappsrl/webmapp-app/compare/v2.12.7...v2.12.8) (2024-09-13)


### Miscellaneous

* Add API endpoint for OSM2CAI ([f3579b2](https://github.com/webmappsrl/webmapp-app/commit/f3579b21db0f2fc8bb65b0fcb5934803792a056c))
<!-- COMMIT_DESC -->
    
    This commit adds a new API endpoint for OSM2CAI, which is set to 'https://osm2cai.cai.it'. This allows for integration with the OSM2CAI service.
* Remove unused saveFileCallback method ([2683dd3](https://github.com/webmappsrl/webmapp-app/commit/2683dd38097b41809216e936ee8faa3cb973b94b))

## [2.12.7](https://github.com/webmappsrl/webmapp-app/compare/v2.12.6...v2.12.7) (2024-09-13)


### Miscellaneous

* Add file saving functionality and permission handling ([b3ba923](https://github.com/webmappsrl/webmapp-app/commit/b3ba923a609e6c900954e427aebacb431df21452))
<!-- COMMIT_DESC -->
    
    - Added a function to save files in the Documents directory
    - Created a popup message to inform the user about successful file saving and ask for sharing
    - Updated the HTML template to remove unnecessary code related to exporting files
    - Modified the TypeScript file to handle storage permission requests before saving files
* Add new deployment command for caiparma project ([73728cc](https://github.com/webmappsrl/webmapp-app/commit/73728cc4db10656206c49a549e05fa3b8b69527b))
* Add surge-osm2cai script to deploy the project to OSM2CAI domain ([ea9c699](https://github.com/webmappsrl/webmapp-app/commit/ea9c69953b8dad3258d32011567de0249ff7863d))
<!-- COMMIT_DESC -->
    
    This commit adds a new script "surge-osm2cai" to the package.json file in the core directory. The script allows deploying the project to the OSM2CAI domain using Surge.
* **map:** add track property to wm-track-download-urls component ([be32e9d](https://github.com/webmappsrl/webmapp-app/commit/be32e9d8fb01bd7c71cdcbd535f6fb4a69ea84ed))

## [2.12.6](https://github.com/webmappsrl/webmapp-app/compare/v2.12.5...v2.12.6) (2024-09-12)


### Miscellaneous

* Update app.module.ts and settings.component.html/ts ([00614b5](https://github.com/webmappsrl/webmapp-app/commit/00614b59331dd548b52d71987900b5f9bea2962b))
<!-- COMMIT_DESC -->
    
    - Removed import of ConfigService in app.module.ts
    - Added import of ConfService and package.json in app.module.ts
    - Removed APP_INITIALIZER provider in app.module.ts
    - Added APP_VERSION provider with value from package.json in app.module.ts
    - Updated ion-item in settings.component.html to display the value of APP_VERSION instead of version variable
    - Removed ngOnInit method from settings.component.ts
* Update environment configuration ([d281e89](https://github.com/webmappsrl/webmapp-app/commit/d281e89afd6f1434654cd94242d8bdaa6d484bbb))
* Update environment variables in gulpfile.js ([aaf7884](https://github.com/webmappsrl/webmapp-app/commit/aaf7884ad73674644d4154f282d1bfe28be48a1a))
<!-- COMMIT_DESC -->
    
    - Added new AWS API endpoint for geohub
    - Added new ElasticSearch API endpoint for geohub
* Update geohubId in environment.ts ([884e8bf](https://github.com/webmappsrl/webmapp-app/commit/884e8bfba7607463103d580afa8c31a34328ee82))
* Update map.effects.ts ([51f5b9d](https://github.com/webmappsrl/webmapp-app/commit/51f5b9d6927138b423aaed346bb082c34ac90682))
<!-- COMMIT_DESC -->
    
    - Replaced the import statement for GeohubService with ApiService
    - Updated the method call from _geohubSVC.getEcTrack() to _apiSvc.getEctrack()
* Update package version during instance creation and build ([9d32a37](https://github.com/webmappsrl/webmapp-app/commit/9d32a3727b4881c8b1d5d8a778acb5761c4a4dad))
* Update subproject dependencies ([4a40266](https://github.com/webmappsrl/webmapp-app/commit/4a402660745b47f4405f0c058f39e606cf6ec68e))
<!-- COMMIT_DESC -->
    
    - Updated the import statement for `CGeojsonLineStringFeature` in `map.page.ts`
    - Added import statement for `FeatureCollection` from 'geojson'
    - Updated the import statement for `isLogged` in `map.page.ts`
    - Updated the import statements for various services and components in `map.page.ts`
    - Updated the type of `currentTrack$` observable in `map.page.ts`
    - Updated the API service method call in `goToTrack()` function in `map.page.ts`
    - Removed duplicate definition of `openPoiShare()` function in `map.page.ts`
    - Added new function `openPoiShare()` to share a point of interest by ID
    - Removed unused function parameters and variables
## [2.12.5](https://github.com/webmappsrl/webmapp-app/compare/v2.12.4...v2.12.5) (2024-09-09)


### Bug Fixes

* Fix error handling in app.component.ts ([99d2e90](https://github.com/webmappsrl/webmapp-app/commit/99d2e90fc976f2b292d7574b81eddac2ff226d5a))
<!-- COMMIT_DESC -->
    
    The code change fixes the error handling in the app.component.ts file. The filter condition has been updated to check for 'Unauthorized' instead of 'Unauthenticated'. This ensures that the correct error message is displayed when an unauthorized error occurs.
* Remove duplicate elasticApi URL ([013cd07](https://github.com/webmappsrl/webmapp-app/commit/013cd07999cf871d72c8bae95732cc49e3efac1d))


### Miscellaneous

* Remove login component ([6b13542](https://github.com/webmappsrl/webmapp-app/commit/6b13542ed1e18fbbcf6652ae1a6172be8d1df44f))
<!-- COMMIT_DESC -->
    
    This commit removes the login component from the codebase. The login component HTML, SCSS, TypeScript files, and spec file have been deleted.
    
    chore: Remove modal header component
    
    The modal header component and its associated files have been deleted. This commit removes the HTML, SCSS, spec, and TypeScript files related to the modal header component.
    
    chore: Remove auth.d.ts file
    
    The auth.d.ts file was deleted. This file contained interfaces for IUser and IGeohubApiLogin, which are no longer needed in the codebase.
    
    chore: Update settings component
    
    - Updated the ngIf condition in the HTML template to use the `isLogged$` observable instead of `isLoggedIn`
    - Imported and used the `select` function from '@ngrx/store' in the TypeScript file
    - Added a new observable `isLogged$` using the `isLogged` selector from 'wm-core/store/auth/auth.selectors'
    - Dispatched the `loadSignOuts()` action when logging out instead of calling `_authSvc.logout()`
    - Removed unnecessary import of 'AuthService' from 'src/app/services/auth.service'
    - Added import statement for 'WmCoreModule' in settings.module.ts
    
    chore: Remove AuthService
    
    This commit removes the AuthService file, which is no longer needed in the codebase. The functionality provided by this service has been refactored and replaced with other services.
    
    chore: Update authentication variable names
    
    - Updated the variable name `isLoggedIn$` to `isLogged$` in multiple files.
    - Renamed the variable `isLoggedIn$` to `isLogged$` in the following files:
      - favourites.page.html
      - favourites.page.ts
      - map.page.html
      - map.page.ts
      - profile.page.html
      - profile.page.ts
      - tabs.page.html
      - tabs.page.ts
    
    chore: Update registeruser.page.html and registeruser.page.ts
    
    - Removed unnecessary ngSubmit event from the form in registeruser.page.html
    - Updated ngClass conditions for error handling in the form fields
    - Updated *ngIf conditions for displaying error messages in the form fields
    - Disabled the register button when the form is invalid in registeruser.page.html
    - Removed AuthService import and usage from registeruser.page.ts
    - Added a BehaviorSubject to track if the form has been submitted or not in registeruser.page.ts
    - Created an Observable to track if the form is valid or not in registeruser.page.ts
    - Dispatched loadSignUps action with user registration details when registering a new user
    
    chore: Update subproject with new imports and error handling
    
    This commit updates the subproject by adding new imports for AlertController and HttpErrorResponse. It also adds error handling for authentication errors, displaying an alert message to the user.
    
    chore: Update btn-track-recording.component.ts
    
    - Remove import of LoginComponent from '../../login/login.component'
    - Add import of LoginComponent from 'wm-core/login/login.component'
    
    chore: Remove unused components and imports
    
    - Removed LoginComponent and ModalHeaderComponent from the SharedModule
    - Removed corresponding imports in the SharedModule
    - Updated storage.service.ts to import IUser from 'wm-core/store/auth/auth.model'
    
    chore: Update subproject commit in settings component
    
    - Updated the subproject commit in the settings component HTML file.
    - Replaced `<webmapp-modal-header>` with `<wm-modal-header>`.
    - Made necessary changes to ensure compatibility with the updated subproject.
    
    chore: Remove profile data and records components
    
    This commit removes the profile data and records components, including their HTML, SCSS, and spec files. These components are no longer needed in the codebase.
    chore: Remove profile data and records components
    
    This commit removes the profile data and records components, including their HTML, SCSS, and spec files. These components are no longer needed in the codebase.
    
    chore: Update profile routing and module
    
    - Updated the import paths for `ProfileDataComponent` and `ProfileRecordsComponent` in the profile-routing.module.ts file.
    - Updated the import paths for `ProfileDataComponent` and `ProfileRecordsComponent` in the profile.module.ts file.
    - Removed the import statement for `ProfileDataComponent` in the profile.module.ts file.
    - Added an import statement for `WmCoreModule` in the profile.module.ts file.
    - Updated the HTML template of the profile.page.html file by replacing some code with a new component called "wm-profile-user".
    - Removed unnecessary code from the profile.page.scss file.
    - Removed unused imports and methods from the profile.page.ts file.
* Remove registeruser page and related components ([0171acf](https://github.com/webmappsrl/webmapp-app/commit/0171acfd1d8c8fb687c793373050d7a3bdd69d0c))
* Remove unnecessary imports and code ([977de12](https://github.com/webmappsrl/webmapp-app/commit/977de12967921df96119b984013c46f50276a3ac))
<!-- COMMIT_DESC -->
    
    This commit removes unnecessary imports and code from the app.component.ts file. It removes the AlertController import, as well as the authError$ observable and its related code. These changes help to clean up the codebase and improve readability.
* remove unused code files (move to wm-core) oc: 3864 ([d1b5710](https://github.com/webmappsrl/webmapp-app/commit/d1b5710e5c48da8d17bc8772d87f0822fb7e3235))
* Remove unused code in GeohubService ([ea9fc65](https://github.com/webmappsrl/webmapp-app/commit/ea9fc655f6d02d53ed477560b637e5b9d7972350))
<!-- COMMIT_DESC -->
    
    This commit removes several unused methods and imports in the GeohubService class. The removed code includes methods for getting details of POIs, EC media, and EC tracks, as well as performing searches and string searches. Additionally, unused imports and dependencies have been removed.
* Update app.module.ts ([dfa20a3](https://github.com/webmappsrl/webmapp-app/commit/dfa20a3f91afe54d1c5bf8769b51a1b65b054efa))
* Update app.module.ts ([2aae140](https://github.com/webmappsrl/webmapp-app/commit/2aae1400043b3eb7e72fb85df12db8ca03ae5f12))
<!-- COMMIT_DESC -->
    
    - Added APP_ID_TOKEN to providers
    - Use ConfigService to get the value for APP_ID_TOKEN
* Update environment configuration ([d0caed0](https://github.com/webmappsrl/webmapp-app/commit/d0caed00aee781d84d05dc87e06ae9597d0afb38))
* Update environment configuration ([b49a8dc](https://github.com/webmappsrl/webmapp-app/commit/b49a8dc00e0dbf189fcc6490b49a9698de1e2151))
<!-- COMMIT_DESC -->
    
    - Added new elasticApi endpoint for production environment
    - Commented out local development api endpoints
* Update imports in ConfigService ([525d4d3](https://github.com/webmappsrl/webmapp-app/commit/525d4d3c32fddad647bb6efaffb34a30682822d2))
* Update profile page ([086ec4a](https://github.com/webmappsrl/webmapp-app/commit/086ec4adc23f484c537a0a98c5254c950c34856f))
<!-- COMMIT_DESC -->
    
    - Added Subscription import from 'rxjs'
    - Added logic to navigate to '/profile/profile-data' when user is no longer logged in
* Update profile routing and module ([9a17ccc](https://github.com/webmappsrl/webmapp-app/commit/9a17cccfaad17606c794b8d3f777d0cc78b0a624))
* Update subproject ([74b7a5a](https://github.com/webmappsrl/webmapp-app/commit/74b7a5a89acd495d2f1071d1c9eb69643ec60044))
<!-- COMMIT_DESC -->
    
    - Removed unused imports and variables
    - Updated import paths for services and classes
## [2.12.4](https://github.com/webmappsrl/webmapp-app/compare/v2.12.3...v2.12.4) (2024-08-28)


### Miscellaneous

* Refactor shareTrackByID method in ShareService <a href="https://orchestrator.maphub.it/resources/customer-stories/3850" target="_blank" rel="noopener noreferrer">OC[3850]</a> ([#36](https://github.com/webmappsrl/webmapp-app/issues/36)) ([6a060df](https://github.com/webmappsrl/webmapp-app/commit/6a060df97401f53b9ee63cd261af0da3733a4aa7))
<!-- COMMIT_DESC -->
    
    * chore: Refactor shareTrackByID method in ShareService <a href="https://orchestrator.maphub.it/resources/customer-stories/3850" target="_blank" rel="noopener noreferrer">OC[3850]</a>
    
    The shareTrackByID method in the ShareService has been refactored to simplify the code and improve readability. Instead of subscribing to an observable and transforming the socialShareText, it now directly shares the track by calling the share method with the trackId as a parameter. This change reduces unnecessary complexity and improves performance.
    
    chore: Update hostToGeohubAppId in ConfigService
    
    The hostToGeohubAppId object in the ConfigService has been updated to use the imported hostToGeohubAppId from 'wm-core/store/api/api.service' instead of the previous hardcoded values. This change allows for more flexibility and easier maintenance of the geohub app IDs based on the hostname.
    
    * chore: Update defaultShareObj text in ShareService
    
    The defaultShareObj text property in the ShareService has been updated to an empty string. This change ensures that the default text for sharing is empty, allowing users to input their own custom text when sharing content.
    
    * chore: Remove empty text property in defaultShareObj
    
    The code change removes the assignment of an empty string to the text property in the defaultShareObj object. This change was made in the ShareService file.
## [2.12.3](https://github.com/webmappsrl/webmapp-app/compare/v2.12.2...v2.12.3) (2024-08-26)


### Bug Fixes

* Add share button for points of interest <a href="https://orchestrator.maphub.it/resources/customer-stories/3789" target="_blank" rel="noopener noreferrer">OC[3789]</a> ([8b11848](https://github.com/webmappsrl/webmapp-app/commit/8b11848967926cf66c5f5b83a71e059c014692a1))
<!-- COMMIT_DESC -->
    
    - Added a new share button for points of interest in the map page.
    - When clicked, it opens a modal to share the selected point of interest.
    - The shared link includes the ID of the point of interest.
* Update map.page.ts ([b631756](https://github.com/webmappsrl/webmapp-app/commit/b6317563234041bbf7ee4c5a111796af173cc883))


### Miscellaneous

* Update deploy-to-web paths in package.json ([ec49915](https://github.com/webmappsrl/webmapp-app/commit/ec49915a15da0f110c32e0686d286779cf309be7))
<!-- COMMIT_DESC -->
    
    - Updated the paths for the deploy-to-web scripts in package.json to use relative paths instead of absolute paths.
    - Replaced the absolute file paths with "./www/*" and "./www/assets/*" to ensure correct deployment to the web server.
* Update subproject commit reference ([b631756](https://github.com/webmappsrl/webmapp-app/commit/b6317563234041bbf7ee4c5a111796af173cc883))

## [2.12.2](https://github.com/webmappsrl/webmapp-app/compare/v2.12.1...v2.12.2) (2024-08-09)


### Miscellaneous

* Add referrer field to login request ([e953006](https://github.com/webmappsrl/webmapp-app/commit/e95300641080b3e61a44c61373503ebd4844f971))
<!-- COMMIT_DESC -->
    
    - Added a new field "referrer" to the login request in the AuthService class.
    - Updated the geohubId value in the environment.ts file from 32 to 53.
    - Commented out the api URL and added a new local development API URL.
* Update geohubId and apiCarg in environment.ts ([227e24d](https://github.com/webmappsrl/webmapp-app/commit/227e24d1958250bf29f116137e59b4d061169782))
* Update map page template and component <a href="https://orchestrator.maphub.it/resources/customer-stories/3636" target="_blank" rel="noopener noreferrer">OC[3636]</a> ([ec64917](https://github.com/webmappsrl/webmapp-app/commit/ec64917012fa5cdc33fc7ab845f8c6c76675dfff))
<!-- COMMIT_DESC -->
    
    - Added wmMapHitMapCollection directive to the map page template
    - Added hitMapFeatureCollection selector to the map page component
    - Updated setWmMapFeatureCollection method in the map page component to handle overlay feature collections
## [2.12.1](https://github.com/webmappsrl/webmapp-app/compare/v2.12.0...v2.12.1) (2024-08-01)


### Bug Fixes

* add 'parcapuane' map to ConfigService ([3c4bb72](https://github.com/webmappsrl/webmapp-app/commit/3c4bb7275423421177ec29f30a91155940074844))
<!-- COMMIT_DESC -->
    
    A new map, 'parcapuane', has been added to the list of maps in the ConfigService. This extends the range of available maps within the application.
* gestion sync ugc OC: 3717 ([f2cdd81](https://github.com/webmappsrl/webmapp-app/commit/f2cdd810b56fc2287c868d7f20de6cbacf9dd1bd))


### Miscellaneous

* **offline:** OFFLINE TRACK <a href="https://orchestrator.maphub.it/resources/customer-stories/2698" target="_blank" rel="noopener noreferrer">OC[2698]</a> ([4b6062d](https://github.com/webmappsrl/webmapp-app/commit/4b6062d8e475cf9526427202212c6045824201c8))
## [2.12.0](https://github.com/webmappsrl/webmapp-app/compare/v2.11.5...v2.12.0) (2024-07-25)


### Features

* Enhance settings component with memory reset functionality ([694aa22](https://github.com/webmappsrl/webmapp-app/commit/694aa22185b667244addf47a9c147c60f4595636))
<!-- COMMIT_DESC -->
    
    Added a new feature to the settings component that allows users to clear cache and saved data. This includes clearing local storage, session storage, IndexedDB, Cache Storage, and cookies. Also restructured the HTML of the settings component for better organization and readability. Added corresponding translations for new features in English language file.
* Refactored download service and map components.  oc: 3685 ([f576e33](https://github.com/webmappsrl/webmapp-app/commit/f576e33bdd428a2765260f12dca0f549697a7cc2))

## [2.11.5](https://github.com/webmappsrl/webmapp-app/compare/v2.11.4...v2.11.5) (2024-07-01)


### Bug Fixes

* Register page privacy link modal  <a href="https://orchestrator.maphub.it/resources/customer-stories/3568" target="_blank" rel="noopener noreferrer">OC[3568]</a> ([ed9e5aa](https://github.com/webmappsrl/webmapp-app/commit/ed9e5aa7c925b9945d0077c308f9c0db4c9d77b0))
<!-- COMMIT_DESC -->
    
    * chore: add new deployment commands for projects bagnolo and apuane
    
    nclude additional gulp build commands for projects bagnolo and apuane.
    
    * chore: Update subproject to include privacy policy link handling logic <a href="https://orchestrator.maphub.it/resources/customer-stories/3568" target="_blank" rel="noopener noreferrer">OC[3568]</a>
    
    - Added conditional rendering for privacy policy link based on async data
    - Implemented modal opening functionality for displaying privacy policy content
    chore: Update subproject to include privacy policy link handling logic
    
    - Added conditional rendering for privacy policy link based on async data
    - Implemented modal opening functionality for displaying privacy policy content
    
    * Refactored privacy policy handling in registration page
    
    Simplified the way privacy policy is handled on the user registration page. The code now checks if a custom privacy policy exists and falls back to a default one if not. Also, refactored the openCmp function for better readability and performance.
## [2.11.4](https://github.com/webmappsrl/webmapp-app/compare/v2.11.3...v2.11.4) (2024-06-24)


### Bug Fixes

* css ion-select <a href="https://orchestrator.maphub.it/resources/customer-stories/3522" target="_blank" rel="noopener noreferrer">OC[3522]</a> ([b1a13eb](https://github.com/webmappsrl/webmapp-app/commit/b1a13eb52bbcdf8c994544617af185f9fb4232e7))
## [2.11.3](https://github.com/webmappsrl/webmapp-app/compare/v2.11.2...v2.11.3) (2024-06-17)


### Bug Fixes

* Change directory for writing file in TrackdetailPage <a href="https://orchestrator.maphub.it/resources/customer-stories/3422" target="_blank" rel="noopener noreferrer">OC[3422]</a> ([63b6b22](https://github.com/webmappsrl/webmapp-app/commit/63b6b228ca33d338898baf39dd710dfe6dcfb579))
<!-- COMMIT_DESC -->
    
    Changed the directory for writing a file in the TrackdetailPage from Directory.Documents to Directory.External. This change ensures that the file is written to the external storage instead of the documents directory.
* Refactor object merging in SaveService oc:3418 ([79b3e73](https://github.com/webmappsrl/webmapp-app/commit/79b3e7300ee0950ad03073d4a7ced6285a4db3de))


### Miscellaneous

* Remove unnecessary code for handling location permission denial ([479d5a5](https://github.com/webmappsrl/webmapp-app/commit/479d5a50953903333106b167a06e02499dca8a1b))
<!-- COMMIT_DESC -->
    
    The code changes in this commit remove the unnecessary code that handles location permission denial. This includes the prompt to open settings and the call to `backgroundGeolocation.openSettings()`.
## [2.11.2](https://github.com/webmappsrl/webmapp-app/compare/v2.11.1...v2.11.2) (2024-05-31)


### Miscellaneous

* add privacy link to settings component ([#24](https://github.com/webmappsrl/webmapp-app/issues/24)) ([d6f4d00](https://github.com/webmappsrl/webmapp-app/commit/d6f4d00a7860e7556e1cab2a41dde3e21eff57c7))
<!-- COMMIT_DESC -->
    
    Include a new button in the settings component for accessing the privacy page. Update language files accordingly.
    feat: add privacy link to settings component
    
    Include a new button in the settings component for accessing the privacy page. Update language files accordingly.
* Refactor SaveService to improve code readability oc: 3418 ([8a37315](https://github.com/webmappsrl/webmapp-app/commit/8a37315cf68d6b56e3d3dd7a6547b93e3ea239ed))
* Remove unused imports and variables in downloaded-tracks-box.component.ts ([2ce5a7d](https://github.com/webmappsrl/webmapp-app/commit/2ce5a7d4fe0813a16567580cea3ff0a1878e3443))
<!-- COMMIT_DESC -->
    
    This commit removes unused imports, variables, and code related to network connectivity in the downloaded-tracks-box.component.ts file. The changes improve code readability and maintainability.
* Update geolocation.ts ([ae181cf](https://github.com/webmappsrl/webmapp-app/commit/ae181cfae5a8e1b95eb42478d62c865cce96b09a))
* Update map.page.html <a href="https://orchestrator.maphub.it/resources/customer-stories/2835" target="_blank" rel="noopener noreferrer">OC[2835]</a> ([c7de296](https://github.com/webmappsrl/webmapp-app/commit/c7de2968dcad27fe32ceb36f392738debc7dc521))
<!-- COMMIT_DESC -->
    
    - Removed ng-container and moved wm-map component to the top level
    - Reorganized ion-fab buttons for better layout and functionality
## [2.11.1](https://github.com/webmappsrl/webmapp-app/compare/v2.11.0...v2.11.1) (2024-05-15)


### Miscellaneous

* Update localization files for English, French, and Italian with new translations and additions. Fix typo in "Salking" to "Walking". Add new terms like "Asphalt", "Bitumenduro", "Onoff", "Real dirt", and "Bar". ([#21](https://github.com/webmappsrl/webmapp-app/issues/21)) ([daccd32](https://github.com/webmappsrl/webmapp-app/commit/daccd3273c5f187d042e681ecaf9a3c5f292f6f3))
## [2.11.0](https://github.com/webmappsrl/webmapp-app/compare/v2.10.0...v2.11.0) (2024-05-06)


### Features

* **i18n:** Add Italian translation for new waypoint message ([afc9e6d](https://github.com/webmappsrl/webmapp-app/commit/afc9e6d44301f78abf05f40469f01222ac762516))
<!-- COMMIT_DESC -->
    
    Added the Italian translation for the new waypoint message to the i18n file.
* **save.service:** remove console.log statement ([43a29c7](https://github.com/webmappsrl/webmapp-app/commit/43a29c74d2a31c0866ef8e0ba5c1bd59d2030099))
* Update  to new geoserver ([396ccc2](https://github.com/webmappsrl/webmapp-app/commit/396ccc2f4f0d699e665c8b6fa77c56ead9febe7f))
<!-- COMMIT_DESC -->
    
    - Updated the URL for low and high resolution tiles in the IDATALAYER object.

### Bug Fixes

* Add take(1) operator to app.component.ts <a href="https://orchestrator.maphub.it/resources/customer-stories/3023" target="_blank" rel="noopener noreferrer">OC[3023]</a> ([a30d3ab](https://github.com/webmappsrl/webmapp-app/commit/a30d3abe28ec95a81186eedcb54d1da36e1ca052))
<!-- COMMIT_DESC -->
    
    - Added the take(1) operator to the observable chain in app.component.ts
    - Ensures that only the first emitted value is taken into account
    - Improves performance and prevents unnecessary processing
* check if conf exists before accessing flow_line_quote_show property ([3c25dd3](https://github.com/webmappsrl/webmapp-app/commit/3c25dd322382df35fd089668b82a9db62846925a))
* **save.service:** fix null check for track coordinates ([10b4f68](https://github.com/webmappsrl/webmapp-app/commit/10b4f68567ad12258a03308641dc1c5ddd2d2cd7))
<!-- COMMIT_DESC -->
    
    The commit fixes a null check issue in the SaveService class. The code now correctly checks for the presence of track coordinates using optional chaining.

### Miscellaneous

* Remove unnecessary code in setPhotoData method ([95be7fa](https://github.com/webmappsrl/webmapp-app/commit/95be7fa3514c2a59cec046c76b1602cf5a88f833))
* Update form component and save service oc: 3025 ([8b10d36](https://github.com/webmappsrl/webmapp-app/commit/8b10d368098f6f91bff4e31f94013d5cf01cb0d7))
* Update modal-save.component.html <a href="https://orchestrator.maphub.it/resources/customer-stories/3043" target="_blank" rel="noopener noreferrer">OC[3043]</a> ([fc1d0cc](https://github.com/webmappsrl/webmapp-app/commit/fc1d0cc334e641b2a4cb15e9c974228e8ae12342))
<!-- COMMIT_DESC -->
    
    - Added <ion-content> tag to wrap the form content
    - Improved formatting and indentation
* Update subproject ([24e4ce6](https://github.com/webmappsrl/webmapp-app/commit/24e4ce67785dbc9935394d3e410d4c484e2c9ec0))

## [2.10.0](https://github.com/webmappsrl/webmapp-app/compare/v2.9.2...v3.0.0) (2024-04-23)


### ⚠ BREAKING CHANGES

* **config:** The private variable _geohubAppId has been added to store the selected geohubAppId value.

### Features

* **config:** add dynamic geohubAppId selection ([f4054da](https://github.com/webmappsrl/webmapp-app/commit/f4054da50b9fa48c85c8cf13e53950b9e2ed1166))
<!-- COMMIT_DESC -->
    
    This commit adds functionality to dynamically select the geohubAppId based on the hostname. It checks for specific hostnames and assigns a corresponding geohubAppId. If no specific hostname is matched, it uses the numeric value from the hostname. This allows for more flexibility in configuring the geohubAppId for different environments.
    
    BREAKING CHANGE: The private variable _geohubAppId has been added to store the selected geohubAppId value.
* **i18n:** Add download options for GPX, KML, and GEOJSON tracks ([8484473](https://github.com/webmappsrl/webmapp-app/commit/848447346d807d80f5c9bc48200c42470b2749fa))


### Miscellaneous

* Add null check before resetting rotation in goToTrack method ([b0350f8](https://github.com/webmappsrl/webmapp-app/commit/b0350f8293ad13538a00f22a1ee26a5ee314fcd7))
* **modal-success:** Update waypoint success message ([13d68ba](https://github.com/webmappsrl/webmapp-app/commit/13d68bae1667a26aff3b52b93f56520a7f966261))
* Update app.component.ts and tabs-routing.module.ts ([d97e02a](https://github.com/webmappsrl/webmapp-app/commit/d97e02a1500fd761f3e1e284c52fca338c99e465))
<!-- COMMIT_DESC -->
    
    - Commented out the navigation to 'home' in app.component.ts
    - Added a new route in tabs-routing.module.ts to redirect to 'home' when the path is empty
* Update track-properties and map.page.html ([97dc1d6](https://github.com/webmappsrl/webmapp-app/commit/97dc1d6542f7c91d32e9e0a87188492843ea0283))

## [2.9.2](https://github.com/webmappsrl/webmapp-app/compare/v2.9.1...v2.9.2) (2024-03-12)


### Bug Fixes

* Add gulp-through2 package ([a971689](https://github.com/webmappsrl/webmapp-app/commit/a9716894c7179a731b363bb4fab4d72bb5c241c0))
<!-- COMMIT_DESC -->
    
    The commit adds the gulp-through2 package to the project dependencies. This package is required for performing tasks in the Gulp build process.
* Add permissions to AndroidManifest.xml ([e961164](https://github.com/webmappsrl/webmapp-app/commit/e961164108ccd0a8b2963a9978eb5b75d550e17d))
* **image-gallery.component:** scrolling fixed ([ae46a2d](https://github.com/webmappsrl/webmapp-app/commit/ae46a2d9f9efc7c6471dfebd3d62c94c98508493))
<!-- COMMIT_DESC -->
    
    style(map-track-details.component): increased padding bottom
    fix(track-properties.component): activity tab fixed
* **track-properties.component:** activity tab fixed ([ae46a2d](https://github.com/webmappsrl/webmapp-app/commit/ae46a2d9f9efc7c6471dfebd3d62c94c98508493))


### Miscellaneous

* Update map.page.html ([3444622](https://github.com/webmappsrl/webmapp-app/commit/3444622d2c97920938314555826aa32ed70a7746))
<!-- COMMIT_DESC -->
    
    - Removed the condition for disabling layers when there are no current filters
    - Added a new condition for disabling layers when there are current filters and toggleLayerDirective is false and currentLayer is null
* Update subproject ([90f54ea](https://github.com/webmappsrl/webmapp-app/commit/90f54ea75312b3766cbc6bd320f4b3ce40f4c2d8))

## [2.9.1](https://github.com/webmappsrl/webmapp-app/compare/v2.9.0...v2.9.1) (2024-02-29)


### Miscellaneous

* Remove unnecessary code and fix formatting in modal-success component ([546a2b2](https://github.com/webmappsrl/webmapp-app/commit/546a2b20a6b94835a5765aff9584125bb0984122))
<!-- COMMIT_DESC -->
    
    - Removed unused imports and variables
    - Fixed indentation and spacing issues
    - Removed commented out code
* Update geolocation and geoutils services ([044745a](https://github.com/webmappsrl/webmapp-app/commit/044745add6f104e3cb18050a8750b553caca66b7))
* Update register page and save service ([2f4b180](https://github.com/webmappsrl/webmapp-app/commit/2f4b180000a382ecab1e6613331849c4febdee97))
<!-- COMMIT_DESC -->
    
    - Refactored code in the register page to update the metadata object
    - Updated the save service to handle metadata parsing and set locations property in geojson
* Update trackdetail page template and component ([4ff483f](https://github.com/webmappsrl/webmapp-app/commit/4ff483ff526874813bc3c7a4851b70a0b82996fe))

## [2.9.0](https://github.com/webmappsrl/webmapp-app/compare/v2.8.1...v2.9.0) (2024-02-27)


### Features

* **i18n:** Add translations for new points of interest ([d3a9b09](https://github.com/webmappsrl/webmapp-app/commit/d3a9b09cdbd7c1eb492824070ef0dff6449958eb))
<!-- COMMIT_DESC -->
    
    - Added translations for new points of interest categories and descriptions in English and Italian.
    - Updated the translation files `en.ts` and `it.ts`.
    - Translated the following categories: Asphalt, Bitumenduro®, Real dirt, Bar, Mountain passes, Roads to drive (BLUE), Points of interest (GREEN), Dirt roads (ORANGE), Streets to admire (PINK), Other types of Point of interest.
    - Translated the description field.
    - Added translation for the prompt "Do you want to propose your waypoint on the motomappa?" with options "Yes" and "No".
* **map:** add support for multiple POI types in info header oc:2583 ([4b2a95b](https://github.com/webmappsrl/webmapp-app/commit/4b2a95b57391f21e52932016d88b5b40a980db4d))


### Miscellaneous

* Update form component template ([7f08637](https://github.com/webmappsrl/webmapp-app/commit/7f086370a2a1acc24bf6a72dd0efcfd2c4e90529))
<!-- COMMIT_DESC -->
    
    - Refactored the structure of the form component template
    - Improved readability and organization of code
    - Updated HTML tags and attributes for better semantic meaning
    - Fixed minor issues with form field labels and placeholders
* Update form.component.ts and save.service.ts ([e6c803c](https://github.com/webmappsrl/webmapp-app/commit/e6c803cc60d2d3270799799666c8f0226bc62428))
* Update home.page.ts <a href="https://orchestrator.maphub.it/resources/customer-stories/2579" target="_blank" rel="noopener noreferrer">OC[2579]</a> ([a3f36bb](https://github.com/webmappsrl/webmapp-app/commit/a3f36bbd4c6b294b45bbf42c559e621f7ce55051))
<!-- COMMIT_DESC -->
    
    - Added import for Platform from '@ionic/angular'
    - Added import for App from '@capacitor/app'
    - Added private property _backBtnSub$ of type Subscription
    - Added ionViewDidEnter() method to handle back button event and exit the app
    - Added ionViewWillLeave() method to unsubscribe from back button event
* Update RegisterPage component ([5adfee4](https://github.com/webmappsrl/webmapp-app/commit/5adfee40f3844088841c6a066c2d0479c1a5454f))

## [2.8.1](https://github.com/webmappsrl/webmapp-app/compare/v2.8.0...v2.8.1) (2024-02-20)


### Miscellaneous

* **deploy-commands:** updated ([6278031](https://github.com/webmappsrl/webmapp-app/commit/627803168adc54acb2132c1fe25d7008f4b57831))
* enable save to gallery ([a946677](https://github.com/webmappsrl/webmapp-app/commit/a94667780865bc8e6a4f6f8b3ad996785611fab9))
* **gulpfile:** updated ([5388bab](https://github.com/webmappsrl/webmapp-app/commit/5388babd4ef55ea31c4167408a8c8db5b265f92f))
* Refactor cgeojson-feature.ts ([46f48d4](https://github.com/webmappsrl/webmapp-app/commit/46f48d41434f9bb3556d5a13d4e4bdad9c749486))
* Remove LangService provider from settings and profile components ([1b4b278](https://github.com/webmappsrl/webmapp-app/commit/1b4b278f5d20cb649d183f0de64b0f3e71af1bf2))
<!-- COMMIT_DESC -->
    
    - Removed the `providers` property for `LangService` in the `SettingsComponent` and `ProfilePage` files.
## [2.8.0](https://github.com/webmappsrl/webmapp-app/compare/v2.7.0...v2.8.0) (2024-02-12)


### Features

* Replace confPOIFORMS with acquisitionFORM in waypoint modal id:2641 ([dc92106](https://github.com/webmappsrl/webmapp-app/commit/dc92106b6410fd6de6d9f70a744fa61b1f828046))
<!-- COMMIT_DESC -->
    
    Replaced the 'confPOIFORMS' observable with a new 'acquisitionFORM' observable in the waypoint save modal. This change affects both the HTML template and TypeScript component of the modal. Also, added 'confPOIFORMS' to waypoint page for data acquisition.

### Miscellaneous

* add @capacitor-community/keep-awake package ([9b7931c](https://github.com/webmappsrl/webmapp-app/commit/9b7931c67db6352fea938a1c5dd60f59de875609))
<!-- COMMIT_DESC -->
    
    The @capacitor-community/keep-awake package has been added to the project dependencies. This package allows the application to prevent the device from going into sleep mode. The version installed is 4.0.0, which requires a peer dependency of @capacitor/core at version 5.0.0 or higher.
## [2.7.0](https://github.com/webmappsrl/webmapp-app/compare/v2.6.1...v2.7.0) (2024-02-07)


### Features

* Add popup functionality to map page ([38b999e](https://github.com/webmappsrl/webmapp-app/commit/38b999efed09cd3e0cf1005e48564b5880491e8e))
<!-- COMMIT_DESC -->
    
    This commit adds the ability to open a popup on the map page when a feature collection is clicked. The popup displays additional information about the selected feature.
* Add release automation workflow ([004bc16](https://github.com/webmappsrl/webmapp-app/commit/004bc16781f50387128c0308fb1fd8df30dec87e))
* Add support for exporting tracks to GeoJSON, KML, and GPX formats id:2214 ([04bf899](https://github.com/webmappsrl/webmapp-app/commit/04bf899d8bf060b049bd8ba17801a414181387fb))
<!-- COMMIT_DESC -->
    
    - Added dependencies for converting GeoJSON to GPX and KML formats
    - Updated the CGeojsonFeature class to include a method for adding properties
    - Modified the trackdetail module to include export buttons for GeoJSON, KML, and GPX formats
    - Implemented saveFileCallback function in trackdetail page to handle saving and sharing exported files
* Enable fullscreen mode for maps in track and waypoint detail pages ([a3a61a3](https://github.com/webmappsrl/webmapp-app/commit/a3a61a3c29bf13d07a4dcbacad0a213f970d996f))
* **home:** add home layer ([5e485df](https://github.com/webmappsrl/webmapp-app/commit/5e485df7bb6082d84dbb4676e47a25893913324e))
* **overlay:** ui deadline:82 ([9251930](https://github.com/webmappsrl/webmapp-app/commit/9251930e99040be43af23f72d2b10174e72e216b))
* **register:** add waypoint button  id:2226 ([34dfade](https://github.com/webmappsrl/webmapp-app/commit/34dfade5d58398ff854d2da061b1c0eb455879b9))
<!-- COMMIT_DESC -->
    
    - Added a new button to the register page HTML template for adding waypoints.
    - Created a new method in the RegisterPage component called "waypoint" that navigates to the "waypoint" page with the current track as a parameter.
    
    This commit adds functionality to allow users to add waypoints while registering.
* **social-share:** add configurable text ([7544147](https://github.com/webmappsrl/webmapp-app/commit/75441472c46df96cca8536352b5aa81d2b290054))
* update ([6d55ba5](https://github.com/webmappsrl/webmapp-app/commit/6d55ba58244485a1bf59b1d12a7f6f20b89fe76f))

### Bug Fixes

* **details:** close ([84c088d](https://github.com/webmappsrl/webmapp-app/commit/84c088dcb5d5001a79b1a848181117b9d3ea5969))
* **downloadoffline_has_some_problem:** story 1641 ([89b0c6e](https://github.com/webmappsrl/webmapp-app/commit/89b0c6e97c371004e2d3ef48c0242559dfc95322))
* **geolocation:** fix background geolocation ([52ebf01](https://github.com/webmappsrl/webmapp-app/commit/52ebf0144d3bd8e0a132ba20eafb75bed4b81c86))
* **langs:** now set default langs ([d2cf1c9](https://github.com/webmappsrl/webmapp-app/commit/d2cf1c95575e8fde82c535a993417fa539eafdf8))
* **map:** add current track to record ([fc431f0](https://github.com/webmappsrl/webmapp-app/commit/fc431f0066ad8fa53b848242ed0c7b4d8f38f685))
* **map:** add logic to control layer opacity and open track details ([d33f275](https://github.com/webmappsrl/webmapp-app/commit/d33f275e98aee01a1f650de08460e4e07ed2495f))
* **map:** missed icons ([424c59a](https://github.com/webmappsrl/webmapp-app/commit/424c59a6a09ae712cc55f638dc30d86c694b5749))
* **modal-success:** navigate forward by key ([4ffb840](https://github.com/webmappsrl/webmapp-app/commit/4ffb8409c81d243ce9972cadd43b3d03b152c927))
* **page/home:** remove handling set filter ([cf4a1dc](https://github.com/webmappsrl/webmapp-app/commit/cf4a1dce372c1a38212d779125bd7f4f8b45c8a2))
* **profile_shift:** implements ([#1](https://github.com/webmappsrl/webmapp-app/issues/1)) ([7d55c66](https://github.com/webmappsrl/webmapp-app/commit/7d55c6664d48ab12a4e734aa787b1aa7e5095217))
* **sunc/offline:** fix media sync ([bdc9c40](https://github.com/webmappsrl/webmapp-app/commit/bdc9c40a73df0b984a92bab48713947b8c268cca))
* **sync/offline:** fix tracks&pois sync ([f651b49](https://github.com/webmappsrl/webmapp-app/commit/f651b4970f8b42fe8d46f7e976ade0381010d8b2))
* waypoint button ([c8b19f6](https://github.com/webmappsrl/webmapp-app/commit/c8b19f603e9c040e66e8cf82ee2edb5fb0e9ec6d))
<!-- COMMIT_DESC -->
    
    improved button visibility

### Miscellaneous

* Add deploy command for motomappa ([0475fc2](https://github.com/webmappsrl/webmapp-app/commit/0475fc20986c1e634d6132daea9e99e639748a9a))
<!-- COMMIT_DESC -->
    
    Added a new deploy command for the motomappa project.
* Add release-please configuration file ([8cf2be7](https://github.com/webmappsrl/webmapp-app/commit/8cf2be7edd248735ff1947c1f988a06848432788))
* **dotenv:** add dotenv ([abba2d1](https://github.com/webmappsrl/webmapp-app/commit/abba2d1661f7f1bc1f999011e4045a0950798e07))
* **inner-component:** add wm core inner components remove useless code ([cacb6e9](https://github.com/webmappsrl/webmapp-app/commit/cacb6e96493554af9f987b33ddd776cae3dffcb9))
* **profile:** add app version ([5f6eea1](https://github.com/webmappsrl/webmapp-app/commit/5f6eea1144821494266eba1c7d767ff62bcb39ed))
* Remove home module and component ([c06592b](https://github.com/webmappsrl/webmapp-app/commit/c06592be228463a113f6eddb91a4b801522d20e3))
* Remove unnecessary code in release_please.yml ([aff70fc](https://github.com/webmappsrl/webmapp-app/commit/aff70fc4b7a92208092fc06b6e8d1c452b82ad7b))
<!-- COMMIT_DESC -->
    
    The commit removes the code that updates the manifest.json file in the PR branch, as it is no longer needed. This change simplifies the workflow and improves efficiency.
* Remove unnecessary import in home.module.ts ([f92e770](https://github.com/webmappsrl/webmapp-app/commit/f92e7706b8a7565cb4a24846e9cdb67fd37658c4))
* Remove unnecessary ngIf condition in map.page.html id: 2227 ([7251398](https://github.com/webmappsrl/webmapp-app/commit/725139820fbcdda1e74c7daa46c87f30c024f9b7))
* Remove unused code and dependencies in search-bar and home.page components ([c3a2bed](https://github.com/webmappsrl/webmapp-app/commit/c3a2beda6a33089ac1b2bb3d4ca981aa42b085f4))
* Remove unused code in home page ([94834da](https://github.com/webmappsrl/webmapp-app/commit/94834daf3a2c52b2519ceb9ef6466d3bc7fb9292))
<!-- COMMIT_DESC -->
    
    - Removed the `removeTrackFilterEVT` and `removePoiFilterEVT` event listeners from the HTML template.
    - Removed the `toggleTrackFilter` and `removePoiFilter` methods from the TypeScript file.
    
    These changes remove unnecessary code related to track filters and poi filters in the home page.
* remove useless file ([d74087e](https://github.com/webmappsrl/webmapp-app/commit/d74087e2ba27c6e97217c46da841a8db9dafdb7d))
* Update @dwayneparton/geojson-to-gpx version to ^0.0.30 in package-lock.json ([6c29832](https://github.com/webmappsrl/webmapp-app/commit/6c29832834a9d2146f92a565eac479a73669b8d9))
<!-- COMMIT_DESC -->
    
    - Updated "@dwayneparton/geojson-to-gpx" dependency to version "^0.0.30"
    - Updated compileSdkVersion and targetSdkVersion in the Android platform to version 33
    
    chore: Update @dwayneparton/geojson-to-gpx version to ^0.0.30 in package-lock.json
* Update dependencies and Android platform versions ([6c29832](https://github.com/webmappsrl/webmapp-app/commit/6c29832834a9d2146f92a565eac479a73669b8d9))
* update deploy commands ([7858417](https://github.com/webmappsrl/webmapp-app/commit/78584174c9545cc3e399522cf430147f78684589))
* Update deploy-messages.txt ([1f39225](https://github.com/webmappsrl/webmapp-app/commit/1f392255ecd82065970c35eab8ccca131be14e3f))
* Update deploy-messages.txt and gulpfile.js ([c858d6c](https://github.com/webmappsrl/webmapp-app/commit/c858d6c494125930b38df407f6879c7414763b20))
<!-- COMMIT_DESC -->
    
    - Added new deploy messages for versions 2.1.42, 2.1.47, 2.1.48, 2.1.49, 2.1.50, 2.1.51, and 2.2.0
    - Improved general performance and geolocation management system
    - Fixed bug with background location acquisition on some devices
    - Improved display of stages and user interface
    - Increased performance in displaying saved tracks and recording new tracks from selected ones
    - Enhanced data loading with improved performance
    - Fixed registration bug with focus on position during registration process
    - Increased rendering performance of layers and fixed graphical issue during track registration process
    - Improved general performance and elevation graph visualization
* Update downloaded-tracks-box.component.scss, home.page.ts, network.service.ts, and netwotk.reducer.ts ([99261d9](https://github.com/webmappsrl/webmapp-app/commit/99261d911f521dc4f784bd5379f676ba945b8726))
* Update form component and waypoint detail page styles id: 2213 ([c6985b6](https://github.com/webmappsrl/webmapp-app/commit/c6985b674bd8d63820e60a660ae59cb2166a7421))
<!-- COMMIT_DESC -->
    
    - Updated the form component template to display the current form label and field values correctly.
    - Removed unnecessary padding from the waypoint detail page.
* Update form component template and styles id:2141 ([33fd91b](https://github.com/webmappsrl/webmapp-app/commit/33fd91bc12339b8171e9ff8beae12c726b974949))
* Update form.component.html id: 2142 ([627b820](https://github.com/webmappsrl/webmapp-app/commit/627b820cc4601f34dfbee9bd34f2c55af286d923))
<!-- COMMIT_DESC -->
    
    - Removed line separator from ion-item element
    - Added a new ion-item element to display helper text for the current form
* Update global.scss ([d52a5c2](https://github.com/webmappsrl/webmapp-app/commit/d52a5c2762e9f0e192be9b7f2db0477eb0da92a4))
* Update home page styling and deployment commands ([7c925ae](https://github.com/webmappsrl/webmapp-app/commit/7c925aeae05c42bf3c2c39bff890dffa3be5c61f))
<!-- COMMIT_DESC -->
    
    - Updated the styling of the home page to include padding for safe areas on ion-content.
    - Added a new deployment command for project "oman".
* Update home page styling st:2242 ([c5c2129](https://github.com/webmappsrl/webmapp-app/commit/c5c21291f077eab1903be3b9aeb2b27e65ceaaa2))
* Update map page HTML and TypeScript files <a href="https://orchestrator.maphub.it/resources/customer-stories/1932" target="_blank" rel="noopener noreferrer">OC[1932]</a>,1925 ([5f6716b](https://github.com/webmappsrl/webmapp-app/commit/5f6716bc35f5a6ab919af9cbe5107733537bf79a))
<!-- COMMIT_DESC -->
    
    - Added event listener for wmMapOverlayEVT$ in map.page.html
    - Added event listener for lastFilterTypeEvt in map.page.html
    - Updated updateLastFilterType() method in map.page.ts to dispatch setLastFilterType action
* update min sdk ([84de014](https://github.com/webmappsrl/webmapp-app/commit/84de0147c564e0acb38e048f11146efe9088f07b))
* Update minSdkVersion in Android platform ([59ab2b5](https://github.com/webmappsrl/webmapp-app/commit/59ab2b5ee8f1127ab1e28f411e0483ad75fc7b6d))
<!-- COMMIT_DESC -->
    
    The minSdkVersion in the Android platform has been updated from 31 to 28. This change ensures compatibility with a wider range of devices.
* Update package version to 2.1.51 ([c2f8753](https://github.com/webmappsrl/webmapp-app/commit/c2f8753f1a4073d4e7f18e9582fe94ea097cff65))
* Update subproject commit reference ([e8fee34](https://github.com/webmappsrl/webmapp-app/commit/e8fee34a17816d326531734c4f0d2fe66ec0828c))
* Update version object in gulpfile.js ([d865f5d](https://github.com/webmappsrl/webmapp-app/commit/d865f5d6b10697e698268b50f212d4d70f2ead3a))

## [2.6.1](https://github.com/webmappsrl/webmapp-app/compare/v2.6.0...v2.6.1) (2024-02-05)


### Miscellaneous

* Add deploy command for motomappa ([0475fc2](https://github.com/webmappsrl/webmapp-app/commit/0475fc20986c1e634d6132daea9e99e639748a9a))
<!-- COMMIT_DESC -->
    
    Added a new deploy command for the motomappa project.
* Remove unused code in home page ([94834da](https://github.com/webmappsrl/webmapp-app/commit/94834daf3a2c52b2519ceb9ef6466d3bc7fb9292))
* Update @dwayneparton/geojson-to-gpx version to ^0.0.30 in package-lock.json ([6c29832](https://github.com/webmappsrl/webmapp-app/commit/6c29832834a9d2146f92a565eac479a73669b8d9))
<!-- COMMIT_DESC -->
    
    - Updated "@dwayneparton/geojson-to-gpx" dependency to version "^0.0.30"
    - Updated compileSdkVersion and targetSdkVersion in the Android platform to version 33
    
    chore: Update @dwayneparton/geojson-to-gpx version to ^0.0.30 in package-lock.json
* Update dependencies and Android platform versions ([6c29832](https://github.com/webmappsrl/webmapp-app/commit/6c29832834a9d2146f92a565eac479a73669b8d9))
* Update downloaded-tracks-box.component.scss, home.page.ts, network.service.ts, and netwotk.reducer.ts ([99261d9](https://github.com/webmappsrl/webmapp-app/commit/99261d911f521dc4f784bd5379f676ba945b8726))
<!-- COMMIT_DESC -->
    
    - Updated margin-top and top values in downloaded-tracks-box.component.scss
    - Imported Network from @capacitor/network in home.page.ts
    - Replaced fromEvent with from(Network.getStatus()) in network.service.ts
    - Changed initial online state to true in netwotk.reducer.ts
* Update global.scss ([d52a5c2](https://github.com/webmappsrl/webmapp-app/commit/d52a5c2762e9f0e192be9b7f2db0477eb0da92a4))
* Update home page styling and deployment commands ([7c925ae](https://github.com/webmappsrl/webmapp-app/commit/7c925aeae05c42bf3c2c39bff890dffa3be5c61f))
<!-- COMMIT_DESC -->
    
    - Updated the styling of the home page to include padding for safe areas on ion-content.
    - Added a new deployment command for project "oman".
* Update home page styling st:2242 ([c5c2129](https://github.com/webmappsrl/webmapp-app/commit/c5c21291f077eab1903be3b9aeb2b27e65ceaaa2))

## [2.6.1](https://github.com/webmappsrl/webmapp-app/compare/v2.6.0...v2.6.1) (2024-01-11)


### Miscellaneous

* Add deploy command for motomappa ([0475fc2](https://github.com/webmappsrl/webmapp-app/commit/0475fc20986c1e634d6132daea9e99e639748a9a))
<!-- COMMIT_DESC -->
    
    Added a new deploy command for the motomappa project.
* Remove unused code in home page ([94834da](https://github.com/webmappsrl/webmapp-app/commit/94834daf3a2c52b2519ceb9ef6466d3bc7fb9292))
* Update @dwayneparton/geojson-to-gpx version to ^0.0.30 in package-lock.json ([6c29832](https://github.com/webmappsrl/webmapp-app/commit/6c29832834a9d2146f92a565eac479a73669b8d9))
<!-- COMMIT_DESC -->
    
    - Updated "@dwayneparton/geojson-to-gpx" dependency to version "^0.0.30"
    - Updated compileSdkVersion and targetSdkVersion in the Android platform to version 33
    
    chore: Update @dwayneparton/geojson-to-gpx version to ^0.0.30 in package-lock.json
* Update dependencies and Android platform versions ([6c29832](https://github.com/webmappsrl/webmapp-app/commit/6c29832834a9d2146f92a565eac479a73669b8d9))
* Update downloaded-tracks-box.component.scss, home.page.ts, network.service.ts, and netwotk.reducer.ts ([99261d9](https://github.com/webmappsrl/webmapp-app/commit/99261d911f521dc4f784bd5379f676ba945b8726))
<!-- COMMIT_DESC -->
    
    - Updated margin-top and top values in downloaded-tracks-box.component.scss
    - Imported Network from @capacitor/network in home.page.ts
    - Replaced fromEvent with from(Network.getStatus()) in network.service.ts
    - Changed initial online state to true in netwotk.reducer.ts
* Update global.scss ([d52a5c2](https://github.com/webmappsrl/webmapp-app/commit/d52a5c2762e9f0e192be9b7f2db0477eb0da92a4))
* Update home page styling and deployment commands ([7c925ae](https://github.com/webmappsrl/webmapp-app/commit/7c925aeae05c42bf3c2c39bff890dffa3be5c61f))
<!-- COMMIT_DESC -->
    
    - Updated the styling of the home page to include padding for safe areas on ion-content.
    - Added a new deployment command for project "oman".
* Update home page styling st:2242 ([c5c2129](https://github.com/webmappsrl/webmapp-app/commit/c5c21291f077eab1903be3b9aeb2b27e65ceaaa2))

## [2.6.0](https://github.com/webmappsrl/webmapp-app/compare/v2.5.0...v2.6.0) (2023-12-07)


### Features

* Add popup functionality to map page ([38b999e](https://github.com/webmappsrl/webmapp-app/commit/38b999efed09cd3e0cf1005e48564b5880491e8e))
<!-- COMMIT_DESC -->
    
    This commit adds the ability to open a popup on the map page when a feature collection is clicked. The popup displays additional information about the selected feature.
* Add support for exporting tracks to GeoJSON, KML, and GPX formats id:2214 ([04bf899](https://github.com/webmappsrl/webmapp-app/commit/04bf899d8bf060b049bd8ba17801a414181387fb))
* **register:** add waypoint button  id:2226 ([34dfade](https://github.com/webmappsrl/webmapp-app/commit/34dfade5d58398ff854d2da061b1c0eb455879b9))
<!-- COMMIT_DESC -->
    
    - Added a new button to the register page HTML template for adding waypoints.
    - Created a new method in the RegisterPage component called "waypoint" that navigates to the "waypoint" page with the current track as a parameter.
    
    This commit adds functionality to allow users to add waypoints while registering.

### Miscellaneous

* Remove unnecessary ngIf condition in map.page.html id: 2227 ([7251398](https://github.com/webmappsrl/webmapp-app/commit/725139820fbcdda1e74c7daa46c87f30c024f9b7))
* Update form component and waypoint detail page styles id: 2213 ([c6985b6](https://github.com/webmappsrl/webmapp-app/commit/c6985b674bd8d63820e60a660ae59cb2166a7421))
* Update form component template and styles id:2141 ([33fd91b](https://github.com/webmappsrl/webmapp-app/commit/33fd91bc12339b8171e9ff8beae12c726b974949))
<!-- COMMIT_DESC -->
    
    - Removed unnecessary line break in the form label
    - Added helper text for form fields
    - Adjusted padding for the form field helper text
* Update form.component.html id: 2142 ([627b820](https://github.com/webmappsrl/webmapp-app/commit/627b820cc4601f34dfbee9bd34f2c55af286d923))

## [2.5.0](https://github.com/webmappsrl/webmapp-app/compare/v2.4.0...v2.5.0) (2023-11-30)


### Features

* **home:** add home layer ([5e485df](https://github.com/webmappsrl/webmapp-app/commit/5e485df7bb6082d84dbb4676e47a25893913324e))

### Miscellaneous

* **profile:** add app version ([5f6eea1](https://github.com/webmappsrl/webmapp-app/commit/5f6eea1144821494266eba1c7d767ff62bcb39ed))
* Remove home module and component ([c06592b](https://github.com/webmappsrl/webmapp-app/commit/c06592be228463a113f6eddb91a4b801522d20e3))
* Remove unnecessary import in home.module.ts ([f92e770](https://github.com/webmappsrl/webmapp-app/commit/f92e7706b8a7565cb4a24846e9cdb67fd37658c4))
<!-- COMMIT_DESC -->
    
    The import statement for HomeModule was removed as it was not being used in the code. This change helps to clean up the module and improve code readability.
* Remove unused code and dependencies in search-bar and home.page components ([c3a2bed](https://github.com/webmappsrl/webmapp-app/commit/c3a2beda6a33089ac1b2bb3d4ca981aa42b085f4))
* Update minSdkVersion in Android platform ([59ab2b5](https://github.com/webmappsrl/webmapp-app/commit/59ab2b5ee8f1127ab1e28f411e0483ad75fc7b6d))
<!-- COMMIT_DESC -->
    
    The minSdkVersion in the Android platform has been updated from 31 to 28. This change ensures compatibility with a wider range of devices.
## [2.4.0](https://github.com/webmappsrl/webmapp-app/compare/v2.3.0...v2.4.0) (2023-11-24)


### Features

* **social-share:** add configurable text ([7544147](https://github.com/webmappsrl/webmapp-app/commit/75441472c46df96cca8536352b5aa81d2b290054))

### Miscellaneous

* **dotenv:** add dotenv ([abba2d1](https://github.com/webmappsrl/webmapp-app/commit/abba2d1661f7f1bc1f999011e4045a0950798e07))
* **inner-component:** add wm core inner components remove useless code ([cacb6e9](https://github.com/webmappsrl/webmapp-app/commit/cacb6e96493554af9f987b33ddd776cae3dffcb9))
* update deploy commands ([7858417](https://github.com/webmappsrl/webmapp-app/commit/78584174c9545cc3e399522cf430147f78684589))
* update min sdk ([84de014](https://github.com/webmappsrl/webmapp-app/commit/84de0147c564e0acb38e048f11146efe9088f07b))

## [2.3.0](https://github.com/webmappsrl/webmapp-app/compare/v2.2.4...v2.3.0) (2023-10-31)


### Features

* update ([6d55ba5](https://github.com/webmappsrl/webmapp-app/commit/6d55ba58244485a1bf59b1d12a7f6f20b89fe76f))
## [2.2.4](https://github.com/webmappsrl/webmapp-app/compare/v2.2.3...v2.2.4) (2023-10-27)


### Miscellaneous

* Update map page HTML and TypeScript files <a href="https://orchestrator.maphub.it/resources/customer-stories/1932" target="_blank" rel="noopener noreferrer">OC[1932]</a>,1925 ([5f6716b](https://github.com/webmappsrl/webmapp-app/commit/5f6716bc35f5a6ab919af9cbe5107733537bf79a))
<!-- COMMIT_DESC -->
    
    - Added event listener for wmMapOverlayEVT$ in map.page.html
    - Added event listener for lastFilterTypeEvt in map.page.html
    - Updated updateLastFilterType() method in map.page.ts to dispatch setLastFilterType action
## [2.2.3](https://github.com/webmappsrl/webmapp-app/compare/v2.2.2...v2.2.3) (2023-10-06)


### Miscellaneous

* Update deploy-messages.txt ([1f39225](https://github.com/webmappsrl/webmapp-app/commit/1f392255ecd82065970c35eab8ccca131be14e3f))
<!-- COMMIT_DESC -->
    
    - Improved rendering performance of layers
    - Fixed graphical issue in elevation chart
    - Improved visualization of elevation chart
    - Improved visualization of layers
    - Fixed minor bugs
## [2.2.2](https://github.com/webmappsrl/webmapp-app/compare/v2.2.1...v2.2.2) (2023-10-06)


### Bug Fixes

* **map:** add logic to control layer opacity and open track details ([d33f275](https://github.com/webmappsrl/webmapp-app/commit/d33f275e98aee01a1f650de08460e4e07ed2495f))
<!-- COMMIT_DESC -->
    
    This commit adds logic to control the opacity of a layer on the map and opens the track details component. The opacity is set based on whether the current layer has edges or not. If there are edges, the opacity is set to false; otherwise, it is set to true.
## [2.2.1](https://github.com/webmappsrl/webmapp-app/compare/v2.2.0...v2.2.1) (2023-10-06)


### Miscellaneous

* Add release-please configuration file ([8cf2be7](https://github.com/webmappsrl/webmapp-app/commit/8cf2be7edd248735ff1947c1f988a06848432788))
<!-- COMMIT_DESC -->
    
    This commit adds a new release-please configuration file, `release-please-config.json`, which includes an extra-file entry for the `core/version.json` file. The JSON path `$version` is specified to extract the version information. This change follows semantic versioning guidelines.
* Remove unnecessary code in release_please.yml ([aff70fc](https://github.com/webmappsrl/webmapp-app/commit/aff70fc4b7a92208092fc06b6e8d1c452b82ad7b))
* remove useless file ([d74087e](https://github.com/webmappsrl/webmapp-app/commit/d74087e2ba27c6e97217c46da841a8db9dafdb7d))
* Update deploy-messages.txt and gulpfile.js ([c858d6c](https://github.com/webmappsrl/webmapp-app/commit/c858d6c494125930b38df407f6879c7414763b20))
* Update subproject commit reference ([e8fee34](https://github.com/webmappsrl/webmapp-app/commit/e8fee34a17816d326531734c4f0d2fe66ec0828c))
* Update version object in gulpfile.js ([d865f5d](https://github.com/webmappsrl/webmapp-app/commit/d865f5d6b10697e698268b50f212d4d70f2ead3a))

## [2.2.0](https://github.com/webmappsrl/webmapp-app/compare/v2.1.50...v2.2.0) (2023-10-03)


### Features

* Add release automation workflow ([004bc16](https://github.com/webmappsrl/webmapp-app/commit/004bc16781f50387128c0308fb1fd8df30dec87e))
<!-- COMMIT_DESC -->
    
    This commit adds a new GitHub Actions workflow file, `release_please.yml`, which automates the release process. The workflow is triggered on pushes to the `main` branch and grants necessary permissions for writing contents and pull requests. It uses the `google-github-actions/release-please-action@v3` action to generate releases based on semantic versioning rules for a Node package named `release-please-action`. The changelog types are defined as "feat" (Features), "fix" (Bug Fixes), and "chore" (Miscellaneous). Pull request titles follow the pattern "release${component} ${version}", and include a robot emoji with an updated changelog header.

### Bug Fixes

* **conf:** auth ([c164e1c](https://github.com/webmappsrl/webmapp-app/commit/c164e1c38b8c3501d629aa4dae2b5d2191cdd338))
* **details:** close ([84c088d](https://github.com/webmappsrl/webmapp-app/commit/84c088dcb5d5001a79b1a848181117b9d3ea5969))
* **downloadoffline_has_some_problem:** story 1641 ([89b0c6e](https://github.com/webmappsrl/webmapp-app/commit/89b0c6e97c371004e2d3ef48c0242559dfc95322))
* **geolocation:** fix background geolocation ([52ebf01](https://github.com/webmappsrl/webmapp-app/commit/52ebf0144d3bd8e0a132ba20eafb75bed4b81c86))
* **itinerary:** remove option menu ([e9f20bc](https://github.com/webmappsrl/webmapp-app/commit/e9f20bc29d57ad2fe828f33b02ee22d237532333))
* **langs:** now set default langs ([d2cf1c9](https://github.com/webmappsrl/webmapp-app/commit/d2cf1c95575e8fde82c535a993417fa539eafdf8))
* **map:** add current track to record ([fc431f0](https://github.com/webmappsrl/webmapp-app/commit/fc431f0066ad8fa53b848242ed0c7b4d8f38f685))
* **map:** missed icons ([424c59a](https://github.com/webmappsrl/webmapp-app/commit/424c59a6a09ae712cc55f638dc30d86c694b5749))
* **modal-success:** navigate forward by key ([4ffb840](https://github.com/webmappsrl/webmapp-app/commit/4ffb8409c81d243ce9972cadd43b3d03b152c927))
* **page/home:** remove handling set filter ([cf4a1dc](https://github.com/webmappsrl/webmapp-app/commit/cf4a1dce372c1a38212d779125bd7f4f8b45c8a2))
* **profile_shift:** implements ([#1](https://github.com/webmappsrl/webmapp-app/issues/1)) ([7d55c66](https://github.com/webmappsrl/webmapp-app/commit/7d55c6664d48ab12a4e734aa787b1aa7e5095217))
* **profile:** fix page ([568d759](https://github.com/webmappsrl/webmapp-app/commit/568d7597258e408257cadbfb4286088e503e9c1a))
* **profile:** visualizzazione i miei downloads ([93b26ce](https://github.com/webmappsrl/webmapp-app/commit/93b26ceb3881bd090153992440ff5d322b788e54))
* **sunc/offline:** fix media sync ([bdc9c40](https://github.com/webmappsrl/webmapp-app/commit/bdc9c40a73df0b984a92bab48713947b8c268cca))
* **sync/offline:** fix tracks&pois sync ([f651b49](https://github.com/webmappsrl/webmapp-app/commit/f651b4970f8b42fe8d46f7e976ade0381010d8b2))
<!-- COMMIT_DESC -->
    
    
    ...

### Miscellaneous

* Update package version to 2.1.51 ([c2f8753](https://github.com/webmappsrl/webmapp-app/commit/c2f8753f1a4073d4e7f18e9582fe94ea097cff65))
<!-- COMMIT_DESC -->
    
    This commit updates the package.json file, specifically the "version" field, from 0.0.1 to 2.1.51 in accordance with semantic versioning guidelines.
## changelog webmapp APP

**APP VERSION:**

- PEC: **12.1.15**

- SICAI: **12.1.17**

- UCVS: **12.1.28**

- FUMAIOLOSENTIERI: **12.1.28**

- GAVORRANO:**12.1.15**

- CAMMINI: **12.1.17**

- IR: **2.1.21**

---

**2.1.23**

- [1F]()(fix):fix grafici sul componente poi

---

**2.1.22**

- [1F]()(feature): aggiunta la traduzione francese della app

---

**2.1.21**

- [1F]()(feature): aggiunta flow line quote
- [1F]()(feature): aggiunta colorazione alle descrizioni
- [1F]()(improve): migliorato il caricamento delle tracks, inserendo livelli diversi di dettaglio in base allo zoom

---

**12.1.20**

- [1F]()(fix/track): eliminato il menu opzioni (tre puntini)
- [2F]()(fix/track/download): aggiunta possibilità di interrompere download
- [3F]()(fix/track/share): fixato bug condivisione su nuove versioni di android [fixx](https://docs.google.com/document/d/1CrE5wY48apcjg6jT-kz-mIE73JzPv3XtLRrxO8fhXCA/edit#heading=h.baz7r5xjckfp)
- [4F]()(fix/preferiti): i preferiti ora sono visualizzati correttamente quando l'utente è loggato
- [5F]()(fix/settings): aggiunta la sezione settings all'interno del profilo che comprende il logout e la scelta lingua
- [6F]()(fix/login): la pagina profilo visualizza correttamente il contenuto in base allo stato di autenticazione
- [7F]()(fix/donwload_preferiti): l'icona che invita al click ora è cliccabile
- [3F]()(feature/tiles): aggiunto switch tiles webmapp/satellitare
- ***

  **12.1.19**

- [1R]()(refactoring): creato un componente per la visualizzazione delle gallery presenti in dettagli mappa e track

---

**12.1.18**

|                  | [1F]() | [2F]() | [3F]() | [4F]() | [5F]() | [6F]() | [7F]() | [8F]() | [9F]() |
| ---------------- | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| PEC              |        |        |        |        |        |        |        |        |        |
| SICAI            |        |        |        |        |        |        |        |        |        |
| UCVS             |        |        |        |        |        |        |        |        |        |
| FUMAIOLOSENTIERI |        | X      | X      | X      | X      | X      |        | X      | X      |
| GAVORRANO        |        |        |        |        |        |        |        |        |        |

- [1F]()(feature): aggiunto nella home il box_type track

- [2F]()(feature): abilitata la registrazione percorso

- [3F]()(feature): abilitata l'autenticazione

- [4F]()(feature): abilitata la sezione preferiti

- [5F]()(feature): inseriti filtri sui punti di interesse

- [6F]()(feature): aggiunta clusterizzazione sui punti di interesse

- [7F]()(feature): aggiunto il componente audio nei dettagli del percorso e del punti di interess

- [8F]()(feature): aggiunta la traduzione inglese della UI

- [9F]()(feature): aggiunto un alert di prossimita per i punti di interesse vicini alla posizione dell' utente

- [1R]()(refactoring): ora i poi hanno come categoria le tassonomie a loro associate e il marker ha una image predefinita legata alla categoria

---

**12.1.17**

-[FIX]()(fix):risolto bug inerente ad alcune vecchie versioni di android/ios che non permetteva la corretta visualizzazione della mappa

---

**12.1.16**

- (fine tuning): stroke width delle tracks ora il minimo è rappresentato da 1 e il massimo da 8

- (fix): aggiunto l'attribution sulla mappa generale e su quella percorso

- (fix): aggiunto lo scale sulla mappa generale e su quella percorso

- (fix): aggiunto un alert di conferma sull' eliminazione delle tracce scaricate

---

**12.1.15**

- (fine tuning): REF

- (fix): visualizzazione FLAGS

---

**12.1.14**

- (feature): aggiunti start e end flags sulla mappa layers/generale.

- (feature): aggiunta ref sulla mappa layers/generale.

- (feature): aggiunta bussola sulla pagina itinerario

- (feature): aggiunta pagina di progetto

- (feature): aggiunta localizzazione

- (feature): migliorato il sistema di navigazione ora integrato nella pagina itinerario

- (fix): aggiunti start e end nei dettagli tecnici di una app, allineati i dettagli tecnici con la webapp

---
