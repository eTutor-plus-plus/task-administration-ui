import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { BinarySearchService } from './binary-search.service';
import { API_URL } from '../../app.config';

describe('BinarySearchServiceTsService', () => {
  let service: BinarySearchService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: API_URL, useValue: 'http://localhost'}
      ]
    });
    service = TestBed.inject(BinarySearchService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadNewRandomNumbers', () => {
    it('should load random numbers', () => {
      // Arrange
      const expected = {min: 1, max: 10};

      // Act
      const promise = service.loadNewRandomNumbers()
        .then(value => expect(value).toEqual(expected))
        .catch(error => fail(error));

      // Assert
      const req = httpTestingController.expectOne('http://localhost/api/forward/binary-search/api/taskGroup/random');
      expect(req.request.method).toBe('GET');
      req.flush(expected);
      httpTestingController.verify();

      return promise;
    });

    it('should reject when loading random numbers fails', () => {
      // Act
      const promise = service.loadNewRandomNumbers()
        .then(() => fail('Expected promise to be rejected'))
        .catch(reason => expect(reason).not.toBeNull());

      // Assert
      const req = httpTestingController.expectOne('http://localhost/api/forward/binary-search/api/taskGroup/random');
      expect(req.request.method).toBe('GET');
      req.flush('some error', {status: 400, statusText: 'Bad Request'});
      httpTestingController.verify();

      return promise;
    });
  });
});
