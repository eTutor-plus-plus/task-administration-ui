import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslocoDirective, TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { distinctUntilChanged, Subscription } from 'rxjs';

import { MessageService } from 'primeng/api';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { Environment, SystemHealthService } from '../../../api';
import { HealthSelectionService } from '../health-selection.service';

/**
 * Displays the configuration variables.
 */
@Component({
  selector: 'dke-system-health-env',
  standalone: true,
  imports: [
    PanelModule,
    TranslocoPipe,
    TableModule,
    TagModule,
    TranslocoDirective
  ],
  templateUrl: './system-health-env.component.html',
  styleUrl: './system-health-env.component.scss'
})
export class SystemHealthEnvComponent implements OnInit, OnDestroy {

  /**
   * The loading state.
   */
  loading: boolean;

  /**
   * The environment data.
   */
  environment?: Environment;

  private changeSub?: Subscription;

  /**
   * Creates a new instance of class SystemHealthEnvComponent.
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
      this.healthService.loadEnvironment(app)
        .then(content => this.environment = content)
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
    return Object.keys(obj);
  }

}
