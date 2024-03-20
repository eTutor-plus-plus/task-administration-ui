import { Component, DestroyRef, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoDirective } from '@ngneat/transloco';
import { editor } from 'monaco-editor';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { TaskTypeFormComponent } from '../task-type-form.component';
import { GradingStrategy } from './grading-strategy.enum';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';

/**
 * Task Type Form: Datalog
 */
@Component({
  selector: 'dke-task-type-datalog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslocoDirective,
    MonacoEditorModule,
    DropdownModule,
    InputNumberModule
  ],
  templateUrl: './task-type-datalog.component.html',
  styleUrl: './task-type-datalog.component.scss'
})
export class TaskTypeDatalogComponent extends TaskTypeFormComponent<TaskTypeForm> implements OnInit {
  /**
   * The XQuery editor options.
   */
  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'datalog'
  };

  /**
   * The available grading strategies.
   */
  strategies: { value: GradingStrategy, text: string }[];

  /**
   * Creates a new instance of class TaskTypeDatalogComponent.
   */
  constructor(private readonly destroy: DestroyRef) {
    super();
    this.strategies = [];
  }

  /**
   * Initializes the component.
   */
  ngOnInit(): void {
    // Listen to language changes
    this.translationService.langChanges$
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe(() => {
        this.strategies = [
          {value: GradingStrategy.EACH, text: this.translationService.translate('taskTypes.datalog.strategy.' + GradingStrategy.EACH)},
          {value: GradingStrategy.GROUP, text: this.translationService.translate('taskTypes.datalog.strategy.' + GradingStrategy.GROUP)},
          {value: GradingStrategy.KO, text: this.translationService.translate('taskTypes.datalog.strategy.' + GradingStrategy.KO)}
        ];
      });
  }

  protected override initForm(): void {
    this.form.addControl('solution', new FormControl<string | null>(null, [Validators.required]));
    this.form.addControl('query', new FormControl<string | null>(null, [Validators.required]));
    this.form.addControl('uncheckedTerms', new FormControl<string | null>(null));
    this.form.addControl('missingPredicatePenalty', new FormControl<number | null>(null, [Validators.required, Validators.min(0)]));
    this.form.addControl('missingPredicateStrategy', new FormControl<GradingStrategy | null>(null, [Validators.required]));
    this.form.addControl('missingFactPenalty', new FormControl<number | null>(null, [Validators.required, Validators.min(0)]));
    this.form.addControl('missingFactStrategy', new FormControl<GradingStrategy | null>(null, [Validators.required]));
    this.form.addControl('superfluousFactPenalty', new FormControl<number | null>(null, [Validators.required, Validators.min(0)]));
    this.form.addControl('superfluousFactStrategy', new FormControl<GradingStrategy | null>(null, [Validators.required]));
  }

  protected override getFormDefaultValues(): Partial<{ [K in keyof TaskTypeForm]: any }> | undefined {
    return {
      missingPredicatePenalty: 0,
      missingPredicateStrategy: GradingStrategy.KO,
      missingFactPenalty: 0,
      missingFactStrategy: GradingStrategy.KO,
      superfluousFactPenalty: 0,
      superfluousFactStrategy: GradingStrategy.KO
    };
  }
}

interface TaskTypeForm {
  solution: FormControl<string | null>;
  query: FormControl<string | null>;
  uncheckedTerms: FormControl<string | null>;
  missingPredicatePenalty: FormControl<number | null>,
  missingPredicateStrategy: FormControl<GradingStrategy | null>,
  missingFactPenalty: FormControl<number | null>,
  missingFactStrategy: FormControl<GradingStrategy | null>,
  superfluousFactPenalty: FormControl<number | null>,
  superfluousFactStrategy: FormControl<GradingStrategy | null>,
}
