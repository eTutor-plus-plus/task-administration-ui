import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@ngneat/transloco';

import { MessageService } from 'primeng/api';
import { BlockUIModule } from 'primeng/blockui';
import { PanelModule } from 'primeng/panel';

import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { SystemHealthService } from '../../../api';

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
export class SystemHealthLogFileComponent implements OnInit, AfterViewInit {

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

  /**
   * Creates a new instance of class SystemHealthLogFileComponent.
   */
  constructor(private readonly healthService: SystemHealthService,
              private readonly messageService: MessageService) {
    this.loading = false;
    this.logFile = '';
  }

  ngAfterViewInit(): void {
    console.warn((window as any).monaco?.languages.getLanguages());
  }

  /**
   * Initializes the component.
   */
  ngOnInit(): void {
    this.logFile = 'INFO';
    this.loading = true;
    this.healthService.loadLogFile()
      .then(content => this.logFile = content)
      .catch(err => {
        this.messageService.add({severity: 'error', summary: 'Error', detail: err.message});
      })
      .finally(() => this.loading = false);
  }
}
