import { Injectable } from '@angular/core';
import { TaskAppService } from '../api';

/**
 * This service provides task types for which a task app is registered.
 */
@Injectable({providedIn: 'root'})
export class TaskAppTypeService {

  private static readonly STORAGE_KEY = '@dke-etutor/task-types';
  private static readonly STORAGE = sessionStorage;

  private taskTypes: string[] | null;

  /**
   * Creates a new instance of class TaskAppTypeService.
   */
  constructor(private readonly taskAppService: TaskAppService) {
    this.taskTypes = null;

    try {
      const fromStorage = TaskAppTypeService.STORAGE.getItem(TaskAppTypeService.STORAGE_KEY);
      if (fromStorage != null) {
        this.taskTypes = JSON.parse(fromStorage);
        if (!Array.isArray(this.taskTypes))
          this.taskTypes = null;
        else
          console.log('[TypeService] Loaded task types from storage');
      }
    } catch (err) {
      this.taskTypes = null;
    }
  }

  /**
   * Returns the available task types, i.e. task types for which a task app is registered.
   */
  async getAvailableTaskTypes(): Promise<string[]> {
    if (this.taskTypes != null)
      return this.taskTypes.slice();

    try {
      const taskApps = await this.taskAppService.load(0, 999999);
      console.log('[TypeService] Loaded task types from server');

      this.taskTypes = taskApps.content.map(x => x.taskType);
      TaskAppTypeService.STORAGE.setItem(TaskAppTypeService.STORAGE_KEY, JSON.stringify(this.taskTypes));

      return this.taskTypes.slice();
    } catch (err) {
      console.error('[TypeService] Failed to load task types from server');
      this.taskTypes = null;
      TaskAppTypeService.STORAGE.removeItem(TaskAppTypeService.STORAGE_KEY);
      return [];
    }
  }

}
