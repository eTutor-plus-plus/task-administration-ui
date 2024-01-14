import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { TranslocoDirective, TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { distinctUntilChanged, Subscription } from 'rxjs';

import { MessageService, SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';

import { Health, SystemHealthService } from '../../../api';
import { HealthSelectionService } from '../health-selection.service';

/**
 * Default system health page.
 */
@Component({
  selector: 'dke-system-health-default',
  standalone: true,
  imports: [
    TranslocoDirective,
    SharedModule,
    NgClass,
    TranslocoPipe,
    ButtonModule,
    OverlayPanelModule
  ],
  templateUrl: './system-health-default.component.html',
  styleUrl: './system-health-default.component.scss'
})
export class SystemHealthDefaultComponent implements OnInit, OnDestroy {

  /**
   * The health information.
   */
  health?: Health;

  private changeSub?: Subscription;

  /**
   * Creates a new instance of class SystemHealthDefaultComponent.
   */
  constructor(private readonly healthService: SystemHealthService,
              private readonly healthSelectionService: HealthSelectionService,
              private readonly messageService: MessageService,
              private readonly translationService: TranslocoService) {
  }

  /**
   * Initializes the component.
   */
  ngOnInit(): void {
    this.changeSub = this.healthSelectionService.selectedAppChanged.pipe(distinctUntilChanged()).subscribe(app => {
      this.healthService.loadHealth(app)
        .then(content => this.health = content)
        .catch(err => {
          this.messageService.add({severity: 'error', summary: this.translationService.translate('health.load-error'), detail: err.message, key: 'global'});
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
   * Returns the properties of the given object.
   *
   * @param obj The object.
   */
  getProperties(obj?: object): string[] {
    return obj ? Object.keys(obj) : [];
  }

  /**
   * Returns the readable value of the given property of the given object.
   *
   * @param component The component.
   * @param value The raw value.
   */
  toReadableValue(component: string, value: any): string {
    if (component === 'diskSpace' && typeof value === 'number') {
      const val = value / 1073741824;
      if (val > 1)
        return `${val.toFixed(2)} GB`;
      return `${(value / 1048576).toFixed(2)} MB`;
    }
    if (typeof value === 'object')
      return JSON.stringify(value);
    return value;
  }

}
