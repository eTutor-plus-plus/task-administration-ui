import { Component } from '@angular/core';
import { TaskGroupTypeFormComponent } from '../task-group-type-form.component';
import { editor } from 'monaco-editor';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'dke-task-group-type-mdx',
  standalone: true,
  imports: [],
  templateUrl: './task-group-type-mdx.component.html',
  styleUrl: './task-group-type-mdx.component.scss'
})
export class TaskGroupTypeMdxComponent extends TaskGroupTypeFormComponent<TaskGroupTypeForm> {

  /**
   * The editor options.
   */
  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'mdx'
  };

  /**
   * Creates a new instance of class TaskGroupTypeXqueryComponent.
   */
  constructor() {
    super();
  }

  protected override initForm(): void {
    this.form.addControl('ddlStatements', new FormControl<string | null>(null, [Validators.required, Validators.minLength(10)]));
    this.form.addControl('diagnoseDmlStatements', new FormControl<string | null>(null, [Validators.required, Validators.minLength(10)]));
    this.form.addControl('submitDmlStatements', new FormControl<string | null>(null, [Validators.required, Validators.minLength(10)]));
    this.form.addControl('submitOlapSchema', new FormControl<string | null>(null, [Validators.required, Validators.minLength(10)]));
  }
}

interface TaskGroupTypeForm {
  ddlStatements: FormControl<string | null>;
  diagnoseDmlStatements: FormControl<string | null>;
  submitDmlStatements: FormControl<string | null>;
  submitOlapSchema: FormControl<string | null>;
}
