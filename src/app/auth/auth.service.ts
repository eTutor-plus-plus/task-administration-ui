import { Inject, Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import * as jose from 'jose';

import { API_URL } from '../app.config';
import { AuthTokenModel, Role, RoleAssignment, ApplicationUser } from './models';

/**
 * Service for authenticating users.
 */
@Injectable({providedIn: 'root'})
export class AuthService implements OnDestroy {
  private static readonly STORAGE_KEY: string = '@dke-etutor/auth-token';
  private readonly userChanged$ = new BehaviorSubject<ApplicationUser | null>(null);
  private authToken: AuthTokenModel | null = null;
  private tokenExpirationDate?: number;
  private refreshSub?: number;

  /**
   * Emits an event when the current user changed.
   */
  readonly userChanged = this.userChanged$.asObservable();

  /**
   * Creates a new instance of class AuthService.
   */
  constructor(private readonly http: HttpClient,
              private readonly router: Router,
              @Inject(API_URL) private readonly apiUrl: string) {
    try {
      console.info('[AUTH] Trying to load token from storage');
      const json = localStorage.getItem(AuthService.STORAGE_KEY);
      if (json !== null) {
        const token: AuthTokenModel = JSON.parse(json);
        this.parseToken(token);
      }
    } catch (err) {
      // do nothing, no valid token available
    }
  }

  /**
   * Performs the login.
   *
   * @param username The username.
   * @param password The password.
   * @throws Error If the login was not successful.
   */
  async login(username: string, password: string): Promise<void> {
    console.info('[AUTH] Login with password');
    try {
      const result = await firstValueFrom(this.http.post<AuthTokenModel>(this.apiUrl + '/auth/login', {
        username,
        password
      }));

      this.storeToken(result);
      this.parseToken(result);
    } catch (err) {
      console.error('[AUTH] Login with password failed', err);
      throw err;
    }
  }

  /**
   * Logout the current user.
   */
  logout(): void {
    console.info('[AUTH] Logout user');
    localStorage.removeItem(AuthService.STORAGE_KEY);
    this.stopRefreshToken();
    this.authToken = null;
    this.user = null;
  }

  /**
   * Returns whether the current user is authenticated.
   */
  isAuthenticated(): boolean {
    return this.user !== null && this.authToken !== null && !!this.tokenExpirationDate && (this.tokenExpirationDate * 1000) > new Date().getTime();
  }

  //#region --- User ---

  /**
   * Gets the current user.
   */
  get user(): ApplicationUser | null {
    return this.userChanged$.value;
  }

  /**
   * Sets the current user.
   *
   * @param value The current user.
   */
  private set user(value: ApplicationUser | null) {
    this.userChanged$.next(value);
  }

  //#endregion

  //#region --- Token ---

  /**
   * Gets the current user.
   */
  get authHeaderValue(): string | null {
    return this.authToken === null ?
      null :
      this.authToken.token_type + ' ' + this.authToken.access_token;
  }

  /**
   * Stores the token in local storage.
   *
   * @param token The token to store.
   */
  private storeToken(token: AuthTokenModel): void {
    localStorage.setItem(AuthService.STORAGE_KEY, JSON.stringify(token));
  }

  /**
   * Parses the token to extract user data and to start a refresh token timer.
   *
   * @param token The token data to parse.
   */
  private parseToken(token: AuthTokenModel): void {
    const claims = jose.decodeJwt(token.access_token);
    const fullAdmin = <boolean>claims['full_admin'];
    let maxRole: Role = 'TUTOR';
    const roles: RoleAssignment[] = <RoleAssignment[]>claims['roles'];
    if (fullAdmin)
      maxRole = 'FULL_ADMIN';
    else {
      for (let role of roles) {
        switch (role.role) {
          case 'INSTRUCTOR':
            maxRole = maxRole != 'ADMIN' ? 'INSTRUCTOR' : maxRole;
            break;
          case 'ADMIN':
            maxRole = 'ADMIN';
            break;
        }
      }
    }

    this.user = {
      userName: claims.sub!,
      firstName: <string>claims['given_name'],
      lastName: <string>claims['family_name'],
      email: <string>claims['email'],
      isFullAdmin: fullAdmin,
      maxRole: maxRole,
      roles: roles
    };
    this.authToken = token;

    this.tokenExpirationDate = claims.exp;
    if (!this.tokenExpirationDate || !token.refresh_token)
      return;

    const diff = this.tokenExpirationDate * 1000 - new Date().getTime() - 60000;
    if (diff > 0) {
      console.debug('[AUTH] Refreshing token in ' + diff + ' milliseconds');
      this.refreshSub = <any>setTimeout(async () => await this.refreshToken(), diff);
    }
  }

  /**
   * Returns whether a process that waits for the token to expire and then refreshes the token is active.
   */
  isRefreshSubscriptionActive(): boolean {
    return this.refreshSub !== undefined;
  }

  /**
   * Stops the refresh token countdown.
   */
  private stopRefreshToken(): void {
    clearTimeout(this.refreshSub);
    this.refreshSub = undefined;
  }

  /**
   * Refreshes the access token.
   *
   * Normally called automatically by token expiration timeout.
   */
  async refreshToken(): Promise<void> {
    if (!this.authToken)
      return;

    this.stopRefreshToken();
    console.info('[AUTH] Refreshing token');

    try {
      const result = await firstValueFrom(this.http.post<AuthTokenModel>(this.apiUrl + '/auth/refresh', this.authToken.refresh_token));

      this.storeToken(result);
      this.parseToken(result);
    } catch (err) {
      console.error('[AUTH] Refreshing token failed', err);

      const username = this.user?.userName;
      this.logout();
      await this.router.navigate(['auth', 'login'], {state: {expired: true, username: username}});
    }
  }

  //#endregion

  /**
   * Destroys the refresh token refresh.
   */
  ngOnDestroy(): void {
    this.stopRefreshToken();
  }
}
