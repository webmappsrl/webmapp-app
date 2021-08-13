/* eslint-disable @typescript-eslint/naming-convention */
export interface IWmImage {
  id: number;
  url: string;
  caption: string;
  api_url: string;
  sizes: {
    '108x148': string;
    '108x137': string;
    '225x100': string;
    '118x138': string;
    '108x139': string;
    '118x117': string;
    '335x250': string;
    '400x200': string;
    '1440x500': string;
  };
}

export interface IWmRoute {
  type: string;
  properties: {
    id: number;
    created_at: Date;
    updated_at: Date;
    name: {
      it: string;
      en: string;
    };
    description: {
      it: string;
      en: string;
    };
    excerpt: {
      it: string;
      en: string;
    };
    source_id: string;
    import_method: string;
    source: string;
    distance_comp: number;
    user_id: number;
    feature_image: number;
    audio: string;
    distance: number;
    ascent: number;
    descent: number;
    ele_from: number;
    ele_to: number;
    ele_min: number;
    ele_max: number;
    duration_forward: number;
    duration_backward: number;
    difficulty: {
      it: string;
      en: string;
    };
    geojson_url: string;
    kml_url: string;
    gpx_url: string;
    image: IWmImage;
    imageGallery: IWmImage[];
    taxonomy: {
      activity: string[];
      where: string[];
    };
    duration: {
      hiking: {
        forward: number;
        backward: number;
      };
    };
  };
  geometry: {
    type: string;
    coordinates: [];
  };
}
