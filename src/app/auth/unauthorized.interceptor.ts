import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { AuthService } from './auth.service';

/**
 * Intercepts HTTP responses and redirects to the login page if the response is unauthorized.
 *
 * @param req The request.
 * @param next The next interceptor.
 */
export function unauthorizedInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(tap({
    error: err => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        authService.logout();
        router.navigateByUrl('/auth/login', {state: {expired: true}});
      }
    }
  }));
}
