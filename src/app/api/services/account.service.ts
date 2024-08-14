import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { API_URL } from '../../app.config';

/**
 * Service for account self-service.
 */
@Injectable({providedIn: 'root'})
export class AccountService {

  /**
   * Creates a new instance of class AccountService.
   */
  constructor(private readonly http: HttpClient,
              @Inject(API_URL) private readonly apiUrl: string) {
  }

  /**
   * Requests a password reset.
   *
   * @param username The username for which a password reset is requested.
   */
  requestPasswordReset(username: string): Promise<void> {
    console.info('[AccountService] Request password reset');
    return new Promise<void>((resolve, reject) => this.http.get(this.apiUrl + '/auth/reset-password', {params: new HttpParams().set('username', username)}).subscribe({
      next: () => resolve(),
      error: err => {
        console.info('[AccountService] Password reset request failed', err);
        reject(err);
      }
    }));
  }

  /**
   * Resets the password.
   *
   * @param token The password reset token.
   * @param password The new password.
   * @param passwordConfirmation The new password confirmation.
   */
  resetPassword(token: string, password: string, passwordConfirmation: string): Promise<void> {
    console.info('[AccountService] Reset password');
    return new Promise<void>((resolve, reject) => this.http.post(this.apiUrl + '/auth/reset-password', {
      token,
      password,
      passwordConfirmation
    }).subscribe({
      next: () => resolve(),
      error: err => {
        console.info('[AccountService] Password reset failed', err);
        reject(err);
      }
    }));
  }

  /**
   * Activates the account.
   *
   * @param token The activation token.
   * @param password The password.
   * @param passwordConfirmation The password confirmation.
   */
  activateAccount(token: string, password: string, passwordConfirmation: string): Promise<void> {
    console.info('[AccountService] Activate account');
    return new Promise<void>((resolve, reject) => this.http.post(this.apiUrl + '/auth/activate', {
      token,
      password,
      passwordConfirmation
    }).subscribe({
      next: () => resolve(),
      error: err => {
        console.info('[AccountService] Account activation failed', err);
        reject(err);
      }
    }));
  }

  /**
   * Changes the password of the current user.
   *
   * @param currentPassword The current password.
   * @param password The new password.
   * @param passwordConfirmation The new password confirmation.
   */
  changePassword(currentPassword: string, password: string, passwordConfirmation: string): Promise<void> {
    console.info('[AccountService] Change password');
    return new Promise<void>((resolve, reject) => this.http.post(this.apiUrl + '/auth/change-password', {
      currentPassword,
      password,
      passwordConfirmation
    }).subscribe({
      next: () => resolve(),
      error: err => {
        console.info('[AccountService] Change password failed', err);
        reject(err);
      }
    }));
  }
}
