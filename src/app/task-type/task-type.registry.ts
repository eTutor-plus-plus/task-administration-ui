import { Type } from '@angular/core';
import { TaskTypeBinarySearchComponent } from './task-type-binary-search/task-type-binary-search.component';

/**
 * Registry for task types.
 */
export class TaskTypeRegistry {

  private constructor() {
  }

  private static readonly taskTypes: { name: string, supportedTaskGroupTypes: string[], component?: Type<any> }[] = [
    {name: 'none', supportedTaskGroupTypes: []},
    {name: 'binary-search', supportedTaskGroupTypes: ['binary-search'], component: TaskTypeBinarySearchComponent}
  ];

  /**
   * Returns the supported task types.
   */
  static getTaskTypes(): string[] {
    return this.taskTypes.map(value => value.name);
  }

  /**
   * Gets the form component for the specified type name.
   *
   * @param name The type name.
   */
  static getComponent(name: string | null): Type<any> | undefined {
    return this.taskTypes.find(x => x.name === name)?.component;
  }

  /**
   * Gets the supported task group types.
   *
   * @param name The type name.
   */
  static getSupportsTaskGroupTypes(name: string | null): string[] {
    return this.taskTypes.find(x => x.name === name)?.supportedTaskGroupTypes ?? [];
  }
}
