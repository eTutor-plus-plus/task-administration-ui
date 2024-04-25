import { TestBed } from '@angular/core/testing';
import { HttpParams } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { TaskService } from './task.service';
import { API_URL } from '../../app.config';
import { StatusEnum } from '../models';

describe('TaskService', () => {
  let service: TaskService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{provide: API_URL, useValue: 'http://localhost'}]
    });
    service = TestBed.inject(TaskService);
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

    it('should set filter param when taskType set', () => {
      // Arrange
      const filter = {taskType: 'test'};
      const params = new HttpParams();

      // Act
      const result = service['setFilterParam'](params, filter);

      // Assert
      expect(result.get('taskTypeFilter')).toBe('test');
    });

    it('should set filter param when organizationalUnit set', () => {
      // Arrange
      const filter = {organizationalUnit: 4};
      const params = new HttpParams();

      // Act
      const result = service['setFilterParam'](params, filter);

      // Assert
      expect(result.get('orgUnitFilter')).toBe('4');
    });

    it('should set filter param when taskGroup set', () => {
      // Arrange
      const filter = {taskGroup: 5};
      const params = new HttpParams();

      // Act
      const result = service['setFilterParam'](params, filter);

      // Assert
      expect(result.get('taskGroupFilter')).toBe('5');
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
      const req = httpTestingController.expectOne('http://localhost/api/task/types');
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
      const req = httpTestingController.expectOne('http://localhost/api/task/types');
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
      const req = httpTestingController.expectOne('http://localhost/api/task/export');
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
      const req = httpTestingController.expectOne('http://localhost/api/task/export');
      expect(req.request.method).toBe('GET');
      req.flush('some error', {status: 400, statusText: 'Bad Request'});
      httpTestingController.verify();
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
      const req = httpTestingController.expectOne('http://localhost/api/task/' + id);
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
      const req = httpTestingController.expectOne('http://localhost/api/task/' + id);
      expect(req.request.method).toBe('POST');
      req.flush(null, {status: 500, statusText: 'Internal Server Error'});
      httpTestingController.verify();
    });
  });

  describe('submit', () => {
    it('should submit task', () => {
      // Arrange
      const submission = {
        mode: 'test',
        feedbackLevel: 1,
        language: 'en',
        submission: {},
        taskId: 1
      };
      const expected = {id: 1};

      // Act
      service.submit(submission)
        .then(value => expect(value).toEqual(expected))
        .catch(error => fail(error));

      // Assert
      const req = httpTestingController.expectOne('http://localhost/api/task/submit');
      expect(req.request.method).toBe('POST');
      req.flush(expected);

      httpTestingController.verify();
    });

    it('should reject when submitting task fails', () => {
      // Arrange
      const submission = {
        mode: 'test',
        feedbackLevel: 1,
        language: 'en',
        submission: {},
        taskId: 1
      };

      // Act
      service.submit(submission)
        .then(() => fail('Expected promise to be rejected'))
        .catch(reason => expect(reason).not.toBeNull());

      // Assert
      const req = httpTestingController.expectOne('http://localhost/api/task/submit');
      expect(req.request.method).toBe('POST');
      req.flush('some error', {status: 400, statusText: 'Bad Request'});
      httpTestingController.verify();
    });
  });
});
