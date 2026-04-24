import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../app.config';

/**
 * Service for accessing the binary search specific API.
 */
@Injectable({ providedIn: 'root' })
export class CypherService {
  /**
   * Creates a new instance of class CypherService.
   */
  constructor(private readonly http: HttpClient,
    @Inject(API_URL) private readonly apiUrl: string) {
  }

  /**
   * Loads two new random numbers.
   */
  loadNewRandomNumbers(): Promise<{ min: number; max: number; }> {
    console.info(`[CypherService] Loading random numbers`);
    return new Promise((resolve, reject) => this.http.get<{ min: number; max: number; }>(`${this.apiUrl}/api/forward/binary-search/api/taskGroup/random`).subscribe({
      next: value => resolve(value),
      error: err => {
        console.error('[CypherService] Failed loading random numbers', err);
        reject(err);
      }
    })
    );
  }
}
