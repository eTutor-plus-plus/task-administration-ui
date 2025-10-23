import { Component } from '@angular/core';
import { TaskTypeFormComponent } from '../task-type-form.component';
import { editor } from 'monaco-editor';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'dke-task-type-mdx',
  standalone: true,
  imports: [],
  templateUrl: './task-type-mdx.component.html',
  styleUrl: './task-type-mdx.component.scss'
})
export class TaskTypeMdxComponent extends TaskTypeFormComponent<TaskTypeForm> {
  /**
   * The editor options.
   */
  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'sql'
  };

  /**
   * Creates a new instance of class TaskTypeSqlComponent.
   */
  constructor() {
    super();
  }

  protected override initForm() {
    this.form.addControl('solution', new FormControl<string | null>(null, [Validators.required]));
    this.form.addControl('wrongOrderPenalty', new FormControl<number | null>(null, [Validators.required, Validators.min(-1)]));
    this.form.addControl('superfluousColumnsPenalty', new FormControl<number | null>(null, [Validators.required, Validators.min(-1)]));
  }

  protected override getFormDefaultValues(): Partial<{ [K in keyof TaskTypeForm]: any }> | undefined {
    return {
      wrongOrderPenalty: -1,
      superfluousColumnsPenalty: -1
    };
  }
}

interface TaskTypeForm {
  solution: FormControl<string | null>;
  wrongOrderPenalty: FormControl<number | null>,
  superfluousColumnsPenalty: FormControl<number | null>
}
