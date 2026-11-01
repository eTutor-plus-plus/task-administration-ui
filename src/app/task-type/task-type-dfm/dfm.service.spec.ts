import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { DfmService } from './dfm.service';
import { DfmGraph, DfmParseError } from './dfm-graph.model';
import { API_URL } from '../../app.config';

describe('DfmService', () => {
  let service: DfmService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: API_URL, useValue: 'http://localhost'}
      ]
    });
    service = TestBed.inject(DfmService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send the model as plain text and return the graph', async () => {
    const graph: DfmGraph = {
      nodes: [{id: 'f', label: 'Sales', type: 'FACT', optional: false, details: ['Revenue']}],
      edges: []
    };

    const promise = service.parse('fact Sales { Revenue; };');

    const req = httpTestingController.expectOne('http://localhost/api/forward/dfm/api/dfm/parse');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe('fact Sales { Revenue; };');
    expect(req.request.headers.get('Content-Type')).toBe('text/plain');
    req.flush(graph);

    await expect(promise).resolves.toEqual(graph);
  });

  it('should throw a parse error with position for invalid models', async () => {
    jest.spyOn(console, 'error').mockImplementation();

    const promise = service.parse('invalid');

    httpTestingController.expectOne('http://localhost/api/forward/dfm/api/dfm/parse')
      .flush({message: 'Unexpected token', line: 1, column: 3}, {status: 400, statusText: 'Bad Request'});

    const error = await promise.catch(e => e);
    expect(error).toBeInstanceOf(DfmParseError);
    expect(error.message).toBe('Unexpected token');
    expect(error.line).toBe(1);
    expect(error.column).toBe(3);
  });

  it('should rethrow other errors', async () => {
    jest.spyOn(console, 'error').mockImplementation();

    const promise = service.parse('fact A { x; };');

    httpTestingController.expectOne('http://localhost/api/forward/dfm/api/dfm/parse')
      .flush('error', {status: 503, statusText: 'Service Unavailable'});

    const error = await promise.catch(e => e);
    expect(error).not.toBeInstanceOf(DfmParseError);
  });
});
