/* eslint-disable @typescript-eslint/naming-convention */
export enum SaveObjType {
  PHOTO = 'photo',
  PHOTOTRACK = 'phototrack',
  TRACK = 'track',
  WAYPOINT = 'waypoint',
}

export interface SaveIndexObj {
  key: string;
  type: SaveObjType;
  saved: boolean;
}
