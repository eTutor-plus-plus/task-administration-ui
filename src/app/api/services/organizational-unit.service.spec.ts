import { TestBed } from '@angular/core/testing';
import { HttpParams, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { OrganizationalUnitService } from './organizational-unit.service';
import { API_URL } from '../../app.config';

describe('OrganizationalUnitService', () => {
  let service: OrganizationalUnitService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [{ provide: API_URL, useValue: 'http://localhost' }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(OrganizationalUnitService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set filter param when name set', () => {
    // Arrange
    const filter = {name: 'test'};
    const params = new HttpParams();

    // Act
    const result = service['setFilterParam'](params, filter);

    // Assert
    expect(result.get('filter')).toBe('test');
  });

  it('should not set filter param whenname not set', () => {
    // Arrange
    const filter = {};
    const params = new HttpParams();

    // Act
    const result = service['setFilterParam'](params, filter);

    // Assert
    expect(result.get('filter')).toBeNull();
  });

  describe('syncWithMoodle', () => {
    it('should resolve when sync with moodle', () => {
      // Arrange
      const id = 1;

      // Act
      service.syncWithMoodle(id).then(() => {
        // do nothing
      }).catch(reason => {
        fail(reason);
      });

      // Assert
      const req = httpTestingController.expectOne('http://localhost/api/organizationalUnit/' + id);
      expect(req.request.method).toBe('POST');
      req.flush(null);
      httpTestingController.verify();
    });

    it('should reject when sync with moodle fails', () => {
      // Arrange
      const id = 1;

      // Act
      service.syncWithMoodle(id).then(() => {
        fail('Expected promise to be rejected');
      }).catch(reason => {
        expect(reason).not.toBeNull();
      });

      // Assert
      const req = httpTestingController.expectOne('http://localhost/api/organizationalUnit/' + id);
      expect(req.request.method).toBe('POST');
      req.flush('some error', {status: 400, statusText: 'Bad Request'});
      httpTestingController.verify();
    });
  });
});
