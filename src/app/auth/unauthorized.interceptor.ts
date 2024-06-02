import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { tap } from 'rxjs';

import { AuthService } from './auth.service';

/**
 * Intercepts HTTP responses and redirects to the login page if the response is unauthorized.
 *
 * @param req The request.
 * @param next The next interceptor.
 */
export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
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
};
