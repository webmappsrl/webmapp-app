import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import {
  GEOHUB_PROTOCOL,
  GEOHUB_DOMAIN,
  GEOHUB_LOGIN_ENDPOINT,
  GEOHUB_LOGOUT_ENDPOINT,
} from '../constants/geohub';
import { CommunicationService } from './base/communication.service';
import { StorageService } from './base/storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _userData: IUser;
  private _onStateChange: ReplaySubject<IUser>;

  constructor(
    private _communicationService: CommunicationService,
    private _storageService: StorageService
  ) {
    this._onStateChange = new ReplaySubject<IUser>(1);
    
    this._onStateChange.subscribe(x => {
      this._communicationService.setToken(x?.token);
    })

    this._onStateChange.next(this._userData);
    this._storageService.getUser().then(
      (user: IUser) => {
        this._userData = user;
        this._onStateChange.next(this._userData);
      },
      (err) => {
        console.warn(err);
      }
    );

  }

  get isLoggedIn(): boolean {
    return typeof this._userData !== 'undefined';
  }

  get userId(): number {
    return this._userData?.id;
  }

  get token(): string {
    return this._userData?.token;
  }

  get email(): string {
    return this._userData?.email;
  }

  get name(): string {
    return this._userData?.name;
  }

  get onStateChange(): ReplaySubject<IUser> {
    return this._onStateChange;
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
          GEOHUB_PROTOCOL + '://' + GEOHUB_DOMAIN + GEOHUB_LOGIN_ENDPOINT,
          {
            email,
            password,
          },
          {
            headers: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'Content-Type': 'application/json',
            },
          }
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
          }
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

    if (token) {
      this._communicationService
        .post(
          GEOHUB_PROTOCOL + '://' + GEOHUB_DOMAIN + GEOHUB_LOGOUT_ENDPOINT,
          undefined,
          {
            headers: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'Content-Type': 'application/json',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              Authorization: 'Bearer ' + token,
            },
          }
        )
        .subscribe(
          () => { },
          (err: HttpErrorResponse) => {
            console.warn(err);
          }
        );
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
