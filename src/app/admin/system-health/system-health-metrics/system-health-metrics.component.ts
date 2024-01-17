import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { TranslocoDirective, TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { DecimalPipe, NgStyle } from '@angular/common';
import { distinctUntilChanged, Subject, Subscription, takeUntil, timer } from 'rxjs';

import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

import { Metric, SystemHealthService } from '../../../api';
import { HealthSelectionService } from '../health-selection.service';
import { MetricProgressBarComponent } from './metric-progress-bar/metric-progress-bar.component';
import { MetricValueComponent } from './metric-value/metric-value.component';

/**
 * Metrics information page
 */
@Component({
  selector: 'dke-system-health-metrics',
  standalone: true,
  imports: [
    TranslocoDirective,
    TranslocoPipe,
    CardModule,
    DecimalPipe,
    NgStyle,
    TooltipModule,
    MetricProgressBarComponent,
    MetricValueComponent,
    TableModule
  ],
  templateUrl: './system-health-metrics.component.html',
  styleUrl: './system-health-metrics.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SystemHealthMetricsComponent implements OnInit, OnDestroy {

  /**
   * The metric map.
   */
  readonly metrics: Map<string, Metric>;

  /**
   * The http status metrics.
   */
  httpStatusMetrics: { status: string, count: number, sum: number, max: number }[];

  /**
   * The http uri metrics.
   */
  httpUriMetrics: { uri: string, count: number, sum: number, max: number }[];

  private readonly destroy$ = new Subject<void>();
  private app: string;
  private availableMetrics: string[];

  /**
   * Creates a new instance of class SystemHealthDefaultComponent.
   */
  constructor(private readonly healthService: SystemHealthService,
              private readonly healthSelectionService: HealthSelectionService,
              private readonly messageService: MessageService,
              private readonly translationService: TranslocoService,
              private readonly changeDetector: ChangeDetectorRef) {
    this.metrics = new Map<string, Metric>();
    this.httpStatusMetrics = [];
    this.httpUriMetrics = [];
    this.availableMetrics = [];
    this.app = '';
  }

  /**
   * Initializes the component.
   */
  ngOnInit(): void {
    this.healthSelectionService.selectedAppChanged.pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(app => this.loadAvailableMetrics(app));
    timer(10000, 10000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadMetrics());
  }

  /**
   * Cleans up the component.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadAvailableMetrics(app: string): Promise<void> {
    // Load metrics
    try {
      this.app = app;
      this.availableMetrics = await this.healthService.loadMetrics(app);
    } catch (err) {
      this.messageService.add({
        severity: 'error',
        summary: this.translationService.translate('health.load-error'),
        detail: (err as any)?.message,
        key: 'global'
      });
    }

    // Load metric details
    await this.loadMetrics();
  }

  private async loadMetrics(): Promise<void> {
    for (const metric of this.availableMetrics) {
      try {
        const details = await this.healthService.loadMetric(metric, this.app);
        this.metrics.set(metric, details);

        if (metric === 'jvm.threads.states') {
          for (const tag of details.availableTags) {
            for (const val of tag.values) {
              const tagDetails = await this.healthService.loadMetric(metric, this.app, tag.tag, val);
              this.metrics.set(metric + '.' + tag.tag + '.' + val, tagDetails);
            }
          }
        }
        if (metric === 'http.server.requests') {
          for (const tag of details.availableTags) {
            if (tag.tag !== 'uri' && tag.tag !== 'status')
              continue;

            for (const val of tag.values) {
              const tagDetails = await this.healthService.loadMetric(metric, this.app, tag.tag, val);
              if (tag.tag === 'status')
                this.httpStatusMetrics.push({
                  status: val,
                  count: tagDetails.measurements.find(x => x.statistic === 'COUNT')?.value ?? 0,
                  sum: tagDetails.measurements.find(x => x.statistic === 'TOTAL_TIME')?.value ?? 0,
                  max: tagDetails.measurements.find(x => x.statistic === 'MAX')?.value ?? 0
                });
              else if (tag.tag === 'uri' && !val.startsWith('/actuator'))
                this.httpUriMetrics.push({
                  uri: val,
                  count: tagDetails.measurements.find(x => x.statistic === 'COUNT')?.value ?? 0,
                  sum: tagDetails.measurements.find(x => x.statistic === 'TOTAL_TIME')?.value ?? 0,
                  max: tagDetails.measurements.find(x => x.statistic === 'MAX')?.value ?? 0
                });
            }
          }
        }
      } catch (err) {
        // ignore
      }
      this.httpStatusMetrics = this.httpStatusMetrics.sort((a, b) => a.status.localeCompare(b.status));
      this.httpUriMetrics = this.httpUriMetrics.sort((a, b) => a.uri.localeCompare(b.uri));
    }

    this.changeDetector.markForCheck();
  }

}
