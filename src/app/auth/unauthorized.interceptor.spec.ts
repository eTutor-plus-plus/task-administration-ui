import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { unauthorizedInterceptor } from './unauthorized.interceptor';
import { AuthService } from './auth.service';

describe('unauthorizedInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => unauthorizedInterceptor(req, next));
  const mockNavigateFunc = jest.fn();
  const mockLogoutFunc = jest.fn();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: Router, useValue: {navigateByUrl: mockNavigateFunc}},
        {provide: AuthService, useValue: {logout: mockLogoutFunc}}
      ]
    });
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should redirect to the login page if the response is unauthorized', () => {
    // Arrange
    mockLogoutFunc.mockClear();
    mockNavigateFunc.mockClear();
    const req = new HttpRequest('GET', 'http://localhost/api/data');
    const next: HttpHandlerFn = _ => {
      return throwError(() => new HttpErrorResponse({status: 401}));
    };

    // Act
    const result = interceptor(req, next).subscribe();

    // Assert
    expect(result).toBeDefined();
    expect(mockLogoutFunc).toHaveBeenCalledTimes(1);
    expect(mockNavigateFunc).toHaveBeenCalledTimes(1);
    expect(mockNavigateFunc).toHaveBeenCalledWith('/auth/login', {state: {expired: true}});
  });

  it('should not redirect to the login page if the response is not unauthorized', () => {
    // Arrange
    mockLogoutFunc.mockClear();
    mockNavigateFunc.mockClear();
    const req = new HttpRequest('GET', 'http://localhost/api/data');
    const next = (r: HttpRequest<unknown>) => {
      return of(new HttpResponse({status: 200}));
    };

    // Act
    const result = interceptor(req, next).subscribe();

    // Assert
    expect(result).toBeDefined();
    expect(mockLogoutFunc).toHaveBeenCalledTimes(0);
    expect(mockNavigateFunc).toHaveBeenCalledTimes(0);
  });
});
