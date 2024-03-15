import { Component, OnDestroy, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslocoDirective, TranslocoService } from '@ngneat/transloco';
import { distinctUntilChanged, Subscription } from 'rxjs';

import { MessageService, SharedModule } from 'primeng/api';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';

import { FlywayContexts, FlywayMigration, SystemHealthService } from '../../../api';
import { HealthSelectionService } from '../health-selection.service';

@Component({
  selector: 'dke-system-health-flyway',
  standalone: true,
  imports: [
    PanelModule,
    SharedModule,
    TableModule,
    TranslocoDirective,
    DatePipe
  ],
  templateUrl: './system-health-flyway.component.html',
  styleUrl: './system-health-flyway.component.scss'
})
export class SystemHealthFlywayComponent implements OnInit, OnDestroy {

  /**
   * The loading state.
   */
  loading: boolean;

  /**
   * The flyway contexts.
   */
  contexts?: FlywayContexts;

  private changeSub?: Subscription;

  /**
   * Creates a new instance of class SystemHealthFlywayComponent.
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
      this.healthService.loadFlyway(app)
        .then(content => this.contexts = content)
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

  /**
   * Returns the properties of the specified object.
   *
   * @param obj The object.
   */
  getProperties(obj: any): string[] {
    if (!obj)
      return [];
    return Object.keys(obj);
  }

  /**
   * Returns the context migrations.
   * @param name The name of the context.
   */
  getContextMigrations(name: string): FlywayMigration[] {
    return this.contexts?.contexts[name]?.flywayBeans?.flyway?.migrations || [];
  }

}
