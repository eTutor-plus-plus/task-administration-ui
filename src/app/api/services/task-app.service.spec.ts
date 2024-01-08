import { TestBed } from '@angular/core/testing';

import { TaskAppService } from './task-app.service';

describe('TaskAppService', () => {
  let service: TaskAppService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskAppService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
