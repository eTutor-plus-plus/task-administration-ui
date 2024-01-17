import { Component, OnInit } from '@angular/core';
import { Health, SystemHealthService, TaskAppService } from '../../../api';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoDirective, TranslocoPipe, TranslocoService } from '@ngneat/transloco';

import { MessageService } from 'primeng/api';
import { AuthService } from '../../../auth';


/**
 * Displays health information for the system.
 */
@Component({
  selector: 'dke-system-health-overview',
  standalone: true,
  imports: [
    TranslocoDirective,
    TranslocoPipe,
    NgClass,
    RouterLink
  ],
  templateUrl: './system-health-overview.component.html',
  styleUrl: './system-health-overview.component.scss'
})
export class SystemHealthOverviewComponent implements OnInit {

  /**
   * The health information for the administration.
   */
  adminHealth?: Health;

  /**
   * The health entries.
   */
  health: Map<string, Health | null>;

  /**
   * Whether the current user is administrator.
   */
  isAdmin: boolean;

  /**
   * Creates a new instance of class SystemHealthDefaultComponent.
   */
  constructor(private readonly healthService: SystemHealthService,
              private readonly taskAppService: TaskAppService,
              private readonly messageService: MessageService,
              private readonly translationService: TranslocoService,
              private readonly authService: AuthService) {
    this.health = new Map<string, Health>();
    this.isAdmin = this.authService.user?.maxRole === 'ADMIN' || this.authService.user?.maxRole === 'FULL_ADMIN';
  }


  /**
   * Initializes the component.
   */
  ngOnInit(): void {
    this.healthService.loadHealth()
      .then(content => this.adminHealth = content)
      .catch(err => {
        this.messageService.add({severity: 'error', summary: this.translationService.translate('health.load-error'), detail: err.message, key: 'global'});
      });
    this.loadHealthForTaskApps();
  }

  private async loadHealthForTaskApps(): Promise<void> {
    // Load task aps
    try {
      const taskApps = await this.taskAppService.load(0, 999999, [{order: 1, field: 'taskType'}]);
      taskApps.content.forEach(a => this.health.set(a.taskType, null));
    } catch (err) {
      this.messageService.add({
        severity: 'error',
        summary: this.translationService.translate('taskApps.errors.load'),
        detail: (err as any)?.message,
        key: 'global'
      });
      return;
    }

    // Load health
    for (const [taskType] of this.health) {
      try {
        const health = await this.healthService.loadHealth(taskType);
        this.health.set(taskType, health);
      } catch (err) {
        this.health.set(taskType, {status: 'DOWN'});
      }
    }
  }

}
