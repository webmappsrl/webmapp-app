# Changelog

## [3.1.0](https://github.com/webmappsrl/webmapp-app/compare/v3.0.8...v3.1.0) (2025-06-16)


### Features

* **github-actions:** ✨ add workflow to enrich changelog with commit descriptions ([e0c3101](https://github.com/webmappsrl/webmapp-app/commit/e0c3101fe8a06631b60ac16916cc4f483c0b1908))
<!-- COMMIT_DESC -->
    
    - Created a new GitHub Actions workflow file `enrich-changelog.yml` to automate the process of enriching the changelog.
    - Configured the workflow to trigger on push events to the `main` branch.
    - Implemented steps to:
      - Checkout the repository with full history.
      - Setup Git with a default user for commits.
      - Execute the `enrich-changelog-with-body.sh` script to append commit descriptions to `CHANGELOG.md`.
      - Commit and push changes if the changelog was updated.
    
    feat(script): ✨ add script for appending commit bodies to changelog
    
    - Added `enrich-changelog-with-body.sh` script to process each line in `CHANGELOG.md`.
    - Identifies commit hashes within the changelog, retrieves their full commit messages, and appends the body (excluding the first line) to the changelog.
    - Ensures proper formatting by indenting each line of the commit body for markdown compatibility.
    - Outputs a message indicating successful enrichment of `CHANGELOG.md`.
    
    - feat: Aggiungi proprietà opzionale 'debug' all'interfaccia Environment
    - feat: Aggiungi tipo UIEvent per gestire eventi dell'interfaccia utente
* check all complete by filter values ([2dfed99](https://github.com/webmappsrl/webmapp-app/commit/2dfed9993369bc45bf27ae752643c2791a3d0609))

* add direction.svg and update font styles in 75.css ([3775ccc](https://github.com/webmappsrl/webmapp-app/commit/3775ccc691ec166f75a2fb2414bab2e956d5a18a))
<!-- COMMIT_DESC -->
    
    - Added a new SVG file for displaying directions
    - Updated font family and size in various sections of the CSS file
    
    - Introduce a new GitHub Actions workflow to automate releases for minor version updates.
    - The workflow triggers on pushes to branches that match the pattern 'v[0-9]+.[0-9]+'.
    - Permissions are set to allow writing to contents and pull requests.
    - Utilize the Release Please Action to manage the release process, specifying `node` as the release type and `webmapp-app` as the package name.
    - Define changelog sections for features, bug fixes, and miscellaneous updates.
    - Customize the pull request title and header for clarity and automation acknowledgment.
    
    - change appId from 33 to 52 for environment updates
    - add new shard configuration for 'cargdev' with necessary endpoints
<!-- COMMIT_DESC -->
    
    - Change page in 'map' when ugcOpened is true
    - Add wm-home-ugc in mapDetails
    
    - ✨ feat(map): add custom tile layer support
    - introduce addTileLayer method for adding tile layers with custom source
    - utilize CustomTileSource for enhanced configuration options
<!-- COMMIT_DESC -->
    
    - feat(utils): ✨ add maxZoom parameter to initVectorTileLayer function
    - Introduced a new parameter `maxZoom` with a default value of 13 to the `initVectorTileLayer` function.
    - Updated the function signature and documentation to reflect the addition of the `maxZoom` parameter.
    - Integrated `maxZoom` into the `TileSource` configuration to limit the maximum zoom level for vector tiles.
    
    - 💄 style(map): update ion-fab display property
    - set display to block for ion-fab to ensure proper layout
<!-- COMMIT_DESC -->
    
    This commit adds support for displaying embedded elements in the POI properties component. The embedded element is conditionally rendered based on the presence of the "embeddedElement" property.
    
    chore: Update inner component in poi-properties template
    
    Refactor inner component tag with new attributes for better functionality.
<!-- COMMIT_DESC -->
    
    - Updated the wm-core submodule reference to the latest commit to incorporate recent changes and improvements.
    - Ensures the main project is using the most up-to-date version of the wm-core submodule.
* Update 75.css ([ec60fbc](https://github.com/webmappsrl/webmapp-app/commit/ec60fbce04f7c6beaf76003d747dcb913a15d583))
<!-- COMMIT_DESC -->
    
    - Increase font size for wm-track-related-poi ion-button
    - Set height to 36px for wm-track-related-poi ion-button
    
    - Added translations for Italian, English, and French languages in app.module.ts
    - Updated the APP_TRANSLATION provider in app.module.ts to include the new translations
    - Removed unused imports and variables in map-details.component.ts
    - Imported the skip operator from rxjs/operators in map-details.component.ts
    
    * chore: Update conf and ecPoi.properties parameters name <a href="https://orchestrator.maphub.it/resources/customer-stories/5452" target="_blank" rel="noopener noreferrer">OC[5452]</a>
    
    * chore: update test e2e
    
    * Updated submodule core/src/app/shared/wm-core
* update font families in theme CSS ([b596835](https://github.com/webmappsrl/webmapp-app/commit/b596835ccbaca1efd53e8dfcc7208fc0e336f2ca))
<!-- COMMIT_DESC -->
    
    - Updated the font families for title and utility in the theme CSS file
    - Changed single quotes to double quotes for consistency
    - Adjusted color and font weight for feature details title
    - Modified color for tab button and search bar icons
    - Aligned elements in track properties section
    
    chore: Update .vscode/settings.json
    
    - Enable format on save
    - Set singleQuote option to true in Prettier configuration
    - Disable adding public modifier if missing in TypeScript code organization
    - Disable adding region caption to region end in TypeScript code organization
    - Enable organizing imports on save in TypeScript code organization
    - Group properties with decorators in TypeScript code organization
    
    chore: Update map page HTML, SCSS, and TypeScript files
    
    - Added [class.full-details] binding to ion-content in map.page.html
    - Added styles for .bottom-right and .ol-zoom classes in map.page.scss
    - Updated imports and added mapDetailsStatus selector in map.page.ts
    
    chore: Update map-details component styles
    
    - Set the height of wm-map-details to inherit instead of 100%
    - Add a style rule to hide ion-col:nth-of-type(2) inside wm-status-filter
    - Remove unnecessary padding and margin rules from ion-card-content
    
    feat: Modify map details status handling
    
    - Add a TODO comment explaining the desired changes to the status handling
    - Dispatch actions based on different status values in ngAfterViewInit()
    - Add new cases for 'full' and 'toggle' statuses
    - Replace calls to open(), onlyTitle(), and background() with dispatching actions
    
    * chore: Update map page HTML and SCSS
    
    - Updated the ion-content element in map.page.html to use [ngClass] instead of [class.full-details] and [class.only-title]
    - Added a new class .has-feature-in-viewport in map.page.scss with a transform property for .bottom-right:first-of-type
    - Updated map.page.ts to include the hasFeatureInViewport$ observable from the store
    
    * chore: Update map page styling
    
    - Changed class name from "has-feature-in-viewport" to "move-bottom"
    - Updated CSS rules for the new class name
* Update map-details.component.scss, map.page.html, and tabs.page.ts <a href="https://orchestrator.maphub.it/resources/customer-stories/5298" target="_blank" rel="noopener noreferrer">OC[5298]</a> ([#113](https://github.com/webmappsrl/webmapp-app/issues/113)) ([f342d42](https://github.com/webmappsrl/webmapp-app/commit/f342d42f8189fce2edc3d9585127b5f58ec9b008))
<!-- COMMIT_DESC -->
    
    - Added styles for wm-image-detail component in map-details.component.scss
    - Updated conditional rendering of header div in map.page.html based on currentEcImageGalleryIndex$ value
    - Updated queryParams object in tabs.page.ts to include the layer parameter
    
    * chore: Update poi-properties component <a href="https://orchestrator.maphub.it/resources/customer-stories/5275" target="_blank" rel="noopener noreferrer">OC[5275]</a>
    
    - Added ion-label to display distance from current location
    - Added wm-poi-types-badges to display poi types
    - Added wm-get-directions component
    - Updated styling for ion-label and wm-poi-properties-info
    
    * chore: Update poi-properties.component.html
    
    Refactor the code to improve readability and maintainability. Specifically, update the ngIf condition for displaying the description in wm-tab-description component.
    
    * chore: Update map-details.component.scss and map.page.scss <a href="https://orchestrator.maphub.it/resources/customer-stories/5289" target="_blank" rel="noopener noreferrer">OC[5289]</a>
    
    - Commented out position absolute in map-details.component.scss
    - Commented out position absolute and arrow buttons in map.page.html
    - Updated styles for webmapp-pagepoi-info-header-title in map.page.scss
    
    - Added surge-ville command to deploy the project to 75.geohub.ville.surge.sh
    - Updated the close button color in map-details.component.html
    - Adjusted the position of the close button in map-details.component.scss
    - Changed the color of icons in map.page.html for better visibility
    - Updated font styles and sizes in 75.css for improved readability
    
    - Added surge-ville-uat script for deploying to UAT environment
    - Added surge-ville-dev script for deploying to development environment
    - Updated theme styles to include new icons for home, map, and user
* update tests e2e ([c79bd16](https://github.com/webmappsrl/webmapp-app/commit/c79bd16dc0af8f693e18a73c083eb7431b4d61e7))
<!-- COMMIT_DESC -->
    
    - Hide pre-title in POI header
    - Adjust font family, size, and weight for POI title
    - Remove ion-title from card header when it contains wm-poi-properties
    - Update font family and color for POI properties labels
    
    - Added "display: block" to position the ion-card element correctly
    - Updated selector for ::after pseudo-element in wm-map-details component
    chore: Update theme CSS for wm-map-details component
    
    - Added "display: block" to position the ion-card element correctly
    - Updated selector for ::after pseudo-element in wm-map-details component
    
    Updates webmapp font files to include new icons such as swimming, binoculars, and restaurant. Updates associated CSS to reflect new icon classes.
    
    Implements security improvements through updated submodule reference.
* **wm-core:** bump to 02473e8 ([4a6f54b](https://github.com/webmappsrl/webmapp-app/commit/4a6f54bd124abca18d7ca833c404d781f1587941))
<!-- COMMIT_DESC -->
    
    - 💄 style(changelog): remove extra newlines
    
    - feat(auth): ✨ handle 401 error by triggering logout process
    - Added a new effect `logoutByError$` to handle `AuthActions.loadAuthsFailure` specifically for 401 errors.
    - Enhanced existing error handling in `loadAuth$` effect to check for 401 status, logging the error and dispatching `loadAuthsFailure`.
    - When a 401 error is caught, the new effect will trigger a user data clearance process, ensuring proper logout flow.
    - Improved code readability by formatting imports and updating error handling logic.
    
    - refactor(utils): ♻️ rename parameter in isValidWmFeature function
    Renamed the parameter `data` to `feature` in the `isValidWmFeature` function to improve code readability and clarity. This change aligns the parameter name with its usage context and makes the function more intuitive for developers.
    
    - refactor(modal-ugc-uploader): ♻️ improve code readability and maintainability
    - Removed the `changeDetection` strategy to simplify the component configuration. A TODO comment was added for future consideration.
    - Reformatted `_deserializeProperties` method for better readability by breaking long method signatures into multiple lines.
    - Applied similar formatting improvements to the handling of `geojsonFeature` extraction for consistent code style.
    
    - refactor(modal-ugc-uploader): ♻️ update feature validation and extraction logic
    - Replaced `Feature` import with `FeatureCollection` from 'geojson'.
    - Added `isValidWmFeature` import from '@wm-core/utils/features'.
    - Updated `_deleteUnnecessaryProperties` to retain and assign `owner_id`.
    - Renamed `_deserializeProperties` to `_deserializeKmlProperties`.
    - Removed `_isValidGeoJsonFeature` and moved its logic to `isValidWmFeature`.
    - Replaced `_getGeojsonFeature` with `_extractWmFeatureFromFeatureCollection`.
    - Updated logic to handle GPX and KML conversions using new methods.
    
    chore(utils): ✨ add isValidWmFeature function
    
    - Created `isValidWmFeature` function in `features.ts` for validating `WmFeature`.
    - Ensures that the feature has a valid type, geometry, and coordinates.
    - TODO: Consider moving this function to `wm-types`.
    
    fix(localForage): 🐛 use isValidWmFeature for feature validation
    
    - Updated `saveUgc` function to use `isValidWmFeature` for validation before proceeding.
    - Ensures consistent feature validation across modules.
    
    - refactor(modal-ugc-uploader): ♻️ consolidate form error handling and save function
    Replaced individual `_addFormError` and `_removeFormError` methods with newly created utility functions `addFormError` and `removeFormError` to streamline form error handling. This enhances code readability and reduces redundancy.
    
    Additionally, refactored the `saveUgcTrack` and `saveUgcPoi` calls into a single `saveUgc` function. This simplifies the logic by consolidating the save operations for different geometry types into one function, promoting code reuse and maintainability.
    
    Refined the process of extracting a GeoJSON feature from parsed GPX or KML content by introducing `_getGeojsonFeature` to minimize repetitive code and improve clarity.
    
    This refactoring aims to make the component code cleaner and more maintainable without altering existing functionalities.
    
    - ♻️ refactor(component): rename and update ugc uploader component
    - rename ModalUgcTrackUploaderComponent to ModalUgcUploaderComponent
    - update component logic to handle both track and poi features
    - add photo handling capabilities
    - adjust form and geometry handling functions
    
    🔧 chore(component): add support for point geometry and photo uploads
    
    - introduce Point geometry support in feature processing
    - add methods for photo handling and validation
    
    ♻️ refactor(styles): update styles for modal-ugc-uploader component
    
    - rename styles to match new component name
    - add styling for map container and padding adjustments
    
    💄 style(image-picker): enhance border style with fallback
    
    - add fallback colors for border variables to ensure consistency across themes
    
    - 🐛 fix(geobox-map): update reloadCustomTracks condition (#99)
* **wm-core:** changelog for bump to 8126351 ([ea6c7c5](https://github.com/webmappsrl/webmapp-app/commit/ea6c7c5ba5639ba3a29392b53b58f1490ed21759))
<!-- COMMIT_DESC -->
    
    - ...
    
    - refactor(home-result): ♻️ unify tab selection state management <a href="https://orchestrator.maphub.it/resources/customer-stories/5634" target="_blank" rel="noopener noreferrer">OC[5634]</a>
    - Replaced `showResultType$` with `showResultTabSelected$` to streamline tab selection logic.
    - Updated HTML references to use `showResultTabSelected$`.
    - Removed `BehaviorSubject` and `Subscription` for result type, leveraging NgRx store state instead.
    - Added `setHomeResultTabSelected` action to manage tab state changes.
    - Introduced effects to initialize or modify tab selection based on specific conditions:
      - Set to 'pois' when last filter type is 'pois'.
      - Set to 'pois' if track count is zero.
      - Default to 'tracks' when opening downloads.
    - Ensured consistent tab state initialization in `home` component.
    - Adjusted reducer and selector to handle `homeResultTabSelected` state.
    
    - style(home-result): 🎨 reformat observable pipelines for readability
    - Adjust spacing and indentation in observable pipelines for better readability.
    - Ensure consistent formatting with trailing commas and line breaks.
    - Maintain existing functionality while improving code clarity and style.
    
    - refactor(utils): ♻️ change Environment type to any in initializeConsoleOverride
    - Updated the `initializeConsoleOverride` function to use `any` type for the `environment` parameter.
    - This change allows for greater flexibility in handling different types of environment configurations.
    
    - refactor(auth): ♻️ extract setAccessToken function to avoid redundancy
    - Moved localStorage.setItem('access_token', user.access_token) into a dedicated setAccessToken function
    - Called setAccessToken function in relevant reducer cases to streamline code
    - Improved code maintainability and readability by reducing repetition of the same logic across different parts of the reducer
* **wm-types:** changelog for bump to abe7232 ([fcf3a21](https://github.com/webmappsrl/webmapp-app/commit/fcf3a21d93c71e7e69d4f68cb90fb2f2c60de8b9))
<!-- COMMIT_DESC -->
    
    - feat(environment): ✨ add optional debug flag to Environment interface
    - Introduced a new optional `debug` boolean property in the `Environment` interface to allow for enhanced configurability.
    - This change supports scenarios where debugging features need to be toggled without affecting production settings.
    
    - Added `changelog-notes-type: github` to both `release_please.yml` and `release_please_minor.yml` workflows
    - Ensures that changelog notes are generated using GitHub's format
    - Aids in maintaining consistency and clarity in release documentation

- check all complete by filter values ([2dfed99](https://github.com/webmappsrl/webmapp-app/commit/2dfed9993369bc45bf27ae752643c2791a3d0609))
- **ci:** ✨ add release workflow for minor versions ([3f86c15](https://github.com/webmappsrl/webmapp-app/commit/3f86c15f17c3d85a528fe606e08e043a2bc31275))
<!-- COMMIT_DESC -->
    
    - Introduce a new GitHub Actions workflow to automate releases for minor version updates.
    - The workflow triggers on pushes to branches that match the pattern 'v[0-9]+.[0-9]+'.
    - Permissions are set to allow writing to contents and pull requests.
    - Utilize the Release Please Action to manage the release process, specifying `node` as the release type and `webmapp-app` as the package name.
    - Define changelog sections for features, bug fixes, and miscellaneous updates.
    - Customize the pull request title and header for clarity and automation acknowledgment.
    
    Add test for tracks edges

- Management of Map details status, added test e2e <a href="https://orchestrator.maphub.it/resources/customer-stories/5500" target="_blank" rel="noopener noreferrer">OC[5500]</a> ([#127](https://github.com/webmappsrl/webmapp-app/issues/127)) ([b2af206](https://github.com/webmappsrl/webmapp-app/commit/b2af206af304a2edff04a1f20714c33bcb87391c))
<!-- COMMIT_DESC -->
    
    * fix: Management of Map details status, added test e2e
    
    * ...
### Bug Fixes

- Aggiunto componente wm-updated-at per visualizzare la data di aggiornamento nei titoli delle proprietà UGC e delle tracce. <a href="https://orchestrator.maphub.it/resources/customer-stories/5331" target="_blank" rel="noopener noreferrer">OC[5331]</a> ([b035933](https://github.com/webmappsrl/webmapp-app/commit/b035933758d8b9ef2886867c97c0369c7671a027))
### Bug Fixes

- Updated submodule core/src/app/shared/wm-core ([8105af2](https://github.com/webmappsrl/webmapp-app/commit/8105af2158c43ff4660b60a94763dc6a11d1eef4))
- handling generate app with shard ([918af1b](https://github.com/webmappsrl/webmapp-app/commit/918af1b659a770bbae2d8ab8fada926b56f092aa))
<!-- COMMIT_DESC -->
    
    - Updated the import statement in test-utils.ts to include openLayer and openTrack functions.
    - Refactored the code in map-details.component.ts to use the updated openLayer and openTrack functions from test-utils.ts.
    - Changed the click event handler in map-details.component.html to call the back() function instead of none().
    - Added a new function back() in map-details.component.ts to handle navigating back from the details page.
    - Modified the logic in MapPage class in map.page.ts to dispatch setMapDetailsStatus with 'background' status when there is no popup.
    
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
### Miscellaneous

- Update subproject commit reference ([de21d37](https://github.com/webmappsrl/webmapp-app/commit/de21d373cecd849e8c994b30f668ae8be57aaf9c))

- disable form when add photos <a href="https://orchestrator.maphub.it/resources/customer-stories/4104" target="_blank" rel="noopener noreferrer">OC[4104]</a> ([239af5f](https://github.com/webmappsrl/webmapp-app/commit/239af5f9b086ebe877993aaba02023d5f4ecc3ad))
<!-- COMMIT_DESC -->
    
    - Fixed a bug in the save button's disabled state in modal-save.component.html
    - Added private methods _addFormError and _removeFormError to handle form errors in modal-save.component.ts
    - Updated addPhotos method to handle photo loading and validation in both modal-save.component.ts and modal-waypoint-save.component.ts
- Update map page HTML ([3bf9737](https://github.com/webmappsrl/webmapp-app/commit/3bf97379f96bb90f9da902745f7a066f76227385))
<!-- COMMIT_DESC -->
    
    - Added event listener for opening popups
    - Adjusted indentation and spacing for better readability
- Add PR test workflow ([#100](https://github.com/webmappsrl/webmapp-app/issues/100)) ([996bb4a](https://github.com/webmappsrl/webmapp-app/commit/996bb4aa6686b2b15f1124b67d708c097a40d133))
<!-- COMMIT_DESC -->
    
    - Added a new workflow file `pr_test.yml` for testing pull requests
    - The workflow runs on the `develop` and `oc_5019` branches
    - The steps include checking out the repository, setting up Node.js, installing dependencies, installing Ionic CLI, creating a Cypress environment file, updating geohubId in environment.ts, running Cypress tests using Chrome browser with specific configurations, and uploading Cypress screenshots on failure.
    
    chore: Update PR test workflow configuration
    
    This commit adds the German Spanish Portuguese and Albanian translation for various components and pages in the application. It includes translations for activities, side menu, card track, map, search bar, slope chart, generic messages, modals, settings page, download list page, favourites page, home page, itinerary page, map page, photo detail page, photo list page, profile page and register page.
    
    - Increased the wait time for filter results from 250ms to 500ms in the distance-and-duration-filters.cy.ts file.
    - Increased the timeout for finding the download button from 10 seconds to 12.5 seconds in the download-ec-track.cy.ts file.
    - Modified the test-utils.ts file to ensure that the email input field has focus before clearing and typing.
    
    These changes improve reliability and stability in test execution.
    
    - Added a new workflow file `pr_test.yml` for testing pull requests
    - The workflow runs on the `develop` and `oc_5019` branches
    - The steps include checking out the repository, setting up Node.js, installing dependencies, installing Ionic CLI, creating a Cypress environment file, updating geohubId in environment.ts, running Cypress tests using Chrome browser with specific configurations, and uploading Cypress screenshots on failure.
    
    chore: Update PR test workflow configuration
## [3.0.0](https://github.com/webmappsrl/webmapp-app/compare/v2.12.16...v3.0.0) (2025-02-28)

### ⚠ BREAKING CHANGES

- This update may introduce breaking changes in the codebase due to changes in the @capacitor/device library.

### Features

- add e2e test for orientation and location buttons <a href="https://orchestrator.maphub.it/resources/customer-stories/4989" target="_blank" rel="noopener noreferrer">OC[4989]</a> ([#94](https://github.com/webmappsrl/webmapp-app/issues/94)) ([fa100bb](https://github.com/webmappsrl/webmapp-app/commit/fa100bb1a533f29d7fff3e5f1b13668ba6440479))
<!-- COMMIT_DESC -->
    
    Added a new e2e test file to test the visualization of the orientation and location buttons. The test verifies that the buttons are displayed correctly on the map page.
    
    This commit updates the URL handling logic for the home tab in the tabs page. Now, when the home tab is selected, the current query parameters are cleared and the URL is updated accordingly. This ensures that any previous tracking or point of interest information is removed from the URL.
<!-- COMMIT_DESC -->
    
    - Added an *ngIf condition to display the title based on the presence of currentUgcPoiProperties$.
    - The title now shows the name of the UGC POI properties using wmtrans translation.
    
    This commit enhances the map page by dynamically displaying a title for UGC POI properties when available.
    
    This commit adds the functionality to go to the home page when the current tab is 'home' and the user clicks on it again. It dispatches the action to navigate to the home page using the `goToHome()` method from `user-activity.action`.
- Add custom Cypress commands and test utilities ([b78c697](https://github.com/webmappsrl/webmapp-app/commit/b78c697d4a7d72f4428d92a757c2ecdf1d2b9213))
<!-- COMMIT_DESC -->
    
    This commit adds a new file `commands.ts` in the `core/cypress/support` directory, which contains custom Cypress commands for login, drag, dismiss, and visit. It also adds a new file `e2e.ts` in the same directory, which imports the `commands.ts` file.
    
    Additionally, this commit introduces a new file `test-utils.ts` in the `core/cypress/utils` directory. This file includes functions for clearing test state, logging into the application, and navigating to different pages.
    
    These changes aim to improve code organization and provide reusable functionality for end-to-end testing.
    
    - Added code to display UGC POI properties in the map page HTML template.
    - Updated the TypeScript file to select and subscribe to the current UGC POI properties from the store.
    
    * chore: add e2e test for downloading ec-track
    
    This commit adds a new e2e test file `download-ec-track.cy.ts` that tests the functionality of downloading an ec-track. The test verifies that the download button is visible, downloads the track, and checks if the downloaded track is displayed correctly in the downloads section.
    
    The test uses helper functions `getDownloadButton()` and `getGoToDownloadsButton()` to locate and interact with the relevant elements on the page.
    
    These changes aim to ensure that the download feature for ec-tracks is working as expected.
    
    * chore: Update download-ec-track.cy.ts
    
    - Replace hardcoded track name with dynamic data
    - Reduce timeout for 'Go to Downloads' button to improve test performance
    
    * chore: Add e2e tests for sharing track and poi <a href="https://orchestrator.maphub.it/resources/customer-stories/4927" target="_blank" rel="noopener noreferrer">OC[4927]</a>
    
    This commit adds end-to-end tests for sharing a track and a point of interest (poi). The tests ensure that the share button is correctly displayed when selecting a track or poi, and that clicking on the share button opens the share window. The test utils file is also added, which contains helper functions for navigating to the home page, opening layers, pois, and tracks.
    
    * chore: Remove unnecessary wait in share-track-and-poi.cy.ts
    
    The code changes remove the unnecessary wait(1000) statements in the 'Should open share window when click on share button' test case. This improves the efficiency of the test by eliminating unnecessary delays.
    
    ---------
    
    Co-authored-by: peppedeka <peppedeka@gmail.com>
- add import UGC test ([#96](https://github.com/webmappsrl/webmapp-app/issues/96)) ([013656d](https://github.com/webmappsrl/webmapp-app/commit/013656df93aefebfd6581b6360aeba49718a19a1))
<!-- COMMIT_DESC -->
    
    This commit adds a new test for importing user-generated content (UGC). The test includes steps to open the import UGC feature, select a file to import, visualize a preview map, and pre-populate the form with track title and description.
    
    This commit adds new test cases to visualize the sync badge in the application. The tests cover scenarios where the track is synchronized and not synchronized, and verify that the correct icon is displayed based on the synchronization status.
    
    This commit updates the URL handling in the open method of the FavouritesPage class. Instead of using the `updateURL` method, it now uses the `changeURL` method with the 'map' parameter. This change improves the consistency and clarity of the code.
- **map:** start navigation on view enter ([4759c30](https://github.com/webmappsrl/webmapp-app/commit/4759c3079a47cb5bcfbbfa40b1266dedaaa6841d))
<!-- COMMIT_DESC -->
    
    This commit adds a call to the `_geolocationSvc.startNavigation()` method in the `ionViewWillEnter` lifecycle hook of the `MapPage` component. This ensures that navigation is started when the page is entered.
    
    Include an excerpt component in the POI properties view. This enhancement allows for better presentation of property information by displaying excerpts when available.
    
    - Remove unnecessary condition in ngOnInit()
    - Always start navigation in ngOnInit()
    
    This commit removes the form component and its associated HTML, SCSS, and TypeScript files. The form component was no longer needed in the project.
    
    Updated submodule core/src/app/shared/wm-core
- Remove LangService provider from multiple components <a href="https://orchestrator.maphub.it/resources/customer-stories/4781" target="_blank" rel="noopener noreferrer">OC[4781]</a> ([2fced83](https://github.com/webmappsrl/webmapp-app/commit/2fced8332f7d09098decedb89097978e67a93997))
<!-- COMMIT_DESC -->
    
    - Removed the LangService provider from app.component.ts, modal-store-success.component.ts, download.component.ts, and register.page.ts.
    
    This commit removes the search-bar component along with its HTML, SCSS, spec, and TypeScript files. The search-bar component was no longer needed in the codebase.
    
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
    
    The code changes in this commit involve removing the trackElevationChartHover event listener from two templates in the map.page.html file. This event listener is no longer needed and has been causing unnecessary overhead.
- Remove unused code and start geolocation service ([d84f7ba](https://github.com/webmappsrl/webmapp-app/commit/d84f7ba6f5ea9a53dc7f3dbf254a8b695f25a98f))
<!-- COMMIT_DESC -->
    
    This commit removes unused code related to geolocation from the app component and home page. It also starts the geolocation service in the map page.
    
    - Removed the unused variable "currentTab" in the TabsPage class.
    - Refactored the setCurrentTab method to use the _urlHandlerSvc.getCurrentPath() instead of this.currentTab.
    
    - Imported Observable and from from the rxjs library
    - Added a subscription to getUgcLoadedOnce() and dispatched setUgcLoaded action if ugcLoadedOnce is true
    
    - Replaced the reference to `_photoSvc` with `_cameraSvc` for consistency and clarity.
    - Updated the `addPhotos()` method to use `_cameraSvc.getPhotos()` instead of `_photoSvc.getPhotos()`.
    - Updated the `addPhotos()` method to use `_cameraSvc.getPhotoData()` instead of `_photoSvc.getPhotoData()`.
    - Added a new method `backToSuccess()` to handle dismissing the modal and returning to success state.
    - Modified the subscription in `saveUgcPoi()` to await dismissal of the modal before dispatching `syncUgcPois()`.
- Update dependencies and imports in modal-save.component.ts <a href="https://orchestrator.maphub.it/resources/customer-stories/4781" target="_blank" rel="noopener noreferrer">OC[4781]</a> ([1bd18b9](https://github.com/webmappsrl/webmapp-app/commit/1bd18b9b42cc24d38f5d69df52386027a669e8bb))
<!-- COMMIT_DESC -->
    
    - Removed unused import of TranslateService
    - Added import of LangService from @wm-core/localization/lang.service
    - Updated references to TranslateService with LangService
    
    The geohubId value in the environment.ts file has been changed from 29 to 26. This update ensures that the correct geohubId is used for the application.
    
    - Replace `reset` method with `stopAll` in `SettingsComponent`
    - Replace `start` method with `startNavigation` in `MapPage`, `RegisterPage`, and `WaypointPage`
    
    These changes ensure that the geolocation service is used correctly and consistently throughout the codebase.
    
    - Removed the display of currentPoiProperties in map.page.html
    - Updated translations for "Conferma" to "Confirm" in en.json, fr.json, and it.json
    - Added translation for "Link utili" as "Useful links" in en.json, fr.json, and it.json
- Update map page HTML and TypeScript files ([88de3e3](https://github.com/webmappsrl/webmapp-app/commit/88de3e35c3a340334c4ab4c217dbacb1f953abd9))
<!-- COMMIT_DESC -->
    
    - Added a new ng-container in the HTML file to display a favorite button for authenticated users
    - Updated the TypeScript file to handle the favorite button functionality by checking if a track is already marked as favorite
    
    - Updated the map.page.html file to use the currentEcTrackProperties$ observable for retrieving the track ID.
    - Updated the map.page.ts file to add the currentEcTrackProperties$ observable and assign it to the currentEcTrackProperties variable.
    
    - Removed unnecessary code related to track preview
    - Updated the layout of the map page
    - Added new functionality for navigating and recording tracks
    
    - Adjusted the top position of ion-card-content in map-details.component.scss
    - Added a ng-template block for wm-track-properties in map.page.html
- Update map-details.component.ts, map.page.html, and map.page.ts ([3202f90](https://github.com/webmappsrl/webmapp-app/commit/3202f9057429ad41f36bbef69c62d85576ba213f))
<!-- COMMIT_DESC -->
    
    - Removed unnecessary imports and variables
    - Refactored ngAfterViewInit() method in MapDetailsComponent
    - Removed unused code in MapPage class
    - Updated methods in MapPage class for better readability
    
    - Added logic to handle currentPoiProperties subscription
    - Updated params object with additional properties for ugc_poi and poi
    - Removed unnecessary code in openPopup method
    chore: Update map.page.ts
    
    - Added logic to handle currentPoiProperties subscription
    - Updated params object with additional properties for ugc_poi and poi
    - Removed unnecessary code in openPopup method
    
    This commit updates the code in modal-save.component.ts file. The changes include:
    - Importing the 'from' and 'Observable' functions from the 'rxjs' library.
    - Adding the 'saveUgcTrack' function to the import statement from '@wm-core/utils/localForage'.
    - Importing the 'take' and 'switchMap' functions from the 'rxjs/operators' library.
    - Adding the '_store' parameter to the constructor of ModalSaveComponent.
    - Modifying the backToSuccess() method to return a Promise<boolean> instead of void.
    - Modifying the saveTrack() method to use observables and dispatch actions using Redux store.
    
    These changes aim to improve code functionality and maintainability.
    
    - Import the 'from' operator from 'rxjs'
    - Add the 'saveUgcPoi' function to the import statement from '@wm-core/utils/localForage'
    - Remove the import of 'UgcService' from '@wm-core/store/features/ugc/ugc.service'
    - Add the 'switchMap' and 'take' operators to the pipe in line 143
    - Dispatch a syncUgcPois action after dismissing the modal and opening the success modal
- Update poi-properties component <a href="https://orchestrator.maphub.it/resources/customer-stories/4837" target="_blank" rel="noopener noreferrer">OC[4837]</a> ([#88](https://github.com/webmappsrl/webmapp-app/issues/88)) ([1955d5d](https://github.com/webmappsrl/webmapp-app/commit/1955d5dd4388360b89487ba95105ece0a478a6d7))
<!-- COMMIT_DESC -->
    
    * chore: Update poi-properties component
    
    - Added conditional rendering for wm-tab-detail and wm-feature-useful-urls based on the values of showTechnicalDetails$ and showUsefulUrls$
    - Updated set properties method to update the values of showTechnicalDetails$ and showUsefulUrls$
    
    * fix(map): update class name for useful URLs item
    
    - Changed the class name from "wm-track-useful-urls-item" to "wm-feature-useful-urls-item" in the map page HTML file.
    - This change reflects a more accurate description of the item's purpose.
    
    - Added step to check out code with submodules
    - Updated Release Please Action version to v3
    - Enabled monorepo tags for webmapp-app package
    - Modified pull request title pattern for releases
    
    - Fixed a syntax error in the ngIf condition for record_track_show.
    
    - Added submodule "core/src/app/shared/wm-types"
    - Updated URL for submodule "core/src/app/shared/wm-core"
- Update subproject commit reference ([bc0d614](https://github.com/webmappsrl/webmapp-app/commit/bc0d61456cda6aac19472a99805456897ad34747))
<!-- COMMIT_DESC -->
    
    - Removed unused import in register.page.ts
    - Updated wmMapGeojson binding in waypoint.page.html
    - Removed unused import and variable in waypoint.page.ts
    - Refactored onChangeLocation method to update geojson and locationString
    
    - Reordered the click event and tab attributes in ion-tab-button elements in tabs.page.html
    - Removed unused import statement from tabs.page.ts
    - Renamed _urlHandlerService to _urlHandlerSvc in tabs.page.ts
    
    This commit updates the tabs.page.ts file to reset the "ugc_track" and "ugc_poi" query parameters along with "track" and "poi". This ensures that all relevant query parameters are properly reset when navigating to the home tab.
- Update track properties component and map details component ([f25a957](https://github.com/webmappsrl/webmapp-app/commit/f25a957595be24d28f0941181499c1e6e403c6ad))
<!-- COMMIT_DESC -->
    
    - Updated the track-properties.component.html file to use optional chaining operator for accessing nested properties.
    - Renamed the map-track-details.component.html, map-track-details.component.scss, and map-track-details.component.ts files to map-details.component.html, map-details.component.scss, and map-details.component.ts respectively.
    - Updated the references to the renamed files in the code.
    - Removed the unused map-track-details.component.spec.ts file.
    - Updated the imports in the map.module.ts file to reflect the renamed components.
    - Updated the template in the map.page.html file to use wm-map-details instead of wm-map-track-details and updated related bindings accordingly.
    - Added a new bottom-right section with two ion-fab buttons for location-related actions.
    - Updated some method names and event handlers in the map.page.ts file to reflect changes made in other files.
    
    - Added a condition to start navigation only if the current mode is not 'recording'
    - Improved efficiency by avoiding unnecessary calls to startNavigation()

- make release ([808ee25](https://github.com/webmappsrl/webmapp-app/commit/808ee257c904af326fb38dc69a532fcbd8fb5527))
- add condition to onlyTitle method in navigation <a href="https://orchestrator.maphub.it/resources/customer-stories/4211" target="_blank" rel="noopener noreferrer">OC[4211]</a> ([37ddb19](https://github.com/webmappsrl/webmapp-app/commit/37ddb19f1ebe69cbf0ba46194df6fd6dcbc98e0c))
<!-- COMMIT_DESC -->
    
    This commit adds a condition to the `navigation` method in the `MapPage` component. The `onlyTitle` method of the `mapTrackDetailsCmp` will now be called only if the map is focused and the track details component is open.
    
    - Changed the back button to use an ion-button with a chevron-back icon
    - Updated the color of the button to dark
    
    - Added a new map component
    - Updated the layout of the bottom buttons
    - Adjusted the position and style of the orientation button
## [2.12.14](https://github.com/webmappsrl/webmapp-app/compare/v2.12.13...v2.12.14) (2024-10-25)

### Miscellaneous

- Add geolocation service to home and map pages <a href="https://orchestrator.maphub.it/resources/customer-stories/4113" target="_blank" rel="noopener noreferrer">OC[4113]</a> ([37903a7](https://github.com/webmappsrl/webmapp-app/commit/37903a78f46f1a95f9ddccc1d370615609f11ab7))
<!-- COMMIT_DESC -->
    
    This commit adds the GeolocationService to the home and map pages. The GeolocationService is used to retrieve the user's current location.
- Add 'cai_scale' translation to Italian language file <a href="https://orchestrator.maphub.it/resources/customer-stories/4097" target="_blank" rel="noopener noreferrer">OC[4097]</a> ([221acd9](https://github.com/webmappsrl/webmapp-app/commit/221acd97ab02b14c8bd2e85363fdc1c0056d3ea5))
<!-- COMMIT_DESC -->
    
    Include translation for 'cai_scale' in the Italian language file.
    
    * chore: Remove unnecessary code for overlay URL and reorganize lifecycle hooks <a href="https://orchestrator.maphub.it/resources/customer-stories/4098" target="_blank" rel="noopener noreferrer">OC[4098]</a>
    
    - Removed unused overlay URL in HTML template
    - Reorganized ngOnInit and ngOnDestroy methods for better readability
    
    * chore: Remove unused enableOverLay$ BehaviorSubject and optimize ngOnInit in MapPage
    
    Removed the unused enableOverLay$ BehaviorSubject and optimized the ngOnInit method in MapPage for better performance.
### Miscellaneous

- change environment ([42fcb8b](https://github.com/webmappsrl/webmapp-app/commit/42fcb8b5645fc686197197a81fa580fd9ea2c3db))
- Comment out console.log statements and unused code ([88c6830](https://github.com/webmappsrl/webmapp-app/commit/88c683017ac3076fb1419c0271084f297f29e25d))
<!-- COMMIT_DESC -->
    
    This commit comments out the console.log statement in the getUrlFile function and removes unused code in the build function.
    
    - Removed unnecessary code in AppComponent
    - Fixed a condition in setWmMapFeatureCollection method of MapPage

- Update Android platform and remove storage permission request <a href="https://orchestrator.maphub.it/resources/customer-stories/3969" target="_blank" rel="noopener noreferrer">OC[3969]</a> ([7e3845f](https://github.com/webmappsrl/webmapp-app/commit/7e3845f4f7824ff2759f119e9be368368a82b0f8))
<!-- COMMIT_DESC -->
    
    - Updated compileSdkVersion and targetSdkVersion in gulpfile.js to 33
    - Removed the requestStoragePermission() function from trackdetail.page.ts

- Update Android platform versions in gulpfile.js ([51f230e](https://github.com/webmappsrl/webmapp-app/commit/51f230e475755b9759fea53b7158a18bc38e3c84))
<!-- COMMIT_DESC -->
    
    Update the compileSdkVersion and targetSdkVersion in the gulpfile.js to version 34.
- Add API endpoint for OSM2CAI ([f3579b2](https://github.com/webmappsrl/webmapp-app/commit/f3579b21db0f2fc8bb65b0fcb5934803792a056c))
<!-- COMMIT_DESC -->
    
    This commit adds a new API endpoint for OSM2CAI, which is set to 'https://osm2cai.cai.it'. This allows for integration with the OSM2CAI service.

- Add file saving functionality and permission handling ([b3ba923](https://github.com/webmappsrl/webmapp-app/commit/b3ba923a609e6c900954e427aebacb431df21452))
<!-- COMMIT_DESC -->
    
    - Added a function to save files in the Documents directory
    - Created a popup message to inform the user about successful file saving and ask for sharing
    - Updated the HTML template to remove unnecessary code related to exporting files
    - Modified the TypeScript file to handle storage permission requests before saving files
    
    This commit adds a new script "surge-osm2cai" to the package.json file in the core directory. The script allows deploying the project to the OSM2CAI domain using Surge.
### Miscellaneous

- Update app.module.ts and settings.component.html/ts ([00614b5](https://github.com/webmappsrl/webmapp-app/commit/00614b59331dd548b52d71987900b5f9bea2962b))
<!-- COMMIT_DESC -->
    
    - Removed import of ConfigService in app.module.ts
    - Added import of ConfService and package.json in app.module.ts
    - Removed APP_INITIALIZER provider in app.module.ts
    - Added APP_VERSION provider with value from package.json in app.module.ts
    - Updated ion-item in settings.component.html to display the value of APP_VERSION instead of version variable
    - Removed ngOnInit method from settings.component.ts
    
    - Added new AWS API endpoint for geohub
    - Added new ElasticSearch API endpoint for geohub
    
    - Replaced the import statement for GeohubService with ApiService
    - Updated the method call from _geohubSVC.getEcTrack() to _apiSvc.getEctrack()
    
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

- Fix error handling in app.component.ts ([99d2e90](https://github.com/webmappsrl/webmapp-app/commit/99d2e90fc976f2b292d7574b81eddac2ff226d5a))
<!-- COMMIT_DESC -->
    
    The code change fixes the error handling in the app.component.ts file. The filter condition has been updated to check for 'Unauthorized' instead of 'Unauthenticated'. This ensures that the correct error message is displayed when an unauthorized error occurs.
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
    
    This commit removes unnecessary imports and code from the app.component.ts file. It removes the AlertController import, as well as the authError$ observable and its related code. These changes help to clean up the codebase and improve readability.
    
    This commit removes several unused methods and imports in the GeohubService class. The removed code includes methods for getting details of POIs, EC media, and EC tracks, as well as performing searches and string searches. Additionally, unused imports and dependencies have been removed.
<!-- COMMIT_DESC -->
    
    - Added APP_ID_TOKEN to providers
    - Use ConfigService to get the value for APP_ID_TOKEN
- Update environment configuration ([b49a8dc](https://github.com/webmappsrl/webmapp-app/commit/b49a8dc00e0dbf189fcc6490b49a9698de1e2151))
<!-- COMMIT_DESC -->
    
    - Added new elasticApi endpoint for production environment
    - Commented out local development api endpoints
    
    - Added Subscription import from 'rxjs'
    - Added logic to navigate to '/profile/profile-data' when user is no longer logged in
    
    - Removed unused imports and variables
    - Updated import paths for services and classes
### Miscellaneous

- Refactor shareTrackByID method in ShareService <a href="https://orchestrator.maphub.it/resources/customer-stories/3850" target="_blank" rel="noopener noreferrer">OC[3850]</a> ([#36](https://github.com/webmappsrl/webmapp-app/issues/36)) ([6a060df](https://github.com/webmappsrl/webmapp-app/commit/6a060df97401f53b9ee63cd261af0da3733a4aa7))
<!-- COMMIT_DESC -->
    
    * chore: Refactor shareTrackByID method in ShareService <a href="https://orchestrator.maphub.it/resources/customer-stories/3850" target="_blank" rel="noopener noreferrer">OC[3850]</a>
    
    The shareTrackByID method in the ShareService has been refactored to simplify the code and improve readability. Instead of subscribing to an observable and transforming the socialShareText, it now directly shares the track by calling the share method with the trackId as a parameter. This change reduces unnecessary complexity and improves performance.
    
    chore: Update hostToGeohubAppId in ConfigService
    
    The hostToGeohubAppId object in the ConfigService has been updated to use the imported hostToGeohubAppId from 'wm-core/store/api/api.service' instead of the previous hardcoded values. This change allows for more flexibility and easier maintenance of the geohub app IDs based on the hostname.
    
    * chore: Update defaultShareObj text in ShareService
    
    The defaultShareObj text property in the ShareService has been updated to an empty string. This change ensures that the default text for sharing is empty, allowing users to input their own custom text when sharing content.
    
    * chore: Remove empty text property in defaultShareObj
    
    The code change removes the assignment of an empty string to the text property in the defaultShareObj object. This change was made in the ShareService file.
- Add share button for points of interest <a href="https://orchestrator.maphub.it/resources/customer-stories/3789" target="_blank" rel="noopener noreferrer">OC[3789]</a> ([8b11848](https://github.com/webmappsrl/webmapp-app/commit/8b11848967926cf66c5f5b83a71e059c014692a1))
<!-- COMMIT_DESC -->
    
    - Added a new share button for points of interest in the map page.
    - When clicked, it opens a modal to share the selected point of interest.
    - The shared link includes the ID of the point of interest.
<!-- COMMIT_DESC -->
    
    - Updated the paths for the deploy-to-web scripts in package.json to use relative paths instead of absolute paths.
    - Replaced the absolute file paths with "./www/*" and "./www/assets/*" to ensure correct deployment to the web server.
### Miscellaneous

- Add referrer field to login request ([e953006](https://github.com/webmappsrl/webmapp-app/commit/e95300641080b3e61a44c61373503ebd4844f971))
<!-- COMMIT_DESC -->
    
    - Added a new field "referrer" to the login request in the AuthService class.
    - Updated the geohubId value in the environment.ts file from 32 to 53.
    - Commented out the api URL and added a new local development API URL.
    
    - Added wmMapHitMapCollection directive to the map page template
    - Added hitMapFeatureCollection selector to the map page component
    - Updated setWmMapFeatureCollection method in the map page component to handle overlay feature collections

- add 'parcapuane' map to ConfigService ([3c4bb72](https://github.com/webmappsrl/webmapp-app/commit/3c4bb7275423421177ec29f30a91155940074844))
<!-- COMMIT_DESC -->
    
    A new map, 'parcapuane', has been added to the list of maps in the ConfigService. This extends the range of available maps within the application.

- Enhance settings component with memory reset functionality ([694aa22](https://github.com/webmappsrl/webmapp-app/commit/694aa22185b667244addf47a9c147c60f4595636))
<!-- COMMIT_DESC -->
    
    Added a new feature to the settings component that allows users to clear cache and saved data. This includes clearing local storage, session storage, IndexedDB, Cache Storage, and cookies. Also restructured the HTML of the settings component for better organization and readability. Added corresponding translations for new features in English language file.

- Register page privacy link modal <a href="https://orchestrator.maphub.it/resources/customer-stories/3568" target="_blank" rel="noopener noreferrer">OC[3568]</a> ([ed9e5aa](https://github.com/webmappsrl/webmapp-app/commit/ed9e5aa7c925b9945d0077c308f9c0db4c9d77b0))
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
- css ion-select <a href="https://orchestrator.maphub.it/resources/customer-stories/3522" target="_blank" rel="noopener noreferrer">OC[3522]</a> ([b1a13eb](https://github.com/webmappsrl/webmapp-app/commit/b1a13eb52bbcdf8c994544617af185f9fb4232e7))
- Change directory for writing file in TrackdetailPage <a href="https://orchestrator.maphub.it/resources/customer-stories/3422" target="_blank" rel="noopener noreferrer">OC[3422]</a> ([63b6b22](https://github.com/webmappsrl/webmapp-app/commit/63b6b228ca33d338898baf39dd710dfe6dcfb579))
<!-- COMMIT_DESC -->
    
    Changed the directory for writing a file in the TrackdetailPage from Directory.Documents to Directory.External. This change ensures that the file is written to the external storage instead of the documents directory.
<!-- COMMIT_DESC -->
    
    The code changes in this commit remove the unnecessary code that handles location permission denial. This includes the prompt to open settings and the call to `backgroundGeolocation.openSettings()`.

- add privacy link to settings component ([#24](https://github.com/webmappsrl/webmapp-app/issues/24)) ([d6f4d00](https://github.com/webmappsrl/webmapp-app/commit/d6f4d00a7860e7556e1cab2a41dde3e21eff57c7))
<!-- COMMIT_DESC -->
    
    Include a new button in the settings component for accessing the privacy page. Update language files accordingly.
    feat: add privacy link to settings component
    
    Include a new button in the settings component for accessing the privacy page. Update language files accordingly.
    
    This commit removes unused imports, variables, and code related to network connectivity in the downloaded-tracks-box.component.ts file. The changes improve code readability and maintainability.
    
    - Removed ng-container and moved wm-map component to the top level
    - Reorganized ion-fab buttons for better layout and functionality
### Miscellaneous

- Update localization files for English, French, and Italian with new translations and additions. Fix typo in "Salking" to "Walking". Add new terms like "Asphalt", "Bitumenduro", "Onoff", "Real dirt", and "Bar". ([#21](https://github.com/webmappsrl/webmapp-app/issues/21)) ([daccd32](https://github.com/webmappsrl/webmapp-app/commit/daccd3273c5f187d042e681ecaf9a3c5f292f6f3))
- **i18n:** Add Italian translation for new waypoint message ([afc9e6d](https://github.com/webmappsrl/webmapp-app/commit/afc9e6d44301f78abf05f40469f01222ac762516))
<!-- COMMIT_DESC -->
    
    Added the Italian translation for the new waypoint message to the i18n file.
    
    - Updated the URL for low and high resolution tiles in the IDATALAYER object.
<!-- COMMIT_DESC -->
    
    - Added the take(1) operator to the observable chain in app.component.ts
    - Ensures that only the first emitted value is taken into account
    - Improves performance and prevents unnecessary processing
    
    The commit fixes a null check issue in the SaveService class. The code now correctly checks for the presence of track coordinates using optional chaining.
- Remove unnecessary code in setPhotoData method ([95be7fa](https://github.com/webmappsrl/webmapp-app/commit/95be7fa3514c2a59cec046c76b1602cf5a88f833))
<!-- COMMIT_DESC -->
    
    - Added <ion-content> tag to wrap the form content
    - Improved formatting and indentation
### ⚠ BREAKING CHANGES

- **config:** The private variable \_geohubAppId has been added to store the selected geohubAppId value.

### Features

- **config:** add dynamic geohubAppId selection ([f4054da](https://github.com/webmappsrl/webmapp-app/commit/f4054da50b9fa48c85c8cf13e53950b9e2ed1166))
<!-- COMMIT_DESC -->
    
    This commit adds functionality to dynamically select the geohubAppId based on the hostname. It checks for specific hostnames and assigns a corresponding geohubAppId. If no specific hostname is matched, it uses the numeric value from the hostname. This allows for more flexibility in configuring the geohubAppId for different environments.
    
    BREAKING CHANGE: The private variable _geohubAppId has been added to store the selected geohubAppId value.
<!-- COMMIT_DESC -->
    
    - Commented out the navigation to 'home' in app.component.ts
    - Added a new route in tabs-routing.module.ts to redirect to 'home' when the path is empty

### Bug Fixes

- Add gulp-through2 package ([a971689](https://github.com/webmappsrl/webmapp-app/commit/a9716894c7179a731b363bb4fab4d72bb5c241c0))
<!-- COMMIT_DESC -->
    
    The commit adds the gulp-through2 package to the project dependencies. This package is required for performing tasks in the Gulp build process.
    
    style(map-track-details.component): increased padding bottom
    fix(track-properties.component): activity tab fixed
- Update map.page.html ([3444622](https://github.com/webmappsrl/webmapp-app/commit/3444622d2c97920938314555826aa32ed70a7746))
<!-- COMMIT_DESC -->
    
    - Removed the condition for disabling layers when there are no current filters
    - Added a new condition for disabling layers when there are current filters and toggleLayerDirective is false and currentLayer is null

- Remove unnecessary code and fix formatting in modal-success component ([546a2b2](https://github.com/webmappsrl/webmapp-app/commit/546a2b20a6b94835a5765aff9584125bb0984122))
<!-- COMMIT_DESC -->
    
    - Removed unused imports and variables
    - Fixed indentation and spacing issues
    - Removed commented out code
    
    - Refactored code in the register page to update the metadata object
    - Updated the save service to handle metadata parsing and set locations property in geojson
### Features

- **i18n:** Add translations for new points of interest ([d3a9b09](https://github.com/webmappsrl/webmapp-app/commit/d3a9b09cdbd7c1eb492824070ef0dff6449958eb))
<!-- COMMIT_DESC -->
    
    - Added translations for new points of interest categories and descriptions in English and Italian.
    - Updated the translation files `en.ts` and `it.ts`.
    - Translated the following categories: Asphalt, Bitumenduro®, Real dirt, Bar, Mountain passes, Roads to drive (BLUE), Points of interest (GREEN), Dirt roads (ORANGE), Streets to admire (PINK), Other types of Point of interest.
    - Translated the description field.
    - Added translation for the prompt "Do you want to propose your waypoint on the motomappa?" with options "Yes" and "No".
<!-- COMMIT_DESC -->
    
    - Refactored the structure of the form component template
    - Improved readability and organization of code
    - Updated HTML tags and attributes for better semantic meaning
    - Fixed minor issues with form field labels and placeholders
    
    - Added import for Platform from '@ionic/angular'
    - Added import for App from '@capacitor/app'
    - Added private property _backBtnSub$ of type Subscription
    - Added ionViewDidEnter() method to handle back button event and exit the app
    - Added ionViewWillLeave() method to unsubscribe from back button event

### Miscellaneous

- **deploy-commands:** updated ([6278031](https://github.com/webmappsrl/webmapp-app/commit/627803168adc54acb2132c1fe25d7008f4b57831))
<!-- COMMIT_DESC -->
    
    - Removed the `providers` property for `LangService` in the `SettingsComponent` and `ProfilePage` files.
- Replace confPOIFORMS with acquisitionFORM in waypoint modal id:2641 ([dc92106](https://github.com/webmappsrl/webmapp-app/commit/dc92106b6410fd6de6d9f70a744fa61b1f828046))
<!-- COMMIT_DESC -->
    
    Replaced the 'confPOIFORMS' observable with a new 'acquisitionFORM' observable in the waypoint save modal. This change affects both the HTML template and TypeScript component of the modal. Also, added 'confPOIFORMS' to waypoint page for data acquisition.
    
    The @capacitor-community/keep-awake package has been added to the project dependencies. This package allows the application to prevent the device from going into sleep mode. The version installed is 4.0.0, which requires a peer dependency of @capacitor/core at version 5.0.0 or higher.
### Features

- Add popup functionality to map page ([38b999e](https://github.com/webmappsrl/webmapp-app/commit/38b999efed09cd3e0cf1005e48564b5880491e8e))
<!-- COMMIT_DESC -->
    
    This commit adds the ability to open a popup on the map page when a feature collection is clicked. The popup displays additional information about the selected feature.
    
    - Added dependencies for converting GeoJSON to GPX and KML formats
    - Updated the CGeojsonFeature class to include a method for adding properties
    - Modified the trackdetail module to include export buttons for GeoJSON, KML, and GPX formats
    - Implemented saveFileCallback function in trackdetail page to handle saving and sharing exported files
    
    - Added a new button to the register page HTML template for adding waypoints.
    - Created a new method in the RegisterPage component called "waypoint" that navigates to the "waypoint" page with the current track as a parameter.
    
    This commit adds functionality to allow users to add waypoints while registering.
- **page/home:** remove handling set filter ([cf4a1dc](https://github.com/webmappsrl/webmapp-app/commit/cf4a1dce372c1a38212d779125bd7f4f8b45c8a2))
<!-- COMMIT_DESC -->
    
    improved button visibility
<!-- COMMIT_DESC -->
    
    Added a new deploy command for the motomappa project.
    
    The commit removes the code that updates the manifest.json file in the PR branch, as it is no longer needed. This change simplifies the workflow and improves efficiency.
- Remove unnecessary ngIf condition in map.page.html id: 2227 ([7251398](https://github.com/webmappsrl/webmapp-app/commit/725139820fbcdda1e74c7daa46c87f30c024f9b7))
<!-- COMMIT_DESC -->
    
    - Removed the `removeTrackFilterEVT` and `removePoiFilterEVT` event listeners from the HTML template.
    - Removed the `toggleTrackFilter` and `removePoiFilter` methods from the TypeScript file.
    
    These changes remove unnecessary code related to track filters and poi filters in the home page.
    
    - Updated "@dwayneparton/geojson-to-gpx" dependency to version "^0.0.30"
    - Updated compileSdkVersion and targetSdkVersion in the Android platform to version 33
    
    chore: Update @dwayneparton/geojson-to-gpx version to ^0.0.30 in package-lock.json
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
    
    - Updated the form component template to display the current form label and field values correctly.
    - Removed unnecessary padding from the waypoint detail page.
    
    - Removed line separator from ion-item element
    - Added a new ion-item element to display helper text for the current form
<!-- COMMIT_DESC -->
    
    - Updated the styling of the home page to include padding for safe areas on ion-content.
    - Added a new deployment command for project "oman".
- Update map page HTML and TypeScript files <a href="https://orchestrator.maphub.it/resources/customer-stories/1932" target="_blank" rel="noopener noreferrer">OC[1932]</a>,1925 ([5f6716b](https://github.com/webmappsrl/webmapp-app/commit/5f6716bc35f5a6ab919af9cbe5107733537bf79a))
<!-- COMMIT_DESC -->
    
    - Added event listener for wmMapOverlayEVT$ in map.page.html
    - Added event listener for lastFilterTypeEvt in map.page.html
    - Updated updateLastFilterType() method in map.page.ts to dispatch setLastFilterType action
    
    The minSdkVersion in the Android platform has been updated from 31 to 28. This change ensures compatibility with a wider range of devices.
### Miscellaneous

- Add deploy command for motomappa ([0475fc2](https://github.com/webmappsrl/webmapp-app/commit/0475fc20986c1e634d6132daea9e99e639748a9a))
<!-- COMMIT_DESC -->
    
    Added a new deploy command for the motomappa project.
    
    - Updated "@dwayneparton/geojson-to-gpx" dependency to version "^0.0.30"
    - Updated compileSdkVersion and targetSdkVersion in the Android platform to version 33
    
    chore: Update @dwayneparton/geojson-to-gpx version to ^0.0.30 in package-lock.json
    
    - Updated margin-top and top values in downloaded-tracks-box.component.scss
    - Imported Network from @capacitor/network in home.page.ts
    - Replaced fromEvent with from(Network.getStatus()) in network.service.ts
    - Changed initial online state to true in netwotk.reducer.ts
    
    - Updated the styling of the home page to include padding for safe areas on ion-content.
    - Added a new deployment command for project "oman".

## [2.6.1](https://github.com/webmappsrl/webmapp-app/compare/v2.6.0...v2.6.1) (2024-01-11)

### Miscellaneous

- Add deploy command for motomappa ([0475fc2](https://github.com/webmappsrl/webmapp-app/commit/0475fc20986c1e634d6132daea9e99e639748a9a))
<!-- COMMIT_DESC -->
    
    Added a new deploy command for the motomappa project.
    
    - Updated "@dwayneparton/geojson-to-gpx" dependency to version "^0.0.30"
    - Updated compileSdkVersion and targetSdkVersion in the Android platform to version 33
    
    chore: Update @dwayneparton/geojson-to-gpx version to ^0.0.30 in package-lock.json
    
    - Updated margin-top and top values in downloaded-tracks-box.component.scss
    - Imported Network from @capacitor/network in home.page.ts
    - Replaced fromEvent with from(Network.getStatus()) in network.service.ts
    - Changed initial online state to true in netwotk.reducer.ts
    
    - Updated the styling of the home page to include padding for safe areas on ion-content.
    - Added a new deployment command for project "oman".

## [2.6.0](https://github.com/webmappsrl/webmapp-app/compare/v2.5.0...v2.6.0) (2023-12-07)

### Features

- Add popup functionality to map page ([38b999e](https://github.com/webmappsrl/webmapp-app/commit/38b999efed09cd3e0cf1005e48564b5880491e8e))
<!-- COMMIT_DESC -->
    
    This commit adds the ability to open a popup on the map page when a feature collection is clicked. The popup displays additional information about the selected feature.
    
    - Added a new button to the register page HTML template for adding waypoints.
    - Created a new method in the RegisterPage component called "waypoint" that navigates to the "waypoint" page with the current track as a parameter.
    
    This commit adds functionality to allow users to add waypoints while registering.
<!-- COMMIT_DESC -->
    
    - Removed unnecessary line break in the form label
    - Added helper text for form fields
    - Adjusted padding for the form field helper text

### Features

- **home:** add home layer ([5e485df](https://github.com/webmappsrl/webmapp-app/commit/5e485df7bb6082d84dbb4676e47a25893913324e))
<!-- COMMIT_DESC -->
    
    The import statement for HomeModule was removed as it was not being used in the code. This change helps to clean up the module and improve code readability.
    
    The minSdkVersion in the Android platform has been updated from 31 to 28. This change ensures compatibility with a wider range of devices.

### Features

- **social-share:** add configurable text ([7544147](https://github.com/webmappsrl/webmapp-app/commit/75441472c46df96cca8536352b5aa81d2b290054))

### Features

- update ([6d55ba5](https://github.com/webmappsrl/webmapp-app/commit/6d55ba58244485a1bf59b1d12a7f6f20b89fe76f))
- Update map page HTML and TypeScript files <a href="https://orchestrator.maphub.it/resources/customer-stories/1932" target="_blank" rel="noopener noreferrer">OC[1932]</a>,1925 ([5f6716b](https://github.com/webmappsrl/webmapp-app/commit/5f6716bc35f5a6ab919af9cbe5107733537bf79a))
<!-- COMMIT_DESC -->
    
    - Added event listener for wmMapOverlayEVT$ in map.page.html
    - Added event listener for lastFilterTypeEvt in map.page.html
    - Updated updateLastFilterType() method in map.page.ts to dispatch setLastFilterType action
- Update deploy-messages.txt ([1f39225](https://github.com/webmappsrl/webmapp-app/commit/1f392255ecd82065970c35eab8ccca131be14e3f))
<!-- COMMIT_DESC -->
    
    - Improved rendering performance of layers
    - Fixed graphical issue in elevation chart
    - Improved visualization of elevation chart
    - Improved visualization of layers
    - Fixed minor bugs
- **map:** add logic to control layer opacity and open track details ([d33f275](https://github.com/webmappsrl/webmapp-app/commit/d33f275e98aee01a1f650de08460e4e07ed2495f))
<!-- COMMIT_DESC -->
    
    This commit adds logic to control the opacity of a layer on the map and opens the track details component. The opacity is set based on whether the current layer has edges or not. If there are edges, the opacity is set to false; otherwise, it is set to true.
- Add release-please configuration file ([8cf2be7](https://github.com/webmappsrl/webmapp-app/commit/8cf2be7edd248735ff1947c1f988a06848432788))
<!-- COMMIT_DESC -->
    
    This commit adds a new release-please configuration file, `release-please-config.json`, which includes an extra-file entry for the `core/version.json` file. The JSON path `$version` is specified to extract the version information. This change follows semantic versioning guidelines.
### Features

- Add release automation workflow ([004bc16](https://github.com/webmappsrl/webmapp-app/commit/004bc16781f50387128c0308fb1fd8df30dec87e))
<!-- COMMIT_DESC -->
    
    This commit adds a new GitHub Actions workflow file, `release_please.yml`, which automates the release process. The workflow is triggered on pushes to the `main` branch and grants necessary permissions for writing contents and pull requests. It uses the `google-github-actions/release-please-action@v3` action to generate releases based on semantic versioning rules for a Node package named `release-please-action`. The changelog types are defined as "feat" (Features), "fix" (Bug Fixes), and "chore" (Miscellaneous). Pull request titles follow the pattern "release${component} ${version}", and include a robot emoji with an updated changelog header.
<!-- COMMIT_DESC -->
    
    
    ...
- Update package version to 2.1.51 ([c2f8753](https://github.com/webmappsrl/webmapp-app/commit/c2f8753f1a4073d4e7f18e9582fe94ea097cff65))
<!-- COMMIT_DESC -->
    
    This commit updates the package.json file, specifically the "version" field, from 0.0.1 to 2.1.51 in accordance with semantic versioning guidelines.
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
