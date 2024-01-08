import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * Protects a route so that only authenticated users can activate the route.
 * Unauthenticated users will be redirected to the login page.
 *
 * @param route The requested route.
 * @param state The router state.
 */
export function authGuard(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if authenticated
  const result = authService.isAuthenticated();
  return result ? true : router.createUrlTree(['auth', 'login']);
}
