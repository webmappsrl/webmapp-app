import { Injectable } from '@angular/core';
import { GEOHUB_BASE_URL, GEOHUB_LOGIN_ENDPOINT } from '../constants/geohub';
import { CommunicationService } from './base/communication.service';
import { StorageService } from './base/storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _userData: IUser;

  constructor(
    private _communicationService: CommunicationService,
    private _storageService: StorageService
  ) {}

  get isLoggedIn(): boolean {
    return true;
  }

  get userId(): number {
    return 0;
  }

  get token(): string {
    return '';
  }

  get email(): string {
    return '';
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
          GEOHUB_BASE_URL + GEOHUB_LOGIN_ENDPOINT,
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
            this._saveToStorage(response);
            resolve(true);
          },
          (err) => {
            console.warn(err);
            reject(err);
          }
        );
    });
  }

  /**
   * Save the current logged user in the storage
   *
   * @param apiUser the user retrieved from the geohub
   * @returns
   */
  private _saveToStorage(apiUser: IGeohubApiLogin): Promise<void> {
    const user: IUser = {
      id: apiUser.id,
      token: apiUser.token,
    };

    if (apiUser.created_at) user.createdAt = apiUser.created_at;
    if (apiUser.updated_at) user.updatedAt = apiUser.updated_at;
    if (apiUser.email) user.email = apiUser.email;
    if (apiUser.name) user.name = apiUser.name;
    if (apiUser.role) user.role = apiUser.role;

    return this._storageService.setUser(user);
  }
}
