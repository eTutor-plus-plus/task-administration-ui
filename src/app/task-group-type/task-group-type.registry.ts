import { Type } from '@angular/core';
import { TaskGroupTypeFormComponent } from './task-group-type-form.component';
import { TaskGroupTypeBinarySearchComponent } from './task-group-type-binary-search/task-group-type-binary-search.component';
import { TaskGroupTypeXqueryComponent } from './task-group-type-xquery/task-group-type-xquery.component';
import { TaskGroupTypeDatalogComponent } from './task-group-type-datalog/task-group-type-datalog.component';
import { TaskGroupTypeSqlComponent } from './task-group-type-sql/task-group-type-sql.component';

/**
 * Registry for task group types.
 */
export class TaskGroupTypeRegistry {

  private constructor() {
  }

  private static readonly taskTypes: {
    name: string,
    component?: Type<TaskGroupTypeFormComponent<any>>,
    supportsDescriptionGeneration?: boolean
  }[] = [
    { name: 'binary-search', component: TaskGroupTypeBinarySearchComponent, supportsDescriptionGeneration: true },
    { name: 'xquery',          component: TaskGroupTypeXqueryComponent,       supportsDescriptionGeneration: true },
    { name: 'datalog',         component: TaskGroupTypeDatalogComponent,      supportsDescriptionGeneration: true },
    { name: 'sql',             component: TaskGroupTypeSqlComponent,          supportsDescriptionGeneration: true },
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
   * Gets whether the specified type supports description generation.
   *
   * @param name The type name.
   */
  static supportsDescriptionGeneration(name: string | null): boolean {
    return this.taskTypes.find(x => x.name === name)?.supportsDescriptionGeneration ?? false;
  }
}
