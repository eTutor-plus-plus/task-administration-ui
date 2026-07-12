import { Component, OnDestroy } from '@angular/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TaskTypeFormComponent } from '../task-type-form.component';
import { editor, MarkerSeverity } from 'monaco-editor';
import { CheckboxModule } from 'primeng/checkbox';
import { debounceTime, merge, Subject, takeUntil } from 'rxjs';
import { DroolsValidationService } from './drools-validation.service';
import { TranslocoDirective, TranslocoPipe } from '@ngneat/transloco';


@Component({
  selector: 'dke-task-type-drools',
  standalone: true,
  imports: [
    MonacoEditorModule,
    ReactiveFormsModule,
    TranslocoDirective,
    TranslocoPipe,
    CheckboxModule
  ],
  templateUrl: './task-type-drools.component.html',
  styleUrl: './task-type-drools.component.scss'
})
export class TaskTypeDroolsComponent extends TaskTypeFormComponent<TaskTypeForm> implements OnDestroy {
  private static readonly TEST_CASE_SEPARATOR = '--- test';

  readonly droolsEditorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'drools',
    minimap: { enabled: false },
    automaticLayout: true
  };

  readonly csvEditorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'text',
    minimap: { enabled: false },
    automaticLayout: true
  };

  private modelDrlEditor?: editor.IStandaloneCodeEditor;
  private solutionDrlEditor?: editor.IStandaloneCodeEditor;
  private visibleTestCasesEditor?: editor.IStandaloneCodeEditor;
  private hiddenTestCasesEditor?: editor.IStandaloneCodeEditor;
  private readonly destroy$ = new Subject<void>();
  private drlValidationRun = 0;
  private testCaseValidationRun = 0;


  constructor(
    private readonly droolsValidationService: DroolsValidationService
  ) {
    super();
  }

  override set formData(data: unknown) {
    super.formData = data;
  }

  protected override initForm(): void {
    this.form.addControl('modelDrl', new FormControl<string | null>(null));
    this.form.addControl('solutionDrl', new FormControl<string | null>(null));
    this.form.addControl('visibleTestCases', new FormControl<string | null>(null));
    this.form.addControl('hiddenTestCases', new FormControl<string | null>(null));
    this.form.addControl('isCEP', new FormControl<boolean | null>(false));

    merge(
      this.form.controls.modelDrl.valueChanges,
      this.form.controls.solutionDrl.valueChanges
    )
      .pipe(debounceTime(700), takeUntil(this.destroy$))
      .subscribe(() => {
        this.validateDrl();
        this.validateTestCases();
      });

    merge(
      this.form.controls.visibleTestCases.valueChanges,
      this.form.controls.hiddenTestCases.valueChanges,
      this.form.controls.isCEP.valueChanges
    )
      .pipe(debounceTime(700), takeUntil(this.destroy$))
      .subscribe(() => this.validateTestCases());
  }

  ngOnDestroy(): void {
    this.clearValidationMarkers();
    this.clearTestCaseValidationMarkers();
    this.destroy$.next();
    this.destroy$.complete();
  }

  onModelDrlEditorInit(instance: editor.IStandaloneCodeEditor): void {
    this.modelDrlEditor = instance;
    this.validateDrl();
    this.validateTestCases();
  }

  onSolutionDrlEditorInit(instance: editor.IStandaloneCodeEditor): void {
    this.solutionDrlEditor = instance;
    this.validateDrl();
    this.validateTestCases();
  }

  onVisibleTestCasesEditorInit(instance: editor.IStandaloneCodeEditor): void {
    this.visibleTestCasesEditor = instance;
    this.validateTestCases();
  }

  onHiddenTestCasesEditorInit(instance: editor.IStandaloneCodeEditor): void {
    this.hiddenTestCasesEditor = instance;
    this.validateTestCases();
  }

  get maxPoints(): number | null {
    return this.parentForm?.controls.maxPoints.value ?? null;
  }

  get definedTestCasePoints(): number {
    return Math.max(
      this.sumTestCasePoints(this.form.controls.visibleTestCases.value),
      this.sumTestCasePoints(this.form.controls.hiddenTestCases.value)
    );
  }

  get testCasePointsExceedMaxPoints(): boolean {
    const maxPoints = this.maxPoints;
    return maxPoints !== null && this.definedTestCasePoints > maxPoints;
  }

  private sumTestCasePoints(testCasesText: string | null | undefined): number {
    if (!testCasesText?.trim()) {
      return 0;
    }

    let sum = 0;
    let currentPoints = 1;
    let hasCurrentTest = false;

    for (const rawLine of testCasesText.split(/\r\n|\r|\n/)) {
      const line = rawLine.trim();

      if (!line) {
        continue;
      }

      if (line === TaskTypeDroolsComponent.TEST_CASE_SEPARATOR) {
        if (hasCurrentTest) {
          sum += currentPoints;
        }

        currentPoints = 1;
        hasCurrentTest = true;
        continue;
      }

      if (!hasCurrentTest) {
        hasCurrentTest = true;
      }

      if (line.startsWith('@points ')) {
        const parsedPoints = Number(line.substring('@points '.length).trim().replace(',', '.'));

        if (!Number.isNaN(parsedPoints)) {
          currentPoints = parsedPoints;
        }
      }
    }

    if (hasCurrentTest) {
      sum += currentPoints;
    }

    return sum;
  }

  private async validateDrl(): Promise<void> {
    const modelDrl = this.form.controls.modelDrl.value;
    const solutionDrl = this.form.controls.solutionDrl.value;

    if (!modelDrl || !solutionDrl) {
      this.clearValidationMarkers();
      this.clearDroolsSyntaxErrors();
      return;
    }

    const currentRun = ++this.drlValidationRun;

    try {
      const result = await this.droolsValidationService.validate({
        modelDrl,
        rulesDrl: solutionDrl
      });

      if (currentRun !== this.drlValidationRun) {
        return;
      }

      if (!this.modelDrlEditor || !this.solutionDrlEditor) {
        return;
      }

      const modelLineCount = modelDrl.split(/\r\n|\r|\n/).length;
      const solutionLineOffset = modelLineCount + 2;

      const modelMarkers: editor.IMarkerData[] = [];
      const solutionMarkers: editor.IMarkerData[] = [];

      const modelErrorMessages: string[] = [];
      const solutionErrorMessages: string[] = [];

      for (const message of result.messages ?? []) {
        if (message.level !== 'ERROR') {
          continue;
        }

        const originalLine = Math.max(message.line, 1);
        const originalColumn = Math.max(message.column, 1);

        const marker: editor.IMarkerData = {
          severity: MarkerSeverity.Error,
          message: message.text,
          startLineNumber: originalLine,
          startColumn: originalColumn,
          endLineNumber: originalLine,
          endColumn: originalColumn + 1
        };

        if (originalLine <= modelLineCount) {
          modelMarkers.push(marker);
          modelErrorMessages.push(`Line ${originalLine}, column ${originalColumn}: ${message.text}`);
        } else {
          const solutionLine = Math.max(originalLine - solutionLineOffset, 1);

          solutionMarkers.push({
            ...marker,
            startLineNumber: solutionLine,
            endLineNumber: solutionLine
          });

          solutionErrorMessages.push(`Line ${solutionLine}, column ${originalColumn}: ${message.text}`);
        }
      }

      editor.setModelMarkers(this.modelDrlEditor.getModel()!, 'drools-validation', modelMarkers);
      editor.setModelMarkers(this.solutionDrlEditor.getModel()!, 'drools-validation', solutionMarkers);

      this.setDroolsSyntaxErrors(modelErrorMessages, solutionErrorMessages);
    } catch {
      this.clearValidationMarkers();
      this.clearDroolsSyntaxErrors();
    }
  }

  private async validateTestCases(): Promise<void> {
    const modelDrl = this.form.controls.modelDrl.value;
    const solutionDrl = this.form.controls.solutionDrl.value;

    if (!modelDrl || !solutionDrl) {
      this.clearTestCaseValidationMarkers();
      this.clearTestCaseSyntaxErrors();
      return;
    }

    const currentRun = ++this.testCaseValidationRun;

    try {
      const result = await this.droolsValidationService.validateTestCases({
        modelDrl,
        solutionDrl,
        visibleTestCases: this.form.controls.visibleTestCases.value,
        hiddenTestCases: this.form.controls.hiddenTestCases.value,
        isCEP: this.form.controls.isCEP.value
      });

      if (currentRun !== this.testCaseValidationRun) {
        return;
      }

      const visibleMessages: string[] = [];
      const hiddenMessages: string[] = [];

      for (const message of result.messages ?? []) {
        if (message.level !== 'ERROR') {
          continue;
        }

        if (message.path === 'hiddenTestCases') {
          hiddenMessages.push(message.text);
        } else {
          visibleMessages.push(message.text);
        }
      }

      this.setTestCaseSyntaxErrors(visibleMessages, hiddenMessages);
      this.setTestCaseValidationMarkers(visibleMessages, hiddenMessages);
    } catch {
      this.clearTestCaseValidationMarkers();
      this.clearTestCaseSyntaxErrors();
    }
  }

  private setDroolsSyntaxErrors(modelMessages: string[], solutionMessages: string[]): void {
    this.form.controls.modelDrl.setErrors(
      modelMessages.length > 0 ? { droolsSyntax: modelMessages.join('\n') } : null
    );

    this.form.controls.solutionDrl.setErrors(
      solutionMessages.length > 0 ? { droolsSyntax: solutionMessages.join('\n') } : null
    );
  }

  private clearDroolsSyntaxErrors(): void {
    this.form.controls.modelDrl.setErrors(null);
    this.form.controls.solutionDrl.setErrors(null);
  }

  private setTestCaseSyntaxErrors(visibleMessages: string[], hiddenMessages: string[]): void {
    this.form.controls.visibleTestCases.setErrors(
      visibleMessages.length > 0 ? { testCaseSyntax: visibleMessages.join('\n') } : null
    );

    this.form.controls.hiddenTestCases.setErrors(
      hiddenMessages.length > 0 ? { testCaseSyntax: hiddenMessages.join('\n') } : null
    );
  }

  private clearTestCaseSyntaxErrors(): void {
    this.form.controls.visibleTestCases.setErrors(null);
    this.form.controls.hiddenTestCases.setErrors(null);
  }

  private setTestCaseValidationMarkers(visibleMessages: string[], hiddenMessages: string[]): void {
    if (this.visibleTestCasesEditor?.getModel()) {
      editor.setModelMarkers(
        this.visibleTestCasesEditor.getModel()!,
        'drools-testcase-validation',
        this.toEditorMarkers(visibleMessages)
      );
    }

    if (this.hiddenTestCasesEditor?.getModel()) {
      editor.setModelMarkers(
        this.hiddenTestCasesEditor.getModel()!,
        'drools-testcase-validation',
        this.toEditorMarkers(hiddenMessages)
      );
    }
  }

  private toEditorMarkers(messages: string[]): editor.IMarkerData[] {
    return messages.map(message => ({
      severity: MarkerSeverity.Error,
      message,
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: 1,
      endColumn: 1
    }));
  }

  private clearValidationMarkers(): void {
    if (this.modelDrlEditor?.getModel()) {
      editor.setModelMarkers(this.modelDrlEditor.getModel()!, 'drools-validation', []);
    }

    if (this.solutionDrlEditor?.getModel()) {
      editor.setModelMarkers(this.solutionDrlEditor.getModel()!, 'drools-validation', []);
    }
  }

  private clearTestCaseValidationMarkers(): void {
    if (this.visibleTestCasesEditor?.getModel()) {
      editor.setModelMarkers(this.visibleTestCasesEditor.getModel()!, 'drools-testcase-validation', []);
    }

    if (this.hiddenTestCasesEditor?.getModel()) {
      editor.setModelMarkers(this.hiddenTestCasesEditor.getModel()!, 'drools-testcase-validation', []);
    }
  }
}

interface TaskTypeForm {
  modelDrl: FormControl<string | null>;
  solutionDrl: FormControl<string | null>;
  visibleTestCases: FormControl<string | null>;
  hiddenTestCases: FormControl<string | null>;
  isCEP: FormControl<boolean | null>;
}
