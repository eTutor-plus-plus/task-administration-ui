import { TestBed } from '@angular/core/testing';
import { HttpParams } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { TaskAppService } from './task-app.service';
import { API_URL } from '../../app.config';

describe('TaskAppService', () => {
  let service: TaskAppService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{provide: API_URL, useValue: 'http://localhost'}]
    });
    service = TestBed.inject(TaskAppService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setFilterParam', () => {
    it('should set filter param when url set', () => {
      // Arrange
      const filter = {url: 'test'};
      const params = new HttpParams();

      // Act
      const result = service['setFilterParam'](params, filter);

      // Assert
      expect(result.get('urlFilter')).toBe('test');
    });

    it('should set filter param when taskType set', () => {
      // Arrange
      const filter = {taskType: 'test'};
      const params = new HttpParams();

      // Act
      const result = service['setFilterParam'](params, filter);

      // Assert
      expect(result.get('taskTypeFilter')).toBe('test');
    });

    it('should not set filter param when no filter set', () => {
      // Arrange
      const filter = {};
      const params = new HttpParams();

      // Act
      const result = service['setFilterParam'](params, filter);

      // Assert
      expect(result.keys().length).toBe(0);
    });
  });
});
