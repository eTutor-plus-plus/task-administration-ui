import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { unauthorizedInterceptor } from './unauthorized.interceptor';
import { MockPlatformLocation } from '@angular/common/testing';

describe('unauthorizedInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => unauthorizedInterceptor(req, next));
  let router: MockPlatformLocation;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [RouterModule.forRoot([])]});
    router = TestBed.inject(MockPlatformLocation);
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should redirect to the login page if the response is unauthorized', () => {
    // Arrange
    const req = new HttpRequest('GET', 'http://localhost/api/data');
    const next = (r: HttpRequest<unknown>) => {
      throw new HttpErrorResponse({status: 401});
    };

    // Act
    const result = interceptor(req, next);

    // Assert
    expect(result).toBeDefined();
    expect(router.url).toBe('/auth/login?expired=true');
  });

  it('should not redirect to the login page if the response is not unauthorized', () => {
    // TODO
  });
});
