import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

import { TranslocoService } from '@ngneat/transloco';

import { API_URL } from '../app.config';

/**
 Intercepts HTTP requests and adds the Accept-Language value to the header.

 @param req The request.
 @param next The next interceptor.
 */
export function langInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const apiUrl = inject(API_URL);
  const trans = inject(TranslocoService);

  if (req.url.toLowerCase().startsWith(apiUrl.toLowerCase())) {
    const langReq = req.clone({
      headers: req.headers.set('Accept-Language', trans.getActiveLang())
    });
    return next(langReq);
  }

  return next(req);
};
