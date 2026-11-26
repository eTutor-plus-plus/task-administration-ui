import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AccountService } from './account.service';
import { API_URL } from '../../app.config';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AccountService', () => {
  let service: AccountService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [{provide: API_URL, useValue: 'http://localhost'}, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    });
    service = TestBed.inject(AccountService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('requestPasswordReset', () => {
    it('should resolve when requesting password reset', () => {
      // Act
      const promise = service.requestPasswordReset('user').then(() => {
        // nothing to do here
      }).catch(reason => {
        fail(reason);
      });

      // Assert
      const req = httpTestingController.expectOne('http://localhost/auth/reset-password?username=user');
      expect(req.request.method).toBe('GET');
      req.flush(null);

      return promise;
    });


    it('should reject when requesting password reset fails', () => {
      // Act
      const promise = service.requestPasswordReset('user').then(() => {
        fail('Expected promise to be rejected');
      }).catch(reason => {
        expect(reason).not.toBeNull();
      });

      // Assert
      const req = httpTestingController.expectOne('http://localhost/auth/reset-password?username=user');
      expect(req.request.method).toBe('GET');
      req.flush('some error', {status: 400, statusText: 'Bad Request'});

      return promise;
    });
  });

  describe('resetPassword', () => {
    it('should resolve when resetting password', () => {
      // Arrange
      const token = 'token';
      const pwd = 'new-pwd';

      // Act
      const promise = service.resetPassword(token, pwd, pwd).then(() => {
        // nothing to do here
      }).catch(reason => {
        fail(reason);
      });

      // Assert
      const req = httpTestingController.expectOne('http://localhost/auth/reset-password');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({token, password: pwd, passwordConfirmation: pwd});
      req.flush(null);

      return promise;
    });


    it('should reject when resetting password fails', () => {
      // Arrange
      const token = 'token';
      const pwd = 'new-pwd';

      // Act
      const promise = service.resetPassword(token, pwd, pwd).then(() => {
        fail('Expected promise to be rejected');
      }).catch(reason => {
        expect(reason).not.toBeNull();
      });

      // Assert
      const req = httpTestingController.expectOne('http://localhost/auth/reset-password');
      expect(req.request.method).toBe('POST');
      req.flush('some error', {status: 400, statusText: 'Bad Request'});

      return promise;
    });
  });

  describe('activateAccount', () => {
    it('should resolve when activating account', () => {
      // Arrange
      const token = 'token';
      const pwd = 'new-pwd';

      // Act
      const promise = service.activateAccount(token, pwd, pwd).then(() => {
        // nothing to do here
      }).catch(reason => {
        fail(reason);
      });

      // Assert
      const req = httpTestingController.expectOne('http://localhost/auth/activate');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({token, password: pwd, passwordConfirmation: pwd});
      req.flush(null);

      return promise;
    });


    it('should reject when activating account fails', () => {
      // Arrange
      const token = 'token';
      const pwd = 'new-pwd';

      // Act
      const promise = service.activateAccount(token, pwd, pwd).then(() => {
        fail('Expected promise to be rejected');
      }).catch(reason => {
        expect(reason).not.toBeNull();
      });

      // Assert
      const req = httpTestingController.expectOne('http://localhost/auth/activate');
      expect(req.request.method).toBe('POST');
      req.flush('some error', {status: 400, statusText: 'Bad Request'});

      return promise;
    });
  });

  describe('changePassword', () => {
    it('should resolve when changing password', () => {
      // Arrange
      const currentPassword = 'token';
      const pwd = 'new-pwd';

      // Act
      const promise = service.changePassword(currentPassword, pwd, pwd).then(() => {
        // nothing to do here
      }).catch(reason => {
        fail(reason);
      });

      // Assert
      const req = httpTestingController.expectOne('http://localhost/auth/change-password');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({currentPassword, password: pwd, passwordConfirmation: pwd});
      req.flush(null);

      return promise;
    });

    it('should reject when changing password fails', () => {
      // Arrange
      const currentPassword = 'token';
      const pwd = 'new-pwd';

      // Act
      const promise = service.changePassword(currentPassword, pwd, pwd).then(() => {
        fail('Expected promise to be rejected');
      }).catch(reason => {
        expect(reason).not.toBeNull();
      });

      // Assert
      const req = httpTestingController.expectOne('http://localhost/auth/change-password');
      expect(req.request.method).toBe('POST');
      req.flush('some error', {status: 400, statusText: 'Bad Request'});

      return promise;
    });
  });
});
