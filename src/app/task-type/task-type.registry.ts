import { Type } from '@angular/core';
import { TaskTypeBinarySearchComponent } from './task-type-binary-search/task-type-binary-search.component';
import { TaskTypeXqueryComponent } from './task-type-xquery/task-type-xquery.component';

/**
 * Registry for task types.
 */
export class TaskTypeRegistry {

  private constructor() {
  }

  private static readonly taskTypes: { name: string, supportedTaskGroupTypes: string[], component?: Type<any>, submissionTemplate?: string }[] = [
    {name: 'none', supportedTaskGroupTypes: []},
    {
      name: 'binary-search', supportedTaskGroupTypes: ['binary-search'], component: TaskTypeBinarySearchComponent, submissionTemplate: `{
  "input": "0"
}`
    },    {
      name: 'xquery', supportedTaskGroupTypes: ['xquery'], component: TaskTypeXqueryComponent, submissionTemplate: `{
  "input": "//book[author='Schrefl, Michael']"
}`
    }
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
   * Gets the submission template for the specified type name.
   *
   * @param name The type name.
   */
  static getSubmissionTemplate(name: string | null): string | undefined {
    return this.taskTypes.find(x => x.name === name)?.submissionTemplate;
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
