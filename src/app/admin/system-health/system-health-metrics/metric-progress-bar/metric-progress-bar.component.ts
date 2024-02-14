import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DecimalPipe, NgClass, NgStyle } from '@angular/common';
import { TranslocoDirective } from '@ngneat/transloco';

import { TooltipModule } from 'primeng/tooltip';

import { Metric } from '../../../../api';

/**
 * Displays a progress bar for a metric.
 */
@Component({
  selector: 'dke-metric-progress-bar',
  standalone: true,
  imports: [
    DecimalPipe,
    TranslocoDirective,
    TooltipModule,
    NgStyle,
    NgClass
  ],
  templateUrl: './metric-progress-bar.component.html',
  styleUrl: './metric-progress-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetricProgressBarComponent {

  /**
   * The translation key.
   */
  @Input({required: true}) translationKey!: string;

  /**
   * Whether to show the values.
   */
  @Input() showValues: boolean = false;

  /**
   * Whether to invert the percentage value.
   */
  @Input() invert: boolean = false;

  /**
   * The progress bar text color CSS class.
   */
  @Input() progressColorClass: string = 'text-green-700';

  /**
   * The progress bar color CSS class.
   */
  @Input() progressBackgroundColorClass: string = 'bg-green-700';

  /**
   * The part metric.
   */
  @Input({required: true}) partMetric?: Metric;

  /**
   * The total metric.
   */
  @Input() totalMetric?: Metric;

  /**
   * The statistic to use.
   */
  @Input() statistic: string = "VALUE";

  /**
   * Creates a new instance of class MetricProgressBarComponent.
   */
  constructor() {
  }

  /**
   * Calculates the percent value of two metrics.
   */
  calcPercent(): number {
    const measurement1 = this.partMetric?.measurements.find(x => x.statistic === this.statistic);
    const measurement2 = this.totalMetric?.measurements.find(x => x.statistic === this.statistic);
    if (!measurement2) {
      const val = measurement1?.value ?? 0;
      return val <= 1 ? val * 100 : val;
    }

    const val1 = measurement1?.value ?? 0;
    const val2 = measurement2?.value ?? 0;
    if (val2 === 0)
      return 0;

    const percent = (val1 / val2) * 100;
    return this.invert ? 100 - percent : percent;
  }

  /**
   * Converts the given bytes metric to a human-readable string.
   *
   * @param m The metric to convert.
   */
  convertBytes(m: Metric | undefined): string {
    if (!m)
      return '0';

    const value = m.measurements.find(x => x.statistic === this.statistic)?.value ?? 0;
    if (m.baseUnit !== 'bytes')
      return value.toString();

    const val = value / 1073741824;
    if (val > 1)
      return `${val.toFixed(2)} GB`;
    return `${(value / 1048576).toFixed(2)} MB`;
  }
}
