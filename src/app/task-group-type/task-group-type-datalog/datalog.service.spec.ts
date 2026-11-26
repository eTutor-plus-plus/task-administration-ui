import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { DatalogService } from './datalog.service';
import { API_URL } from '../../app.config';

describe('DatalogService', () => {
  let service: DatalogService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: API_URL, useValue: 'http://localhost'}
      ]
    });
    service = TestBed.inject(DatalogService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadDiagnoseFacts', () => {
    it('should load url', () => {
      // Arrange
      const expected = 'http://localhost/dlg/abcd';

      // Act
      const promise = service.loadDiagnoseFacts(1)
        .then(value => expect(value).toEqual(expected))
        .catch(error => fail(error));

      // Assert
      const req = httpTestingController.expectOne('http://localhost/api/forward/datalog/api/taskGroup/1/public');
      expect(req.request.method).toBe('GET');
      req.flush(expected);
      httpTestingController.verify();

      return promise;
    });

    it('should reject when loading url fails', () => {
      // Act
      const promise = service.loadDiagnoseFacts(2)
        .then(() => fail('Expected promise to be rejected'))
        .catch(reason => expect(reason).not.toBeNull());

      // Assert
      const req = httpTestingController.expectOne('http://localhost/api/forward/datalog/api/taskGroup/2/public');
      expect(req.request.method).toBe('GET');
      req.flush('some error', {status: 400, statusText: 'Bad Request'});
      httpTestingController.verify();

      return promise;
    });
  });
});
