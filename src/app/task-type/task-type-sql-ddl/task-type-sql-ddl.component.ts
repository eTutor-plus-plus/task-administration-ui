import { Component } from '@angular/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { PaginatorModule } from 'primeng/paginator';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslocoDirective, TranslocoPipe } from '@ngneat/transloco';
import { ButtonModule } from 'primeng/button';
import { TreeSelectModule } from 'primeng/treeselect';
import { TaskTypeFormComponent } from '../task-type-form.component';
import { editor } from 'monaco-editor';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
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
    InputTextareaModule,
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
  insertStatements = new FormArray<FormGroup<{ name: FormControl<string | null>, insertStatements: FormControl<string | null> }>>([]);

  constructor() {
    super();
  }

  override set formData(data: unknown) {
    super.formData = data;
    this.setSqlDdlData(data);
  }

  protected override initForm(): void {
    this.form.addControl('solution', new FormControl<string | null>(null));
    this.form.addControl('whitelist', new FormControl<string | null>(null));
    this.form.addControl('insertStatements', this.insertStatements);
    this.form.addControl('tablePoints', new FormControl<number | null>(null));
    this.form.addControl('primaryKeyPoints', new FormControl<number | null>(null));
    this.form.addControl('foreignKeyPoints', new FormControl<number | null>(null));
    this.form.addControl('constraintPoints', new FormControl<number | null>(null));
  }

  addInsertStatement() {
    this.insertStatements.push(new FormGroup({
      name: new FormControl<string | null>(''),
      insertStatements: new FormControl<string | null>('')
    }));
  }

  removeInsertStatement(index: number) {
    this.insertStatements.removeAt(index);
  }

  private setSqlDdlData(dto: any) {
    while (this.insertStatements.length !== 0) {
      this.insertStatements.removeAt(0);
    }

    const insertStatements = dto?.insertStatements;
    if (Array.isArray(insertStatements)) {
      insertStatements.forEach((entry: any) => {
        this.insertStatements.push(new FormGroup({
          name: new FormControl<string | null>(entry?.name ?? ''),
          insertStatements: new FormControl<string | null>(entry?.insertStatements ?? '')
        }));
      });
      return;
    }

    //relevant if you want to load old tasks where insertStatements was a string not an array
    if (typeof insertStatements === 'string') {
      this.insertStatements.push(new FormGroup({
        name: new FormControl<string | null>(''),
        insertStatements: new FormControl<string | null>(insertStatements)
      }));
    }
  }

}


interface TaskTypeForm {
  solution: FormControl<string | null>;
  whitelist: FormControl<string | null>;
  insertStatements: FormArray<FormGroup<{ name: FormControl<string | null>, insertStatements: FormControl<string | null> }>>;
  tablePoints: FormControl<number | null>;
  primaryKeyPoints: FormControl<number | null>;
  foreignKeyPoints: FormControl<number | null>;
  constraintPoints: FormControl<number | null>;
}
