import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';

import { authInterceptor } from './auth.interceptor';
import { API_URL } from '../app.config';
import { AuthService } from './auth.service';

class MockAuth {
  authenticated = true;
  headerValue: string | undefined = undefined;

  isAuthenticated() {
    return this.authenticated;
  }

  get authHeaderValue() {
    return this.headerValue;
  }
}

describe('authInterceptor', () => {
  const apiUrl = 'http://localhost:3000';
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => authInterceptor(req, next));
  const mock = new MockAuth();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: API_URL, useValue: apiUrl},
        {provide: AuthService, useValue: mock}
      ]
    });
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should add the authorization token to the header', () => {
    // Arrange
    mock.headerValue = 'some-value';
    mock.authenticated = true;
    const req = new HttpRequest('GET', apiUrl + '/api/data');
    const next = (r: HttpRequest<unknown>) => {
      expect(r.headers.get('Authorization')).toBe(mock.headerValue);
      return {} as any;
    };

    // Act
    const result = interceptor(req, next);

    // Assert
    expect(result).toBeDefined();
  });

  it('should not add the authorization token to the header if the URL does not match', () => {
    // Arrange
    mock.headerValue = 'some-value';
    mock.authenticated = true;
    const req = new HttpRequest('GET', 'http://example.com/api/data');
    const next = (r: HttpRequest<unknown>) => {
      expect(r.headers.get('Authorization')).toBeNull();
      return {} as any;
    };

    // Act
    const result = interceptor(req, next);

    // Assert
    expect(result).toBeDefined();
  });

  it('should not add the authorization token to the header if the user is not authenticated', () => {
    // Arrange
    mock.headerValue = 'some-value';
    mock.authenticated = false;
    const req = new HttpRequest('GET', apiUrl + '/api/data');
    const next = (r: HttpRequest<unknown>) => {
      expect(r.headers.get('Authorization')).toBeNull();
      return {} as any;
    };

    // Act
    const result = interceptor(req, next);

    // Assert
    expect(result).toBeDefined();
  });

  it('should not add the authorization token to the header if the token is undefined', () => {
    // Arrange
    mock.headerValue = undefined;
    mock.authenticated = true;
    const req = new HttpRequest('GET', apiUrl + '/api/data');
    const next = (r: HttpRequest<unknown>) => {
      expect(r.headers.get('Authorization')).toBeNull();
      return {} as any;
    };

    // Act
    const result = interceptor(req, next);

    // Assert
    expect(result).toBeDefined();
  });

  it('should not add the authorization token to the header if the request is a login request', () => {
    // Arrange
    mock.headerValue = 'token';
    mock.authenticated = true;
    const req = new HttpRequest('GET', apiUrl + '/auth/login');
    const next = (r: HttpRequest<unknown>) => {
      expect(r.headers.get('Authorization')).toBeNull();
      return {} as any;
    };

    // Act
    const result = interceptor(req, next);

    // Assert
    expect(result).toBeDefined();
  });

  it('should add the authorization token to the header if it is a refresh request', () => {
    // Arrange
    mock.headerValue = 'some-value';
    mock.authenticated = true;
    const req = new HttpRequest('GET', apiUrl + '/auth/refresh');
    const next = (r: HttpRequest<unknown>) => {
      expect(r.headers.get('Authorization')).toBe(mock.headerValue);
      return {} as any;
    };

    // Act
    const result = interceptor(req, next);

    // Assert
    expect(result).toBeDefined();
  });

  it('should add the authorization token to the header if it is a change password request', () => {
    // Arrange
    mock.headerValue = 'some-value';
    mock.authenticated = true;
    const req = new HttpRequest('GET', apiUrl + '/auth/change-password');
    const next = (r: HttpRequest<unknown>) => {
      expect(r.headers.get('Authorization')).toBe(mock.headerValue);
      return {} as any;
    };

    // Act
    const result = interceptor(req, next);

    // Assert
    expect(result).toBeDefined();
  });
});
