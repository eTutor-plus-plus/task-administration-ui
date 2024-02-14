import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslocoDirective, TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { distinctUntilChanged, Subscription } from 'rxjs';

import { MessageService } from 'primeng/api';
import { PanelModule } from 'primeng/panel';

import {  ScheduledTasks, SystemHealthService } from '../../../api';
import { HealthSelectionService } from '../health-selection.service';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'dke-system-health-scheduled-tasks',
  standalone: true,
  imports: [
    PanelModule,
    TranslocoPipe,
    TableModule,
    TranslocoDirective
  ],
  templateUrl: './system-health-scheduled-tasks.component.html',
  styleUrl: './system-health-scheduled-tasks.component.scss'
})
export class SystemHealthScheduledTasksComponent implements OnInit, OnDestroy {

  /**
   * The loading state.
   */
  loading: boolean;

  /**
   * The scheduled tasks.
   */
  tasks?: ScheduledTasks;

  private changeSub?: Subscription;

  /**
   * Creates a new instance of class SystemHealthScheduledTasksComponent.
   */
  constructor(private readonly healthService: SystemHealthService,
              private readonly healthSelectionService: HealthSelectionService,
              private readonly messageService: MessageService,
              private readonly translationService: TranslocoService) {
    this.loading = false;
  }

  /**
   * Initializes the component.
   */
  ngOnInit(): void {
    this.changeSub = this.healthSelectionService.selectedAppChanged.pipe(distinctUntilChanged()).subscribe(app => {
      this.loading = true;
      this.healthService.loadScheduledTasks(app)
        .then(content => this.tasks = content)
        .catch(err => {
          this.messageService.add({severity: 'error', summary: this.translationService.translate('health.load-error'), detail: err.message, key: 'global'});
        })
        .finally(() => this.loading = false);
    });
  }

  /**
   * Cleans up the component.
   */
  ngOnDestroy(): void {
    this.changeSub?.unsubscribe();
  }

}
