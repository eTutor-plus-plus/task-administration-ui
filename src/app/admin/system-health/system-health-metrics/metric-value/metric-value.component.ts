import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TranslocoDirective, TranslocoService } from '@ngneat/transloco';

import { TooltipModule } from 'primeng/tooltip';

import { Metric } from '../../../../api';
import { DateTime, Duration } from 'luxon';

/**
 * Displays a metric value.
 */
@Component({
  selector: 'dke-metric-value',
  standalone: true,
  imports: [
    DecimalPipe,
    TooltipModule,
    TranslocoDirective
  ],
  templateUrl: './metric-value.component.html',
  styleUrl: './metric-value.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetricValueComponent {

  /**
   * The translation key.
   */
  @Input({required: true}) translationKey!: string;

  /**
   * The part metric.
   */
  @Input({required: true}) metric?: Metric;

  /**
   * The statistic to use.
   */
  @Input() statistic: string = 'VALUE';

  /**
   * Creates a new instance of class MetricValueComponent.
   */
  constructor(private readonly translationService: TranslocoService) {
  }

  /**
   * Returns the value of the metric.
   */
  getValue(): string {
    const measurement = this.metric?.measurements.find(x => x.statistic === this.statistic);
    const value = measurement?.value ?? 0;
    const locale = this.translationService.getActiveLang() === 'de' ? 'de-AT' : 'en-GB';

    switch (this.metric?.baseUnit) {
      case 'seconds':
        // check if value is a duration or a timestamp
        if (value > 1000000000) {
          const date = DateTime.fromSeconds(value).setLocale(locale);
          return date.toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);
        }

        const dur = Duration.fromObject({seconds: value}, {locale: locale, numberingSystem: 'latn'});
        return dur.shiftTo('months', 'days', 'hours', 'minutes', 'seconds')
          .normalize().rescale()
          .toHuman({unitDisplay: 'short'});

      case 'bytes':
        const val = value / 1073741824;
        if (val > 1)
          return `${val.toFixed(2)} GB`;
        return `${(value / 1048576).toFixed(2)} MB`;

      case 'percent':
        return (new DecimalPipe(locale).transform(value * 100, '1.0-2') ?? '') + ' %';
    }
    return new DecimalPipe(locale).transform(value, '1.0-2') ?? '';
  }

}
