import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';

import { langInterceptor } from './lang.interceptor';
import { TranslocoService, TranslocoTestingModule } from '@ngneat/transloco';
import { API_URL } from '../app.config';

describe('langInterceptor', () => {
  const apiUrl = 'http://localhost:3000';
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => langInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslocoTestingModule.forRoot({translocoConfig: {availableLangs: ['en', 'de'], defaultLang: 'en'}})],
      providers: [{provide: API_URL, useValue: apiUrl}]
    });
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should add the language to the header', () => {
    // Arrange
    TestBed.inject(TranslocoService).setActiveLang('en');
    const req = new HttpRequest('GET', apiUrl + '/api/data');
    const next = (r: any) => {
      expect(r.headers.get('Accept-Language')).toBe('en');
      return {} as any;
    };

    // Act
    const result = interceptor(req, next);

    // Assert
    expect(result).toBeDefined();
  });

  it('should not add the language to the header if the URL does not match', () => {
    // Arrange
    TestBed.inject(TranslocoService).setActiveLang('en');
    const req = new HttpRequest('GET', 'http://example.com/api/data');
    const next = (r: any) => {
      expect(r.headers.get('Accept-Language')).toBe(null);
      return {} as any;
    };

    // Act
    const result = interceptor(req, next);

    // Assert
    expect(result).toBeDefined();
  });
});
