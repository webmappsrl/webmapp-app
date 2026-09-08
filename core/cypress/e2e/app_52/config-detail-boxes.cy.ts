import {
  clearTestState,
  confURL,
  data,
  goHome,
  mockGetPoi,
  mockGetTrack,
  openLayer,
  openPoi,
  openTrack,
} from 'cypress/utils/test-utils';
import {ILAYER} from '@wm-core/types/config';

// Stesso layer id già usato per `data.layers.ecTrack` ("Tracks test e2e") in
// map-overlay-feature-collection.cy.ts (`E2E_FC_LAYER_ID`) e not-accessible-track.cy.ts — se la
// fixture conf.json venisse riseedata con un id diverso, aggiornare qui insieme a quei due file.
const E2E_TRACKS_TEST_LAYER_ID = 504;

const configDetailGroups = [
  {
    box_type: 'info',
    items: [
      {
        title: {en: 'Water', it: 'Acqua'},
        content: {
          en: '<p>Scarce water along the way.</p>',
          it: '<p>Scarsità di acqua lungo il percorso.</p>',
        },
      },
      {
        title: {en: 'History', it: 'Storia'},
        content: {en: '<p>Historical background.</p>', it: '<p>Cenni storici.</p>'},
      },
    ],
  },
];

const ec_poi_with_config_detail = {
  type: 'Feature',
  properties: {
    id: 99998,
    name: {en: 'Mocked Poi With Config Detail'},
    description: {en: 'Poi used to test config_detail rendering'},
    config_detail: configDetailGroups,
    searchable: '{it:Mocked Poi With Config Detail}',
    related: false,
    // Elenco completo copiato da ec-poi-details.cy.ts (stesso layer "Poi test e2e"): il filtro
    // taxonomy del layer richiede TUTTI questi identificatori (isArrayContained), non solo un
    // sottoinsieme — un elenco incompleto fa scartare il POI mockato dal filtro e openPoi()
    // va in timeout (bug reale, trovato e corretto in wm-skills:wm-review-ticket).
    taxonomyIdentifiers: [
      'poi-test-e2e',
      'end2end-pois',
      'where_marche',
      'where_ascoli-piceno',
      'where_044023',
      'poi_type_poi',
    ],
  },
  geometry: {
    type: 'Point',
    coordinates: [13.870561123, 42.994791786],
  },
};

const ec_track_properties_with_config_detail = {
  name: {en: 'Track example one MOD'},
  description: {en: 'Track example one MOD description'},
  config_detail: configDetailGroups,
};

// Un solo item, solo con `it` (nessun `en`): la lingua corrente nei test è `en` (lingua del
// browser Cypress), quindi questo item esercita davvero il fallback a cascata (corrente assente
// → lingua di default del shard, `it` per camminiditalia) invece di limitarsi a leggere `en`
// come fanno tutti gli altri item di questo file.
const partiallyTranslatedGroups = [
  {
    box_type: 'info',
    items: [
      {
        title: {it: 'Solo italiano'},
        content: {it: '<p>Contenuto disponibile solo in italiano.</p>'},
      },
    ],
  },
];

const ec_track_properties_with_partial_translation = {
  name: {en: 'Track example one MOD'},
  description: {en: 'Track example one MOD description'},
  config_detail: partiallyTranslatedGroups,
};

/** Rimuove `config_detail` dal layer e2e — sovrascrive intercept precedenti (testIsolation=false). */
function interceptConfWithoutLayerConfigDetail(): void {
  cy.intercept('GET', confURL, req => {
    req.reply(res => {
      const layers = res.body.MAP.layers.map((layer: ILAYER) => {
        if (String(layer.id) !== String(E2E_TRACKS_TEST_LAYER_ID)) {
          return layer;
        }
        const {config_detail: _removed, ...rest} = layer as ILAYER & {
          config_detail?: unknown;
        };
        return rest;
      });
      res.send({...res.body, MAP: {...res.body.MAP, layers}});
    });
  });
}

/** Layer tests first: ordine stabile con testIsolation=false e intercept conf condivisi. */
describe('config_detail boxes are rendered on Layer, EcTrack and EcPoi details (oc:8181)', () => {
  it('renders nothing when config_detail is absent on a Layer', () => {
    clearTestState();
    interceptConfWithoutLayerConfigDetail();
    cy.visit('/');
    goHome(false);

    openLayer(data.layers.ecTrack);

    cy.get('wm-map-details .wm-box-title').should('contain', data.layers.ecTrack);
    cy.get('wm-map-details wm-config-detail .wm-config-detail-item').should('not.exist');
  });

  it('renders config_detail on the Layer detail', () => {
    clearTestState();
    cy.intercept('GET', confURL, req => {
      req.reply(res => {
        const layers = res.body.MAP.layers.map((layer: ILAYER) =>
          String(layer.id) === String(E2E_TRACKS_TEST_LAYER_ID)
            ? {...layer, config_detail: configDetailGroups}
            : layer,
        );
        res.send({...res.body, MAP: {...res.body.MAP, layers}});
      });
    }).as('confWithLayerConfigDetail');
    cy.visit('/');
    cy.wait('@confWithLayerConfigDetail');
    goHome(false);

    openLayer(data.layers.ecTrack);

    cy.get('wm-map-details .wm-box-title').should('contain', data.layers.ecTrack);
    // Scope al pannello mappa: con testIsolation=false la tab Home monta un secondo
    // `wm-home-layer`/`wm-config-detail` per lo stesso layer selezionato nel store.
    cy.get('wm-map-details wm-config-detail .wm-config-detail-item').should(
      'have.length',
      configDetailGroups[0].items.length,
    );
    cy.get('wm-map-details wm-config-detail .wm-config-detail-content').should('not.exist');
  });

  it('renders config_detail as a closed-by-default accordion on the EcTrack detail', () => {
    clearTestState();
    mockGetTrack('86095', ec_track_properties_with_config_detail).as('getApiTrack');
    cy.visit('/');
    goHome(false);

    openLayer(data.layers.ecTrack);
    openTrack(data.tracks.exampleOne);
    cy.wait('@getApiTrack');

    cy.get('wm-map-details wm-track-properties wm-config-detail .wm-config-detail-item').should(
      'have.length',
      configDetailGroups[0].items.length,
    );
    cy.get('wm-map-details wm-track-properties wm-config-detail .wm-config-detail-content').should(
      'not.exist',
    );

    cy.get('wm-map-details wm-track-properties wm-config-detail .wm-config-detail-item')
      .first()
      .find('.wm-config-detail-header')
      .click();
    cy.get('wm-map-details wm-track-properties wm-config-detail .wm-config-detail-content')
      .should('have.length', 1)
      .and('contain.html', configDetailGroups[0].items[0].content.en);
  });

  it('keeps multiple config_detail items open at the same time (oc:8458)', () => {
    clearTestState();
    mockGetTrack('86095', ec_track_properties_with_config_detail).as('getApiTrack');
    cy.visit('/');
    goHome(false);

    openLayer(data.layers.ecTrack);
    openTrack(data.tracks.exampleOne);
    cy.wait('@getApiTrack');

    cy.get('wm-map-details wm-track-properties wm-config-detail .wm-config-detail-item')
      .eq(0)
      .find('.wm-config-detail-header')
      .click();
    cy.get('wm-map-details wm-track-properties wm-config-detail .wm-config-detail-item')
      .eq(1)
      .find('.wm-config-detail-header')
      .click();

    cy.get('wm-map-details wm-track-properties wm-config-detail .wm-config-detail-content')
      .should('have.length', 2);
    cy.get('wm-map-details wm-track-properties wm-config-detail .wm-config-detail-item')
      .eq(0)
      .find('.wm-config-detail-content')
      .should('contain.html', configDetailGroups[0].items[0].content.en);
    cy.get('wm-map-details wm-track-properties wm-config-detail .wm-config-detail-item')
      .eq(1)
      .find('.wm-config-detail-content')
      .should('contain.html', configDetailGroups[0].items[1].content.en);
  });

  it('renders config_detail as a closed-by-default accordion on the EcPoi detail', () => {
    clearTestState();
    mockGetPoi(ec_poi_with_config_detail).as('getPoi');
    cy.visit('/');
    cy.wait('@getPoi');
    goHome(false);

    openLayer(data.layers.ecPoi);
    openPoi(ec_poi_with_config_detail.properties.name.en);

    cy.get('wm-map-details wm-poi-properties wm-config-detail .wm-config-detail-item').should(
      'have.length',
      configDetailGroups[0].items.length,
    );
    cy.get('wm-map-details wm-poi-properties wm-config-detail .wm-config-detail-content').should(
      'not.exist',
    );

    cy.get('wm-map-details wm-poi-properties wm-config-detail .wm-config-detail-item')
      .eq(1)
      .find('.wm-config-detail-header')
      .click();
    cy.get('wm-map-details wm-poi-properties wm-config-detail .wm-config-detail-content')
      .should('have.length', 1)
      .and('contain.html', configDetailGroups[0].items[1].content.en);
  });

  it('falls back to the default language when the current language is missing for a row', () => {
    clearTestState();
    mockGetTrack('86095', ec_track_properties_with_partial_translation).as('getApiTrack');
    cy.visit('/');
    goHome(false);

    openLayer(data.layers.ecTrack);
    openTrack(data.tracks.exampleOne);
    cy.wait('@getApiTrack');

    cy.get('wm-map-details wm-track-properties wm-config-detail .wm-config-detail-item').should(
      'have.length',
      1,
    );
    cy.get('wm-map-details wm-track-properties wm-config-detail .wm-config-detail-header').click();
    cy.get('wm-map-details wm-track-properties wm-config-detail .wm-config-detail-content')
      .should('have.length', 1)
      .and('contain.html', partiallyTranslatedGroups[0].items[0].content.it);
  });
});
