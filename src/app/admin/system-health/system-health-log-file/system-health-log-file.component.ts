import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { distinctUntilChanged, Subscription } from 'rxjs';

import { MessageService } from 'primeng/api';
import { BlockUIModule } from 'primeng/blockui';
import { PanelModule } from 'primeng/panel';

import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { SystemHealthService } from '../../../api';
import { HealthSelectionService } from '../health-selection.service';

/**
 * Displays the log file.
 */
@Component({
  selector: 'dke-system-health-log-file',
  standalone: true,
  imports: [
    BlockUIModule,
    PanelModule,
    TranslocoPipe,
    MonacoEditorModule,
    FormsModule
  ],
  templateUrl: './system-health-log-file.component.html',
  styleUrl: './system-health-log-file.component.scss'
})
export class SystemHealthLogFileComponent implements OnInit, OnDestroy {

  /**
   * The loading state.
   */
  loading: boolean;

  /**
   * The logfile contents.
   */
  logFile: string;

  /**
   * The result editor options.
   */
  readonly options = {
    language: 'dke-log',
    theme: 'dke-log-light',
    minimap: {enabled: true},
    readOnly: true
  };

  private changeSub?: Subscription;

  /**
   * Creates a new instance of class SystemHealthLogFileComponent.
   */
  constructor(private readonly healthService: SystemHealthService,
              private readonly healthSelectionService: HealthSelectionService,
              private readonly messageService: MessageService,
              private readonly translationService: TranslocoService) {
    this.loading = false;
    this.logFile = '';
  }

  /**
   * Initializes the component.
   */
  ngOnInit(): void {
    this.changeSub = this.healthSelectionService.selectedAppChanged.pipe(distinctUntilChanged()).subscribe(app => {
      this.loading = true;
      this.healthService.loadLogFile(app)
        .then(content => this.logFile = content)
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
}
