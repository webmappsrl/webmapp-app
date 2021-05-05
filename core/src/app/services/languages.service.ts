/**
 * Languages Service
 *
 * It provides all the languages feature based on the app configuration,
 * such as default language, current language in use. It also handle the
 * tranlate service (ngx-translate) initialization. The translations are
 * available using the TranslateService
 *
 * */

import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { StorageService } from './base/storage.service';

@Injectable({
  providedIn: 'root',
})
export class LanguagesService {
  private _defaultLang: string;
  private _currentLang: string;
  private _available: Array<string>;
  private _onCurrentLangChange: ReplaySubject<string>;

  constructor(
    private _configService: ConfigService,
    private _translateService: TranslateService,
    private _storageService: StorageService // private _configService: ConfigService,
  ) {
    this._onCurrentLangChange = new ReplaySubject<string>(1);
  }

  public get onCurrentLangChange(): Observable<string> {
    return this._onCurrentLangChange;
  }

  public get currentLang(): string {
    return this._currentLang;
  }

  public get defaultLang(): string {
    return this._defaultLang;
  }

  /**
   * Initialize the translation service and the app language
   */
  initialize() {
    this._initTranslate();
  }

  /**
   * Allow to change the app language
   *
   * @param lang string of at least two chars that represent the language to switch
   */
  changeLanguage(lang: string): void {
    lang = lang.substring(0, 2);
    if (this.isAvailable(lang)) {
      this._currentLang = lang;
      this._translateService
        .use(this._currentLang)
        .pipe(take(1))
        .subscribe(
          () => {
            this._onCurrentLangChange.next(this._currentLang);
            // this._storageService.setLanguage(this._currentLang);
          },
          (err) => {
            console.warn(err);
          }
        );
    }
  }

  /**
   * If lang is available return true
   *
   * @param lang the language to look for
   */
  isAvailable(lang: string): boolean {
    if (
      typeof lang === 'undefined' ||
      lang === null ||
      lang === '' ||
      lang.length < 2
    )
      return false;

    for (const i of this._available)
      if (i === lang.substring(0, 2)) return true;

    return false;
  }

  /**
   * Return the translation for the specifiedkey using the specified object
   *
   * @param object the object containing the key and eventually the translations
   * @param key the key
   * @param key the fallback key. Used if there is no translation of the key
   */
  translate(object: any, key: string, fallbackKey?: string): string {
    let value: string;

    if (!object) return undefined;

    if (
      object[key] &&
      this._translateService.instant(object[key]) !== object[key]
    )
      value = this._translateService.instant(object[key]);
    else if (
      object.translations &&
      object.translations[this._currentLang] &&
      object.translations[this._currentLang][key]
    )
      value = object.translations[this._currentLang][key];
    else if (
      object.locale &&
      object.locale.substring(0, 2) === this._currentLang &&
      object[key]
    )
      value = object[key];
    else if (
      fallbackKey &&
      object.translations &&
      object.translations[this._currentLang] &&
      object.translations[this._currentLang][fallbackKey]
    )
      value = object.translations[this._currentLang][fallbackKey];
    else if (
      fallbackKey &&
      object.locale &&
      object.locale.substring(0, 2) === this._currentLang &&
      object[fallbackKey]
    )
      value = object[fallbackKey];
    else if (
      object.translations &&
      object.translations[this._defaultLang] &&
      object.translations[this._defaultLang][key]
    )
      value = object.translations[this._defaultLang][key];
    else if (object[key]) value = object[key];
    else if (object[fallbackKey]) value = object[fallbackKey];

    return value;
  }

  /**
   * Initialize the translations and select the language
   */
  private _initTranslate() {
    this._defaultLang = this._configService.defaultLanguage;
    this._available = this._configService.availableLanguages;

    this._translateService.setDefaultLang('it');
    this._storageService.getLanguage().then((lang) => {
      // First - previously set language
      if (this.isAvailable(lang)) this._currentLang = lang;
      // Second - browser language
      else if (
        this._translateService.getBrowserLang() !== undefined &&
        this.isAvailable(this._translateService.getBrowserLang())
      )
        this._currentLang = this._translateService
          .getBrowserLang()
          .substring(0, 2);
      // Third - default language
      else this._currentLang = this._defaultLang;

      this._translateService
        .use(this._currentLang)
        .pipe(take(1))
        .subscribe(
          () => {
            this._onCurrentLangChange.next(this._currentLang);
            this._storageService.setLanguage(this._currentLang);
          },
          (err) => {
            console.warn(err);
          }
        );
    });
  }
}
