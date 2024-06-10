import { TestBed } from '@angular/core/testing';
import { Inject, Injectable } from '@angular/core';
import { HttpParams, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ApiService } from './api.service';
import { API_URL } from '../../app.config';

describe('ApiService', () => {
  let service: ApiService<TestDto, ModifyTestDto, number, TestFilter>;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [{provide: API_URL, useValue: 'http://localhost'}, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    });
    service = TestBed.inject(TestService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not be created when base url ends with a slash', () => {
    expect(() => new TestService2('http://localhost/')).toThrow();
  });

  describe('load', () => {
    it('should resolve with data when loading page', () => {
      // Arrange
      const offset = 10;
      const perPage = 5;
      const sort = [{field: 'name', order: 1}, {field: 'id', order: -1}];
      const filter: TestFilter = {name: 'test'};

      // Act
      const promise = service.load(offset, perPage, sort, filter).then(result => {
        expect(result.content.length).toBe(1);
      }).catch(reason => {
        fail(reason);
      });

      // Assert
      const req = httpTestingController.expectOne(r => {
        return (r.method === 'GET' && r.url === 'http://localhost/test' &&
          r.params.has('size') && r.params.get('size') === '5' &&
          r.params.has('page') && r.params.get('page') === '2' &&
          r.params.has('sort') && r.params.getAll('sort')?.length === 2 &&
          r.params.getAll('sort')?.includes('name,asc') && r.params.getAll('sort')?.includes('id,desc') &&
          r.params.has('filter') && r.params.get('filter') === 'test') ?? false;
      });
      req.flush({
        content: [{id: 1, name: 'test'}],
        first: true,
        last: true,
        number: 2,
        numberOfElements: 1,
        size: 5,
        totalPages: 3,
        totalElements: 15,
        sort: {sorted: true, empty: false, unsorted: false},
        pageable: {paged: true, offset: 10}
      });

      return promise;
    });

    it('should reject when loading page fails', () => {
      // Act
      const promise = service.load(0, 5).then(() => {
        fail('Expected promise to be rejected');
      }).catch(reason => {
        expect(reason).not.toBeNull();
      });

      // Assert
      const req = httpTestingController.expectOne('http://localhost/test?size=5&page=0');
      expect(req.request.method).toBe('GET');
      req.flush('some error', {status: 400, statusText: 'Bad Request'});

      return promise;
    });
  });

  describe('get', () => {
    it('should resolve with data when loading entity', () => {
      // Arrange
      const id = 3;

      // Act
      const promise = service.get(id).then(result => {
        expect(result.id).toBe(id);
      }).catch(reason => {
        fail(reason);
      });

      // Assert
      const req = httpTestingController.expectOne('http://localhost/test/' + id);
      req.flush({id: id, name: 'test'});

      return promise;
    });

    it('should reject when loading entity fails', () => {
      // Arrange
      const id = 3;

      // Act
      const promise = service.get(3).then(() => {
        fail('Expected promise to be rejected');
      }).catch(reason => {
        expect(reason).not.toBeNull();
      });

      // Assert
      const req = httpTestingController.expectOne('http://localhost/test/' + id);
      expect(req.request.method).toBe('GET');
      req.flush('some error', {status: 400, statusText: 'Bad Request'});

      return promise;
    });
  });

  describe('create', () => {
    it('should resolve with data when creating entity succeeds', () => {
      // Arrange
      const id = 3;
      const dto = {name: 'test'};

      // Act
      const promise = service.create(dto).then(result => {
        expect(result.id).toBe(id);
      }).catch(reason => {
        fail(reason);
      });

      // Assert
      const req = httpTestingController.expectOne('http://localhost/test');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush({id: id, name: 'test'});

      return promise;
    });

    it('should reject when creating entity fails', () => {
      // Arrange
      const dto = {name: 'test'};

      // Act
      const promise = service.create(dto).then(() => {
        fail('Expected promise to be rejected');
      }).catch(reason => {
        expect(reason).not.toBeNull();
      });

      // Assert
      const req = httpTestingController.expectOne('http://localhost/test');
      expect(req.request.method).toBe('POST');
      req.flush('some error', {status: 400, statusText: 'Bad Request'});

      return promise;
    });
  });

  describe('update', () => {
    it('should resolve when updating entity succeeds', () => {
      // Arrange
      const id = 3;
      const dto = {name: 'test'};
      const concurrencyToken = '1234567890';

      // Act
      const promise = service.update(3, dto, concurrencyToken).then(() => {
        // nothing to do
      }).catch(reason => {
        fail(reason);
      });

      // Assert
      const req = httpTestingController.expectOne('http://localhost/test/' + id);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(dto);
      expect(req.request.headers.get('If-Unmodified-Since')).toBe(concurrencyToken);
      req.flush(null);

      return promise;
    });

    it('should reject when updating entity fails', () => {
      // Arrange
      const id = 3;
      const dto = {name: 'test'};

      // Act
      const promise = service.update(3, dto).then(() => {
        fail('Expected promise to be rejected');
      }).catch(reason => {
        expect(reason).not.toBeNull();
      });

      // Assert
      const req = httpTestingController.expectOne('http://localhost/test/' + id);
      expect(req.request.method).toBe('PUT');
      req.flush('some error', {status: 400, statusText: 'Bad Request'});

      return promise;
    });
  });

  describe('delete', () => {
    it('should resolve when deleting entity succeeds', () => {
      // Arrange
      const id = 3;

      // Act
      const promise = service.delete(3).then(() => {
        // nothing to do
      }).catch(reason => {
        fail(reason);
      });

      // Assert
      const req = httpTestingController.expectOne('http://localhost/test/' + id);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      return promise;
    });

    it('should reject when deleting entity fails', () => {
      // Arrange
      const id = 3;

      // Act
      const promise = service.delete(3).then(() => {
        fail('Expected promise to be rejected');
      }).catch(reason => {
        expect(reason).not.toBeNull();
      });

      // Assert
      const req = httpTestingController.expectOne('http://localhost/test/' + id);
      expect(req.request.method).toBe('DELETE');
      req.flush('some error', {status: 400, statusText: 'Bad Request'});

      return promise;
    });
  });
});

@Injectable({providedIn: 'root'})
class TestService extends ApiService<TestDto, ModifyTestDto, number, TestFilter> {
  constructor(@Inject(API_URL) baseUrl: string) {
    super('TestService', baseUrl + '/test');
  }

  protected override setFilterParam(params: HttpParams, filter: TestFilter): HttpParams {
    if (filter.name)
      return params.set('filter', filter.name);
    return params;
  }
}

class TestService2 extends ApiService<TestDto, ModifyTestDto, number, TestFilter> {
  constructor(totalUrl: string) {
    super('TestService2', totalUrl);
  }

  protected override setFilterParam(params: HttpParams, filter: TestFilter): HttpParams {
    if (filter.name)
      return params.set('filter', filter.name);
    return params;
  }
}

interface TestDto {
  id: number;
  name: string;
}

interface ModifyTestDto {
  name: string;
}

interface TestFilter {
  name?: string;
}
