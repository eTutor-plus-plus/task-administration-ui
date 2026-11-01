import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { API_URL } from '../../app.config';
import { DfmGraph, DfmParseError } from './dfm-graph.model';

/**
 * Service for accessing the DFM specific API.
 */
@Injectable({providedIn: 'root'})
export class DfmService {

  /**
   * Creates a new instance of class DfmService.
   */
  constructor(private readonly http: HttpClient,
              @Inject(API_URL) private readonly apiUrl: string) {
  }

  /**
   * Parses the DFM model using the task app and returns its graph.
   *
   * @param source The DFM model.
   * @returns The graph.
   * @throws DfmParseError If the model is invalid.
   */
  async parse(source: string): Promise<DfmGraph> {
    console.info('[DfmService] Parsing DFM model');
    try {
      return await firstValueFrom(this.http.post<DfmGraph>(
        `${this.apiUrl}/api/forward/dfm/api/dfm/parse`,
        source,
        {headers: {'Content-Type': 'text/plain'}}
      ));
    } catch (err) {
      console.error('[DfmService] Failed parsing DFM model', err);
      const body = err instanceof HttpErrorResponse ? err.error : null;
      if (err instanceof HttpErrorResponse && (err.status === 400 || err.status === 413) &&
        typeof body === 'object' && body !== null && typeof body.message === 'string')
        throw new DfmParseError(
          body.message,
          typeof body.line === 'number' ? body.line : null,
          typeof body.column === 'number' ? body.column : null
        );
      throw err;
    }
  }
}
