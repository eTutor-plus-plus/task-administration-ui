import { InjectionToken } from '@angular/core';

/**
 * The injection token for the base API URL.
 *
 * Kept in its own file (instead of app.config.ts) so that services can import it
 * without loading the routes, which would create a circular import with the auth guards.
 */
export const API_URL = new InjectionToken<string>('API_URL');
