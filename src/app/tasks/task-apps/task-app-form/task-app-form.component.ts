import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective, TranslocoPipe } from '@ngneat/transloco';

import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';

import { AuditInformationComponent, DialogEditFormComponent } from '../../../layout';
import { TaskAppDto, TaskAppService } from '../../../api';

/**
 * Task App Form
 */
@Component({
  selector: 'dke-task-app-form',
  standalone: true,
  imports: [
    ButtonModule,
    CalendarModule,
    CheckboxModule,
    DropdownModule,
    InputTextModule,
    MessagesModule,
    ReactiveFormsModule,
    TranslocoDirective,
    TranslocoPipe,
    AuditInformationComponent
  ],
  templateUrl: './task-app-form.component.html',
  styleUrl: './task-app-form.component.scss'
})
export class TaskAppFormComponent extends DialogEditFormComponent<TaskAppDto, TaskAppService, TaskAppForm> {

  /**
   * Creates a new instance of class TaskAppFormComponent.
   */
  constructor(entityService: TaskAppService) {
    super(entityService, new FormGroup<TaskAppForm>({
      url: new FormControl<string | null>(null, [Validators.required, Validators.minLength(8), Validators.maxLength(255), Validators.pattern('^(http|https)://.+$')]),
      taskType: new FormControl<string | null>(null, [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
      apiKey: new FormControl<string | null>(null, [Validators.maxLength(255)])
    }), 'taskApps.');
  }

  override getId(entity: TaskAppDto): string | number {
    return entity.id;
  }

  override getLastModifiedDate(entity: TaskAppDto): string | null {
    return entity.lastModifiedDate;
  }

  override getMessageParams(entity: TaskAppDto | {
    url: any;
  }, type: 'successCreate' | 'errorCreate' | 'successUpdate' | 'errorUpdate'): Record<string, unknown> {
    return {name: entity.url};
  }

}

interface TaskAppForm {
  url: FormControl<string | null>;
  taskType: FormControl<string | null>;
  apiKey: FormControl<string | null>;
}
