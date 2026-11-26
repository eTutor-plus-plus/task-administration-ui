import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';
import { API_URL } from '../app.config';

/**
 * Intercepts HTTP requests and adds the authorization token to the header.
 *
 * @param req The request.
 * @param next The next interceptor.
 */
export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);
  const apiUrl = inject(API_URL);

  if (req.url.toLowerCase().startsWith(apiUrl.toLowerCase()) &&
    (req.url.indexOf('/auth/') < 0 || req.url.indexOf('/auth/refresh') > 0 || req.url.indexOf('/auth/change-password') > 0) &&
    authService.isAuthenticated() && authService.authHeaderValue) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', authService.authHeaderValue)
    });
    return next(authReq);
  }

  return next(req);
}
