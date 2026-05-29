import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../app.config';

export interface DroolsValidationRequest {
  modelDrl: string | null;
  rulesDrl: string | null;
}

export interface DroolsTestCaseValidationRequest {
  modelDrl: string | null;
  solutionDrl: string | null;
  visibleTestCases: string | null;
  hiddenTestCases: string | null;
  isCEP: boolean | null;
}

export interface DroolsValidationMessage {
  level: string;
  text: string;
  path: string | null;
  line: number;
  column: number;
}

export interface DroolsValidationResponse {
  valid: boolean;
  messages: DroolsValidationMessage[];
}

@Injectable({ providedIn: 'root' })
export class DroolsValidationService {

  public constructor(
    private readonly http: HttpClient,
    @Inject(API_URL) private readonly apiUrl: string
  ) {
  }

  public validate(request: DroolsValidationRequest): Promise<DroolsValidationResponse> {
    return new Promise((resolve, reject) => {
      this.http.post<DroolsValidationResponse>(
        `${this.apiUrl}/api/forward/drools/api/validation`,
        request
      ).subscribe({
        next: result => resolve(result),
        error: err => reject(err)
      });
    });
  }

  public validateTestCases(request: DroolsTestCaseValidationRequest): Promise<DroolsValidationResponse> {
    return new Promise((resolve, reject) => {
      this.http.post<DroolsValidationResponse>(
        `${this.apiUrl}/api/forward/drools/api/validation/test-cases`,
        request
      ).subscribe({
        next: result => resolve(result),
        error: err => reject(err)
      });
    });
  }
}
