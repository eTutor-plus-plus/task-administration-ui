import { Inject, Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';

import { API_URL } from '../../app.config';
import { ModifyTaskGroupDto, StatusEnum, TaskGroupDetailsDto, TaskGroupDto } from '../models';
import { ApiService } from './api.service';

/**
 * API-service for task groups.
 */
@Injectable({providedIn: 'root'})
export class TaskGroupService extends ApiService<TaskGroupDto, ModifyTaskGroupDto, number, TaskGroupFilter, TaskGroupDetailsDto> {

  /**
   * Creates a new instance of class TaskGroupService.
   */
  constructor(@Inject(API_URL) apiUrl: string) {
    super('TaskGroupService', apiUrl + '/api/taskGroup');
  }

  /**
   * Loads the used task group types.
   *
   * @return List of used task group types.
   */
  getTypes(): Promise<string[]> {
    console.info(`[${this.serviceName}] Loading task group types`);
    return new Promise<string[]>((resolve, reject) => this.http.get<string[]>(this.apiUrl + '/types').subscribe({
      next: value => resolve(value),
      error: err => {
        console.error(`[${this.serviceName}] Failed loading task group types`, err);
        reject(err);
      }
    }));
  }

  protected override setFilterParam(params: HttpParams, filter: TaskGroupFilter): HttpParams {
    if (filter.name)
      params = params.set('nameFilter', filter.name);
    if (filter.status)
      params = params.set('statusFilter', filter.status);
    if (filter.taskGroupType)
      params = params.set('taskGroupTypeFilter', filter.taskGroupType);
    if (filter.organizationalUnit)
      params = params.set('orgUnitFilter', filter.organizationalUnit);
    return params;
  }

}

/**
 * The filter properties for task groups.
 */
export interface TaskGroupFilter {
  name?: string;
  status?: StatusEnum;
  taskGroupType?: string;
  organizationalUnit?: number;
}
