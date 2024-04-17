import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../app.config';

/**
 * Service for accessing the Datalog specific API.
 */
@Injectable({providedIn: 'root'})
export class DatalogService {

  /**
   * Creates a new instance of class DatalogService.
   */
  constructor(private readonly http: HttpClient,
              @Inject(API_URL) private readonly apiUrl: string) {
  }

  /**
   * Load diagnose facts URL.
   *
   * @param id The ID of the task group.
   */
  loadDiagnoseFacts(id: number): Promise<string> {
    console.info(`[DatalogService] Loading facts URL`);
    return new Promise((resolve, reject) => this.http.get(`${this.apiUrl}/api/forward/datalog/api/taskGroup/${id}/public`, {responseType: 'text'}).subscribe({
        next: value => resolve(value),
        error: err => {
          console.error('[DatalogService] Failed loading facts url', err);
          reject(err);
        }
      })
    );
  }
}
