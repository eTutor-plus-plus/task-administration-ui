import { Component } from '@angular/core';
import { TaskTypeFormComponent } from '../task-type-form.component';
import { editor } from 'monaco-editor';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {EditorComponent} from "ngx-monaco-editor-v2";
import {InputNumberModule} from "primeng/inputnumber";
import {PaginatorModule} from "primeng/paginator";
import { TranslocoDirective, TranslocoPipe } from '@ngneat/transloco';
import { ButtonModule } from 'primeng/button';
import { TreeSelectModule } from 'primeng/treeselect';
import { InputTextModule } from 'primeng/inputtext';
import { NgForOf } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'dke-task-type-mdx',
  standalone: true,
    imports: [
        EditorComponent,
        InputNumberModule,
        PaginatorModule,
        ReactiveFormsModule,
        TranslocoDirective,
        ButtonModule,
        TranslocoPipe,
        TreeSelectModule,
        InputTextModule,
        NgForOf,
        CheckboxModule
    ],
  templateUrl: './task-type-mdx.component.html',
  styleUrl: './task-type-mdx.component.scss'
})
export class TaskTypeMdxComponent extends TaskTypeFormComponent<TaskTypeForm> {
  /**
   * The editor options.
   */
  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'mdx'
  };

  solutions = new FormArray<FormGroup<any>>([]);

  /**
   * Creates a new instance of class TaskTypeSqlComponent.
   */
  constructor() {
    super();
  }

  protected override initForm() {
    this.solutions.setValidators([Validators.required, Validators.minLength(1)]);
    this.solutions.updateValueAndValidity();
    this.form.addControl('solutions', this.solutions);
    this.form.addControl('wrongOrderPenalty', new FormControl<number | null>(null, [Validators.required, Validators.min(0)]));
    this.form.addControl('wrongFormatPenalty', new FormControl<number | null>(null, [Validators.required, Validators.min(0)]));
  }


  addSolution() {
    this.solutions.push(new FormGroup({
      name: new FormControl<string | null>(null, Validators.required),
      points: new FormControl<number | null>(0, Validators.required),
      mdx: new FormControl<string | null>(null, Validators.required)
    }));
  }

  removeSolution(i: number) {
    this.solutions.removeAt(i);
  }

  protected override onOriginalDataChanged(originalData: unknown | undefined): void {
    if (!this.form || !originalData) return;

    const data = originalData as {
      solutions: { name: string; points: number; mdx: string }[];
      wrongOrderPenalty: number;
      wrongFormatPenalty: number;
    };

    this.solutions.clear();

    for (const sol of data.solutions) {
      this.solutions.push(
        new FormGroup({
          name: new FormControl(sol.name, Validators.required),
          points: new FormControl(sol.points, Validators.required),
          mdx: new FormControl(sol.mdx, Validators.required)
        })
      );
    }
  }

  protected override getFormDefaultValues(): Partial<{ [K in keyof TaskTypeForm]: any }> | undefined {
    return {
      wrongOrderPenalty: 0,
      wrongFormatPenalty: 0
    };
  }
}



interface TaskTypeForm {
  solutions: FormArray<FormGroup>;
  wrongOrderPenalty: FormControl<number | null>,
  wrongFormatPenalty: FormControl<number | null>
}
