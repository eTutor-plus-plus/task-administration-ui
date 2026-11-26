import { Inject, Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';

import { API_URL } from '../../app.config';
import { ModifyTaskDto, StatusEnum, SubmissionDto, TaskDetailsDto, TaskDto } from '../models';
import { ApiService } from './api.service';

/**
 * API-service for tasks.
 */
@Injectable({providedIn: 'root'})
export class TaskService extends ApiService<TaskDto, ModifyTaskDto, number, TaskFilter, TaskDetailsDto> {

  /**
   * Creates a new instance of class TaskService.
   */
  constructor(@Inject(API_URL) apiUrl: string) {
    super('TaskService', apiUrl + '/api/task');
  }

  /**
   * Loads the used task types.
   *
   * @return List of used task types.
   */
  getTypes(): Promise<string[]> {
    console.info(`[${this.serviceName}] Loading task types`);
    return new Promise<string[]>((resolve, reject) => this.http.get<string[]>(this.apiUrl + '/types').subscribe({
      next: value => resolve(value),
      error: err => {
        console.error(`[${this.serviceName}] Failed loading task types`, err);
        reject(err);
      }
    }));
  }

  /**
   * Loads the details of all tasks.
   *
   * @return List of tasks.
   */
  export(): Promise<string> {
    console.info(`[${this.serviceName}] Exporting task details`);
    return new Promise<string>((resolve, reject) => this.http.get(this.apiUrl + '/export', {responseType: 'text'}).subscribe({
      next: value => resolve(value),
      error: err => {
        console.error(`[${this.serviceName}] Failed exporting tasks`, err);
        reject(err);
      }
    }));
  }

  /**
   * Submits a task.
   *
   * @param submission The submission.
   * @return The grading result.
   */
  submit(submission: {
    mode: string;
    feedbackLevel: number;
    language: string;
    submission: any;
    taskId: number;
  }): Promise<SubmissionDto> {
    console.info(`[${this.serviceName}] Submitting task`);
    return new Promise((resolve, reject) => this.http.post<SubmissionDto>(this.apiUrl + '/submit', submission).subscribe({
      next: value => resolve(value),
      error: err => {
        console.error(`[${this.serviceName}] Failed submitting task`, err);
        reject(err);
      }
    }));
  }

  /**
   * Initiates synchronization of the task with Moodle.
   *
   * @param id The task identifier.
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

  protected override setFilterParam(params: HttpParams, filter: TaskFilter): HttpParams {
    if (filter.name)
      params = params.set('nameFilter', filter.name);
    if (filter.status)
      params = params.set('statusFilter', filter.status);
    if (filter.taskType)
      params = params.set('taskTypeFilter', filter.taskType);
    if (filter.organizationalUnit)
      params = params.set('orgUnitFilter', filter.organizationalUnit);
    if (filter.taskGroup)
      params = params.set('taskGroupFilter', filter.taskGroup);
    return params;
  }
}

/**
 * The filter properties for tasks.
 */
export interface TaskFilter {
  name?: string;
  status?: StatusEnum;
  taskType?: string;
  organizationalUnit?: number;
  taskGroup?: number;
}