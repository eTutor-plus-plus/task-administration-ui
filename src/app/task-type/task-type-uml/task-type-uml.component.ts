import { ChangeDetectorRef, Component } from '@angular/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { PaginatorModule } from 'primeng/paginator';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslocoDirective, TranslocoPipe } from '@ngneat/transloco';
import { ButtonModule } from 'primeng/button';
import { TreeSelectModule } from 'primeng/treeselect';
import { TaskTypeFormComponent } from '../task-type-form.component';
import { editor } from 'monaco-editor';
import { InputTextModule } from 'primeng/inputtext';
import { NgForOf } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { data, value } from 'happy-dom/lib/PropertySymbol';
import { GradingStrategy } from '../task-type-xquery/grading-strategy.enum';



@Component({
  selector: 'dke-task-type-uml',
  standalone: true,
  imports: [
    MonacoEditorModule,
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
  templateUrl: './task-type-uml.component.html',
  styleUrl: './task-type-uml.component.scss'
})
export class TaskTypeUmlComponent extends TaskTypeFormComponent<TaskTypeForm> {

  readonly umlEditorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'plantuml'
  };

  umlSolution = new FormArray<FormGroup<{ umlBlock: FormArray<FormGroup<{ umlBlockAlt: FormControl<string | null>; }>>; }>>([]);

  constructor(private changeDetectorRef: ChangeDetectorRef) {
    super();
  }

  protected override initForm(): void {
    this.form.addControl('umlSolution', this.umlSolution);
    this.form.addControl('completeComparison', new FormControl<boolean|null>(null));
    this.form.addControl('classPoints', new FormControl<number|null>(null));
    this.form.addControl('associationPoints', new FormControl<number|null>(null));
    this.form.addControl('associationClassPoints', new FormControl<number|null>(null));
    this.form.addControl('constraintPoints', new FormControl<number|null>(null));
  }


  protected override getFormDefaultValues(): Partial<{ [K in keyof TaskTypeForm]: any }> | undefined {
    return {
      classPoints: 0,
      associationPoints: 0,
      associationClassPoints: 0,
      constraintPoints: 0,
      completeComparison: false
    };
  }

  get itemsControls() {
    return this.umlSolution.controls as FormGroup[];
  }

  addUmlBlock() {
    this.umlSolution.push(new FormGroup({umlBlock: new FormArray([new FormGroup({umlBlockAlt: new FormControl<string | null>(null)})])}));
    this.changeDetectorRef.detectChanges();
  }

  itemsControlsAlt(index: number) {
    return (this.umlSolution.at(index).get('umlBlock') as FormArray).controls as FormGroup[];
  }

  addUmlBlockAlt(index: number, value?: any) {
    if (value) {
      console.log(value);
      (this.umlSolution.at(index).get('umlBlock') as FormArray).push(new FormGroup({
        umlBlockAlt: new FormControl<string | null>(value.umlBlockAlt)
      }));
      return;
    } else {
      (this.umlSolution.at(index).get('umlBlock') as FormArray).push(new FormGroup({
        umlBlockAlt: new FormControl<string | null>(null)
      }));
    }
    this.changeDetectorRef.detectChanges();
  }

  addUmlBlockWithoutAlt() {
    this.umlSolution.push(new FormGroup({
      umlBlock: new FormArray<FormGroup<{ umlBlockAlt: FormControl<string | null>; }>>([])
    }));
    this.changeDetectorRef.detectChanges();
  }

  removeUmlBlock(index: number) {
    this.umlSolution.removeAt(index);
  }

  removeUmlBlockAlt(index: number, indexAlt: number) {
    (this.umlSolution.at(index).get('umlBlock') as FormArray).removeAt(indexAlt);
  }


  protected override onOriginalDataChanged(originalData: unknown | undefined): void {
    if (!this.form || !originalData) {
      console.log('Form is not initialized or originalData is undefined');
      return;
    }

    const data = originalData as { umlSolution: { umlBlock: string[] }[] };

    this.umlSolution.clear();

    for (const [index, item] of data.umlSolution.entries()) {
      this.addUmlBlockWithoutAlt();

      for (const block of item.umlBlock) {
        this.addUmlBlockAlt(index, block);
      }
    }
  }


}

interface TaskTypeForm {
  umlSolution: FormArray<FormGroup<{ umlBlock: FormArray<FormGroup<{ umlBlockAlt: FormControl<string | null> }>> }>>;
  completeComparison: FormControl<boolean|null>;
  classPoints: FormControl<number|null>;
  associationPoints: FormControl<number|null>;
  associationClassPoints: FormControl<number|null>;
  constraintPoints: FormControl<number|null>;
}
