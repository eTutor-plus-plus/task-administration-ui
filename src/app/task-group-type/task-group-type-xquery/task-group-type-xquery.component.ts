import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective } from '@ngneat/transloco';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { editor } from 'monaco-editor';

import { TaskGroupTypeFormComponent } from '../task-group-type-form.component';
import { XqueryService } from './xquery.service';
import { TaskGroupDto } from '../../api';

/**
 * Task Group Type Form: XQuery
 */
@Component({
  selector: 'dke-task-group-type-xquery',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslocoDirective,
    MonacoEditorModule
  ],
  templateUrl: './task-group-type-xquery.component.html',
  styleUrl: './task-group-type-xquery.component.scss'
})
export class TaskGroupTypeXqueryComponent extends TaskGroupTypeFormComponent<TaskGroupTypeForm> {

  /**
   * The editor options.
   */
  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'xml'
  };

  /**
   * The public URL to the diagnose-document.
   */
  publicUrl?: string;

  /**
   * Creates a new instance of class TaskGroupTypeXqueryComponent.
   */
  constructor(private readonly xqueryService: XqueryService) {
    super();
  }

  protected override initForm(): void {
    this.form.addControl('diagnoseDocument', new FormControl<string | null>(null, [Validators.required, Validators.minLength(4)]));
    this.form.addControl('submitDocument', new FormControl<string | null>(null, [Validators.required, Validators.minLength(4)]));
  }

  protected override onTaskGroupChanged(taskGroup: TaskGroupDto | undefined) {
    if (!taskGroup) {
      this.publicUrl = undefined;
      return;
    }

    this.startLoading();
    this.xqueryService.loadDiagnoseDocument(taskGroup.id)
      .then(url => this.publicUrl = url)
      .catch(error => this.publicUrl = undefined)
      .finally(() => this.finishLoading());
  }
}

interface TaskGroupTypeForm {
  diagnoseDocument: FormControl<string | null>;
  submitDocument: FormControl<string | null>;
}
