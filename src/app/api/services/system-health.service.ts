import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_URL } from '../../app.config';
import { AppInfo, Environment, FlywayContexts, Health, Link, Metric, ScheduledTasks } from '../models';

/**
 * Service for accessing the actuator endpoints.
 */
@Injectable({providedIn: 'root'})
export class SystemHealthService {

  private readonly contentType = 'application/vnd.spring-boot.actuator.v3+json';

  /**
   * Creates a new instance of class SystemHealthService.
   */
  constructor(private readonly http: HttpClient,
              @Inject(API_URL) private readonly apiUrl: string) {
  }

  /**
   * Loads the available system health endpoints.
   *
   * @param taskType The task type to load the endpoints for.
   */
  loadAvailableEndpoints(taskType?: string): Promise<string[]> {
    console.info('[SystemHealthService] Loading actuator endpoints for ' + taskType);
    let url = this.apiUrl;
    if (taskType && taskType !== '')
      url += '/api/forward/' + encodeURIComponent(taskType);
    url += '/actuator';

    return new Promise((resolve, reject) => this.http.get<{
        '_links': Record<string, Link>
      }>(url, {headers: new HttpHeaders().set('Accept', this.contentType)}).subscribe({
        next: value => resolve(Object.keys(value._links).filter(x => x !== 'self' && !x.includes('-'))),
        error: err => {
          console.error('[SystemHealthService] Failed loading actuator endpoints', err);
          reject(err);
        }
      })
    );
  }

  /**
   * Loads the health information.
   *
   * @param taskType The task type to load the health info for.
   */
  loadHealth(taskType?: string): Promise<Health> {
    console.info('[SystemHealthService] Loading health info for ' + taskType);
    let url = this.apiUrl;
    if (taskType && taskType !== '')
      url += '/api/forward/' + encodeURIComponent(taskType);
    url += '/actuator/health';

    return new Promise((resolve, reject) => this.http.get<Health>(url, {headers: new HttpHeaders().set('Accept', this.contentType)}).subscribe({
        next: value => resolve(value),
        error: err => {
          console.error('[SystemHealthService] Failed loading health info for' + taskType, err);
          reject(err);
        }
      })
    );
  }

  /**
   * Loads the app information.
   *
   * @param taskType The task type to load the app info for.
   */
  loadAppInfo(taskType?: string): Promise<AppInfo> {
    console.info('[SystemHealthService] Loading app info for ' + taskType);
    let url = this.apiUrl;
    if (taskType && taskType !== '')
      url += '/api/forward/' + encodeURIComponent(taskType);
    url += '/actuator/info';

    return new Promise((resolve, reject) => this.http.get<AppInfo>(url, {headers: new HttpHeaders().set('Accept', this.contentType)}).subscribe({
        next: value => resolve(value),
        error: err => {
          console.error('[SystemHealthService] Failed loading app info for ' + taskType, err);
          reject(err);
        }
      })
    );
  }

  /**
   * Loads the environment variables.
   *
   * @param taskType The task type to load the environment for.
   */
  loadEnvironment(taskType?: string): Promise<Environment> {
    console.info('[SystemHealthService] Loading environment for ' + taskType);
    let url = this.apiUrl;
    if (taskType && taskType !== '')
      url += '/api/forward/' + encodeURIComponent(taskType);
    url += '/actuator/env';

    return new Promise((resolve, reject) => this.http.get<Environment>(url, {
      headers: new HttpHeaders().set('Accept', this.contentType)
    }).subscribe({
      next: value => resolve(value),
      error: err => {
        console.error('[SystemHealthService] Failed loading environment for ' + taskType, err);
        reject(err);
      }
    }));
  }

  /**
   * Loads the flyway information.
   *
   * @param taskType The task type to load the flyway info for.
   */
  loadFlyway(taskType?: string): Promise<FlywayContexts> {
    console.info('[SystemHealthService] Loading flyway for ' + taskType);
    let url = this.apiUrl;
    if (taskType && taskType !== '')
      url += '/api/forward/' + encodeURIComponent(taskType);
    url += '/actuator/flyway';

    return new Promise((resolve, reject) => this.http.get<FlywayContexts>(url, {
      headers: new HttpHeaders().set('Accept', this.contentType)
    }).subscribe({
      next: value => resolve(value),
      error: err => {
        console.error('[SystemHealthService] Failed loading flyway for ' + taskType, err);
        reject(err);
      }
    }));
  }

  /**
   * Loads the scheduled tasks.
   *
   * @param taskType The task type to load the scheduled tasks for.
   */
  loadScheduledTasks(taskType?: string): Promise<ScheduledTasks> {
    console.info('[SystemHealthService] Loading scheduled tasks for ' + taskType);
    let url = this.apiUrl;
    if (taskType && taskType !== '')
      url += '/api/forward/' + encodeURIComponent(taskType);
    url += '/actuator/scheduledtasks';

    return new Promise((resolve, reject) => this.http.get<ScheduledTasks>(url, {
      headers: new HttpHeaders().set('Accept', this.contentType)
    }).subscribe({
      next: value => resolve(value),
      error: err => {
        console.error('[SystemHealthService] Failed loading scheduled tasks for ' + taskType, err);
        reject(err);
      }
    }));
  }

  /**
   * Loads the log file.
   *
   * @param taskType The task type to load the log file for.
   * @param from The start position of the log file.
   * @param to The end position of the log file.
   */
  loadLogFile(taskType?: string, from?: number, to?: number): Promise<string> {
    let headers = new HttpHeaders().set('Accept', 'text/plain');
    if (from && to) headers = headers.set('Range', `bytes=${from}-${to}`);
    let url = this.apiUrl;
    if (taskType && taskType !== '')
      url += '/api/forward/' + encodeURIComponent(taskType);
    url += '/actuator/logfile';

    console.info('[SystemHealthService] Loading log file for ' + taskType);
    return new Promise((resolve, reject) => this.http.get(url, {
      headers: headers,
      responseType: 'text'
    }).subscribe({
      next: value => resolve(value),
      error: err => {
        console.error('[SystemHealthService] Failed loading log file for ' + taskType, err);
        reject(err);
      }
    }));
  }

  /**
   * Loads the metrics.
   *
   * @param taskType The task type to load the metrics for.
   */
  loadMetrics(taskType?: string): Promise<string[]> {
    console.info('[SystemHealthService] Loading metrics for ' + taskType);
    let url = this.apiUrl;
    if (taskType && taskType !== '')
      url += '/api/forward/' + encodeURIComponent(taskType);
    url += '/actuator/metrics';

    return new Promise((resolve, reject) => this.http.get<{
        names: string[]
      }>(url, {headers: new HttpHeaders().set('Accept', this.contentType)}).subscribe({
        next: value => resolve(value.names),
        error: err => {
          console.error('[SystemHealthService] Failed loading metrics for ' + taskType, err);
          reject(err);
        }
      })
    );
  }

  /**
   * Loads a metric.
   *
   * @param name The name of the metric to load.
   * @param taskType The task type to load the metric for.
   */
  loadMetric(name: string, taskType?: string): Promise<Metric> {
    console.info('[SystemHealthService] Loading metric ' + name + ' for ' + taskType);
    let url = this.apiUrl;
    if (taskType && taskType !== '')
      url += '/api/forward/' + encodeURIComponent(taskType);
    url += '/actuator/metrics/' + encodeURIComponent(name);

    return new Promise((resolve, reject) => this.http.get<Metric>(url, {headers: new HttpHeaders().set('Accept', this.contentType)}).subscribe({
        next: value => resolve(value),
        error: err => {
          console.error('[SystemHealthService] Failed loading metric ' + name + ' for ' + taskType, err);
          reject(err);
        }
      })
    );
  }

}
