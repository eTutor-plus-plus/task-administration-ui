import { Component, DestroyRef, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective } from '@ngneat/transloco';
import { InputNumberModule } from 'primeng/inputnumber';
import { editor } from 'monaco-editor';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { TaskTypeFormComponent } from '../task-type-form.component';
import { GradingStrategy } from './grading-strategy.enum';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StatusEnum } from '../../api';
import { DropdownModule } from 'primeng/dropdown';

/**
 * Task Type Form: XQuery
 */
@Component({
  selector: 'dke-task-type-xquery',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslocoDirective,
    MonacoEditorModule,
    InputNumberModule,
    DropdownModule
  ],
  templateUrl: './task-type-xquery.component.html',
  styleUrl: './task-type-xquery.component.scss'
})
export class TaskTypeXqueryComponent extends TaskTypeFormComponent<TaskTypeForm> implements OnInit {
  /**
   * The XQuery editor options.
   */
  readonly editorOptionsXQ: editor.IStandaloneEditorConstructionOptions = {
    language: 'xquery'
  };

  /**
   * The XPath editor options.
   */
  readonly editorOptionsXP: editor.IStandaloneEditorConstructionOptions = {
    language: 'xpath'
  };

  /**
   * The available grading strategies.
   */
  strategies: { value: GradingStrategy, text: string }[];

  /**
   * Creates a new instance of class TaskTypeXqueryComponent.
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
          {value: GradingStrategy.EACH, text: this.translationService.translate('taskTypes.xquery.strategy.' + GradingStrategy.EACH)},
          {value: GradingStrategy.GROUP, text: this.translationService.translate('taskTypes.xquery.strategy.' + GradingStrategy.GROUP)},
          {value: GradingStrategy.KO, text: this.translationService.translate('taskTypes.xquery.strategy.' + GradingStrategy.KO)}
        ];
      });
  }

  protected override initForm(): void {
    this.form.addControl('solution', new FormControl<string | null>(null, [Validators.required]));
    this.form.addControl('sorting', new FormControl<string | null>(null));
    this.form.addControl('missingNodePenalty', new FormControl<number | null>(null, [Validators.required, Validators.min(0)]));
    this.form.addControl('missingNodeStrategy', new FormControl<GradingStrategy | null>(null, [Validators.required]));
    this.form.addControl('superfluousNodePenalty', new FormControl<number | null>(0, [Validators.required, Validators.min(0)]));
    this.form.addControl('superfluousNodeStrategy', new FormControl<GradingStrategy | null>(null, [Validators.required]));
    this.form.addControl('displacedNodePenalty', new FormControl<number | null>(null, [Validators.required, Validators.min(0)]));
    this.form.addControl('displacedNodeStrategy', new FormControl<GradingStrategy | null>(null, [Validators.required]));
    this.form.addControl('missingAttributePenalty', new FormControl<number | null>(null, [Validators.required, Validators.min(0)]));
    this.form.addControl('missingAttributeStrategy', new FormControl<GradingStrategy | null>(null, [Validators.required]));
    this.form.addControl('superfluousAttributePenalty', new FormControl<number | null>(null, [Validators.required, Validators.min(0)]));
    this.form.addControl('superfluousAttributeStrategy', new FormControl<GradingStrategy | null>(null, [Validators.required]));
    this.form.addControl('incorrectAttributeValuePenalty', new FormControl<number | null>(null, [Validators.required, Validators.min(0)]));
    this.form.addControl('incorrectAttributeValueStrategy', new FormControl<GradingStrategy | null>(null, [Validators.required]));
    this.form.addControl('incorrectTextPenalty', new FormControl<number | null>(null, [Validators.required, Validators.min(0)]));
    this.form.addControl('incorrectTextStrategy', new FormControl<GradingStrategy | null>(null, [Validators.required]));
  }

  protected override getFormDefaultValues(): Partial<{ [K in keyof TaskTypeForm]: any }> | undefined {
    return {
      missingNodePenalty: 0,
      missingNodeStrategy: GradingStrategy.KO,
      superfluousNodePenalty: 0,
      superfluousNodeStrategy: GradingStrategy.KO,
      displacedNodePenalty: 0,
      displacedNodeStrategy: GradingStrategy.KO,
      missingAttributePenalty: 0,
      missingAttributeStrategy: GradingStrategy.KO,
      superfluousAttributePenalty: 0,
      superfluousAttributeStrategy: GradingStrategy.KO,
      incorrectAttributeValuePenalty: 0,
      incorrectAttributeValueStrategy: GradingStrategy.KO,
      incorrectTextPenalty: 0,
      incorrectTextStrategy: GradingStrategy.KO
    };
  }
}

interface TaskTypeForm {
  solution: FormControl<string | null>;
  sorting: FormControl<string | null>;
  missingNodePenalty: FormControl<number | null>,
  missingNodeStrategy: FormControl<GradingStrategy | null>,
  superfluousNodePenalty: FormControl<number | null>,
  superfluousNodeStrategy: FormControl<GradingStrategy | null>,
  incorrectTextPenalty: FormControl<number | null>,
  incorrectTextStrategy: FormControl<GradingStrategy | null>,
  displacedNodePenalty: FormControl<number | null>,
  displacedNodeStrategy: FormControl<GradingStrategy | null>,
  missingAttributePenalty: FormControl<number | null>,
  missingAttributeStrategy: FormControl<GradingStrategy | null>,
  superfluousAttributePenalty: FormControl<number | null>,
  superfluousAttributeStrategy: FormControl<GradingStrategy | null>,
  incorrectAttributeValuePenalty: FormControl<number | null>,
  incorrectAttributeValueStrategy: FormControl<GradingStrategy | null>
}
