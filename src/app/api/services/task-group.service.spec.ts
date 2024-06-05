import { TestBed } from '@angular/core/testing';
import { HttpParams, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { TaskGroupService } from './task-group.service';
import { API_URL } from '../../app.config';
import { StatusEnum } from '../models';

describe('TaskGroupService', () => {
  let service: TaskGroupService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [{ provide: API_URL, useValue: 'http://localhost' }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(TaskGroupService);
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

    it('should set filter param when status set', () => {
      // Arrange
      const filter = {status: StatusEnum.APPROVED};
      const params = new HttpParams();

      // Act
      const result = service['setFilterParam'](params, filter);

      // Assert
      expect(result.get('statusFilter')).toBe('APPROVED');
    });

    it('should set filter param when taskGroupType set', () => {
      // Arrange
      const filter = {taskGroupType: 'test'};
      const params = new HttpParams();

      // Act
      const result = service['setFilterParam'](params, filter);

      // Assert
      expect(result.get('taskGroupTypeFilter')).toBe('test');
    });

    it('should set filter param when organizationalUnit set', () => {
      // Arrange
      const filter = {organizationalUnit: 3};
      const params = new HttpParams();

      // Act
      const result = service['setFilterParam'](params, filter);

      // Assert
      expect(result.get('orgUnitFilter')).toBe('3');
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

  describe('getTypes', () => {
    it('should load task group types', () => {
      // Arrange
      const expected = ['type1', 'type2'];

      // Act
      service.getTypes()
        .then(value => expect(value).toEqual(expected))
        .catch(error => fail(error));

      // Assert
      const req = httpTestingController.expectOne('http://localhost/api/taskGroup/types');
      expect(req.request.method).toBe('GET');
      req.flush(expected);

      httpTestingController.verify();
    });

    it('should reject when loading task group types fails', () => {
      // Act
      service.getTypes()
        .then(() => fail('Expected promise to be rejected'))
        .catch(reason => expect(reason).not.toBeNull());

      // Assert
      const req = httpTestingController.expectOne('http://localhost/api/taskGroup/types');
      expect(req.request.method).toBe('GET');
      req.flush('some error', {status: 400, statusText: 'Bad Request'});
      httpTestingController.verify();
    });
  });

  describe('export', () => {
    it('should export task group details', () => {
      // Arrange
      const expected = 'exported data';

      // Act
      service.export()
        .then(value => expect(value).toBe(expected))
        .catch(error => fail(error));

      // Assert
      const req = httpTestingController.expectOne('http://localhost/api/taskGroup/export');
      expect(req.request.method).toBe('GET');
      req.flush(expected);

      httpTestingController.verify();
    });

    it('should reject when exporting task groups fails', () => {
      // Act
      service.export()
        .then(() => fail('Expected promise to be rejected'))
        .catch(reason => expect(reason).not.toBeNull());

      // Assert
      const req = httpTestingController.expectOne('http://localhost/api/taskGroup/export');
      expect(req.request.method).toBe('GET');
      req.flush('some error', {status: 400, statusText: 'Bad Request'});
      httpTestingController.verify();
    });
  });
});
