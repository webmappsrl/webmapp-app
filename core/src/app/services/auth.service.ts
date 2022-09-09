import {BehaviorSubject, Observable, ReplaySubject, from, of} from 'rxjs';
import {
  GEOHUB_DELETE_ENDPOINT,
  GEOHUB_LOGIN_ENDPOINT,
  GEOHUB_LOGOUT_ENDPOINT,
  GEOHUB_REGISTER_ENDPOINT,
} from '../constants/geohub';
import {HttpErrorResponse, HttpHeaders, HttpResponse} from '@angular/common/http';
import {catchError, switchMap, take, tap} from 'rxjs/operators';

import {CommunicationService} from './base/communication.service';
import {Injectable} from '@angular/core';
import {LoadingController} from '@ionic/angular';
import {StorageService} from './base/storage.service';
import config from '../../../config.json';
import {environment} from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _onStateChange: ReplaySubject<IUser>;
  private _userData: IUser;

  isLoggedIn$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private _communicationService: CommunicationService,
    private _storageService: StorageService,
    private _loadingCtrl: LoadingController,
  ) {
    this._onStateChange = new ReplaySubject<IUser>(1);

    this._onStateChange.subscribe(x => {
      this._communicationService.setToken(x?.token);
    });

    this._onStateChange.next(this._userData);
    this._storageService.getUser().then(
      (user: IUser) => {
        this._userData = user;
        if (user != null) {
          this.isLoggedIn$.next(true);
        }
        this._onStateChange.next(this._userData);
      },
      err => {
        console.warn(err);
      },
    );
  }

  get email(): string {
    return this._userData?.email;
  }

  get isLoggedIn(): boolean {
    return typeof this._userData !== 'undefined';
  }

  get name(): string {
    return this._userData?.name;
  }

  get onStateChange(): ReplaySubject<IUser> {
    return this._onStateChange;
  }

  get token(): string {
    return this._userData?.token;
  }

  get userId(): number {
    return this._userData?.id;
  }

  /**
   * Perform the login with the geohub
   *
   * @param email the account email
   * @param password the account password
   * @returns
   */
  login(email: string, password: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this._communicationService
        .post(
          `${environment.api}${GEOHUB_LOGIN_ENDPOINT}`,
          {
            email,
            password,
          },
          {
            headers: new HttpHeaders({
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'Content-Type': 'application/json',
            }),
          },
        )
        .subscribe(
          (response: IGeohubApiLogin) => {
            this._saveUser(response);
            resolve(true);
          },
          (err: HttpErrorResponse) => {
            console.warn(err);
            this._userData = undefined;
            this._onStateChange.next(this._userData);
            reject(err);
          },
        );
    });
  }

  /**
   * Perform the logout from the geohub
   */
  logout(): void {
    const token: string = this.token;
    this._storageService.removeUser();
    this._userData = undefined;
    this._onStateChange.next(this._userData);
    this.isLoggedIn$.next(false);
    if (token) {
      this._communicationService
        .post(`${environment.api}${GEOHUB_LOGOUT_ENDPOINT}`, undefined, {
          headers: new HttpHeaders({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Content-Type': 'application/json',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Authorization: 'Bearer ' + token,
          }),
        })
        .subscribe(
          () => {},
          (err: HttpErrorResponse) => {
            console.warn(err);
          },
        );
    }
  }

  delete$(): Observable<any> {
    const token: string = this.token;
    let res: Observable<any> = from('errore');
    let loading = null;

    if (token) {
      res = from(this._loadingCtrl.create()).pipe(
        switchMap(l => {
          loading = l;
          loading.present();
          return this._communicationService.post(
            `${environment.api}${GEOHUB_DELETE_ENDPOINT}`,
            undefined,
            {
              headers: new HttpHeaders({
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-Type': 'application/json',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Authorization: 'Bearer ' + token,
              }),
            },
          );
        }),
        take(1),
        catchError((err: HttpErrorResponse) => {
          return of(err.error);
        }),
        tap(_ => {
          loading.dismiss();
        }),
      );
    }
    return res;
  }

  async register(name: string, email: string, password: string, cf: string): Promise<boolean> {
    try {
      const response: IGeohubApiLogin = await this._communicationService
        .post(
          `${environment.api}${GEOHUB_REGISTER_ENDPOINT}`,
          {
            name,
            email,
            password,
            referrer: config.APP.id,
            fiscal_code: cf,
          },
          {
            headers: new HttpHeaders({
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'Content-Type': 'application/json',
            }),
          },
        )
        .toPromise();
      this._saveUser(response);
      console.log('------- ~ AuthService ~ register ~ response', response);
      return true;
    } catch (err) {
      console.warn(err);
      this._userData = undefined;
      this._onStateChange.next(this._userData);
      return false;
    }
  }

  /**
   * Save the current logged user in the storage
   *
   * @param apiUser the user retrieved from the geohub
   * @returns
   */
  private _saveUser(apiUser: IGeohubApiLogin): Promise<void> {
    const user: IUser = {
      id: apiUser.id,
      token: apiUser.access_token,
    };

    if (apiUser.created_at) user.createdAt = apiUser.created_at;
    if (apiUser.updated_at) user.updatedAt = apiUser.updated_at;
    if (apiUser.email) user.email = apiUser.email;
    if (apiUser.name) user.name = apiUser.name;
    if (apiUser.role) user.role = apiUser.role;

    this._userData = user;
    this._onStateChange.next(this._userData);

    return this._storageService.setUser(user);
  }
}
