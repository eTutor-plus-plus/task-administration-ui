import { TestBed } from '@angular/core/testing';

import { TaskAppTypeService } from './task-app-type.service';
import { TaskAppService } from '../api';

describe('TaskAppTypeService', () => {
  let service: TaskAppTypeService;
  const loadFn = jest.fn();

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [{provide: TaskAppService, useValue: {load: loadFn}}]
    });
    service = TestBed.inject(TaskAppTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load from storage', async () => {
    // Arrange
    sessionStorage.setItem('@dke-etutor/task-types', JSON.stringify(['sql', 'xquery']));
    service = new TaskAppTypeService(null!);

    // Act
    const result = await service.getAvailableTaskTypes();

    // Assert
    expect(result).toHaveLength(2);
    expect(result).toContain('sql');
    expect(result).toContain('xquery');
  });

  it('should load from server if storage is invalid', async () => {
    // Arrange
    sessionStorage.setItem('@dke-etutor/task-types', JSON.stringify({type: 'sql'}));
    loadFn.mockResolvedValue({
      page: {},
      content: [
        {taskType: 'datalog'},
        {taskType: 'asp'}
      ]
    });
    const tmp: any = {load: loadFn};
    service = new TaskAppTypeService(tmp);

    // Act
    const result = await service.getAvailableTaskTypes();

    // Assert
    expect(result).toHaveLength(2);
    expect(result).toContain('datalog');
    expect(result).toContain('asp');
  });

  it('should load from server if storage is empty', async () => {
    // Arrange
    loadFn.mockResolvedValue({
      page: {},
      content: [
        {taskType: 'datalog'},
        {taskType: 'asp'}
      ]
    });
    const tmp: any = {load: loadFn};
    service = new TaskAppTypeService(tmp);

    // Act
    const result = await service.getAvailableTaskTypes();

    // Assert
    expect(result).toHaveLength(2);
    expect(result).toContain('datalog');
    expect(result).toContain('asp');

    const fromStorage = JSON.parse(sessionStorage.getItem('@dke-etutor/task-types') ?? '[]');
    expect(fromStorage).toEqual(result);
  });

  it('should return empty array on server error response', async () => {
    // Arrange
    loadFn.mockRejectedValue('some-error');

    // Act
    const result = await service.getAvailableTaskTypes();

    // Assert
    expect(result).toHaveLength(0);

    const fromStorage = sessionStorage.getItem('@dke-etutor/task-types');
    expect(fromStorage).toBeNull();
  });
});
