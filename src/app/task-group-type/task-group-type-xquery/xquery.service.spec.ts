import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { XqueryService } from './xquery.service';
import { API_URL } from '../../app.config';

describe('XqueryService', () => {
  let service: XqueryService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: API_URL, useValue: 'http://localhost'}
      ]
    });
    service = TestBed.inject(XqueryService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadDiagnoseDocument', () => {
    it('should load url', () => {
      // Arrange
      const expected = 'http://localhost/xq/abcd';

      // Act
      const promise = service.loadDiagnoseDocument(1)
        .then(value => expect(value).toEqual(expected))
        .catch(error => fail(error));

      // Assert
      const req = httpTestingController.expectOne('http://localhost/api/forward/xquery/api/taskGroup/1/public');
      expect(req.request.method).toBe('GET');
      req.flush(expected);
      httpTestingController.verify();

      return promise;
    });

    it('should reject when loading url fails', () => {
      // Act
      const promise = service.loadDiagnoseDocument(2)
        .then(() => fail('Expected promise to be rejected'))
        .catch(reason => expect(reason).not.toBeNull());

      // Assert
      const req = httpTestingController.expectOne('http://localhost/api/forward/xquery/api/taskGroup/2/public');
      expect(req.request.method).toBe('GET');
      req.flush('some error', {status: 400, statusText: 'Bad Request'});
      httpTestingController.verify();

      return promise;
    });
  });
});
