import {environment} from 'src/environments/environment';
import {clearUgcSynchronizedData, clearUgcDeviceData, removeAuth} from '@wm-core/utils/localForage';
import {clearMapCoreData} from '@map-core/utils';

/**
 * Clears the test state.
 * This function uses Cypress to clear cookies and local storage.
 * It is useful for resetting the application state between end-to-end tests.
 */
export function clearTestState(): void {
  cy.clearLocalStorage();
  cy.clearCookies();
  clearUgcSynchronizedData();
  clearUgcDeviceData();
  clearMapCoreData();
  removeAuth();
}

/**
 * Intercepts the configuration request and enables authentication.
 * @returns A Cypress chainable object.
 */
export function confWithAuthEnabled(): Cypress.Chainable {
  return cy.intercept('GET', confURL, req => {
    req.reply(res => {
      const newRes = {
        ...res.body,
        AUTH: {
          ...res.body.AUTH,
          enable: true,
          webappEnable: true,
        },
      };
      res.send(newRes);
    });
  });
}

/**
 * Logs into the application.
 * @param email - User's email address.
 * @param password - User's password.
 */
export function e2eLogin(
  email: string = Cypress.env('email'),
  password: string = Cypress.env('password'),
): Cypress.Chainable {
  const apiLogin = `${environment?.shards?.geohub?.origin}/api/auth/login`;
  cy.intercept('POST', apiLogin).as('loginRequest');
  goProfile();
  cy.get('.wm-profile-logged-out-login-button').click();
  cy.get('ion-input[formcontrolname="email"] input').should('have.focus').clear().type(email);
  cy.get('ion-input[formcontrolname="password"] input').focus().clear().type(password);
  cy.get('.wm-login-submit-button').click();
  return cy.wait('@loginRequest').its('response.body');
}

/**
 * Navigates to the home page.
 * @param doubleClick if true, performs a double click; otherwise, performs a single click. Default is true.
 */
export function goHome(doubleClick = true) {
  if (doubleClick) {
    cy.get('#tab-button-home').dblclick();
  } else {
    cy.get('#tab-button-home').click();
  }
}

/**
 * Navigates to the map page.
 */
export function goMap() {
  cy.get('#tab-button-map').click();
}

/**
 * Navigates to the profile page.
 */
export function goProfile() {
  cy.get('#tab-button-profile').click();
}

/**
 * Mocks the get api ugc pois request.
 * @param mockRes - The mock response.
 * @returns A Cypress chainable object.
 */
export function mockGetApiPois(mockRes: any): Cypress.Chainable {
  return cy.intercept('GET', `${environment.shards.geohub.origin}/api/v2/ugc/poi/index`, req => {
    req.reply(res => {
      res.send(mockRes);
    });
  });
}

/**
 * Mocks the get api ugc tracks request.
 * @param mockRes - The mock response.
 * @returns A Cypress chainable object.
 */
export function mockGetApiTracks(mockRes: any): Cypress.Chainable {
  return cy.intercept('GET', `${environment.shards.geohub.origin}/api/v2/ugc/track/index`, req => {
    req.reply(res => {
      res.send(mockRes);
    });
  });
}

export function mockGetTrack(id: string, mockPropertiesRes: any): Cypress.Chainable {
  return cy.intercept('GET', `${environment.shards.geohub.awsApi}/tracks/${id}.json`, req => {
    req.reply(res => {
      const newRes = {
        ...res.body,
        properties: {
          ...res.body.properties,
          ...mockPropertiesRes,
        },
      };
      res.send(newRes);
    });
  });
}

export function mockGetPoi(mockFeatures: any): Cypress.Chainable {
  return cy.intercept('GET', `${environment.shards.geohub.awsApi}/pois/52.geojson`, req => {
    req.reply(res => {
      const newRes = {
        ...res.body,
        features: [...(Array.isArray(res.body.features) ? res.body.features : []), mockFeatures],
      };
      res.send(newRes);
    });
  });
}

/**
 * Mocks the save api ugc tracks request with a network error.
 * @returns A Cypress chainable object.
 */
export function mockSaveApiTracksOffline(): Cypress.Chainable {
  // forceNetworkError: true, correctly simulates the network error, but still sends the track to the backend
  return cy.intercept('POST', `${environment.shards.geohub.origin}/api/v2/ugc/track/store`, {
    statusCode: 500,
    body: {error: 'Simulated server error'},
  });
}

/**
 * Opens a layer by its title.
 * @param layerTitle the title of the layer to open.
 */
export function openLayer(layerTitle: string) {
  cy.get('wm-layer-box')
    .contains('div.wm-box-title', layerTitle)
    .then($box => {
      cy.wrap($box).click();
    });
  cy.get('.wm-drag-btn').should('be.visible').click();
}

/**
 * Opens the UGC box.
 */
export function openUgcBox() {
  cy.get('wm-ugc-box').click();
}

/**
 * Opens a POI in a layer by its title.
 * @param poiTitle the title of the POI to open.
 */
export function openPoi(poiTitle: string) {
  cy.get('wm-poi-box').contains('.wm-box-name', poiTitle).as('poiBox');
  cy.get('@poiBox')
    .should('be.visible')
    .then($poiBox => {
      cy.wrap($poiBox).click();
    });
}

/**
 * Opens a track in a layer by its title.
 * @param trackTitle the title of the track to open.
 */
export function openTrack(trackTitle: string) {
  cy.get('wm-map-details wm-search-box').should('exist');
  cy.get('wm-map-details wm-search-box').contains('ion-card-title', trackTitle).as('searchBox');
  cy.get('@searchBox')
    .should('be.visible')
    .then($searchBox => {
      cy.wrap($searchBox).click();
    });
}

export const originUrl = environment.shards.geohub.origin;
export const meUrl = `${environment.shards.geohub.origin}/api/auth/me`;
export const confURL = `${environment.shards.geohub.awsApi}/conf/52.json`;
export const elasticUrl = `${environment.shards.geohub.elasticApi}`;
export const mapReadyTimeout = 10000;
export const data = {
  layers: {
    ecTrack: 'Tracks test e2e',
    ecPoi: 'Poi test e2e',
    ecTracksEdge: 'Edge Layer Test e2e',
  },
  tracks: {
    exampleOne: 'Track example one',
    exampleTwo: 'Track example two',
    exampleTwoRelatedPoi: 'related poi example',
    exampleFirstEdge: 'Track Edge Example 01',
  },
  pois: {
    exampleOne: 'Poi example one',
  },
};

/**
 * Mocks the configuration request with release update enabled.
 * Uses simulated store URLs (not real URLs) for testing.
 * @param githubVersion - The version to return from GitHub package.json (default: '3.2.0')
 * @param appVersion - The current app version for comparison (default: '3.1.0')
 * @param storeUrl - Optional custom store URL. If not provided, uses MOCKED_STORE_URL.
 * @returns A Cypress chainable object.
 */
export function confWithReleaseUpdateEnabled(
  githubVersion: string = '3.2.0',
  appVersion: string = '3.1.0',
  storeUrl: string | undefined = MOCKED_STORE_URL,
): Cypress.Chainable {
  return cy.intercept('GET', confURL, req => {
    req.reply(res => {
      const newRes = {
        ...res.body,
        APP: {
          ...res.body.APP,
          forceToReleaseUpdate: true,
          androidStore: storeUrl,
          iosStore: storeUrl,
        },
      };
      res.send(newRes);
    });
  });
}

/**
 * Simulated app version for testing.
 * This is the version that the app reports as its current version.
 */
export const MOCKED_APP_VERSION = '0.0.1';

/**
 * Simulated release update version for testing.
 * This is the version that GitHub reports as the latest available version.
 */
export const MOCKED_RELEASE_UPDATE_VERSION = '1.0.0';

/**
 * Simulated store URL for testing.
 * This is a mock URL used for both Android and iOS stores in tests.
 * NOT a real URL - only for testing purposes.
 */
export const MOCKED_STORE_URL = 'https://test-store-url.mock/webmapp-app';

/**
 * Mocks the release update version request for testing.
 * This function intercepts the HTTP request that the service makes and returns a simulated response.
 * Uses simulated versions - NO real network calls are made.
 * @param version - Optional version to return. Defaults to MOCKED_RELEASE_UPDATE_VERSION.
 * @returns A Cypress chainable object that intercepts the request.
 */
export function mockReleaseUpdateVersion(
  version: string = MOCKED_RELEASE_UPDATE_VERSION,
): Cypress.Chainable {
  // Intercept any package.json request and return simulated release update version
  // No real URLs are referenced - only simulated version comparison
  return cy.intercept('GET', '**/package.json', {
    statusCode: 200,
    body: {
      version: version,
    },
  });
}

/**
 * Mocks the configuration request with release update disabled.
 * When disabled, the property should not be present in the config (or explicitly set to false).
 * @returns A Cypress chainable object.
 */
export function confWithReleaseUpdateDisabled(): Cypress.Chainable {
  return cy.intercept('GET', confURL, req => {
    req.reply(res => {
      const appConfig = {...res.body.APP};
      // Remove forceToReleaseUpdate property if it exists, or set it to false
      delete appConfig.forceToReleaseUpdate;
      const newRes = {
        ...res.body,
        APP: appConfig,
      };
      res.send(newRes);
    });
  });
}

/**
 * Mocks the configuration request with release update enabled and optional store URLs.
 * This function allows specifying a custom store URL or undefined (to test missing store URLs).
 * @param storeUrl - Custom store URL. If not provided, uses MOCKED_STORE_URL. To explicitly set store URLs to undefined, pass null.
 * @param githubVersion - The version to return from GitHub package.json (default: '3.2.0')
 * @returns A Cypress chainable object.
 */
export function confWithReleaseUpdateEnabledCustomStoreUrl(
  storeUrl?: string | null,
  githubVersion: string = '3.2.0',
): Cypress.Chainable {
  return cy.intercept('GET', confURL, req => {
    req.reply(res => {
      // If storeUrl is null, explicitly set to undefined (for testing missing store URLs)
      // If storeUrl is not provided (undefined), use MOCKED_STORE_URL
      // Otherwise, use the provided storeUrl
      const finalStoreUrl = storeUrl === null ? undefined : storeUrl || MOCKED_STORE_URL;
      const newRes = {
        ...res.body,
        APP: {
          ...res.body.APP,
          forceToReleaseUpdate: true,
          androidStore: finalStoreUrl,
          iosStore: finalStoreUrl,
        },
      };
      res.send(newRes);
    });
  });
}

/**
 * Mocks the device as a mobile device (Android or iOS) for testing.
 * This function sets up the necessary mocks to make Platform.is('android') or Platform.is('ios') return true.
 * Must be called before cy.visit() in the onBeforeLoad callback.
 * @param platform - The mobile platform to simulate: 'android' or 'ios'. Defaults to 'android'.
 * @returns A function to be used in cy.visit() onBeforeLoad callback.
 */
export function mockMobileDevice(platform: 'android' | 'ios' = 'android'): (win: Window) => void {
  return (win: Window) => {
    // Mock userAgent to simulate mobile device
    if (platform === 'android') {
      Object.defineProperty(win.navigator, 'userAgent', {
        writable: true,
        value:
          'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
      });
    } else {
      Object.defineProperty(win.navigator, 'userAgent', {
        writable: true,
        value:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
      });
    }

    // Mock Capacitor Platform if available
    if (!(win as any).Capacitor) {
      (win as any).Capacitor = {};
    }
    (win as any).Capacitor.getPlatform = () => platform;

    // Mock Ionic Platform if available
    if ((win as any).Ionic && (win as any).Ionic.Platform) {
      (win as any).Ionic.Platform.is = (platformName: string) => {
        if (platformName === 'android') return platform === 'android';
        if (platformName === 'ios') return platform === 'ios';
        if (platformName === 'mobile') return true;
        if (platformName === 'pwa' || platformName === 'desktop' || platformName === 'mobileweb')
          return false;
        return false;
      };
    } else {
      // Create mock Ionic Platform
      (win as any).Ionic = {
        Platform: {
          is: (platformName: string) => {
            if (platformName === 'android') return platform === 'android';
            if (platformName === 'ios') return platform === 'ios';
            if (platformName === 'mobile') return true;
            if (
              platformName === 'pwa' ||
              platformName === 'desktop' ||
              platformName === 'mobileweb'
            )
              return false;
            return false;
          },
        },
      };
    }
  };
}
