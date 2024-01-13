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
   */
  loadAvailableEndpoints(): Promise<string[]> {
    console.info('[SystemHealthService] Loading actuator endpoints');
    return new Promise((resolve, reject) => this.http.get<{
        '_links': Record<string, Link>
      }>(`${this.apiUrl}/actuator`, {headers: new HttpHeaders().set('Accept', this.contentType)}).subscribe({
        next: value => resolve(Object.keys(value._links)),
        error: err => {
          console.error('[SystemHealthService] Failed loading actuator endpoints', err);
          reject(err);
        }
      })
    );
  }

  /**
   * Loads the environment variables.
   */
  loadEnvironment(): Promise<Environment> {
    console.info('[SystemHealthService] Loading environment');
    return new Promise((resolve, reject) => this.http.get<Environment>(`${this.apiUrl}/actuator/env`, {
      headers: new HttpHeaders().set('Accept', this.contentType)
    }).subscribe({
      next: value => resolve(value),
      error: err => {
        console.error('[SystemHealthService] Failed loading environment', err);
        reject(err);
      }
    }));
  }

  /**
   * Loads the flyway information.
   */
  loadFlyway(): Promise<FlywayContexts> {
    console.info('[SystemHealthService] Loading flyway');
    return new Promise((resolve, reject) => this.http.get<FlywayContexts>(`${this.apiUrl}/actuator/flyway`, {
      headers: new HttpHeaders().set('Accept', this.contentType)
    }).subscribe({
      next: value => resolve(value),
      error: err => {
        console.error('[SystemHealthService] Failed loading flyway', err);
        reject(err);
      }
    }));
  }

  /**
   * Loads the scheduled tasks.
   */
  loadScheduledTasks(): Promise<ScheduledTasks> {
    console.info('[SystemHealthService] Loading scheduled tasks');
    return new Promise((resolve, reject) => this.http.get<ScheduledTasks>(`${this.apiUrl}/actuator/scheduledtasks`, {
      headers: new HttpHeaders().set('Accept', this.contentType)
    }).subscribe({
      next: value => resolve(value),
      error: err => {
        console.error('[SystemHealthService] Failed loading scheduled tasks', err);
        reject(err);
      }
    }));
  }

  /**
   * Loads the log file.
   *
   * @param from The start position of the log file.
   * @param to The end position of the log file.
   */
  loadLogFile(from?: number, to?: number): Promise<string> {
    let headers = new HttpHeaders().set('Accept', 'text/plain');
    if (from && to) headers = headers.set('Range', `bytes=${from}-${to}`);

    console.info('[SystemHealthService] Loading log file');
    return new Promise((resolve, reject) => this.http.get<string>(`${this.apiUrl}/actuator/scheduledtasks`, {
      headers: headers,
      observe: 'body'
    }).subscribe({
      next: value => resolve(value),
      error: err => {
        console.error('[SystemHealthService] Failed loading log file', err);
        reject(err);
      }
    }));
  }

  /**
   * Loads the metrics.
   */
  loadMetrics(): Promise<string[]> {
    console.info('[SystemHealthService] Loading metrics');
    return new Promise((resolve, reject) => this.http.get<{
        names: string[]
      }>(`${this.apiUrl}/actuator/metrics`, {headers: new HttpHeaders().set('Accept', this.contentType)}).subscribe({
        next: value => resolve(value.names),
        error: err => {
          console.error('[SystemHealthService] Failed loading metrics', err);
          reject(err);
        }
      })
    );
  }

  /**
   * Loads a metric.
   *
   * @param name The name of the metric to load.
   */
  loadMetric(name: string): Promise<Metric> {
    console.info('[SystemHealthService] Loading metric ' + name);
    return new Promise((resolve, reject) => this.http.get<Metric>(`${this.apiUrl}/actuator/metrics/` + encodeURIComponent(name), {headers: new HttpHeaders().set('Accept', this.contentType)}).subscribe({
        next: value => resolve(value),
        error: err => {
          console.error('[SystemHealthService] Failed loading metric ' + name, err);
          reject(err);
        }
      })
    );
  }

  /**
   * Loads the app information.
   */
  loadAppInfo(): Promise<AppInfo> {
    console.info('[SystemHealthService] Loading app info');
    return new Promise((resolve, reject) => this.http.get<AppInfo>(`${this.apiUrl}/actuator/info`, {headers: new HttpHeaders().set('Accept', this.contentType)}).subscribe({
        next: value => resolve(value),
        error: err => {
          console.error('[SystemHealthService] Failed loading app info', err);
          reject(err);
        }
      })
    );
  }

  /**
   * Loads the health information.
   */
  loadHealth(): Promise<Health> {
    console.info('[SystemHealthService] Loading health info');
    return new Promise((resolve, reject) => this.http.get<Health>(`${this.apiUrl}/actuator/health`, {headers: new HttpHeaders().set('Accept', this.contentType)}).subscribe({
        next: value => resolve(value),
        error: err => {
          console.error('[SystemHealthService] Failed loading health info', err);
          reject(err);
        }
      })
    );
  }

}
