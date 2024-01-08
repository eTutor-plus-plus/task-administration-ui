import { Component } from '@angular/core';
import { TranslocoDirective, TranslocoPipe } from '@ngneat/transloco';

import { ConfirmationService, SharedModule } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { TableDialogOverviewComponent } from '../../layout';
import { TaskAppDto, TaskAppService } from '../../api';
import { TaskAppFormComponent } from './task-app-form/task-app-form.component';

/**
 * Page: Task Apps Overview
 */
@Component({
  selector: 'dke-task-apps',
  standalone: true,
  imports: [
    ButtonModule,
    ConfirmPopupModule,
    InputTextModule,
    SharedModule,
    TableModule,
    TagModule,
    TranslocoDirective,
    TranslocoPipe,
    TooltipModule
  ],
  providers: [ConfirmationService, DialogService],
  templateUrl: './task-apps.component.html',
  styleUrl: './task-apps.component.scss'
})
export class TaskAppsComponent extends TableDialogOverviewComponent<TaskAppDto, TaskAppService> {

  /**
   * Creates a new instance of class TaskAppsComponent.
   */
  constructor(entityService: TaskAppService) {
    super(entityService, [{field: 'taskType', order: 1}], 'taskApps.', TaskAppFormComponent, {
      style: {
        'max-width': '60em',
        'min-width': '30em'
      }
    });
  }

  getId(entity: TaskAppDto): string | number {
    return entity.id;
  }

  getMessageParams(entity: TaskAppDto, type: 'success' | 'error'): Record<string, unknown> {
    return {name: entity.url};
  }

}
