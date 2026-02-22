import { Component } from '@angular/core';
import { PaginatorModule } from 'primeng/paginator';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { editor } from 'monaco-editor';
import { TaskGroupTypeFormComponent } from '../task-group-type-form.component';
import { TranslocoDirective, TranslocoPipe } from '@ngneat/transloco';
import { EditorComponent } from 'ngx-monaco-editor-v2';
import { NgForOf, NgIf } from '@angular/common';
import { Button } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TaskGroupDetailsDto, TaskGroupService } from '../../api';

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
    EditorComponent,
    NgForOf,
    Button,
    NgIf,
    InputTextModule,
    TranslocoPipe
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
  constructor(private readonly fb: FormBuilder, private readonly taskGroupService: TaskGroupService) {
    super();
  }

  ngOnInit(): void {
    const taskGroupId = this.taskGroup?.id;
    if (taskGroupId != null) {
      this.taskGroupService.get(taskGroupId).then(
        (tg: TaskGroupDetailsDto) => {
          if (tg.additionalData) {
            this.form.patchValue(tg.additionalData);
            const declare = (tg.additionalData as any)['declareStmt'];
            if (declare) {
              if (Array.isArray(declare)) {
                const items = declare.map((it: any) => ({
                  statementName: it?.statementName ?? null,
                  statement: it?.statement ?? null
                }));
                this.loadDeclareStmts(items);
              } else if (typeof declare === 'object') {
                const it = declare as any;
                this.loadDeclareStmts([{
                  statementName: it?.statementName ?? null,
                  statement: it?.statement ?? null
                }]);
              }
            }
          }
        }
      );
    }
  }

  public asFormControl(control: AbstractControl | null): FormControl {
    return control as FormControl;
  }

  protected override initForm(): void {
    this.form.addControl('maxPoints', new FormControl<string | null>(null, [Validators.required]));
    this.form.addControl('superfluousAttributesPenalty', new FormControl<number | null>(null, [Validators.required]));
    this.form.addControl('superfluousStatementsPenalty', new FormControl<number | null>(null, [Validators.required]));
    this.form.addControl('ddlStatements', new FormControl<string | null>(null, [Validators.minLength(10)]));
    this.form.addControl('diagnoseDmlStatements', new FormControl<string | null>(null, [Validators.minLength(10)]));
    this.form.addControl('submitDmlStatements', new FormControl<string | null>(null, [Validators.minLength(10)]));
    this.form.addControl('declareStmt', this.fb.array<FormGroup>([]));
  }

  private createDeclareStmtGroup(): FormGroup {
    return this.fb.group({
      statementName: new FormControl<string | null>(null),
      statement: new FormControl<string | null>(null)
    });
  }

  public addDeclareStmtEntry(): void {
    this.declareStmt.push(this.createDeclareStmtGroup());
  }

  public removeDeclareStmtEntry(index: number): void {
    if (index >= 0 && index < this.declareStmt.length) {
      this.declareStmt.removeAt(index);
    }
  }

  get declareStmt(): FormArray<FormGroup> {
    return this.form.get('declareStmt') as FormArray<FormGroup>;
  }

  public loadDeclareStmts(declareStmt: Array<{ statementName: string; statement: string }>): void {
    const declareStmtFormGroups = declareStmt.map(declareStmt => this.fb.group({
      statementName: new FormControl<string | null>(declareStmt.statementName),
      statement: new FormControl<string | null>(declareStmt.statement)
    }));
    const declareStmtFormArray = this.fb.array<FormGroup>(declareStmtFormGroups);
    this.form.setControl('declareStmt', declareStmtFormArray);
  }
}

interface TaskGroupTypeForm {
  maxPoints: FormControl<string | null>;
  superfluousAttributesPenalty: FormControl<number | null>;
  superfluousStatementsPenalty: FormControl<number | null>;
  ddlStatements: FormControl<string | null>;
  diagnoseDmlStatements: FormControl<string | null>;
  submitDmlStatements: FormControl<string | null>;
  declareStmt: FormArray<FormGroup>;
  statementName: FormControl<string | null>;
  statement: FormControl<string | null>;
}
