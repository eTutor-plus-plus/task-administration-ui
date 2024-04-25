import { TestBed } from '@angular/core/testing';
import { HttpParams } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { TaskCategoryService } from './task-category.service';
import { API_URL } from '../../app.config';

describe('TaskCategoryService', () => {
  let service: TaskCategoryService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{provide: API_URL, useValue: 'http://localhost'}]
    });
    service = TestBed.inject(TaskCategoryService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setFilterParam', () => {
    it('should set filter param when name set', () => {
      // Arrange
      const filter = {name: 'test'};
      const params = new HttpParams();

      // Act
      const result = service['setFilterParam'](params, filter);

      // Assert
      expect(result.get('nameFilter')).toBe('test');
    });

    it('should set filter param when parent set', () => {
      // Arrange
      const filter = {parent: 1};
      const params = new HttpParams();

      // Act
      const result = service['setFilterParam'](params, filter);

      // Assert
      expect(result.get('parentFilter')).toBe('1');
    });

    it('should set filter param when organizationalUnit set', () => {
      // Arrange
      const filter = {organizationalUnit: 1};
      const params = new HttpParams();

      // Act
      const result = service['setFilterParam'](params, filter);

      // Assert
      expect(result.get('organizationalUnitFilter')).toBe('1');
    });

    it('should not set filter param when name not set', () => {
      // Arrange
      const filter = {};
      const params = new HttpParams();

      // Act
      const result = service['setFilterParam'](params, filter);

      // Assert
      expect(result.get('nameFilter')).toBeNull();
    });

    it('should not set filter param when parent not set', () => {
      // Arrange
      const filter = {};
      const params = new HttpParams();

      // Act
      const result = service['setFilterParam'](params, filter);

      // Assert
      expect(result.get('parentFilter')).toBeNull();
    });

    it('should not set filter param when organizationalUnit not set', () => {
      // Arrange
      const filter = {};
      const params = new HttpParams();

      // Act
      const result = service['setFilterParam'](params, filter);

      // Assert
      expect(result.get('organizationalUnitFilter')).toBeNull();
    });
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
      const req = httpTestingController.expectOne('http://localhost/api/taskCategory/' + id);
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
      const req = httpTestingController.expectOne('http://localhost/api/taskCategory/' + id);
      expect(req.request.method).toBe('POST');
      req.flush(null, {status: 500, statusText: 'Internal Server Error'});
      httpTestingController.verify();
    });
  });
});
