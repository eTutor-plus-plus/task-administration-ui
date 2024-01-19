import { Inject, Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';

import { API_URL } from '../../app.config';
import { ModifyTaskCategoryDto, TaskCategoryDto } from '../models';
import { ApiService } from './api.service';

/**
 * API-service for task categories.
 */
@Injectable({providedIn: 'root'})
export class TaskCategoryService extends ApiService<TaskCategoryDto, ModifyTaskCategoryDto, number, TaskCategoryFilter> {

  /**
   * Creates a new instance of class TaskCategoryService.
   */
  constructor(@Inject(API_URL) apiUrl: string) {
    super('TaskCategoryService', apiUrl + '/api/taskCategory');
  }

  protected override setFilterParam(params: HttpParams, filter: TaskCategoryFilter): HttpParams {
    if (filter.name)
      params = params.set('nameFilter', filter.name);
    if (filter.parent)
      params = params.set('parentFilter', filter.parent);
    if (filter.organizationalUnit)
      params = params.set('organizationalUnitFilter', filter.organizationalUnit);
    return params;
  }

  /**
   * Initiates synchronization of the task category with Moodle.
   *
   * @param id The task category identifier.
   */
  syncWithMoodle(id: number): Promise<void> {
    console.info(`[${this.serviceName}] Sync with moodle ` + id);
    return new Promise<void>((resolve, reject) => this.http.post(this.apiUrl + '/' + encodeURIComponent(id), null).subscribe({
      next: () => resolve(),
      error: err => {
        console.error(`[${this.serviceName}] Failed sync with moodle ` + id, err);
        reject(err);
      }
    }));
  }

}

/**
 * The filter properties for task categories.
 */
export interface TaskCategoryFilter {
  name?: string;
  parent?: number;
  organizationalUnit?: number;
}
