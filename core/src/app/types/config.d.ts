interface IAPP {
  name: string;
  id: string;
}

interface IGEOLOCATION {
  record: {
    enable: boolean;
  };
}

interface IConfig {
  APP: IAPP;
  GEOLOCATION?: IGEOLOCATION;
}
