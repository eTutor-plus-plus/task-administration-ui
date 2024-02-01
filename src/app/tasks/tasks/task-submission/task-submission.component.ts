import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective, TranslocoPipe, TranslocoService } from '@ngneat/transloco';

import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { editor } from 'monaco-editor';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';

import { TaskService } from '../../../api';
import { TaskTypeRegistry } from '../../../task-type';

/**
 * Form for submitting a task.
 */
@Component({
  selector: 'dke-task-submission',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    TranslocoDirective,
    DropdownModule,
    ButtonModule,
    TranslocoPipe,
    MonacoEditorModule,
    FormsModule
  ],
  templateUrl: './task-submission.component.html',
  styleUrl: './task-submission.component.scss'
})
export class TaskSubmissionComponent implements OnInit {
  /**
   * The form.
   */
  readonly form: FormGroup<SubmitForm>;

  /**
   * The editor options.
   */
  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'json'
  };

  /**
   * The result editor options.
   */
  readonly resultEditorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'json',
    readOnly: true
  };

  /**
   * The supported languages.
   */
  languages: { label: string, value: string }[];

  /**
   * The supported feedback levels.
   */
  feedbackLevels: { label: string, value: number }[];

  /**
   * The supported modes.
   */
  modes: string[];

  /**
   * Whether the submission is currently loading.
   */
  loading: boolean;

  /**
   * Whether the task is a simple input task.
   */
  readonly isSimpleInput: boolean;

  /**
   * The grading result.
   */
  gradingResult?: string;

  /**
   * Creates a new instance of class TaskSubmissionComponent.
   */
  constructor(private readonly dialogConf: DynamicDialogConfig,
              private readonly dialogRef: DynamicDialogRef,
              private readonly taskService: TaskService,
              private readonly translateService: TranslocoService) {
    this.form = new FormGroup({
      language: new FormControl<string | null>(this.translateService.getActiveLang(), [Validators.required]),
      mode: new FormControl<string | null>('DIAGNOSE', [Validators.required]),
      feedbackLevel: new FormControl<number | null>(3, [Validators.required]),
      submission: new FormControl<string | null>(TaskTypeRegistry.getSubmissionTemplate(this.dialogConf.data.taskType) ?? '{"submission": ""}', [Validators.required])
    });
    this.loading = false;
    this.languages = [];
    this.feedbackLevels = [];
    this.modes = ['RUN', 'DIAGNOSE', 'SUBMIT'];
    const inputLang = TaskTypeRegistry.getSubmissionInputLanguage(this.dialogConf.data.taskType);
    this.isSimpleInput = inputLang !== undefined;
    this.editorOptions.language = inputLang ?? 'json';
  }

  /**
   * Initializes the component.
   */
  ngOnInit(): void {
    this.languages = [
      {value: 'en', label: this.translateService.translate('language.english')},
      {value: 'de', label: this.translateService.translate('language.german')}
    ];
    this.feedbackLevels = [
      {value: 0, label: this.translateService.translate('feedbackLevel.0')},
      {value: 1, label: this.translateService.translate('feedbackLevel.1')},
      {value: 2, label: this.translateService.translate('feedbackLevel.2')},
      {value: 3, label: this.translateService.translate('feedbackLevel.3')},
    ];
  }

  /**
   * Closes the dialog.
   */
  cancel(): void {
    this.dialogRef.close();
  }

  /**
   * Submits the submission.
   */
  async submit(): Promise<void> {
    if (this.form.invalid)
      return;

    try {
      this.loading = true;
      let submission: any;
      if (this.isSimpleInput) {
        submission = {
          input: this.form.value.submission
        };
      } else {
        submission = JSON.parse(this.form.value.submission ?? '{}');
      }

      const result = await this.taskService.submit({
        taskId: this.dialogConf.data.taskId,
        language: this.form.value.language!,
        mode: this.form.value.mode!,
        feedbackLevel: this.form.value.feedbackLevel!,
        submission: submission
      });
      this.gradingResult = JSON.stringify(JSON.parse(result), null, 2);
    } catch (err) {
      console.error('[TaskSubmissionComponent] Could not send submission', err);
      this.gradingResult = JSON.stringify(err, null, 2);
    } finally {
      this.loading = false;
    }
  }
}

interface SubmitForm {
  language: FormControl<string | null>;
  mode: FormControl<string | null>;
  feedbackLevel: FormControl<number | null>;
  submission: FormControl<string | null>;
}
