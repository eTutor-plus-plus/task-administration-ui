import { TestBed } from '@angular/core/testing';
import { HttpParams, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { UserService } from './user.service';
import { API_URL } from '../../app.config';

describe('UserService', () => {
  let service: UserService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [{ provide: API_URL, useValue: 'http://localhost' }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(UserService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setFilterParam', () => {
    it('should set filter param when username set', () => {
      // Arrange
      const filter = {username: 'test'};
      const params = new HttpParams();

      // Act
      const result = service['setFilterParam'](params, filter);

      // Assert
      expect(result.get('usernameFilter')).toBe('test');
    });

    it('should set filter param when firstName set', () => {
      // Arrange
      const filter = {firstName: 'test'};
      const params = new HttpParams();

      // Act
      const result = service['setFilterParam'](params, filter);

      // Assert
      expect(result.get('firstNameFilter')).toBe('test');
    });

    it('should set filter param when lastName set', () => {
      // Arrange
      const filter = {lastName: 'test'};
      const params = new HttpParams();

      // Act
      const result = service['setFilterParam'](params, filter);

      // Assert
      expect(result.get('lastNameFilter')).toBe('test');
    });

    it('should set filter param when email set', () => {
      // Arrange
      const filter = {email: 'test'};
      const params = new HttpParams();

      // Act
      const result = service['setFilterParam'](params, filter);

      // Assert
      expect(result.get('emailFilter')).toBe('test');
    });

    it('should set filter param when enabled set', () => {
      // Arrange
      const filter = {enabled: true};
      const params = new HttpParams();

      // Act
      const result = service['setFilterParam'](params, filter);

      // Assert
      expect(result.get('enabledFilter')).toBe('true');
    });

    it('should set filter param when fullAdmin set', () => {
      // Arrange
      const filter = {fullAdmin: true};
      const params = new HttpParams();

      // Act
      const result = service['setFilterParam'](params, filter);

      // Assert
      expect(result.get('fullAdminFilter')).toBe('true');
    });

    it('should not set filter param when filter not set', () => {
      // Arrange
      const filter = {};
      const params = new HttpParams();

      // Act
      const result = service['setFilterParam'](params, filter);

      // Assert
      expect(result.keys().length).toBe(0);
    });
  });

  describe('changePassword', () => {
    it('should change password', () => {
      // Arrange
      const id = 1;
      const data = {password: 'test'};
      const concurrencyToken = '0123456789';

      // Act
      service.changePassword(id, data, concurrencyToken).then(() => {
        // do nothing
      }).catch(reason => {
        fail(reason);
      });

      // Assert
      const req = httpTestingController.expectOne('http://localhost/api/user/' + id + '/password');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(data);
      req.flush(null);
    });

    it('should reject when changing password fails', () => {
      // Arrange
      const id = 1;
      const data = {password: 'test'};

      // Act
      service.changePassword(id, data).then(() => {
        fail('Expected promise to be rejected');
      }).catch(reason => {
        expect(reason).not.toBeNull();
      });

      // Assert
      const req = httpTestingController.expectOne('http://localhost/api/user/' + id + '/password');
      expect(req.request.method).toBe('PUT');
      req.flush('some error', {status: 400, statusText: 'Bad Request'});
    });
  });
});
