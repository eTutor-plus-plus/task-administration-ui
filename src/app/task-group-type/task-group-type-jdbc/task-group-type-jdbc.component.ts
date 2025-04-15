import { Component } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective } from '@ngneat/transloco';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputGroupModule } from 'primeng/inputgroup';
import { ButtonModule } from 'primeng/button';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { editor } from 'monaco-editor';

import { TaskGroupTypeFormComponent } from '../task-group-type-form.component';
import { JDBCService } from './jdbc.service';

/**
 * Task Group Type Form: Binary Search
 */
@Component({
  selector: 'dke-task-group-type-jdbc',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputNumberModule,
    MonacoEditorModule,
    TranslocoDirective,
    InputGroupModule,
    ButtonModule
  ],
  templateUrl: './task-group-type-jdbc.component.html',
  styleUrl: './task-group-type-jdbc.component.scss'
})
export class TaskGroupTypeJDBCComponent extends TaskGroupTypeFormComponent<TaskGroupTypeForm> {

  /**
   * The editor options.
   */
  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'sql'
  };


  /**
   * Creates a new instance of class TaskGroupTypeJDBCComponent.
   */
  constructor(private readonly binSearchService: JDBCService) {
    super();
  }

  protected override initForm(): void {
    this.form.addControl('createStatements', new FormControl<string | null>(null, [Validators.required]));
    this.form.addControl('insertStatementsDiagnose', new FormControl<string | null>(null, [Validators.required]));
    this.form.addControl('insertStatementsSubmission', new FormControl<string | null>(null, [Validators.required]));
  }
  

  /**
   * Loads random numbers.
   */
  // async loadNumbers(): Promise<void> {
  //   try {
  //     this.startLoading();
  //     const minMax = await this.binSearchService.loadNewRandomNumbers();
  //     this.form.patchValue({
  //       minNumber: minMax.min,
  //       maxNumber: minMax.max
  //     });
  //   } catch (err) {
  //   } finally {
  //     this.finishLoading();
  //   }
  // }
}

interface TaskGroupTypeForm {
  createStatements: FormControl<string | null>;
  insertStatementsDiagnose: FormControl<string | null>;
  insertStatementsSubmission: FormControl<string | null>;
}
