import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../app.config';

/**
 * Service for accessing the XQuery specific API.
 */
@Injectable({providedIn: 'root'})
export class XqueryService {
  /**
   * Creates a new instance of class BinarySearchService.
   */
  constructor(private readonly http: HttpClient,
              @Inject(API_URL) private readonly apiUrl: string) {
  }

  /**
   * Load diagnose document URL.
   *
   * @param id The ID of the task group.
   */
  loadDiagnoseDocument(id: number): Promise<string> {
    console.info(`[XqueryService] Loading document URL`);
    return new Promise((resolve, reject) => this.http.get(`${this.apiUrl}/api/forward/xquery/api/taskGroup/${id}/public`, {responseType: 'text'}).subscribe({
        next: value => resolve(value),
        error: err => {
          console.error('[XqueryService] Failed loading document url', err);
          reject(err);
        }
      })
    );
  }
}
