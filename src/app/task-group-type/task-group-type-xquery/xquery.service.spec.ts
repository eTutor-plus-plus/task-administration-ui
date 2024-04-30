import { TestBed } from '@angular/core/testing';

import { XqueryService } from './xquery.service';

describe('XqueryService', () => {
  let service: XqueryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(XqueryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
