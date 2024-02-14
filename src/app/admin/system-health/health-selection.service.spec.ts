import { TestBed } from '@angular/core/testing';

import { HealthSelectionService } from './health-selection.service';

describe('HealthSelectionService', () => {
  let service: HealthSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HealthSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
