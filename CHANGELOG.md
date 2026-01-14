# Changelog

## [3.1.8](https://github.com/webmappsrl/webmapp-app/compare/v3.1.7...v3.1.8) (2026-01-14)


### Bug Fixes

* **modal-save:** ✨ add logic to remove current track for new tracks oc:6582 ([33d4520](https://github.com/webmappsrl/webmapp-app/commit/33d4520fac6da5bfe97b84e710e82591315022a2))


### Miscellaneous

* **dependencies:** 🔄 update background-geolocation package to v1.2.26 ([39ab7dc](https://github.com/webmappsrl/webmapp-app/commit/39ab7dcc1076d6e2ca7f155ad1bbba79fc989069))
* enrich changelog with commit descriptions ([c1bf42e](https://github.com/webmappsrl/webmapp-app/commit/c1bf42ef071306268ee0267199abf416132f33a7))
* enrich changelog with commit descriptions ([7576b1e](https://github.com/webmappsrl/webmapp-app/commit/7576b1e13c172e3950ecfb366a0efca9b917336a))
* enrich changelog with commit descriptions ([33b2a58](https://github.com/webmappsrl/webmapp-app/commit/33b2a58add10eaaecae4e517f946c83e310103fa))
* **map-core:** changelog for bump to 234fbf1 ([55cf3a7](https://github.com/webmappsrl/webmapp-app/commit/55cf3a7398012c4e8e3be3ecabe2cc3a94976d57))
* **map-core:** changelog for bump to 3701dce ([2aeb1ac](https://github.com/webmappsrl/webmapp-app/commit/2aeb1ace764164a7188b57bd22cf5bd9c7e28b61))
* remove unused UGC track test and related functions oc:6672 ([#173](https://github.com/webmappsrl/webmapp-app/issues/173)) ([1104ed7](https://github.com/webmappsrl/webmapp-app/commit/1104ed729fd49f48cac9788fb20c3dfcd57e0545))
* **ugc-track:** add e2e test for resuming UGC track recording oc: 6889 ([#174](https://github.com/webmappsrl/webmapp-app/issues/174)) ([cec8776](https://github.com/webmappsrl/webmapp-app/commit/cec8776d204cfa01558fb6ab77804e35069f147e))
* **wm-core:** changelog for bump to 0c5ca30 ([61aa49b](https://github.com/webmappsrl/webmapp-app/commit/61aa49b3ea52b78b970d4061d1caadbcac492d3b))
* **wm-core:** changelog for bump to 4bf49d9 ([f7eec72](https://github.com/webmappsrl/webmapp-app/commit/f7eec7277bef83b3551a5c9d468c673670047b7a))
* **wm-core:** changelog for bump to 571c827 ([6b22e23](https://github.com/webmappsrl/webmapp-app/commit/6b22e23f020063925064747dfc5d8da07b544126))
* **wm-core:** changelog for bump to b35e4d6 ([c4ba468](https://github.com/webmappsrl/webmapp-app/commit/c4ba4685f38d507c56881a68e8f62668a03517fd))
* **wm-types:** changelog for bump to ec39ac9 ([e339305](https://github.com/webmappsrl/webmapp-app/commit/e339305f91217cf711d281154c5aec208512070e))
* **wm-types:** changelog for bump to f9b7df9 ([3a01185](https://github.com/webmappsrl/webmapp-app/commit/3a011855e1ad5c6fd296f2f543f10f6a3ec4b2df))

## [3.1.7](https://github.com/webmappsrl/webmapp-app/compare/v3.1.6...v3.1.7) (2025-11-21)


### Miscellaneous

* enrich changelog with commit descriptions ([427711f](https://github.com/webmappsrl/webmapp-app/commit/427711f0226e7a06ba493e726b7c054c0016f564))
<!-- COMMIT_DESC -->
    
    Enhanced the URL query parameters for the 'home' tab by including the 'search' parameter. This ensures that the search state is preserved and properly handled when navigating to the home tab.
<!-- COMMIT_DESC -->
    
    - chore(device): ✨ add isAppMobile property to enhance mobile detection
    Introduced a new property `isAppMobile` in the `DeviceService` to better determine if the application is running on a mobile device but not in a browser. Updated the configuration effect and reducer to incorporate this new property.
    
    - Added `isAppMobile` getter in `DeviceService`.
    - Updated `ConfEffects` to include `isAppMobile` in the configuration state.
    - Modified the `conf.reducer.ts` to initialize `isAppMobile`.
    - Extended the `ICONF` interface to define the `isAppMobile` property.
    
    This change improves the ability to differentiate between mobile app environments and browser-based environments, which can be critical for certain app behaviors and optimizations.
    
    - refactor(modal-release-update): ✨ rename productionVersion to gitVersion
    The `productionVersion` input has been renamed to `gitVersion` across several components to better reflect its purpose. Updated the modal-release-update component and related service logic accordingly.
    
    fix(device.service): 🐛 modify checkIfUpdateNeeded to return boolean
    
    Changed the function `checkIfUpdateNeeded` to consistently return a boolean value, avoiding null returns and ensuring a more predictable flow.
    
    refactor(store): 🔥 remove unused APP_VERSION injection
    
    Cleaned up imports and removed the unused `APP_VERSION` injection from the conf effects. This streamlines the code and removes unnecessary dependencies.
    
    fix(browser.open): 🐛 simplify store URL opening logic
    
    Simplified logic for opening the store URL by directly using `window.open` and handling errors with `Browser.open`.
    
    refactor(conf.selector): 🔥 remove unused confReleaseUpdate selector
    
    The `confReleaseUpdate` selector was removed as it was not used in the application, streamlining the selector file.
    
    - chore: optimize selector imports <a href="https://orchestrator.maphub.it/resources/customer-stories/6540" target="_blank" rel="noopener noreferrer">OC[6540]</a>
    Streamlines imports by consolidating selectors, removing unused
    types, and enhancing import efficiency.
    
    Relates to oc_6540
    
    - chore: normalize version comparison logic <a href="https://orchestrator.maphub.it/resources/customer-stories/6540" target="_blank" rel="noopener noreferrer">OC[6540]</a>
    Ensures both app and GitHub versions are prefixed with "1" before comparison. This guarantees consistency for version checks, especially for incorrect SKU versions.
    
    Relates to oc_6540
    
    - refactor: update APP type usage <a href="https://orchestrator.maphub.it/resources/customer-stories/6540" target="_blank" rel="noopener noreferrer">OC[6540]</a>
    Replaces IAPP with APP for improved type consistency across services and components. Adjusts import statements and updates related type references to enhance code maintainability.
    
    Relates to oc_6540
    - chore(device): add modal for release update notifications <a href="https://orchestrator.maphub.it/resources/customer-stories/6540" target="_blank" rel="noopener noreferrer">OC[6540]</a>
    Introduces functionality to display a modal prompting users to update the app if needed, utilizing update logic previously found in the config effects. This refactoring centralizes the logic within the device service for better maintainability and separation of concerns.
    
    Relates to oc_6540
    
    - refactor: streamline update process and checks <a href="https://orchestrator.maphub.it/resources/customer-stories/6540" target="_blank" rel="noopener noreferrer">OC[6540]</a>
    Refactors device handling by encapsulating URL opening logic within
    the device service. Simplifies version retrieval by removing network
    status checks and observable-based retries, transitioning to a simpler
    promise-based approach. Adds effect for app version check using store
    state. Removes obsolete conf effects file.
    
    Relates to oc_6540
    - refactor: remove excessive logging from openStore <a href="https://orchestrator.maphub.it/resources/customer-stories/6540" target="_blank" rel="noopener noreferrer">OC[6540]</a>
    Eliminates redundant logs to streamline the openStore method's
    output. Reduces console noise and improves readability while
    maintaining error-handling logic.
    
    Relates to #6540
    
    - refactor: update device handling logic <a href="https://orchestrator.maphub.it/resources/customer-stories/6540" target="_blank" rel="noopener noreferrer">OC[6540]</a>
    Replaces direct Capacitor platform checks with DeviceService methods
    to improve reliability and maintain better abstraction.
    
    Moves release update check logic to new ConfEffects to optimize
    code structure and streamline update modal management.
    
    Modifies ConfEffects to include a new effect ensuring release update modal
    is shown when required conditions are met.
    
    Relates to #6540
    - fix: remove unnecessary fallback logic <a href="https://orchestrator.maphub.it/resources/customer-stories/6540" target="_blank" rel="noopener noreferrer">OC[6540]</a>
    Removes fallback logic for app store URLs when the device is not
    Android or iOS, returning null instead. Simplifies URL retrieval
    logic and prevents possible misdirection.
    
    Relates to oc_6540
    
    - refactor: enhance e2e testability by adding attributes <a href="https://orchestrator.maphub.it/resources/customer-stories/6540" target="_blank" rel="noopener noreferrer">OC[6540]</a>
    Adds E2E test attributes to modal components for better automation.
    
    Removes debug logs in the service to clean up console output.
    Optimizes error handling by simplifying catch blocks.
    
    Refines logic to ensure modal checks and presentations
    occur only on mobile devices.
    
    Relates to #oc_6540
    
    - chore(modal-release-update): add version update modal <a href="https://orchestrator.maphub.it/resources/customer-stories/6540" target="_blank" rel="noopener noreferrer">OC[6540]</a>
    Introduces a new modal component for notifying users about app
    version updates with options for immediate updates or dismissals.
    Integrates browser capabilities for store navigation linked to
    provided URLs.
    
    Relates to oc_6540
    
    - chore(localization): add notification for updates <a href="https://orchestrator.maphub.it/resources/customer-stories/6540" target="_blank" rel="noopener noreferrer">OC[6540]</a>
    Introduces new translations for update-related messages across multiple languages. Implements a new device service to handle update notifications, including checks for the latest app version and network status. Aligns translations for clearer communication of update availability and actions.
    
    Relates to issue oc_6540
* **wm-core:** changelog for bump to d70c95f ([0a43f27](https://github.com/webmappsrl/webmapp-app/commit/0a43f271cd0d12488e7b9c5203744301f14f3c04))
<!-- COMMIT_DESC -->
    
    - refactor(conf): ♻️ streamline layer selection logic
    Replaced the `confHOME` selector with `confMAP` for improved clarity and functionality. Simplified the logic by directly accessing the `map.layers` array. This change eliminates unnecessary filtering and mapping, allowing for a more efficient search for the layer with the corresponding ID. The refactor also removes unused imports and variables, resulting in cleaner, more maintainable code.
    
    - Oc 6528 (#143)
    * chore(localization): add language selector component oc_6528
    
    Integrates a new language selector to enhance user localization options,
    including a button that triggers a selection alert with available languages.
    Simplifies UI by removing the form-based language selection.
    Relates to oc_6528
    
    * chore: add "Language" translation to i18n files <a href="https://orchestrator.maphub.it/resources/customer-stories/6528" target="_blank" rel="noopener noreferrer">OC[6528]</a>
    
    Introduces a new "Language" translation entry across all supported languages
    (i.e., German, English, Spanish, French, Italian, Portuguese, and Albanian).
    Updates the language selector component to utilize this new translation.
    
    Related to oc_6528
    
    * chore(lang-selector): enhance language selector UI <a href="https://orchestrator.maphub.it/resources/customer-stories/6528" target="_blank" rel="noopener noreferrer">OC[6528]</a>
    
    Introduces display of selected language and label text in the UI.
    Uses ChangeDetectorRef to ensure UI updates on language changes.
    
    Relates to oc_6528
    
    * chore(lang-selector): simplify UI logic <a href="https://orchestrator.maphub.it/resources/customer-stories/6528" target="_blank" rel="noopener noreferrer">OC[6528]</a>
    
    Refactors language selector UI for cleaner layout management.
    Removes obsolete inputs, consolidates logic for displaying
    selected language and title. Enhances alignment using CSS
    
    Relates to oc_6528
    
    * style: reorder map components for better layout <a href="https://orchestrator.maphub.it/resources/customer-stories/6528" target="_blank" rel="noopener noreferrer">OC[6528]</a>
    
    Moves profile popup and language selector above filters to improve UI arrangement. Ensures the top-right elements maintain consistency in positioning and functionality.
    
    Relates to oc_6528
    
    ---------
    
    Co-authored-by: peppedeka <peppedeka@gmail.com>
    - refactor(profile): 🔄 integrate delete account feature and enhance translations (#144)
    This update includes the removal of the `WmPrivacyAgreeButtonComponent` from the box module and its integration into the profile module. The `WmPrivacyAgreeButtonComponent` and a newly added `WmProfileDeleteButtonComponent` are now part of the shared module, enabling broader use across the application.
    
    Additionally, new translations were added for multiple languages, enhancing the user interface's clarity, especially regarding the irreversible action of account deletion. This functionality requires users to type "delete account" to confirm the deletion, adding an extra layer of confirmation to prevent accidental account deletions.
    - refactor(home): 🔄 remove deprecated layer handling logic (#142)
    Simplified the subscription logic in `WmHomeComponent` by removing the deprecated layer handling code. The component now only processes filters, reducing potential errors and improving code maintainability.
    
    refactor(conf): ♻️ add `take` operator for single emission
    
    Introduced the `take` operator in `updateLayer$` effect to ensure the home state is only processed once per action emission. This change enhances the predictability and performance of the effect by preventing unnecessary emissions.
    
    - refactor(geolocation-service): ♻️ improve location update handling
    Refactored the `_startWebWatcher` method in the `GeolocationService` to enhance clarity and maintainability. Introduced a `location` constant to hold the geolocation data before passing it to the `_onLocationUpdate` method. Additionally, updated the `properties` of `_recordedFeature` to include the new location object, ensuring the `locations` array is correctly populated.

## [3.1.6](https://github.com/webmappsrl/webmapp-app/compare/v3.1.5...v3.1.6) (2025-10-28)


### Miscellaneous

* **app:** ✨ load icons on app initialization ([#162](https://github.com/webmappsrl/webmapp-app/issues/162)) ([56f8c9c](https://github.com/webmappsrl/webmapp-app/commit/56f8c9cbedd3bbf30f4f423293fbdf58d7278102))
<!-- COMMIT_DESC -->
    
    Added the dispatch of `loadIcons()` action in the `AppComponent` constructor to ensure icons are loaded during the app's initialization phase.
    
    feat(poi-properties): ✨ integrate readonly form in poi properties
    
    Added a readonly form in the `poi-properties.component.html` to display POI form data if available. Updated the component to include necessary selectors and form group management.
    
    Added a TODO in the HTML to consider merging `ugc-properties` with `poi-properties`.
    
    - refactor(auth): ♻️ simplify header logic and remove app_id from privacy
    The auth interceptor has been updated to streamline the header setting logic. The 'Authorization' header is now conditionally added only if the 'idToken' is present. This change simplifies the code and improves readability.
    
    Additionally, the 'app_id' field has been removed from the 'Privacy' interface and related logic in the 'auth.service.ts' file. This reflects a change in how privacy agreements are managed, no longer requiring an 'app_id'.
    
    - style(poi-box): 💄 adjust position of top-right-content for better alignment
    Reduced the right and top positioning from 10px to 5px for the `.top-right-content` in `poi-box.component.scss`.
    
    style(ugc-synchronized-badge): 💄 enhance badge icon appearance
    
    Added border-radius, padding, and background color to the `ion-icon` within `ugc-synchronized-badge.component.ts` to improve visual appearance.
    
    - refactor(icons): ♻️ convert svg rendering to wm-icon component <a href="https://orchestrator.maphub.it/resources/customer-stories/6351" target="_blank" rel="noopener noreferrer">OC[6351]</a> (#140)
    * refactor(icons): ♻️ convert svg rendering to wm-icon component
    
    Replaced inline SVG rendering logic in multiple components with a reusable `wm-icon` component to streamline icon handling. This change affects several components including `search-box`, `filters`, `select-filter`, `status-filter`, `poi-types-badges`, `tab-howto`, and `track-related-poi`.
    
    - Introduced `wm-icon` component with logic to select and render icons based on data.
    - Removed redundant SVG rendering logic from the affected components.
    - Updated the respective HTML and SCSS files to accommodate the changes.
    - Added `WmIconComponent` to `WmSharedModule`.
    
    These changes aim to reduce code duplication and improve maintainability by centralizing icon rendering logic.
    
    * refactor(conf): ♻️ remove redundant geohubId check and layer processing
    
    The code checking for `geohubId === 3` and processing map layers for edges and crossroads has been removed. This simplifies the reducer by eliminating unnecessary logic that was specific to a certain geohub configuration. Now, the MAP state update only merges the incoming configuration without additional processing.
    
    - Merge pull request #9 from webmappsrl/oc_6255
    Oc 6255
    - fix(environment): 🔧 update AWS API URL to use HTTPS
    Changed the `awsApi` URL from HTTP to HTTPS for improved security and to ensure data is transmitted over a secure connection. This change affects the `geohub-dev` shard configuration in the `environment.ts` file.
    
    - refactor(consent): update privacy agreement interface <a href="https://orchestrator.maphub.it/resources/customer-stories/6255" target="_blank" rel="noopener noreferrer">OC[6255]</a>
    Replaces data consent interfaces with privacy agree interfaces
    to better align with updated privacy policies. This refactor
    includes changing various related interfaces and exports
    to ensure consistency and clarity in handling privacy agreements.
    
    - chore: add SyncUgcTypes type <a href="https://orchestrator.maphub.it/resources/customer-stories/6255" target="_blank" rel="noopener noreferrer">OC[6255]</a>
    Introduce SyncUgcTypes for specifying 'poi', 'track', or null.
    Enhances the definition of UGC synchronization types.
    
    - chore: add data consent interfaces <a href="https://orchestrator.maphub.it/resources/customer-stories/6255" target="_blank" rel="noopener noreferrer">OC[6255]</a>
    Introduce interfaces for managing data consent in compliance with GDPR and privacy regulations. This includes defining structures for tracking consent periods, consent history, and API responses related to user consent.
    
    Exported the new types to be accessible across the project.
    
    - ....
    
    - add prod osm2cai
    
    - fix(environment): 🐛 update URLs for osm2caidev shard
    Corrected the URLs for the osm2caidev shard to ensure proper connectivity and resource access. Updated the `origin`, `elasticApi`, and `awsApi` URLs to reflect the new domain structure.
### Miscellaneous

* **android:** 🔧 update SDK versions in variables.gradle ([c71dc5f](https://github.com/webmappsrl/webmapp-app/commit/c71dc5fc829d367ee4fcccc1d44c463fc0426adc))
<!-- COMMIT_DESC -->
    
    Updated the compileSdkVersion and targetSdkVersion to 35 in the variables.gradle file for Android projects. This change ensures compatibility with the latest Android SDK requirements.
    
    - chore(conf): ✨ add showDownloadTilesButton option
    Added a new configuration option `showDownloadTilesButton` to the application's state management. This allows for toggling the visibility of the download tiles button in the user interface. The change includes updates to the reducer, selector, and configuration type definitions to support this new option.
    
    * chore(download-panel): ✨ add download size display and translations
    
    Enhanced the download panel to display the download size. Updated the HTML to conditionally show the download size using a new template. Modified TypeScript logic to exclude 'size' from completion checks. Added translations for "Download size" in multiple languages including German, English, Spanish, French, Italian, Portuguese, and Albanian.
    
    * Updated submodule core/src/app/shared/map-core
    
    - chore(map): 🌟 add bounding box download and overlay management
    Added new directive for managing tile downloads by bounding box. Implemented animation for bounding box delete button and new styles. Added ngrx effects to handle bounding box actions and updated the reducer to manage bounding box state. Enhanced localForage utility with functions for saving, deleting, and retrieving bounding boxes. Updated constants for tile download limits and introduced new actions for bounding box management.
    
    - Added `WmMapTilesDownloadDirective` for handling tile downloads.
    - Integrated bounding box animation and styles.
    - Incorporated ngrx effects for loading and deleting bounding boxes.
    - Extended localForage utilities with bounding box operations.
    - Updated map-core module to include new directive and effects.
    - Modified map-core actions and reducer to accommodate bounding box state.
    - Introduced new constants for bounding box functionality.
    
    - chore(map): 🌍 add tile download feature with bounding box management
    This update introduces the ability to download map tiles by managing bounding boxes. Users can now select areas on the map for downloading tiles. The feature includes:
    
    - UI elements for enabling tile downloads and displaying bounding boxes.
    - Functions for setting bounding boxes and disabling/enabling download buttons.
    - A delete confirmation dialog for removing bounding boxes with multi-language support.
    - State management for enabling and disabling tile downloads, handling bounding boxes, and related UI changes.
    - Updated localization files to support new strings in multiple languages.
    
    - chore(track-properties): ✨ add wm-inner-component-html for excerpt display (#135)
    Added a new `wm-inner-component-html` element to display excerpts within the track properties component. This element is conditionally rendered based on the availability of the `excerpt` property from `ecTrackProperties`. The `enableDismiss` attribute is set to false to prevent dismissal, and the content is transformed using the `wmtrans` pipe.
<!-- COMMIT_DESC -->
    
    * chore(poi): ✨ add Point of Interest (POI) recording functionality
    
    This commit introduces the ability to record User Generated Content (UGC) Points of Interest (POI) within the application. Key changes include:
    
    - Creation of a new `PoiRecorderComponent` for recording POIs.
    - Modification of existing track recording components and modules to support POI recording.
    - Removal of the old waypoint page and its related components.
    - Update of localization files to include new translations for POI recording.
    - Adjustment of routing and component architecture to integrate the new POI recording feature seamlessly within the app.
    
    These changes allow users to record and save POIs, enhancing the application's functionality for user-generated map content.
    
    * Updated submodule core/src/app/shared/map-core
    
    * Updated submodule core/src/app/shared/wm-core
    
    * refactor(e2e): ♻️ use mapReadyTimeout constant for consistency
    
    Updated Cypress e2e tests to use the `mapReadyTimeout` constant instead of hardcoded timeout values. This improves maintainability by centralizing timeout configuration.
    
    - Added `mapReadyTimeout` constant in `test-utils.ts`.
    - Replaced hardcoded timeout values with `mapReadyTimeout` in related test files.
    - Adjusted `appId` in `environment.ts` for configuration consistency.
    
    * fix(e2e): 🐛 update selectors for waypoint save button
    
    Updated the Cypress test for the wm-form field to use the correct selectors for the waypoint save button. The previous selectors were outdated and caused test failures. The new selectors ensure that the test accurately reflects the current UI elements.
    
    * style(ui): 💄 update ion-card positioning with safe area insets
    
    Adjusted the positioning of the `ion-card` in both `poi-recorder.component.ts` and `track-recorder.component.scss` to account for safe area insets. This change ensures proper layout and appearance on devices with notches or other display cutouts by using `env()` for `safe-area-inset-left`, `safe-area-inset-right`, and `safe-area-inset-top`.
    
    * refactor(modal-save): ♻️ simplify save method with updated device info flow
    
    Removed unnecessary async/await for device information retrieval. Integrated device info into a reactive stream using switchMap to update the `ugcFeature` properties. Ensured modal dismissal logic is reactive and streamlined the subscription handling for dispatching sync actions. This refactor enhances the maintainability and readability of the `save` method.
    
    * refactor(poi-recorder): ♻️ separate HTML and SCSS from TypeScript component
    
    The template and styles of the poi-recorder component have been moved from the TypeScript file into their respective HTML and SCSS files. This separation improves code organization and maintainability. The HTML content is now located in `poi-recorder.component.html` and the styles in `poi-recorder.component.scss`. The TypeScript component file now references these files using `templateUrl` and `styleUrls`.
    
    * Updated submodule core/src/app/shared/wm-core
    
    * refactor(map): ♻️ rename wm-recorder to wm-track-recorder
    
    Updated the SCSS to change the class name from `wm-recorder` to `wm-track-recorder` to better reflect its functionality. This change affects both `.onlyTitle` and `.open` sections for consistent naming conventions.
    
    * Updated submodule core/src/app/shared/wm-core
    
    - chore(map): 🗺️ add focus position and recording panel functionality <a href="https://orchestrator.maphub.it/resources/customer-stories/5239" target="_blank" rel="noopener noreferrer">OC[5239]</a> (#130)
    * chore(map): 🗺️ add focus position and recording panel functionality
    
    Added new functionalities to the geobox map component including focus position and recording panel toggles. Updated HTML to bind new observables for map control parameters. Refactored TypeScript to manage state and integrate with GeolocationService. Introduced new actions and effects for handling recording state and focus position. Modified reducer and selectors to manage corresponding states.
    
    - Added `[wmMapDisableFitView]` and `[wmMapGeojson]` bindings to HTML.
    - Introduced `focusPosition$`, `enableRecoderPanel$`, and `recordedTrack$` observables.
    - Updated GeolocationService to dispatch actions for recording state changes.
    - Created new actions: `setEnableRecoderPanel`, `setOnRecord`, and `setFocusPosition`.
    - Added effects to handle side effects of recording state changes.
    - Enhanced reducer and selectors for new states: `enableRecoderPanel`, `onRecord`, and `focusPosition`.
    
    This enhancement allows better user control over focus positioning and track recording within the map interface.
    
    * chore(geolocation): ✨ add recording of coordinates in web watcher
    
    Enhanced the `_startWebWatcher` method in `GeolocationService` to record coordinates when in 'recording' mode. This change appends the current location's longitude, latitude, and altitude to the `_recordedFeature.geometry.coordinates` array, allowing for continuous tracking of location updates.
    
    * refactor(geobox-map): ♻️ rename and refactor focus position logic
    
    This commit updates the `geobox-map.component` to rename the `focusPosition$` observable to `wmMapPositionfocus$` for consistency with other naming conventions in the component. It also refactors the way the focus position is handled by changing its type from `BehaviorSubject` to `Observable` and directly selecting it from the store using `this._store.select(focusPosition)`.
    
    Additionally, the HTML template is updated to reflect this change by using the new `wmMapPositionfocus$` binding. These changes ensure a more consistent and maintainable codebase by aligning variable names and removing unnecessary observables.
    
    * refactor(geobox-map): ♻️ update map component and feature selector logic
    
    Enhanced the `WmGeoboxMapComponent` by replacing `wmMapPositionfocus$` with `enableRecoderPanel$` for better clarity and functionality. Adjusted the logic to append coordinates only when `enableRecoderPanel` is active. Also, updated the `features.selector.ts` to include `enableRecoderPanel` in the `showFeaturesInViewport` selector for improved feature visibility control.
    
    * refactor(geobox-map): ♻️ move side effects from observable to subscription
    
    The side effects initially present within the `enableRecoderPanel$` observable were moved to a separate subscription. This improves readability and separates the data stream definition from side effect handling. Now, `enableRecoderPanel$` simply represents the data stream, and the side effects (resetting `_linestring` and `recordedTrack$`) are handled explicitly in a subscription.
    - refactor(features-in-viewport): 🔄 make sliderOptions observable <a href="https://orchestrator.maphub.it/resources/customer-stories/6000" target="_blank" rel="noopener noreferrer">OC[6000]</a> (#133)
    * refactor(features-in-viewport): 🔄 make sliderOptions observable
    
    Changed sliderOptions to an observable sliderOptions$ to dynamically adjust slide settings based on the number of features in the viewport. This allows for different configurations when there is only one feature compared to multiple features. The adjustment includes changes to properties like `slidesPerView`, `spaceBetween`, `slidesOffsetBefore`, `slidesOffsetAfter`, and `centeredSlides`.
    
    * refactor(features-in-viewport): ♻️ extract slider options logic to a private method
    
    Simplified the logic for determining slider options by extracting it into a private method `_getSliderOptions`. This method takes the feature count as an argument and returns the appropriate slider configuration, reducing redundancy and improving code readability.
    - chore(draw-ugc-button): ✨ add e2e attributes to buttons
    Enhanced the draw UGC button component by adding end-to-end test attributes to the buttons. This includes:
    
    - `e2e-draw-button` for the main draw button.
    - `e2e-draw-button-exit` for the exit button in the drawing feature template.
    - `e2e-draw-button-poi` for the point of interest draw button.
    - `e2e-draw-button-track` for the track draw button.
    
    These attributes facilitate automated testing by providing selectors for interaction and validation.
    
    - refactor(ugc): ♻️ rename action to setCurrentUgcPoiDrawnSuccess
    Renamed `setCurrentUgcPoiDrawn` to `setCurrentUgcPoiDrawnSuccess` in `draw-ugc.component.ts` and `user-activity.effects.ts`. This change clarifies the purpose of the action by explicitly indicating success, improving code readability and maintainability. Updated corresponding imports and usages across the files to reflect this change.
    
    - fix(localization): 🐛 correct typo in "downloads" across multiple translations <a href="https://orchestrator.maphub.it/resources/customer-stories/5967" target="_blank" rel="noopener noreferrer">OC[5967]</a>
    Corrected the typo "donwloads" to "downloads" in the Italian text and its translations in the HTML component and localization files for multiple languages including German, English, Spanish, French, Italian, Portuguese, and Albanian. This ensures consistency and accuracy in all related text translations.
    
    - chore(testing): ✨ add Karma configuration and initial unit tests for UGC service (#128)
    Introduced Karma configuration to the project to enable unit testing with Jasmine and Angular testing utilities. Added initial unit tests for the `UgcService`, focusing on EXIF data cleaning and `FormData` building functionalities.
    
    - Added `karma.conf.js` for Karma setup with necessary plugins.
    - Updated `package.json` with test scripts for running tests via Karma.
    - Created `ugc.service.spec.ts` to implement tests for the `UgcService`.
    
    These additions enhance the project's testability by providing a framework and initial test cases for verifying the functionality of the UGC service.
    
    - Enhance changelog script to append commit body descriptions automatically
    - Detect lines with commit hashes and retrieve their corresponding commit bodies
    - Transform OC references into clickable links within the commit bodies
    - Add a marker for commit descriptions to differentiate them in the changelog
    - Handle already present descriptions by copying indented lines following the marker
    - Improve readability and maintainability of changelog entries by automating body inclusion
    
    - Removed trailing slash from 'osm2caidev' origin URL in both production and development environment files for consistency.
    - Updated 'shardName' from 'carg' to 'osm2caidev' in development environment to reflect the correct configuration.
    
    Introduces two webp profile images to the assets folder.
    
    - Updated `origin`, `elasticApi`, and `awsApi` endpoints for `carg` and `cargdev` configurations in both production and development environments.
    - Changed `appId` and `shardName` values and added `debug` flag in the development environment configuration for improved debugging capabilities.
    - Adjusted URLs to reflect new domain structure and storage paths for better resource management.
    
    - Removed the dark color from the navigation icon in `map.page.html` to use the default color.
    - Added a new input `[wmMapPositionCenter]` in `register.page.html` to bind the `centerPositionEvt$`.
    - Introduced a new center position button in the register page's fab container for centering the map.
    - Updated the SCSS for the fab button in `register.page.scss` to control the size and margin.
    - Added `centerPositionEvt$` BehaviorSubject to `register.page.ts` to manage the center position state.
    
    * chore(theme): ✨ add camminiditalia theme and reorganize geohub theme
    
    - Introduced new CSS styling for the camminiditalia theme in `1.css`, setting specific padding and transformations for the `wm-home-header-container`.
    - Reorganized the geohub theme by renaming `75.css` to `geohub/75.css` for improved structure and clarity.
    
    * Updated submodule core/src/app/shared/wm-core
    
    * fix(theme): 🐛 adjust header container translation and prevent horizontal overflow
    
    Added overflow-x: hidden to the root of wm-home to prevent horizontal scrolling. Adjusted the transform property of wm-home-header-container for proper alignment.
    
    - chore(image-picker): ✨ add readonlyPhotos support and improve photo handling <a href="https://orchestrator.maphub.it/resources/customer-stories/5240" target="_blank" rel="noopener noreferrer">OC[5240]</a> (#123)
    * chore(image-picker): ✨ add readonlyPhotos support and improve photo handling
    
    Enhanced the `WmImagePickerComponent` to support `readonlyPhotos` input, allowing pre-existing photos to be displayed and managed separately from newly added photos. This ensures that photos with an `id` are treated as immutable and not duplicated when adding new photos.
    
    Changes include:
    - Updated `image-picker.component.html` to conditionally display the remove icon only for photos without an `id`.
    - Introduced `readonlyPhotos` input and a `showPhotos$` observable for better photo management in `image-picker.component.ts`.
    - Modified `ugc.service.ts` to filter out photos with an `id` before processing.
    - Updated UGC POI and Track property components to integrate the image picker with the new `readonlyPhotos` functionality, ensuring that `media` property is correctly updated with changes.
    
    This enhancement allows for a seamless integration of existing photos with new additions, providing a more robust user experience when managing images.
    
    chore(image-picker): ✨ add synchronized badge and delete functionality for UGC media
    
    Updated the image picker component to include a synchronized badge for images and handle deletion of UGC media. Added a new action, effects, and selectors to manage media deletion using NgRx.
    
    - Introduced `synchronizedPhotos` input to handle synchronized media.
    - Added `wm-ugc-synchronized-badge` to display a badge on synchronized images.
    - Modified the `remove` method to dispatch a `deleteUgcMedia` action for media with an ID.
    - Added corresponding NgRx actions: `deleteUgcMedia`, `deleteUgcMediaSuccess`, and `deleteUgcMediaFailure`.
    - Implemented effects to handle media deletion API calls and success/failure notifications using Ionic alerts.
    - Adjusted selectors to manage current UGC features.
    
    This change enhances the image picker by providing visual feedback for synchronized images and allowing users to delete media with persistence through the backend.
    
    chore(image-picker): ✨ enhance photo management with BehaviorSubject
    
    Introduce `BehaviorSubject` for managing local and synchronized photos separately within the `WmImagePickerComponent`. This approach leverages `combineLatest` to merge both local and synchronized photos streams, ensuring a consolidated view of all photos. The component now implements `OnDestroy` to handle subscription clean-up, preventing memory leaks. Additionally, the logic for adding and removing photos has been updated to interact with the new subjects, ensuring consistent state management.
    
    fix(ugc): 🐛 update UGC reducer and effects for media deletion
    
    Enhance the UGC handling by updating the reducer and effects to properly manage media deletion. When a media item is deleted, the `deleteUgcMediaSuccess` action now carries the media information, allowing the reducer to update the current UGC state accurately. The effects have been adjusted to ensure synchronization actions follow successful deletions, maintaining consistency in the application's state. Additionally, selectors have been introduced to easily access UGC entities' IDs.
    
    * chore(ugc): ✨ add confirmation modal before media deletion
    
    A confirmation modal is now presented to the user before deleting media. The modal asks the user to confirm the deletion or cancel the operation. If the user confirms (chooses the "Elimina" option), the media is deleted. If the user cancels, the deletion is aborted.
    
    This change enhances user interaction by preventing accidental deletions and providing a clear option to cancel the action.
    
    * fix(ugc): 🐛 update API endpoints to version 3
    
    Updated the API endpoints for editing POIs and tracks from version 2 to version 3 in the UgcService. This ensures compatibility with the latest API changes and should fix issues related to outdated endpoints.
    
    * fix(ugc-poi-properties): 🐛 fix media property default value
    
    Remove fallback to current UGC POI media when `_photos` is undefined. The media property now defaults to an empty array instead.
    
    fix(ugc-track-properties): 🐛 fix media property default value
    
    Remove fallback to current track properties media when `_photos` is undefined. The media property now defaults to an empty array instead.
    - fix(auth): 🐛 ensure email is in lowercase during login and signup <a href="https://orchestrator.maphub.it/resources/customer-stories/5238" target="_blank" rel="noopener noreferrer">OC[5238]</a> (#124)
    * fix(auth): 🐛 ensure email is in lowercase during login and signup
    
    Convert the email to lowercase before passing it to the login and sign-up methods to ensure consistency and prevent issues related to case-sensitivity. This change helps in avoiding potential mismatches or errors when users input their email in different cases.
    
    * refactor(auth): ♻️ move email lowercase transformation to service
    
    The transformation of the email to lowercase has been moved from the effects layer to the service layer for both login and sign-up actions. This change centralizes the email formatting logic, ensuring consistency and reducing redundancy. By handling the lowercase transformation within the AuthService, we simplify the effects and ensure that any email processing logic is contained within the service that manages authentication.
    
    - refactor(meta): 🔄 replace confGeohubId with EnvironmentService for theme application
    Removed the usage of `confGeohubId` observable and replaced it with `shardName` and `appId` from `EnvironmentService`. This change simplifies the theme application logic by directly using the environment service to retrieve the necessary identifiers for constructing the theme stylesheet URL.
    
    Additionally, added a `shardName` getter in the `EnvironmentService` to expose the private `_shardName` property for external usage.
    
    - chore(ugc): ✨ add EXIF data cleaning feature to remove special characters <a href="https://orchestrator.maphub.it/resources/customer-stories/5926" target="_blank" rel="noopener noreferrer">OC[5926]</a> (#127)
    * chore(ugc): ✨ add EXIF data cleaning feature to remove special characters
    
    Introduced a new method to clean EXIF data from special characters before sending it. This ensures that any Unicode characters which may cause issues are removed. This update includes:
    
    - A `_cleanExifData` method to iterate over media properties and clean EXIF data.
    - A `_cleanObject` helper function to recursively clean invalid Unicode characters from strings and objects.
    
    * refactor(ugc): ♻️ clone feature object to prevent mutation
    
    In the `_cleanExifData` method, a deep clone of the `feature` object is created using `structuredClone`. This prevents mutations to the original `feature` object when cleaning EXIF data. The cleaned feature object is returned instead of the original. This change ensures that the original data remains untouched, improving data integrity.
    
    - chore(media): ✨ add MAX_PHOTOS constant and update import path
    Introduced a new constant `MAX_PHOTOS` in the `media.ts` file within the `wm-core` project. This file is created to store media-related constants. Updated the `image-picker.component.ts` to import `MAX_PHOTOS` from the new location `@wm-core/constants/media` instead of the previous `@map-core/readonly/constants`. This change enhances code organization by centralizing media constants.
    
    - chore(geobox-map): ✨ add map controls support <a href="https://orchestrator.maphub.it/resources/customer-stories/5248" target="_blank" rel="noopener noreferrer">OC[5248]</a> (#117)
    Enabled map controls by adding the `wmMapEnableMapControls` binding to the component template. This enhancement provides users with additional interactive options on the geobox map, improving the overall user experience.
    - chore(form): ✨ add conditional display of form field <a href="https://orchestrator.maphub.it/resources/customer-stories/5247" target="_blank" rel="noopener noreferrer">OC[5247]</a> (#118)
    * chore(form): ✨ add conditional display of form field
    
    Updated the form component to conditionally display the form field based on the number of available forms. The form field will only be shown if there is more than one form available. This change improves the user interface by preventing unnecessary form field displays when there is only a single form option.
    
    * chore(form): ✨ add fallback UI for single form type selection
    
    Added a fallback UI for cases where there is only one form type available. The form will now display a title with the form type if only one is present, instead of showing a select dropdown. Updated the HTML template to include an `ng-template` for this scenario and added corresponding styling in the SCSS file.
    
    * style(form): 💄 adjust ion-title font size and padding
    
    Updated the `ion-title` within the `wm-form` component to have a font size of 18px and adjusted the padding from 10px to 8px. This change enhances the styling consistency across the form component.
    
    * feat(localization): 🌐 add translation for 'Tipo di form' in multiple languages
    
    Added the translation for 'Tipo di form' in German, English, Spanish, French, Italian, Portuguese, and Albanian localization files. This enhances the application's multilingual support by providing a consistent translation for 'Form type' across various languages.
    - chore(ec): ✨ add distinctUntilChanged to featuresInViewport$ effect (#116)
    Added distinctUntilChanged operator to the featuresInViewport$ effect to prevent redundant emissions when feature IDs have not changed. This ensures that only significant changes in the feature IDs trigger further processing, enhancing performance by avoiding unnecessary operations.
    
    The distinctUntilChanged operator compares the previous and current feature ID arrays and only allows the stream to proceed if there is a change in the array length or the content of the arrays.
    - style(features-in-viewport): 💄 update card styling for consistent layout
    Adjusted the styling of ion-card elements to ensure a more consistent and visually appealing layout. Changes include setting a fixed height, adding padding, adjusting border radius, and ensuring proper spacing between elements. Additionally, ensured that certain internal elements like wm-box-taxonomies are hidden as needed, and set specific dimensions for included images.
    
    - refactor(draw-ugc-button): 🔄 replace translate pipe with wmtrans pipe
    Updated the translation pipe from `translate` to `wmtrans` in the draw-ugc-button component HTML. This change ensures consistency with the new translation handling methods across the application.
    
    - refactor(lang.service): ♻️ remove unnecessary pipe and take operators
    - Simplified the subscription logic in the `_confLANGUAGES$` observable.
    - Removed the `filter` and `take` operators since they are no longer needed.
    - Directly subscribed to `_confLANGUAGES$` to handle language initialization.
    
    feat(conf.reducer): ✨ add LANGUAGES and TRANSLATIONS to conf state
    
    - Updated the `confReducer` to include `LANGUAGES` and `TRANSLATIONS` in the state update.
    - Ensures that language and translation configurations are part of the application state.
    
    - chore(draw-ugc): ✨ add "draw user-generated content" component <a href="https://orchestrator.maphub.it/resources/customer-stories/5569" target="_blank" rel="noopener noreferrer">OC[5569]</a> (#108)
    * chore(draw-ugc): ✨ add "draw user-generated content" component
    
    Implemented a new component, `WmDrawUgcButtonComponent`, for drawing user-generated content. This includes buttons to toggle drawing modes (POI and Track) and to handle user authentication for drawing features. Added relevant HTML, SCSS, and TypeScript files for the new component. Updated the map component to use the new drawing button component, replacing the previous draw track button logic.
    
    Additionally, modified the configuration selectors and reducers to manage new states related to drawing features and user activity actions. Updated effects to handle the opening of login modals and dispatching of actions related to drawing features. Updated the configuration interface to include a new property for showing draw POI features.
    
    * refactor(draw-ugc): ♻️ simplify authentication logic and form type selection
    
    Removed redundant authentication checks in `draw-ugc-button.component.ts` and simplified the logic by removing the `_handleAuthFlow` method. The form type selection logic in `draw-ugc.component.ts` has been refactored to use a selector `currentDrawFormType` to determine the form type based on whether a custom track exists.
    
    Additionally, the new effect `setCurrentUgcPoiDrawn$` in `ugc.effects.ts` handles user confirmation when modifying the position of a POI on the map. The new utility function `areFeatureGeometriesEqual` helps compare feature geometries to decide if user confirmation is needed.
    
    Overall, these changes streamline the component logic and improve code readability.
    
    chore(localization): 🌐 add new translations for POI modification confirmation
    
    Added new translations for the confirmation message when modifying POI coordinates across multiple language files. This update ensures that users receive consistent messaging in their selected language when they attempt to modify POI coordinates.
    
    - Updated German (de.ts), English (en.ts), Spanish (es.ts), French (fr.ts), Italian (it.ts), Portuguese (pr.ts), and Albanian (sq.ts) language files.
    - New translations for the warning message "Stai modificando le coordinate del POI, vuoi continuare?" have been added to each file.
    - Adjusted formatting for better readability.
    
    Additionally, updated a related message in the `ugc.effects.ts` file to align with the new translation entries.
    
    * refactor(draw-ugc): ♻️ replace startDrawUgcPoi with setCurrentUgcPoiDrawn
    
    Updated the draw-ugc component to replace the `startDrawUgcPoi` action with `setCurrentUgcPoiDrawn` when dispatching store updates. This change improves the naming consistency and better reflects the action's purpose.
    
    * style(draw-ugc-button): 💄 compact import statements and add return types
    
    Refactored the import statements by combining them into a single line for better readability and maintainability. Additionally, added explicit return types to the `toggleTypeSelection` and `stopDrawing` methods for improved code clarity and type safety.
    - refactor(ugc): ♻️ update UGC POI with drawn geometry (#107)
    Enhanced the `updateUgcPoi$` effect by integrating the latest drawn geometry into the UGC POI update process. The effect now:
    
    - Imports `currentUgcPoiDrawnGeometry` from the UGC selector.
    - Uses `withLatestFrom` to combine the update action with the current drawn geometry.
    - Constructs an updated POI object, ensuring the geometry is included.
    - Updates the POI using the `updateApiPoi` service with the newly constructed object.
    - Ensures the success action reflects the updated POI.
    - fix(geobox-map): 🐛 correct event binding for drawing UGC POIs
    Updated the event binding in the `geobox-map.component.html` to use the correct event name `(wmMapDrawUgcPoiEvt)` instead of `(ugcPoiDrawnEvt)`. This ensures that the `updateUgcPoiDrawn($event)` function is triggered correctly when the event is emitted.
    
    - chore(ugc): ✨ add drawing functionality for UGC POIs (#105)
    This update introduces the ability to draw User-Generated Content (UGC) Points of Interest (POIs) on the map. Key changes include:
    
    - Added `wmMapDrawUgc` directive and related bindings in `geobox-map.component.html` to enable and manage POI drawing.
    - Implemented new actions, reducers, and selectors to manage the state of drawn POIs in the UGC feature.
    - Updated `ugc.actions.ts`, `ugc.reducer.ts`, and `ugc.selector.ts` to handle the new `currentUgcPoiDrawing` action and state updates.
    - Included additional functionality in `user-activity.action.ts`, `user-activity.reducer.ts`, and `user-activity.selector.ts` to manage the state of POI drawing activity.
    
    These enhancements enable users to interactively draw and update POIs on the map, improving the feature set for UGC management.
    
    refactor(geobox-map): ♻️ rename and remove unused selectors
    
    Renamed `wmMapDrawUgc` to `wmMapDrawUgcPoi` and updated bindings to match the new naming convention. Removed the `currentUgcDrawn` selector as it was no longer used in the codebase. Updated the component typescript file and template accordingly to reflect these changes. This refactor improves code clarity and maintains consistency in naming conventions.
    
    refactor(geobox-map): 🔄 rename actions and update usage for UGC POI handling
    
    Renamed `currentUgcPoiDrwaing` to `setCurrentUgcPoiDrawn` to correct the spelling and improve clarity. Updated all references in the `geobox-map.component.html`, `geobox-map.component.ts`, and the relevant action and reducer files.
    
    Additionally, added new actions (`startEditUgcPoi` and `stopEditUgcPoi`) to manage the UGC POI editing state. Implemented effects to handle these actions by setting the current UGC POI and controlling the draw state. This improves the maintainability and readability of the UGC POI handling logic.
    
    - feat(config): ✨ add ZoomFeaturesInViewport interface (#7)
    Introduce a new interface `ZoomFeaturesInViewport` to manage zoom levels for features in the viewport. The interface includes optional properties `minZoomFeaturesInViewport` and `maxZoomFeaturesInViewport`.
    
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
    
    - Change page in 'map' when ugcOpened is true
    - Add wm-home-ugc in mapDetails
    
    - ✨ feat(map): add custom tile layer support
    - introduce addTileLayer method for adding tile layers with custom source
    - utilize CustomTileSource for enhanced configuration options
    
    - feat(utils): ✨ add maxZoom parameter to initVectorTileLayer function
    - Introduced a new parameter `maxZoom` with a default value of 13 to the `initVectorTileLayer` function.
    - Updated the function signature and documentation to reflect the addition of the `maxZoom` parameter.
    - Integrated `maxZoom` into the `TileSource` configuration to limit the maximum zoom level for vector tiles.
    
    - 💄 style(map): update ion-fab display property
    - set display to block for ion-fab to ensure proper layout
    
    This commit adds support for displaying embedded elements in the POI properties component. The embedded element is conditionally rendered based on the presence of the "embeddedElement" property.
    
    chore: Update inner component in poi-properties template
    
    Refactor inner component tag with new attributes for better functionality.
    
    - Updated the wm-core submodule reference to the latest commit to incorporate recent changes and improvements.
    - Ensures the main project is using the most up-to-date version of the wm-core submodule.
    
    - Increase font size for wm-track-related-poi ion-button
    - Set height to 36px for wm-track-related-poi ion-button
    
    - Added translations for Italian, English, and French languages in app.module.ts
    - Updated the APP_TRANSLATION provider in app.module.ts to include the new translations
    - Removed unused imports and variables in map-details.component.ts
    - Imported the skip operator from rxjs/operators in map-details.component.ts
    
    * chore: Update conf and ecPoi.properties parameters name <a href="https://orchestrator.maphub.it/resources/customer-stories/5452" target="_blank" rel="noopener noreferrer">OC[5452]</a>
    
    * chore: update test e2e
    
    * Updated submodule core/src/app/shared/wm-core
    
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
    
    - feat(environment): ✨ add optional debug flag to Environment interface
    - Introduced a new optional `debug` boolean property in the `Environment` interface to allow for enhanced configurability.
    - This change supports scenarios where debugging features need to be toggled without affecting production settings.
    
    - Added `changelog-notes-type: github` to both `release_please.yml` and `release_please_minor.yml` workflows
    - Ensures that changelog notes are generated using GitHub's format
    - Aids in maintaining consistency and clarity in release documentation
    
    - Introduce a new GitHub Actions workflow to automate releases for minor version updates.
    - The workflow triggers on pushes to branches that match the pattern 'v[0-9]+.[0-9]+'.
    - Permissions are set to allow writing to contents and pull requests.
    - Utilize the Release Please Action to manage the release process, specifying `node` as the release type and `webmapp-app` as the package name.
    - Define changelog sections for features, bug fixes, and miscellaneous updates.
    - Customize the pull request title and header for clarity and automation acknowledgment.
    
    Add test for tracks edges
    
    * fix: Management of Map details status, added test e2e
    
    * ...
    
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
    
    - Fixed a bug in the save button's disabled state in modal-save.component.html
    - Added private methods _addFormError and _removeFormError to handle form errors in modal-save.component.ts
    - Updated addPhotos method to handle photo loading and validation in both modal-save.component.ts and modal-waypoint-save.component.ts
    
    - Added event listener for opening popups
    - Adjusted indentation and spacing for better readability
    
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
    
    Added a new e2e test file to test the visualization of the orientation and location buttons. The test verifies that the buttons are displayed correctly on the map page.
    
    This commit updates the URL handling logic for the home tab in the tabs page. Now, when the home tab is selected, the current query parameters are cleared and the URL is updated accordingly. This ensures that any previous tracking or point of interest information is removed from the URL.
    
    - Added an *ngIf condition to display the title based on the presence of currentUgcPoiProperties$.
    - The title now shows the name of the UGC POI properties using wmtrans translation.
    
    This commit enhances the map page by dynamically displaying a title for UGC POI properties when available.
    
    This commit adds the functionality to go to the home page when the current tab is 'home' and the user clicks on it again. It dispatches the action to navigate to the home page using the `goToHome()` method from `user-activity.action`.
    
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
    
    This commit adds a new test for importing user-generated content (UGC). The test includes steps to open the import UGC feature, select a file to import, visualize a preview map, and pre-populate the form with track title and description.
    
    This commit adds new test cases to visualize the sync badge in the application. The tests cover scenarios where the track is synchronized and not synchronized, and verify that the correct icon is displayed based on the synchronization status.
    
    This commit updates the URL handling in the open method of the FavouritesPage class. Instead of using the `updateURL` method, it now uses the `changeURL` method with the 'map' parameter. This change improves the consistency and clarity of the code.
    
    This commit adds a call to the `_geolocationSvc.startNavigation()` method in the `ionViewWillEnter` lifecycle hook of the `MapPage` component. This ensures that navigation is started when the page is entered.
    
    Include an excerpt component in the POI properties view. This enhancement allows for better presentation of property information by displaying excerpts when available.
    
    - Remove unnecessary condition in ngOnInit()
    - Always start navigation in ngOnInit()
    
    This commit removes the form component and its associated HTML, SCSS, and TypeScript files. The form component was no longer needed in the project.
    
    Updated submodule core/src/app/shared/wm-core
    
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
    
    - Added a new ng-container in the HTML file to display a favorite button for authenticated users
    - Updated the TypeScript file to handle the favorite button functionality by checking if a track is already marked as favorite
    
    - Updated the map.page.html file to use the currentEcTrackProperties$ observable for retrieving the track ID.
    - Updated the map.page.ts file to add the currentEcTrackProperties$ observable and assign it to the currentEcTrackProperties variable.
    
    - Removed unnecessary code related to track preview
    - Updated the layout of the map page
    - Added new functionality for navigating and recording tracks
    
    - Adjusted the top position of ion-card-content in map-details.component.scss
    - Added a ng-template block for wm-track-properties in map.page.html
    
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
    
    - Removed unused import in register.page.ts
    - Updated wmMapGeojson binding in waypoint.page.html
    - Removed unused import and variable in waypoint.page.ts
    - Refactored onChangeLocation method to update geojson and locationString
    
    - Reordered the click event and tab attributes in ion-tab-button elements in tabs.page.html
    - Removed unused import statement from tabs.page.ts
    - Renamed _urlHandlerService to _urlHandlerSvc in tabs.page.ts
    
    This commit updates the tabs.page.ts file to reset the "ugc_track" and "ugc_poi" query parameters along with "track" and "poi". This ensures that all relevant query parameters are properly reset when navigating to the home tab.
    
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
    
    This commit adds a condition to the `navigation` method in the `MapPage` component. The `onlyTitle` method of the `mapTrackDetailsCmp` will now be called only if the map is focused and the track details component is open.
    
    - Changed the back button to use an ion-button with a chevron-back icon
    - Updated the color of the button to dark
    
    - Added a new map component
    - Updated the layout of the bottom buttons
    - Adjusted the position and style of the orientation button
    
    This commit adds the GeolocationService to the home and map pages. The GeolocationService is used to retrieve the user's current location.
    
    Include translation for 'cai_scale' in the Italian language file.
    
    * chore: Remove unnecessary code for overlay URL and reorganize lifecycle hooks <a href="https://orchestrator.maphub.it/resources/customer-stories/4098" target="_blank" rel="noopener noreferrer">OC[4098]</a>
    
    - Removed unused overlay URL in HTML template
    - Reorganized ngOnInit and ngOnDestroy methods for better readability
    
    * chore: Remove unused enableOverLay$ BehaviorSubject and optimize ngOnInit in MapPage
    
    Removed the unused enableOverLay$ BehaviorSubject and optimized the ngOnInit method in MapPage for better performance.
    
    This commit comments out the console.log statement in the getUrlFile function and removes unused code in the build function.
    
    - Removed unnecessary code in AppComponent
    - Fixed a condition in setWmMapFeatureCollection method of MapPage
    
    - Updated compileSdkVersion and targetSdkVersion in gulpfile.js to 33
    - Removed the requestStoragePermission() function from trackdetail.page.ts
    
    Update the compileSdkVersion and targetSdkVersion in the gulpfile.js to version 34.
    
    This commit adds a new API endpoint for OSM2CAI, which is set to 'https://osm2cai.cai.it'. This allows for integration with the OSM2CAI service.
    
    - Added a function to save files in the Documents directory
    - Created a popup message to inform the user about successful file saving and ask for sharing
    - Updated the HTML template to remove unnecessary code related to exporting files
    - Modified the TypeScript file to handle storage permission requests before saving files
    
    This commit adds a new script "surge-osm2cai" to the package.json file in the core directory. The script allows deploying the project to the OSM2CAI domain using Surge.
    
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
    
    The code change fixes the error handling in the app.component.ts file. The filter condition has been updated to check for 'Unauthorized' instead of 'Unauthenticated'. This ensures that the correct error message is displayed when an unauthorized error occurs.
    
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
    
    - Added APP_ID_TOKEN to providers
    - Use ConfigService to get the value for APP_ID_TOKEN
    
    - Added new elasticApi endpoint for production environment
    - Commented out local development api endpoints
    
    - Added Subscription import from 'rxjs'
    - Added logic to navigate to '/profile/profile-data' when user is no longer logged in
    
    - Removed unused imports and variables
    - Updated import paths for services and classes
    
    * chore: Refactor shareTrackByID method in ShareService <a href="https://orchestrator.maphub.it/resources/customer-stories/3850" target="_blank" rel="noopener noreferrer">OC[3850]</a>
    
    The shareTrackByID method in the ShareService has been refactored to simplify the code and improve readability. Instead of subscribing to an observable and transforming the socialShareText, it now directly shares the track by calling the share method with the trackId as a parameter. This change reduces unnecessary complexity and improves performance.
    
    chore: Update hostToGeohubAppId in ConfigService
    
    The hostToGeohubAppId object in the ConfigService has been updated to use the imported hostToGeohubAppId from 'wm-core/store/api/api.service' instead of the previous hardcoded values. This change allows for more flexibility and easier maintenance of the geohub app IDs based on the hostname.
    
    * chore: Update defaultShareObj text in ShareService
    
    The defaultShareObj text property in the ShareService has been updated to an empty string. This change ensures that the default text for sharing is empty, allowing users to input their own custom text when sharing content.
    
    * chore: Remove empty text property in defaultShareObj
    
    The code change removes the assignment of an empty string to the text property in the defaultShareObj object. This change was made in the ShareService file.
    
    - Added a new share button for points of interest in the map page.
    - When clicked, it opens a modal to share the selected point of interest.
    - The shared link includes the ID of the point of interest.
    
    - Updated the paths for the deploy-to-web scripts in package.json to use relative paths instead of absolute paths.
    - Replaced the absolute file paths with "./www/*" and "./www/assets/*" to ensure correct deployment to the web server.
    
    - Added a new field "referrer" to the login request in the AuthService class.
    - Updated the geohubId value in the environment.ts file from 32 to 53.
    - Commented out the api URL and added a new local development API URL.
    
    - Added wmMapHitMapCollection directive to the map page template
    - Added hitMapFeatureCollection selector to the map page component
    - Updated setWmMapFeatureCollection method in the map page component to handle overlay feature collections
    
    A new map, 'parcapuane', has been added to the list of maps in the ConfigService. This extends the range of available maps within the application.
    
    Added a new feature to the settings component that allows users to clear cache and saved data. This includes clearing local storage, session storage, IndexedDB, Cache Storage, and cookies. Also restructured the HTML of the settings component for better organization and readability. Added corresponding translations for new features in English language file.
    
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
    
    Changed the directory for writing a file in the TrackdetailPage from Directory.Documents to Directory.External. This change ensures that the file is written to the external storage instead of the documents directory.
    
    The code changes in this commit remove the unnecessary code that handles location permission denial. This includes the prompt to open settings and the call to `backgroundGeolocation.openSettings()`.
    
    Include a new button in the settings component for accessing the privacy page. Update language files accordingly.
    feat: add privacy link to settings component
    
    Include a new button in the settings component for accessing the privacy page. Update language files accordingly.
    
    This commit removes unused imports, variables, and code related to network connectivity in the downloaded-tracks-box.component.ts file. The changes improve code readability and maintainability.
    
    - Removed ng-container and moved wm-map component to the top level
    - Reorganized ion-fab buttons for better layout and functionality
    
    Added the Italian translation for the new waypoint message to the i18n file.
    
    - Updated the URL for low and high resolution tiles in the IDATALAYER object.
    
    - Added the take(1) operator to the observable chain in app.component.ts
    - Ensures that only the first emitted value is taken into account
    - Improves performance and prevents unnecessary processing
    
    The commit fixes a null check issue in the SaveService class. The code now correctly checks for the presence of track coordinates using optional chaining.
    
    - Added <ion-content> tag to wrap the form content
    - Improved formatting and indentation
    
    This commit adds functionality to dynamically select the geohubAppId based on the hostname. It checks for specific hostnames and assigns a corresponding geohubAppId. If no specific hostname is matched, it uses the numeric value from the hostname. This allows for more flexibility in configuring the geohubAppId for different environments.
    
    BREAKING CHANGE: The private variable _geohubAppId has been added to store the selected geohubAppId value.
    
    - Commented out the navigation to 'home' in app.component.ts
    - Added a new route in tabs-routing.module.ts to redirect to 'home' when the path is empty
    
    The commit adds the gulp-through2 package to the project dependencies. This package is required for performing tasks in the Gulp build process.
    
    style(map-track-details.component): increased padding bottom
    fix(track-properties.component): activity tab fixed
    
    - Removed the condition for disabling layers when there are no current filters
    - Added a new condition for disabling layers when there are current filters and toggleLayerDirective is false and currentLayer is null
    
    - Removed unused imports and variables
    - Fixed indentation and spacing issues
    - Removed commented out code
    
    - Refactored code in the register page to update the metadata object
    - Updated the save service to handle metadata parsing and set locations property in geojson
    
    - Added translations for new points of interest categories and descriptions in English and Italian.
    - Updated the translation files `en.ts` and `it.ts`.
    - Translated the following categories: Asphalt, Bitumenduro®, Real dirt, Bar, Mountain passes, Roads to drive (BLUE), Points of interest (GREEN), Dirt roads (ORANGE), Streets to admire (PINK), Other types of Point of interest.
    - Translated the description field.
    - Added translation for the prompt "Do you want to propose your waypoint on the motomappa?" with options "Yes" and "No".
    
    - Refactored the structure of the form component template
    - Improved readability and organization of code
    - Updated HTML tags and attributes for better semantic meaning
    - Fixed minor issues with form field labels and placeholders
    
    - Added import for Platform from '@ionic/angular'
    - Added import for App from '@capacitor/app'
    - Added private property _backBtnSub$ of type Subscription
    - Added ionViewDidEnter() method to handle back button event and exit the app
    - Added ionViewWillLeave() method to unsubscribe from back button event
    
    - Removed the `providers` property for `LangService` in the `SettingsComponent` and `ProfilePage` files.
    
    Replaced the 'confPOIFORMS' observable with a new 'acquisitionFORM' observable in the waypoint save modal. This change affects both the HTML template and TypeScript component of the modal. Also, added 'confPOIFORMS' to waypoint page for data acquisition.
    
    The @capacitor-community/keep-awake package has been added to the project dependencies. This package allows the application to prevent the device from going into sleep mode. The version installed is 4.0.0, which requires a peer dependency of @capacitor/core at version 5.0.0 or higher.
    
    This commit adds the ability to open a popup on the map page when a feature collection is clicked. The popup displays additional information about the selected feature.
    
    - Added dependencies for converting GeoJSON to GPX and KML formats
    - Updated the CGeojsonFeature class to include a method for adding properties
    - Modified the trackdetail module to include export buttons for GeoJSON, KML, and GPX formats
    - Implemented saveFileCallback function in trackdetail page to handle saving and sharing exported files
    
    - Added a new button to the register page HTML template for adding waypoints.
    - Created a new method in the RegisterPage component called "waypoint" that navigates to the "waypoint" page with the current track as a parameter.
    
    This commit adds functionality to allow users to add waypoints while registering.
    
    improved button visibility
    
    Added a new deploy command for the motomappa project.
    
    The commit removes the code that updates the manifest.json file in the PR branch, as it is no longer needed. This change simplifies the workflow and improves efficiency.
    
    - Removed the `removeTrackFilterEVT` and `removePoiFilterEVT` event listeners from the HTML template.
    - Removed the `toggleTrackFilter` and `removePoiFilter` methods from the TypeScript file.
    
    These changes remove unnecessary code related to track filters and poi filters in the home page.
    
    - Updated "@dwayneparton/geojson-to-gpx" dependency to version "^0.0.30"
    - Updated compileSdkVersion and targetSdkVersion in the Android platform to version 33
    
    chore: Update @dwayneparton/geojson-to-gpx version to ^0.0.30 in package-lock.json
    
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
    
    - Updated the styling of the home page to include padding for safe areas on ion-content.
    - Added a new deployment command for project "oman".
    
    - Added event listener for wmMapOverlayEVT$ in map.page.html
    - Added event listener for lastFilterTypeEvt in map.page.html
    - Updated updateLastFilterType() method in map.page.ts to dispatch setLastFilterType action
    
    The minSdkVersion in the Android platform has been updated from 31 to 28. This change ensures compatibility with a wider range of devices.
    
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
<!-- COMMIT_DESC -->
    
    This commit adds the ability to open a popup on the map page when a feature collection is clicked. The popup displays additional information about the selected feature.
    
    - Added a new button to the register page HTML template for adding waypoints.
    - Created a new method in the RegisterPage component called "waypoint" that navigates to the "waypoint" page with the current track as a parameter.
    
    This commit adds functionality to allow users to add waypoints while registering.
    
    - Removed unnecessary line break in the form label
    - Added helper text for form fields
    - Adjusted padding for the form field helper text
    
    The import statement for HomeModule was removed as it was not being used in the code. This change helps to clean up the module and improve code readability.
    
    The minSdkVersion in the Android platform has been updated from 31 to 28. This change ensures compatibility with a wider range of devices.
<!-- COMMIT_DESC -->
    
    - Added event listener for wmMapOverlayEVT$ in map.page.html
    - Added event listener for lastFilterTypeEvt in map.page.html
    - Updated updateLastFilterType() method in map.page.ts to dispatch setLastFilterType action
    
    - Improved rendering performance of layers
    - Fixed graphical issue in elevation chart
    - Improved visualization of elevation chart
    - Improved visualization of layers
    - Fixed minor bugs
    
    This commit adds logic to control the opacity of a layer on the map and opens the track details component. The opacity is set based on whether the current layer has edges or not. If there are edges, the opacity is set to false; otherwise, it is set to true.
    
    This commit adds a new release-please configuration file, `release-please-config.json`, which includes an extra-file entry for the `core/version.json` file. The JSON path `$version` is specified to extract the version information. This change follows semantic versioning guidelines.
    
    This commit adds a new GitHub Actions workflow file, `release_please.yml`, which automates the release process. The workflow is triggered on pushes to the `main` branch and grants necessary permissions for writing contents and pull requests. It uses the `google-github-actions/release-please-action@v3` action to generate releases based on semantic versioning rules for a Node package named `release-please-action`. The changelog types are defined as "feat" (Features), "fix" (Bug Fixes), and "chore" (Miscellaneous). Pull request titles follow the pattern "release${component} ${version}", and include a robot emoji with an updated changelog header.
    
    
    ...
<!-- COMMIT_DESC -->
    
    This commit updates the package.json file, specifically the "version" field, from 0.0.1 to 2.1.51 in accordance with semantic versioning guidelines.

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
