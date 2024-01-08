import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { inject } from '@angular/core';

import { AuthService } from './auth.service';
import { Role } from './models';

/**
 * Protects a route so that only users with the specified role names are allowed to activate the route.
 *
 * @param roleNames The role names that are allowed to access the route.
 */
export function roleGuard(roleNames: Role[]): CanActivateFn {
  return async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Check if in role
    const user = authService.user;
    if (user && roleNames.includes(user.maxRole))
      return true;

    return router.createUrlTree(['not-found']);
  };
}
