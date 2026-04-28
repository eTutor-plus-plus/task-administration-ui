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
  insertStatements = new FormArray<StatementFormGroup>([]);
  assertionStatements = new FormArray<StatementFormGroup>([]);

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
    this.form.addControl('assertionStatements', this.assertionStatements);
    this.form.addControl('tablePoints', new FormControl<number | null>(null));
    this.form.addControl('primaryKeyPoints', new FormControl<number | null>(null));
    this.form.addControl('foreignKeyPoints', new FormControl<number | null>(null));
    this.form.addControl('constraintPoints', new FormControl<number | null>(null));
    this.form.addControl('assertionPoints', new FormControl<number | null>(null));
  }

  addInsertStatement() {
    this.insertStatements.push(this.createStatementGroup());
  }

  addAssertionStatement() {
    this.assertionStatements.push(this.createStatementGroup());
  }

  removeInsertStatement(index: number) {
    this.insertStatements.removeAt(index);
  }

  removeAssertionStatement(index: number) {
    this.assertionStatements.removeAt(index);
  }

  private setSqlDdlData(dto: any) {
    this.setStatementData(this.insertStatements, dto?.insertStatements, true);
    this.setStatementData(this.assertionStatements, dto?.assertionStatements);
  }

  private createStatementGroup(entry?: any): StatementFormGroup {
    return new FormGroup({
      definition: new FormControl<string | null>(entry?.definition ?? ''),
      successfulStatements: new FormControl<string | null>(entry?.successfulStatements ?? entry?.insertStatements ?? ''),
      unsuccessfulStatements: new FormControl<string | null>(entry?.unsuccessfulStatements ?? '')
    });
  }

  private setStatementData(target: FormArray<StatementFormGroup>, data: unknown, allowLegacyString = false) {
    while (target.length !== 0) {
      target.removeAt(0);
    }

    if (Array.isArray(data)) {
      data.forEach((entry: any) => target.push(this.createStatementGroup(entry)));
      return;
    }

    // Relevant for loading old tasks where insertStatements was a string instead of an array.
    if (allowLegacyString && typeof data === 'string') {
      target.push(this.createStatementGroup({successfulStatements: data}));
    }
  }
}

type StatementFormGroup = FormGroup<{
  definition: FormControl<string | null>,
  successfulStatements: FormControl<string | null>,
  unsuccessfulStatements: FormControl<string | null>
}>;

interface TaskTypeForm {
  solution: FormControl<string | null>;
  whitelist: FormControl<string | null>;
  insertStatements: FormArray<StatementFormGroup>;
  assertionStatements: FormArray<StatementFormGroup>;
  tablePoints: FormControl<number | null>;
  primaryKeyPoints: FormControl<number | null>;
  foreignKeyPoints: FormControl<number | null>;
  constraintPoints: FormControl<number | null>;
  assertionPoints: FormControl<number | null>;
}
