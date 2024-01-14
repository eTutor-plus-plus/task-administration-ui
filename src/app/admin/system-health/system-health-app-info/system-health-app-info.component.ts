import { Component, OnDestroy, OnInit } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { TranslocoDirective, TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { distinctUntilChanged, Subscription } from 'rxjs';

import { MessageService } from 'primeng/api';

import { AppInfo, SystemHealthService } from '../../../api';
import { HealthSelectionService } from '../health-selection.service';

/**
 * App information page
 */
@Component({
  selector: 'dke-system-health-app-info',
  standalone: true,
  imports: [
    TranslocoDirective,
    TranslocoPipe,
    NgClass,
    DatePipe
  ],
  templateUrl: './system-health-app-info.component.html',
  styleUrl: './system-health-app-info.component.scss'
})
export class SystemHealthAppInfoComponent implements OnInit, OnDestroy {

  /**
   * The app information.
   */
  info?: AppInfo;

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
      this.healthService.loadAppInfo(app)
        .then(content => this.info = content)
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

}
