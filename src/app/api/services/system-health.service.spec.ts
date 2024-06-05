import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { SystemHealthService } from './system-health.service';
import { API_URL } from '../../app.config';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SystemHealthService', () => {
  let service: SystemHealthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [{ provide: API_URL, useValue: 'http://localhost' }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(SystemHealthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadAvailableEndpoints', () => {
    it('should load available endpoints from task administration', () => {
      // Arrange
      const expected = ['test1', 'test2'];

      // Act
      service.loadAvailableEndpoints().then((result) => {
        // Assert
        expect(result).toEqual(expected);
      });
      const req = httpTestingController.expectOne('http://localhost/actuator');
      req.flush({'_links': {'self': {}, 'test1': {}, 'test2': {}, 'test-3': {}}});
    });

    it('should load available endpoints from task app', () => {
      // Arrange
      const taskType = 'test';
      const expected = ['test1', 'test2'];

      // Act
      service.loadAvailableEndpoints(taskType).then((result) => {
        // Assert
        expect(result).toEqual(expected);
      });
      const req = httpTestingController.expectOne('http://localhost/api/forward/test/actuator');
      req.flush({'_links': {'self': {}, 'test1': {}, 'test2': {}, 'test-3': {}}});
    });

    it('should handle error when loading available endpoints', () => {
      // Act
      service.loadAvailableEndpoints().catch((error) => {
        // Assert
        expect(error).toBeTruthy();
      });
      const req = httpTestingController.expectOne('http://localhost/actuator');
      req.flush('some error', {status: 400, statusText: 'Bad Request'});
    });
  });

  describe('loadHealth', () => {
    it('should load health information from task administration', () => {
      // Arrange
      const expected = {status: 'UP'};

      // Act
      service.loadHealth().then((result) => {
        // Assert
        expect(result).toEqual(expected);
      });
      const req = httpTestingController.expectOne('http://localhost/actuator/health');
      req.flush(expected);
    });

    it('should load health information from task app', () => {
      // Arrange
      const taskType = 'test';
      const expected = {status: 'UP'};

      // Act
      service.loadHealth(taskType).then((result) => {
        // Assert
        expect(result).toEqual(expected);
      });
      const req = httpTestingController.expectOne('http://localhost/api/forward/test/actuator/health');
      req.flush(expected);
    });

    it('should handle error when loading health information', () => {
      // Act
      service.loadHealth().catch((error) => {
        // Assert
        expect(error).toBeTruthy();
      });
      const req = httpTestingController.expectOne('http://localhost/actuator/health');
      req.flush('some error', {status: 400, statusText: 'Bad Request'});
    });
  });

  describe('loadAppInfo', () => {
    it('should load app information from task administration', () => {
      // Arrange
      const expected = {name: 'test'};

      // Act
      service.loadAppInfo().then((result) => {
        // Assert
        expect(result).toEqual(expected);
      });
      const req = httpTestingController.expectOne('http://localhost/actuator/info');
      req.flush(expected);
    });

    it('should load app information from task app', () => {
      // Arrange
      const taskType = 'test';
      const expected = {name: 'test'};

      // Act
      service.loadAppInfo(taskType).then((result) => {
        // Assert
        expect(result).toEqual(expected);
      });
      const req = httpTestingController.expectOne('http://localhost/api/forward/test/actuator/info');
      req.flush(expected);
    });

    it('should handle error when loading app information', () => {
      // Act
      service.loadAppInfo().catch((error) => {
        // Assert
        expect(error).toBeTruthy();
      });
      const req = httpTestingController.expectOne('http://localhost/actuator/info');
      req.flush('some error', {status: 400, statusText: 'Bad Request'});
    });
  });

  describe('loadEnvironment', () => {
    it('should load environment variables from task administration', () => {
      // Arrange
      const expected = {profiles: ['test']};

      // Act
      service.loadEnvironment().then((result) => {
        // Assert
        expect(result).toEqual(expected);
      });
      const req = httpTestingController.expectOne('http://localhost/actuator/env');
      req.flush(expected);
    });

    it('should load environment variables from task app', () => {
      // Arrange
      const taskType = 'test';
      const expected = {profiles: ['test']};

      // Act
      service.loadEnvironment(taskType).then((result) => {
        // Assert
        expect(result).toEqual(expected);
      });
      const req = httpTestingController.expectOne('http://localhost/api/forward/test/actuator/env');
      req.flush(expected);
    });

    it('should handle error when loading environment variables', () => {
      // Act
      service.loadEnvironment().catch((error) => {
        // Assert
        expect(error).toBeTruthy();
      });
      const req = httpTestingController.expectOne('http://localhost/actuator/env');
      req.flush('some error', {status: 400, statusText: 'Bad Request'});
    });
  });

  describe('loadMetrics', () => {
    it('should load metrics from task administration', () => {
      // Arrange
      const expected = {mem: 100};

      // Act
      service.loadMetrics().then((result) => {
        // Assert
        expect(result).toEqual(expected);
      });
      const req = httpTestingController.expectOne('http://localhost/actuator/metrics');
      req.flush(expected);
    });

    it('should load metrics from task app', () => {
      // Arrange
      const taskType = 'test';
      const expected = {mem: 100};

      // Act
      service.loadMetrics(taskType).then((result) => {
        // Assert
        expect(result).toEqual(expected);
      });
      const req = httpTestingController.expectOne('http://localhost/api/forward/test/actuator/metrics');
      req.flush(expected);
    });

    it('should handle error when loading metrics', () => {
      // Act
      service.loadMetrics().catch((error) => {
        // Assert
        expect(error).toBeTruthy();
      });
      const req = httpTestingController.expectOne('http://localhost/actuator/metrics');
      req.flush('some error', {status: 400, statusText: 'Bad Request'});
    });
  });

  describe('loadFlyway', () => {
    it('should load flyway information from task administration', () => {
      // Arrange
      const expected = {contexts: ['test']};

      // Act
      service.loadFlyway().then((result) => {
        // Assert
        expect(result).toEqual(expected);
      });
      const req = httpTestingController.expectOne('http://localhost/actuator/flyway');
      req.flush(expected);
    });

    it('should load flyway information from task app', () => {
      // Arrange
      const taskType = 'test';
      const expected = {contexts: ['test']};

      // Act
      service.loadFlyway(taskType).then((result) => {
        // Assert
        expect(result).toEqual(expected);
      });
      const req = httpTestingController.expectOne('http://localhost/api/forward/test/actuator/flyway');
      req.flush(expected);
    });

    it('should handle error when loading flyway information', () => {
      // Act
      service.loadFlyway().catch((error) => {
        // Assert
        expect(error).toBeTruthy();
      });
      const req = httpTestingController.expectOne('http://localhost/actuator/flyway');
      req.flush('some error', {status: 400, statusText: 'Bad Request'});
    });
  });

  describe('loadScheduledTasks', () => {
    it('should load scheduled tasks from task administration', () => {
      // Arrange
      const expected = {tasks: ['test']};

      // Act
      service.loadScheduledTasks().then((result) => {
        // Assert
        expect(result).toEqual(expected);
      });
      const req = httpTestingController.expectOne('http://localhost/actuator/scheduledtasks');
      req.flush(expected);
    });

    it('should load scheduled tasks from task app', () => {
      // Arrange
      const taskType = 'test';
      const expected = {tasks: ['test']};

      // Act
      service.loadScheduledTasks(taskType).then((result) => {
        // Assert
        expect(result).toEqual(expected);
      });
      const req = httpTestingController.expectOne('http://localhost/api/forward/test/actuator/scheduledtasks');
      req.flush(expected);
    });

    it('should handle error when loading scheduled tasks', () => {
      // Act
      service.loadScheduledTasks().catch((error) => {
        // Assert
        expect(error).toBeTruthy();
      });
      const req = httpTestingController.expectOne('http://localhost/actuator/scheduledtasks');
      req.flush('some error', {status: 400, statusText: 'Bad Request'});
    });
  });

  describe('loadLogFile', () => {
    it('should load log file from task administration', () => {
      // Arrange
      const expected = 'test';

      // Act
      service.loadLogFile().then((result) => {
        // Assert
        expect(result).toEqual(expected);
      });
      const req = httpTestingController.expectOne('http://localhost/actuator/logfile');
      req.flush(expected);
    });

    it('should load log file from task app', () => {
      // Arrange
      const taskType = 'test';
      const expected = 'test';

      // Act
      service.loadLogFile(taskType).then((result) => {
        // Assert
        expect(result).toEqual(expected);
      });
      const req = httpTestingController.expectOne('http://localhost/api/forward/test/actuator/logfile');
      req.flush(expected);
    });

    it('should handle error when loading log file', () => {
      // Act
      service.loadLogFile().catch((error) => {
        // Assert
        expect(error).toBeTruthy();
      });
      const req = httpTestingController.expectOne('http://localhost/actuator/logfile');
      req.flush('some error', {status: 400, statusText: 'Bad Request'});
    });
  });

  describe('loadMetric', () => {
    it('should load metric from task administration', () => {
      // Arrange
      const expected = {mem: 100};

      // Act
      service.loadMetric('mem').then((result) => {
        // Assert
        expect(result).toEqual(expected);
      });
      const req = httpTestingController.expectOne('http://localhost/actuator/metrics/mem');
      req.flush(expected);
    });

    it('should load metric from task app', () => {
      // Arrange
      const taskType = 'test';
      const expected = {mem: 100};

      // Act
      service.loadMetric('mem', taskType).then((result) => {
        // Assert
        expect(result).toEqual(expected);
      });
      const req = httpTestingController.expectOne('http://localhost/api/forward/test/actuator/metrics/mem');
      req.flush(expected);
    });

    it('should handle error when loading metric', () => {
      // Act
      service.loadMetric('mem').catch((error) => {
        // Assert
        expect(error).toBeTruthy();
      });
      const req = httpTestingController.expectOne('http://localhost/actuator/metrics/mem');
      req.flush('some error', {status: 400, statusText: 'Bad Request'});
    });
  });

  describe('loadHttpExchanges', () => {
    it('should load http exchanges from task administration', () => {
      // Arrange
      const expected = {exchanges: ['test']};

      // Act
      service.loadHttpExchanges().then((result) => {
        // Assert
        expect(result).toEqual(expected);
      });
      const req = httpTestingController.expectOne('http://localhost/actuator/httpexchanges');
      req.flush(expected);
    });

    it('should load http exchanges from task app', () => {
      // Arrange
      const taskType = 'test';
      const expected = {exchanges: ['test']};

      // Act
      service.loadHttpExchanges(taskType).then((result) => {
        // Assert
        expect(result).toEqual(expected);
      });
      const req = httpTestingController.expectOne('http://localhost/api/forward/test/actuator/httpexchanges');
      req.flush(expected);
    });

    it('should handle error when loading http exchanges', () => {
      // Act
      service.loadHttpExchanges().catch((error) => {
        // Assert
        expect(error).toBeTruthy();
      });
      const req = httpTestingController.expectOne('http://localhost/actuator/httpexchanges');
      req.flush('some error', {status: 400, statusText: 'Bad Request'});
    });
  });
});
