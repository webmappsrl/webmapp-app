import {clearTestState, data, mockGetPoi, openLayer, openPoi} from "cypress/utils/test-utils";

const ec_poi = {
  type: "Feature",
  properties: {
      id: 99999,
      created_at: "2025-02-12T10:00:24.000000Z",
      updated_at: "2025-05-12T13:40:23.000000Z",
      name: {
          en: "Mocked Poi",
      },
      description: {
          en: "This poi was created for e2e tests"
      },
      excerpt: {
        en: "<p>Excerpt for e2e tests</p>"
      },
      image_gallery: [
        {
            id: 14536,
            name: {
                en: "Mocked Poi Image"
            },
            url: "https://ecmedia.s3.eu-central-1.amazonaws.com/EcMedia/14536.jpg",
            caption: {
                en: "Mocked Poi Image Caption"
            },
            api_url: "https://geohub.webmapp.it/api/ec/media/14536"
        }
      ],
      user_id: 21804,
      color: "#de1b0d",
      info: {
          "it": "<h2>Info:<h2>\r\n<p>Orari apertura:</br><strong>Lunedì</strong>: 8:00 - 20:00</br><strong>Martedì</strong>: 8:00 - 13:00</br><strong>Mercoledì</strong>: 8:00 - 20:00</br><strong>Giovedì</strong>: 8:00 - 13:00</br></p>"
      },
      address: "Via Fasulla 123, Stella (SL)",
      ele: 100,
      contact_phone: "3333333333",
      contact_email: "e2e@webmapp.it",
      related_url: {"osm2cai.cai.it":"https:\/\/osm2cai.cai.it\/hiking-route\/id\/14906"},
      embedded_html: {
          en: "<h1>Embedded HTML</h1><p>Embedded HTML for e2e tests</p>"
      },
      author_email: "e2e@webmapp.it",
      taxonomy: {
          theme: [
              453,
              244
          ],
          where: [
              11,
              64,
              4350
          ]
      },
      taxonomyIdentifiers: [
          "poi-test-e2e",
          "end2end-pois",
          "where_marche",
          "where_ascoli-piceno",
          "where_044023",
          "poi_type_poi"
      ],
      searchable: "{it:Poi example one,en:Poi example one} {it:Questo poi u00e8 stato creato per dei test e2e} []  {it:Punto di interesse,en:Point Of Interest} ",
      related: false
  },
  geometry: {
      type: "Point",
      coordinates: [
          13.870561123,
          42.994791786
      ]
  }
}

describe('Show correct ec_poi details', () => {
  before(() => {
    clearTestState();
    mockGetPoi(ec_poi).as('getPoi');
    cy.visit('/');
  });

  it('should show the ec_poi excerpt in details', () => {
    cy.wait('@getPoi');
    openLayer(data.layers.ecPoi);
    openPoi(ec_poi.properties.name.en);

    const excerpt = ec_poi.properties.excerpt.en;
    cy.get('.wm-excerpt').invoke('html').should('contain', excerpt);
  })

  it('should show the ec_poi image gallery in details', () => {
    const imageGallery = ec_poi.properties.image_gallery;
    cy.get('wm-tab-image-gallery wm-img').should('have.length', imageGallery.length);
  })

  it('should show the ec_poi address and ele in details', () => {
    const address = ec_poi.properties.address;
    const ele = ec_poi.properties.ele;
    cy.get('wm-tab-detail ion-note').should('contain', address);
    cy.get('wm-tab-detail ion-note').should('contain', ele);
  })

  it('should show the ec_poi description in details', () => {
    const description = ec_poi.properties.description.en;
    cy.get('wm-tab-description').invoke('html').should('contain', description);
  })

  it('should show the phone number, email and related urls in details', () => {
    const phone = ec_poi.properties.contact_phone;
    const email = ec_poi.properties.contact_email;
    const relatedUrl = ec_poi.properties.related_url;

    cy.get('wm-feature-useful-urls wm-phone').should('contain', phone);
    cy.get('wm-feature-useful-urls wm-email').should('contain', email);
    cy.get('wm-feature-useful-urls wm-related-urls').should('contain', Object.keys(relatedUrl)[0]);
  });
});
