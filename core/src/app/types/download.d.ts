
export interface DownloadStatus {
  finish: boolean,
  setup?: number,
  map?: number,
  data?: number,
  media?: number,
  install?: number,
}
export interface DownloadedTrackComponents {
  trackId: number,
  tiles: string[],
  images: string[],
  pois: number[]
}
