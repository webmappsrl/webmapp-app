import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { IGeojsonFeature } from 'src/app/types/model';

const TRACKTABLE = 'tblTrack';
const POITABLE = 'tblPoi'
const IMAGETABLE = 'tblImages'
const MBTILETABLE = 'tblMbTIle'
const TRACKPOITABLE = 'tblTrackPoi';
const TRACKIMAGETABLE = 'tblTrackImage';
const TRACKTILETABLE = 'tblTrackTile';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  private db: SQLiteObject;

  constructor(
    private sqlite: SQLite,
    private platform: Platform
  ) {

    this.platform.ready().then(() => {
      console.log('the platform is ready');
      this.init();
    });
  }

  async init() {
    console.log("------- ~ DbService ~ init ~ init");


    if (this.platform.is('cordova')) {
      this.db = await this.sqlite.create({
        name: 'data.db',
        location: 'default'
      })
      console.log("------- ~ DbService ~ init ~ this.db", this.db);
      this.initTables();
    } else {
      // this.db = window.openDatabase('test_DB', '1.0', 'DEV', 5 * 1024 * 1024);
      console.log("not a cordova device! Cannot init sqlite")
    }

  }

  private async initTables() {
    return this.db.transaction((tx) => {
      tx.executeSql(`CREATE TABLE IF NOT EXISTS ${TRACKTABLE} (id, data, size)`);
      tx.executeSql(`CREATE TABLE IF NOT EXISTS ${POITABLE} (id, data)`);
      tx.executeSql(`CREATE TABLE IF NOT EXISTS ${MBTILETABLE} (id, path)`);
      tx.executeSql(`CREATE TABLE IF NOT EXISTS ${IMAGETABLE} (url, data)`);
      tx.executeSql(`CREATE TABLE IF NOT EXISTS ${TRACKPOITABLE} (trackid, poiId)`);
      tx.executeSql(`CREATE TABLE IF NOT EXISTS ${TRACKIMAGETABLE} (trackid, imageurl)`);
      tx.executeSql(`CREATE TABLE IF NOT EXISTS ${TRACKTILETABLE} (trackid, tileId)`);
    }).catch((error) => {
      console.log('Transaction ERROR: ' + error.message);
    });
  }

  public async getTrack(trackId): Promise<IGeojsonFeature> {
    const res = await this.execute('select data from ${TRACKTABLE} where id = ?', [trackId]);
    console.log("------- ~ DbService ~ getTrack ~ res", res);
    // const ret = JSON.parse(res.data);
    return res;
  }

  public async saveTrack(track: IGeojsonFeature) {
    // const res = await this.execute('select data from ${TRACKTABLE} where id = ?', [trackId]);
    // console.log("------- ~ DbService ~ getTrack ~ res", res);
    // // const ret = JSON.parse(res.data);
    // return res;
  }

  private async execute(query, parmas) {
    return this.db.executeSql(query, parmas).catch(e => console.log(e, query, parmas));
  }

}
