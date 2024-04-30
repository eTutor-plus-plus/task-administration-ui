import { TestBed } from '@angular/core/testing';

import { DatalogService } from './datalog.service';

describe('DatalogService', () => {
  let service: DatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
