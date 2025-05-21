import {clearTestState, data, mockGetTrack, openLayer, openTrack} from "cypress/utils/test-utils";

const ec_track_properties = {
  name: {en: 'Track example one MOD'},
  description: {en: 'Track example one MOD description'},
  image_gallery: [
    {
        "id": 631,
        "name": {
            "en": "test image",
            "nl": null
        },
        "url": "https://ecmedia.s3.eu-central-1.amazonaws.com/EcMedia/631.jpg",
        "api_url": "https://geohub.webmapp.it/api/ec/media/631",
    },
    {
      "id": 631,
      "name": {
          "en": "test image",
          "nl": null
      },
      "url": "https://ecmedia.s3.eu-central-1.amazonaws.com/EcMedia/631.jpg",
      "api_url": "https://geohub.webmapp.it/api/ec/media/631",
    }
  ],
  taxonomy: {
    activity: [
      {
        "id": 1,
        "name": {
            "en": "Hiking",
        },
        "identifier": "hiking",
      },
      {
        "id": 2,
        "name": {
            "en": "Cycling",
        },
        "identifier": "cycling",
      }
    ]
  },
  related_url: {"osm2cai.cai.it":"https:\/\/osm2cai.cai.it\/hiking-route\/id\/14906"}
};

describe('Show correct ec_track details', () => {
  before(() => {
    clearTestState();
    mockGetTrack('86095', ec_track_properties).as('getApiTrack');
    cy.visit('/');
  });

  it('should show correct name on ec_track details', () => {
    openLayer(data.layers.ecTrack);
    openTrack(data.tracks.exampleOne);
    cy.wait('@getApiTrack');

    cy.get('wm-map-details ion-title').should('contain', ec_track_properties.name.en);
  });

  it('should show correct description on ec_track details', () => {
    const description = ec_track_properties.description.en;
    cy.get('wm-tab-description').should('contain', description);
  });

  it('should show correct image gallery on ec_track details', () => {
    const imageGallery = ec_track_properties.image_gallery;
    cy.get('wm-tab-image-gallery wm-img').should('have.length', imageGallery.length);
  });

  it('should show correct activity on ec_track details', () => {
    const activity = ec_track_properties.taxonomy.activity;
    cy.get('wm-tab-howto .webmapp-walkability-box').should('have.length', activity.length);
    activity.forEach(activity => {
      cy.get('wm-tab-howto').should('contain', activity.name.en);
    });
  });

  it('should show correct related url on ec_track details', () => {
    const relatedUrl = ec_track_properties.related_url;
    cy.get('wm-related-urls ion-label').should('contain', Object.keys(relatedUrl)[0]);
  });
});
