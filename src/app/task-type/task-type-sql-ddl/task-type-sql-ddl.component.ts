import { Component } from '@angular/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { PaginatorModule } from 'primeng/paginator';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslocoDirective, TranslocoPipe } from '@ngneat/transloco';
import { ButtonModule } from 'primeng/button';
import { TreeSelectModule } from 'primeng/treeselect';
import { TaskTypeFormComponent } from '../task-type-form.component';
import { editor } from 'monaco-editor';
import { InputTextModule } from 'primeng/inputtext';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'dke-task-type-sql-ddl',
  standalone: true,
  imports: [
    MonacoEditorModule,
    PaginatorModule,
    TranslocoDirective,
    ButtonModule,
    TranslocoPipe,
    TreeSelectModule,
    InputTextModule,
    NgForOf,
    ReactiveFormsModule
  ],
  templateUrl: './task-type-sql-ddl.component.html',
  styleUrl: './task-type-sql-ddl.component.scss'
})


export class TaskTypeSqlDdlComponent extends TaskTypeFormComponent<TaskTypeForm> {
  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'sql'
  };

  constructor() {
    super();
  }

  override set formData(data: unknown) {
    super.formData = data;
  }

  protected override initForm(): void {
    this.form.addControl('solution', new FormControl<string | null>(null));
    this.form.addControl('insertStatements', new FormControl<string | null>(null));
    this.form.addControl('tablePoints', new FormControl<number | null>(null));
    this.form.addControl('columnPoints', new FormControl<number | null>(null));
    this.form.addControl('primaryKeyPoints', new FormControl<number | null>(null));
    this.form.addControl('foreignKeyPoints', new FormControl<number | null>(null));
    this.form.addControl('constraintPoints', new FormControl<number | null>(null));
  }


}


interface TaskTypeForm {
  solution: FormControl<string | null>;
  insertStatements: FormControl<string | null>;
  tablePoints: FormControl<number | null>;
  columnPoints: FormControl<number | null>;
  primaryKeyPoints: FormControl<number | null>;
  foreignKeyPoints: FormControl<number | null>;
  constraintPoints: FormControl<number | null>;
}
