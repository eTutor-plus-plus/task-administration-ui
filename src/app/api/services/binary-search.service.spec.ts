import { TestBed } from '@angular/core/testing';

import { BinarySearchService } from './binary-search.service';

describe('BinarySearchServiceTsService', () => {
  let service: BinarySearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BinarySearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
