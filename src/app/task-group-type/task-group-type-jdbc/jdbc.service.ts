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
}
