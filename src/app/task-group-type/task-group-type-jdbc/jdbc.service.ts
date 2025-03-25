import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../app.config';

/**
 * Service for accessing the jdbc specific API.
 */
@Injectable({providedIn: 'root'})
export class JDBCService {
  /**
   * Creates a new instance of class JDBCService.
   */
  constructor(private readonly http: HttpClient,
              @Inject(API_URL) private readonly apiUrl: string) {
  }

  /**
   * Loads two new random numbers.
   */
  // loadNewRandomNumbers(): Promise<{ min: number; max: number; }> {
  //   console.info(`[JDBCService] Loading random numbers`);
  //   return new Promise((resolve, reject) => this.http.get<{ min: number; max: number; }>(`${this.apiUrl}/api/forward/jdbc/api/taskGroup/random`).subscribe({
  //       next: value => resolve(value),
  //       error: err => {
  //         console.error('[JDBCService] Failed loading random numbers', err);
  //         reject(err);
  //       }
  //     })
  //   );
  // }
}
