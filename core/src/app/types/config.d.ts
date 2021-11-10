interface IAPP {
  name: string;
  id: string;
  geohubId: number;
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
