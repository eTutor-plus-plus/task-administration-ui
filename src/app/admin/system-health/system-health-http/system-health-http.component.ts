import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslocoDirective, TranslocoService } from '@ngneat/transloco';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { Duration } from 'luxon';

import { MessageService, SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

import { HttpExchanges, SystemHealthService } from '../../../api';
import { HealthSelectionService } from '../health-selection.service';

/**
 * The component for displaying HTTP requests.
 */
@Component({
  selector: 'dke-system-health-http',
  standalone: true,
  imports: [
    DatePipe,
    SharedModule,
    TableModule,
    TranslocoDirective,
    ButtonModule
  ],
  templateUrl: './system-health-http.component.html',
  styleUrl: './system-health-http.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SystemHealthHttpComponent implements OnInit, OnDestroy {

  /**
   * The loading state.
   */
  loading: boolean;

  /**
   * The http requests
   */
  http?: HttpExchanges;

  private changeSub?: Subscription;

  /**
   * Creates a new instance of class SystemHealthHttpComponent.
   */
  constructor(private readonly healthService: SystemHealthService,
              private readonly healthSelectionService: HealthSelectionService,
              private readonly messageService: MessageService,
              private readonly translationService: TranslocoService,
              private readonly changeDetector: ChangeDetectorRef) {
    this.loading = false;
  }

  /**
   * Initializes the component.
   */
  ngOnInit(): void {
    this.changeSub = this.healthSelectionService.selectedAppChanged.pipe(distinctUntilChanged()).subscribe(app => {
      this.loading = true;
      this.changeDetector.markForCheck();

      this.healthService.loadHttpExchanges(app)
        .then(content => this.http = content)
        .catch(err => {
          this.messageService.add({severity: 'error', summary: this.translationService.translate('health.load-error'), detail: err.message, key: 'global'});
        })
        .finally(() => {
          this.loading = false;
          this.changeDetector.markForCheck();
        });
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

  /**
   * Converts the duration string to a human-readable string.
   *
   * @param duration The duration string.
   */
  convertDurationToString(duration: string): string {
    const dur = Duration.fromISO(duration);
    if (!dur.isValid)
      return '--';
    return dur.normalize().rescale().toHuman({unitDisplay: 'short'});
  }
}
