import { Component } from '@angular/core';
import { PaginatorModule } from "primeng/paginator";
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { editor } from 'monaco-editor';
import { TaskGroupTypeFormComponent } from '../task-group-type-form.component';
import { TranslocoDirective } from '@ngneat/transloco';
import {EditorComponent} from "ngx-monaco-editor-v2";

/**
 * Task Group Type Form: Intensional Schema
 */
@Component({
  selector: 'dke-task-group-type-intensional-schema',
  standalone: true,
    imports: [
        PaginatorModule,
        ReactiveFormsModule,
        TranslocoDirective,
        EditorComponent
    ],
  templateUrl: './task-group-type-intensional-schema.component.html',
  styleUrl: './task-group-type-intensional-schema.component.scss'
})
export class TaskGroupTypeIntensionalSchemaComponent extends TaskGroupTypeFormComponent<TaskGroupTypeForm> {

  /**
   * The editor options.
   */
  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'sql'
  };

  /**
   * Creates a new instance of class TaskGroupTypeIntensionalSchemaComponent.
   */
  constructor() {
    super();
  }

  protected override initForm(): void {
    this.form.addControl('maxPoints', new FormControl<string | null>(null, [Validators.required, Validators.minLength(10)]));
    this.form.addControl('ddlStatements', new FormControl<string | null>(null, [Validators.required, Validators.minLength(10)]));
    this.form.addControl('diagnoseDmlStatements', new FormControl<string | null>(null, [Validators.required, Validators.minLength(10)]));
    this.form.addControl('submitDmlStatements', new FormControl<string | null>(null, [Validators.required, Validators.minLength(10)]));
  }
}

interface TaskGroupTypeForm {
  maxPoints: FormControl<string | null>;
  ddlStatements: FormControl<string | null>;
  diagnoseDmlStatements: FormControl<string | null>;
  submitDmlStatements: FormControl<string | null>;
}
