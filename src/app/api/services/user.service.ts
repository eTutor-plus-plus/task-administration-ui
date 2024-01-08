import { Inject, Injectable } from '@angular/core';
import { HttpHeaders, HttpParams } from '@angular/common/http';

import { API_URL } from '../../app.config';
import { ModifyUserDto, UserDto } from '../models';
import { ApiService } from './api.service';

/**
 * API-service for users.
 */
@Injectable({providedIn: 'root'})
export class UserService extends ApiService<UserDto, ModifyUserDto, number, UserFilter> {

  /**
   * Creates a new instance of class UserService.
   */
  constructor(@Inject(API_URL) apiUrl: string) {
    super('UserService', apiUrl + '/api/user');
  }

  /**
   * Updates the password of an existing user.
   *
   * @param id The identifier of the user.
   * @param data The new password.
   * @param concurrencyToken The concurrency token to prevent modification of different users.
   */
  changePassword(id: number, data: { password: string; }, concurrencyToken: string | null = null): Promise<void> {
    console.info(`[${this.serviceName}] Update password of user ` + id);
    let headers = new HttpHeaders();
    if (concurrencyToken)
      headers = headers.set('If-Unmodified-Since', concurrencyToken);
    return new Promise((resolve, reject) => this.http.put(this.apiUrl + '/' + encodeURIComponent(id) + '/password', data, {headers}).subscribe({
      next: () => resolve(),
      error: err => {
        console.error(`[${this.serviceName}] Failed updating password of user ` + id, err);
        reject(err);
      }
    }));
  }

  protected override setFilterParam(params: HttpParams, filter: UserFilter): HttpParams {
    if (filter.username)
      params = params.set('usernameFilter', filter.username);
    if (filter.firstName)
      params = params.set('firstNameFilter', filter.firstName);
    if (filter.lastName)
      params = params.set('lastNameFilter', filter.lastName);
    if (filter.email)
      params = params.set('emailFilter', filter.email);
    if (filter.enabled !== null && filter.enabled !== undefined)
      params = params.set('enabledFilter', filter.enabled.toString());
    if (filter.fullAdmin !== null && filter.fullAdmin !== undefined)
      params = params.set('fullAdminFilter', filter.fullAdmin.toString());
    return params;
  }

}

/**
 * The filter properties for users.
 */
export interface UserFilter {
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  enabled?: boolean;
  fullAdmin?: boolean;
}
