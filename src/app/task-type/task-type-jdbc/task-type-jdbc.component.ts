import { Component, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective } from '@ngneat/transloco';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { editor } from 'monaco-editor'
import { TaskTypeFormComponent } from '../task-type-form.component';
import { TaskGroupService } from '../../api';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Task Type Form: Binary Search
 */
@Component({
  selector: 'dke-task-type-jdbc',
  standalone: true,
  imports: [
    InputNumberModule,
    InputTextModule,
    MonacoEditorModule,
    PaginatorModule,
    ReactiveFormsModule,
    TranslocoDirective
  ],
  templateUrl: './task-type-jdbc.component.html',
  styleUrl: './task-type-jdbc.component.scss'
})
export class TaskTypeJDBCComponent extends TaskTypeFormComponent<TaskTypeForm> implements OnChanges, OnDestroy {

  /**
   * The editor options.
   */
  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'java'
  };

  private sub?: Subscription;

  /**
   * Creates a new instance of class TaskTypeJDBCComponent.
   */
  constructor(private readonly taskGroupService: TaskGroupService) {
    super();
  }

  protected override initForm(): void {
    this.form.addControl('solution', new FormControl<number | null>(null, [Validators.required]));
  
    const tableListPattern = /^\s*[a-zA-Z_][a-zA-Z0-9_]*(\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)*\s*$/;
    const requiredPatternHint = this.translationService.translate('taskTypes.jdbc.errors.tables');
  
    this.form.addControl(
      'tables',
      new FormControl<string | null>(
        '',
        [
          Validators.required,
          this.patternValidator(tableListPattern, requiredPatternHint)
        ]
      )
    );
  }
  
  
  private patternValidator(regex: RegExp, requiredPatternHint: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
  
      if (value && !regex.test(value)) {
        return {
          pattern: {
            requiredPattern: requiredPatternHint
          }
        };
      }
  
      return null;
    };
  }  
  

  /**
   * Listens to input changes.
   *
   * @param changes The changes.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!('parentForm' in changes))
      return;

    this.sub?.unsubscribe();
    this.sub = changes['parentForm'].currentValue.controls.taskGroupId.valueChanges
      .pipe(distinctUntilChanged()).subscribe((val: number | null) => this.updateValidator(val));
  }

  /**
   * Unsubscribes from all subscriptions.
   */
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private async updateValidator(taskGroupId: number | null): Promise<void> {
    if (!taskGroupId)
      return;

    this.form.controls.solution.clearValidators();
    this.form.controls.solution.addValidators(Validators.required);
    try {
      const tg = await this.taskGroupService.get(taskGroupId);
      if (!tg.additionalData || tg.dto.taskGroupType !== 'jdbc')
        return;

      const min = tg.additionalData['minNumber'] as number;
      const max = tg.additionalData['maxNumber'] as number;
      const schema = tg.additionalData['schema'] as string;
      const tables = tg.additionalData['tables'] as string;
      this.form.controls.solution.addValidators(Validators.min(min));
      // this.form.controls.solution.addValidators(Validators.required(schema));
      this.form.controls.solution.addValidators(Validators.max(max));
      this.form.controls.solution.updateValueAndValidity();
    } catch (err) {
      // ignore
    }
  }

}


interface TaskTypeForm {
  solution: FormControl<number | null>;
  schema: FormControl<string | null>;
  tables: FormControl<string | null>;
}
