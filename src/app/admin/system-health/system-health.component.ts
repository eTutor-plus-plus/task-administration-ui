import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoDirective, TranslocoPipe, TranslocoService } from '@ngneat/transloco';

import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';

import { SystemHealthService, TaskAppService } from '../../api';
import { HealthSelectionService } from './health-selection.service';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

/**
 * Base component for the System Health page.
 */
@Component({
  selector: 'dke-system-health',
  standalone: true,
  imports: [
    NgClass,
    RouterOutlet,
    TranslocoDirective,
    TranslocoPipe,
    RouterLink,
    RouterLinkActive,
    DropdownModule,
    FormsModule,
  ],
  templateUrl: './system-health.component.html',
  styleUrl: './system-health.component.scss'
})
export class SystemHealthComponent implements OnInit, OnDestroy {

  /**
   * The available apps.
   */
  apps: { value: string, label: string }[];

  /**
   * The available tabs.
   */
  availableTabs: string[];

  /**
   * The selected app.
   */
  selectedApp: string;

  private changeSub?: Subscription;

  /**
   * Creates a new instance of class SystemHealthComponent.
   */
  constructor(private readonly healthService: SystemHealthService,
              private readonly healthSelectionService: HealthSelectionService,
              private readonly route: ActivatedRoute,
              private readonly taskAppService: TaskAppService,
              private readonly messageService: MessageService,
              private readonly translationService: TranslocoService) {
    this.availableTabs = [];
    this.selectedApp = '';
    this.apps = [{value: '', label: this.translationService.translate('appName')}];
  }

  /**
   * Initializes the component.
   */
  ngOnInit(): void {
    this.changeSub = this.healthSelectionService.selectedAppChanged.pipe(distinctUntilChanged()).subscribe(app => {
      this.selectedApp = app;
      this.availableTabs = [];
      this.healthService.loadAvailableEndpoints(app)
        .then(endpoints => this.availableTabs = endpoints)
        .catch(() => this.availableTabs = []);
    });

    this.loadTaskApps();
  }

  /**
   * Cleans up the component.
   */
  ngOnDestroy(): void {
    this.changeSub?.unsubscribe();
  }

  /**
   * Selects a new app.
   *
   * @param evt The change event.
   */
  selectApp(evt: DropdownChangeEvent): void {
    this.healthSelectionService.selectedApp = evt.value;
  }

  private async loadTaskApps(): Promise<void> {
    // Load task apps
    try {
      const taskApps = await this.taskAppService.load(0, 999999, [{order: 1, field: 'taskType'}]);
      taskApps.content.forEach(a => this.apps.push({value: a.taskType, label: this.translationService.translate('taskTypes.' + a.taskType + '.title')}));
    } catch (err) {
      this.messageService.add({
        severity: 'error',
        summary: this.translationService.translate('taskApps.errors.load'),
        detail: (err as any)?.message,
        key: 'global'
      });
    }

    // Set current selected app
    this.healthSelectionService.selectedApp = this.route.snapshot.queryParamMap.get('type') ?? '';
  }

}
