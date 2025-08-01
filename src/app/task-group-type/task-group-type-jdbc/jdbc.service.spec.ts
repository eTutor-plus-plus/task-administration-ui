import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { JDBCService } from './jdbc.service';
import { API_URL } from '../../app.config';

describe('JDBCService', () => {
  let service: JDBCService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        JDBCService,
        provideHttpClient(), 
        provideHttpClientTesting(),
        { provide: API_URL, useValue: 'http://localhost/api' }
      ]
    });

    service = TestBed.inject(JDBCService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
