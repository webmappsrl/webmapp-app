import { Injectable } from '@angular/core';
import { SQLite, SQLiteDatabaseConfig } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { TILES_DOMAIN } from '../constants/geohub';
import { StorageService } from './base/storage.service';

const MINIMUMZOOM = 1;

@Injectable({
  providedIn: 'root'
})
export class TilesService {

  constructor(
    private storage: StorageService,
    private platform: Platform,
    private _sqlite: SQLite,
  ) { }

  async getTile(coords: number[], fromCache: boolean): Promise<string> {
    const tileId = coords.join('/');
    let result = null;
    if (fromCache) {
      // try get from mbtiles
      result = await this.getFromMBTilesDownloaded(tileId);
    }

    if (!result) {
      //get from url
      result = this.getTileFromWeb(coords);
    }

    return result
  }

  public getTileFromWeb(coords: number[]) {
    const tileId = coords.join('/');
    return (`${TILES_DOMAIN}${tileId}.png`);
  }

  public getCoordsFromUr(url: string): number[] {
    let coords: [number, number, number] = [0, 0, 0];
    let tmp: string[] = url.split("/");

    coords[0] = parseInt(tmp[tmp.length - 3]);
    coords[1] = parseInt(tmp[tmp.length - 2]);
    coords[2] = parseInt(tmp[tmp.length - 1].split(".")[0]);

    return coords;
  }

  async getFromMBTilesDownloaded(tileId: string): Promise<string> {
    const mbTileFileName = await this.getMbTileFileName(tileId);
    console.log("------- ~ TilesService ~ getFromMBTilesDownloaded ~ mbTileFileName", mbTileFileName);
    if (mbTileFileName) {
      return this.getBase64fromMBtile(tileId, mbTileFileName);
    }
    return null;
  }

  async getMbTileFileName(tileId) {
    const mbTile = this.storage.getMBTileFilename(tileId);
    if (mbTile) {
      return mbTile;
    }

    const fatherTileId = this.getFatherTileId(tileId);

    if (fatherTileId) {
      return this.getMbTileFileName(fatherTileId);
    }

    return null;
  }

  getFatherTileId(tileId): string {
    const coord = tileId.split('/');
    if (coord[0] as number <= MINIMUMZOOM)
      return null;
    return `${coord[0]--}/${Math.floor(coord[1] / 2)}/${Math.floor(coord[2] / 2)}`;
  }

  async getBase64fromMBtile(tileId: string, mbTileFileName): Promise<string> {
    if (!this.platform.is('mobile')) {
      return null;
    }

    let coordsString: string[] = tileId.split('/');
    const coords: number[] = [];
    coordsString.forEach(x => { coords.push(+x) })
    coords[2] = Math.pow(2, (coords[0] as number)) - (coords[2] as number) - 1;

    let config: SQLiteDatabaseConfig = {
      name: mbTileFileName,
      iosDatabaseLocation: "Library",
    };

    const db = await this._sqlite.create(config);
    const value = await db.executeSql(
      "SELECT BASE64(tile_data) AS tile FROM images INNER JOIN map ON images.tile_id = map.tile_id WHERE zoom_level = ? AND tile_column = ? AND tile_row = ?;",
      coords
    )

    let tileData = value.rows.item(0);
    let base64: string;

    if (
      typeof tileData !== "undefined" &&
      typeof tileData.tile !== "undefined" &&
      tileData.tile !== ""
    ) {
      base64 = "data:image/png;base64, " + tileData.tile;
    }
    return base64;

  }
}
