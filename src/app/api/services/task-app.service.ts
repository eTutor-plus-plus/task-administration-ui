import { Inject, Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';

import { API_URL } from '../../app.config';
import { ModifyTaskAppDto, TaskAppDto } from '../models';
import { ApiService } from './api.service';

/**
 * API-service for task apps.
 */
@Injectable({providedIn: 'root'})
export class TaskAppService extends ApiService<TaskAppDto, ModifyTaskAppDto, number, TaskAppFilter> {

  /**
   * Creates a new instance of class TaskAppService.
   */
  constructor(@Inject(API_URL) apiUrl: string) {
    super('TaskAppService', apiUrl + '/api/taskApp');
  }

  protected override setFilterParam(params: HttpParams, filter: TaskAppFilter): HttpParams {
    if (filter.url)
      params = params.set('urlFilter', filter.url);
    if (filter.taskType)
      params = params.set('urlFilter', filter.taskType);
    return params;
  }

}

/**
 * The filter properties for task apps.
 */
export interface TaskAppFilter {
  url?: string;
  taskType?: string;
}
