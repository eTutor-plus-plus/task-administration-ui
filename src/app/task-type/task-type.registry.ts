import { Type } from '@angular/core';
import { TaskTypeBinarySearchComponent } from './task-type-binary-search/task-type-binary-search.component';
import { TaskTypeXqueryComponent } from './task-type-xquery/task-type-xquery.component';
import { TaskTypeFormComponent } from './task-type-form.component';
import { TaskTypeDatalogComponent } from './task-type-datalog/task-type-datalog.component';
import { TaskTypeDroolsComponent } from './task-type-drools/task-type-drools.component';
import { TaskTypeAspComponent } from './task-type-asp/task-type-asp.component';
import { TaskTypeSqlComponent } from './task-type-sql/task-type-sql.component';
import { TaskTypeRelalgComponent } from './task-type-relalg/task-type-relalg.component';
import { TaskTypeFanfComponent } from './task-type-fanf/task-type-fanf.component';
import { TaskTypeUmlComponent } from './task-type-uml/task-type-uml.component';

/**
 * Registry for task types.
 */
export class TaskTypeRegistry {

  private constructor() {
  }

  private static readonly taskTypes: {
    name: string,
    supportedTaskGroupTypes: string[],
    component?: Type<TaskTypeFormComponent<any>>,
    submissionTemplate?: string,
    supportsDescriptionGeneration?: boolean,
    submissionInputLanguage?: string // set the monaco language if the submission data have following format {"input": "<USER INPUT>"}, otherwise leave this undefined
  }[] = [
    {
      name: 'binary-search',
      supportedTaskGroupTypes: ['binary-search'],
      component: TaskTypeBinarySearchComponent,
      submissionTemplate: '0',
      supportsDescriptionGeneration: true,
      submissionInputLanguage: 'plaintext'
    }, {
      name: 'xquery',
      supportedTaskGroupTypes: ['xquery'],
      component: TaskTypeXqueryComponent,
      submissionTemplate: `let $d := doc('etutor.xml')
return $d`,
      supportsDescriptionGeneration: false,
      submissionInputLanguage: 'xquery'
    }, {
      name: 'datalog',
      supportedTaskGroupTypes: ['datalog'],
      component: TaskTypeDatalogComponent,
      submissionTemplate: '',
      supportsDescriptionGeneration: false,
      submissionInputLanguage: 'datalog'
    }, {
      name: 'asp',
      supportedTaskGroupTypes: ['datalog'],
      component: TaskTypeAspComponent,
      submissionTemplate: '',
      supportsDescriptionGeneration: false,
      submissionInputLanguage: 'datalog'
    }, {
      name: 'drools',
      supportedTaskGroupTypes: [],
      component: TaskTypeDroolsComponent,
      submissionTemplate: '',
      supportsDescriptionGeneration: false,
      submissionInputLanguage: 'drools'
    }, {
      name: 'sql',
      supportedTaskGroupTypes: ['sql'],
      component: TaskTypeSqlComponent,
      submissionTemplate: '',
      supportsDescriptionGeneration: false,
      submissionInputLanguage: 'sql'
    }, {
      name: 'relalg',
      supportedTaskGroupTypes: ['sql'],
      component: TaskTypeRelalgComponent,
      submissionTemplate: '',
      supportsDescriptionGeneration: false,
      submissionInputLanguage: 'relalg'

    }, {
      name: 'fanf',
      supportedTaskGroupTypes: [],
      component: TaskTypeFanfComponent,
      submissionTemplate: '',
      supportsDescriptionGeneration: true,
      submissionInputLanguage: 'fanf'
    },
    {
      name: 'uml',
      supportedTaskGroupTypes: [],
      component: TaskTypeUmlComponent,
      submissionTemplate: '',
      supportsDescriptionGeneration: false,
      submissionInputLanguage: 'uml'
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

  /**
   * Gets whether the specified type supports description generation.
   *
   * @param name The type name.
   */
  static supportsDescriptionGeneration(name: string | null): boolean {
    return this.taskTypes.find(x => x.name === name)?.supportsDescriptionGeneration ?? false;
  }

  /**
   * Gets the submission input language.
   *
   * @param name The type name.
   */
  static getSubmissionInputLanguage(name: string | null): string | undefined {
    return this.taskTypes.find(x => x.name === name)?.submissionInputLanguage;
  }
}
