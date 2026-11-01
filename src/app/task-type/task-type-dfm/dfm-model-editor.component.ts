import { Component, inject, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslocoDirective, TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { editor } from 'monaco-editor';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { getValidationErrorMessage } from '../../api';
import { DfmGraph, DfmParseError } from './dfm-graph.model';
import { DfmGraphComponent } from './dfm-graph.component';
import { DfmService } from './dfm.service';

/**
 * The state of the graph preview of a DFM editor.
 */
export interface DfmPreview {
  loading: boolean;
  /** The model the preview was created for. */
  source: string | null;
  graph: DfmGraph | null;
  error: { message: string; line: number | null; column: number | null } | null;
}

export type DfmModelKind = 'solution' | 'submodel';

const TRANSLATION_KEYS: Record<DfmModelKind, { field: string; clear: string; copy: string; check: string }> = {
  solution: {
    field: 'taskTypes.dfm.fields.solution',
    clear: 'taskTypes.dfm.fields.clearSolution',
    copy: 'taskTypes.dfm.fields.copySolution',
    check: 'taskTypes.dfm.fields.checkSolution'
  },
  submodel: {
    field: 'taskTypes.dfm.fields.subtree',
    clear: 'taskTypes.dfm.fields.clearSubmodel',
    copy: 'taskTypes.dfm.fields.copySubmodel',
    check: 'taskTypes.dfm.fields.checkSubmodel'
  }
};

/**
 * Editor for a DFM model (solution or submodel) with actions to clear, copy and check it
 * and a graph preview of the checked model.
 */
@Component({
  selector: 'dke-dfm-model-editor',
  standalone: true,
  imports: [
    ButtonModule,
    DfmGraphComponent,
    MonacoEditorModule,
    ReactiveFormsModule,
    TooltipModule,
    TranslocoDirective,
    TranslocoPipe
  ],
  templateUrl: './dfm-model-editor.component.html',
  styleUrl: './dfm-model-editor.component.scss'
})
export class DfmModelEditorComponent {

  /** The control containing the DFM model. */
  @Input({required: true}) control!: FormControl<string | null>;

  /** The id of the editor. */
  @Input({required: true}) inputId!: string;

  /** Determines the labels of the editor. */
  @Input() kind: DfmModelKind = 'solution';

  /** The initial height of the editor in pixels. The user can resize the editor. */
  @Input() height = 300;

  /** Whether the surrounding form is currently loading data. */
  @Input() loading = false;

  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'plaintext',
    minimap: {enabled: false},
    automaticLayout: true,
    scrollBeyondLastLine: false,
    wordWrap: 'on'
  };

  readonly preview: DfmPreview = createPreview();

  private readonly translationService = inject(TranslocoService);
  private readonly messageService = inject(MessageService);
  private readonly dfmService = inject(DfmService);

  get keys(): { field: string; clear: string; copy: string; check: string } {
    return TRANSLATION_KEYS[this.kind];
  }

  getError(): string {
    return getValidationErrorMessage(this.translationService, this.control, this.keys.field);
  }

  clear(): void {
    this.control.setValue('');
    this.control.markAsDirty();
    this.dismiss();
  }

  async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.control.value ?? '');
    } catch (error) {
      console.error('[DfmModelEditorComponent] Could not copy text to clipboard', error);
      this.showError('taskTypes.dfm.errors.copyToClipboard');
    }
  }

  async check(): Promise<void> {
    const source = this.control.value;
    if (!source?.trim() || this.preview.loading)
      return;

    this.preview.loading = true;
    this.preview.source = source;
    this.preview.error = null;
    try {
      this.preview.graph = await this.dfmService.parse(source);
    } catch (error) {
      this.preview.graph = null;
      this.preview.error = error instanceof DfmParseError
        ? {message: error.message, line: error.line, column: error.column}
        : {message: this.translationService.translate('taskTypes.dfm.errors.preview'), line: null, column: null};
    } finally {
      this.preview.loading = false;
    }
  }

  /**
   * Hides the preview.
   */
  dismiss(): void {
    Object.assign(this.preview, createPreview());
  }

  async download(graphComponent: DfmGraphComponent): Promise<void> {
    try {
      await graphComponent.downloadPng();
    } catch (error) {
      console.error('[DfmModelEditorComponent] Could not download DFM preview as PNG', error);
      this.showError('taskTypes.dfm.errors.downloadPng');
    }
  }

  private showError(translationKey: string): void {
    this.messageService.add({
      severity: 'error',
      detail: this.translationService.translate(translationKey),
      key: 'global'
    });
  }
}

function createPreview(): DfmPreview {
  return {loading: false, source: null, graph: null, error: null};
}
