import { TestBed } from '@angular/core/testing';

import { TaskCategoryService } from './task-category.service';

describe('TaskCategoryService', () => {
  let service: TaskCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
