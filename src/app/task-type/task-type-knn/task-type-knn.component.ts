import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, Validators, FormArray, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { TaskTypeFormComponent } from '../task-type-form.component';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'dke-task-type-knn',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoModule,
    InputNumberModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
    RadioButtonModule,
  ],
  templateUrl: './task-type-knn.component.html',
  styleUrls: ['./task-type-knn.component.scss'],
})
export class TaskTypeKnnComponent extends TaskTypeFormComponent<TaskTypeForm> {
  @Output() save = new EventEmitter<any>();
  constructor(private cdr: ChangeDetectorRef) {
    super();
  }
  
  // Initialize the form with all fields/controls
  protected override initForm(): void {
    const form = this.form as FormGroup;
    form.addControl('k',              new FormControl(3, [Validators.required, Validators.min(1)]));
    form.addControl('metric',         new FormControl('euclidean', Validators.required));
    form.addControl('numTrain',       new FormControl(6, [Validators.required, Validators.min(1)]));
    form.addControl('xMin',           new FormControl(0, Validators.required));
    form.addControl('xMax',           new FormControl(10, Validators.required));
    form.addControl('yMin',           new FormControl(0, Validators.required));
    form.addControl('yMax',           new FormControl(10, Validators.required));
    form.addControl('numTest',        new FormControl(3, [Validators.required, Validators.min(1)]));
    form.addControl('xLabel',         new FormControl('X', Validators.required));
    form.addControl('yLabel',         new FormControl('Y', Validators.required));
    form.addControl('tiebreaker',     new FormControl('sum', Validators.required));
    form.addControl('trainLabels',    new FormArray([]));
    form.addControl('trainPoints',    new FormArray([])); 
    form.addControl('testPoints',     new FormArray([])); 
  }

  // Returns default values for the form
  protected override getFormDefaultValues(): Partial<{ [K in keyof TaskTypeForm]: any }> | undefined {
    return {
      k: 3,
      metric: 'euclidean',
      numTrain: 6,
      xMin: 0,
      xMax: 10,
      yMin: 0,
      yMax: 10,
      numTest: 3,
      xLabel: 'X',
      yLabel: 'Y',
      tiebreaker: 'sum',
    };
  }
  // Tiebreaker dropdown options
   tiebreakerOptions = [
    { label: this.translationService.translate('taskTypes.knn.fields.tiebreaker.sum'), value: 'sum' },
    { label: this.translationService.translate('taskTypes.knn.fields.tiebreaker.mean'), value: 'mean' },
    { label: this.translationService.translate('taskTypes.knn.fields.tiebreaker.nearest'), value: 'nearest' },
  ];

  // ======= Simple getters for arrays and edit state =======

  get isEditMode() { return !!this.originalData; }
  get trainLabelsArray(): FormArray {
  return this.form.get('trainLabels') as FormArray;
  }
  get trainPointsArray(): FormArray {
    return this.form.get('trainPoints') as FormArray;
  }
  get testPointsArray(): FormArray {
    return this.form.get('testPoints') as FormArray;
  }
  get isExamTask(): boolean {
    return this.form.parent?.get('examTask')?.value === true;
  }


  trackByIdx = (_i: number) => _i;

  get submission(): string {
    return JSON.stringify(this.form.value, null, 2);
  }
 
  // ========== Populate form arrays from backend/original data ===========
  protected override onOriginalDataChanged(originalData: any | undefined): void {
    if (!this.form) { return; }

    // Clear all arrays before repopulating
    this.trainLabelsArray.clear();
    this.trainPointsArray.clear();
    this.testPointsArray.clear();

    // Fill labels array
    const labels = originalData?.trainLabels?.length ? originalData.trainLabels : ['A', 'B'];
    labels.forEach((l: any) =>
      this.trainLabelsArray.push(new FormControl(l, Validators.required))
    );

    // Fill training points per class
    (originalData?.trainPoints ?? []).forEach((tp: { points: number[][]; label: any; }) => {
      const pointsFA = new FormArray(
        tp.points.map((p: number[]) =>
          new FormGroup({
            x: new FormControl(p[0], Validators.required),
            y: new FormControl(p[1], Validators.required)
          })
        )
      );

      this.trainPointsArray.push(
        new FormGroup({
          label : new FormControl(tp.label, Validators.required),
          points: pointsFA
        })
      );
    });

    // Fill test points
    (originalData?.testPoints ?? []).forEach((p: number[]) =>
      this.testPointsArray.push(
        new FormGroup({
          x: new FormControl(p[0], Validators.required),
          y: new FormControl(p[1], Validators.required)
        })
      )
    );

    // Patch number fields for display
    if (originalData) {
      const totalTrain = this.trainPointsArray.value
                          .reduce((sum: number, g: any) => sum + g.points.length, 0);

      // Points per class
      const perClass = Math.floor(
        totalTrain / Math.max(1, this.trainLabelsArray.length)
      );

      this.form.patchValue(
        {
          numTrain: perClass,         
          numTest : this.testPointsArray.length
        },
        { emitEvent: false }
      );
    }

    this.cdr.detectChanges();         // View refreshen
  }



  // ========== Methods for add/remove buttons ==========

  addClassLabel() {
    // 1) sichtbares Control für den Input
    const uiCtrl   = new FormControl('', Validators.required);
    // 2) Daten-Control, das ans Backend geht
    const dataCtrl = new FormControl('', Validators.required);

    // automatisch spiegeln
    uiCtrl.valueChanges.subscribe(v => dataCtrl.setValue(v, { emitEvent: false }));

    // sichtbare Liste
    this.trainLabelsArray.push(uiCtrl);

    // verborgene Trainingsstruktur
    this.trainPointsArray.push(
      new FormGroup({
        label : dataCtrl,
        points: new FormArray([])
      })
    );
  }

  // Remove class label and its point group (keep at least two)
  removeClassLabel(idx: number) {
    if (this.trainLabelsArray.length > 2) {
      this.trainLabelsArray.removeAt(idx);
      this.trainPointsArray.removeAt(idx);
    }
    this.cdr.detectChanges();
  }

  // Add train point to given class
  addTrainPoint(labelIdx: number) {
    const pointsArray = (this.trainPointsArray.at(labelIdx).get('points') as FormArray);
    pointsArray.push(new FormGroup({ x: new FormControl(0), y: new FormControl(0) }));
    this.cdr.detectChanges();
  }
  
  // Remove train point from given class
  removeTrainPoint(labelIdx: number, pointIdx: number) {
    const pointsArray = (this.trainPointsArray.at(labelIdx).get('points') as FormArray);
    pointsArray.removeAt(pointIdx);
    this.cdr.detectChanges();
  }

  // Add new test point
  addTestPoint() {
    this.testPointsArray.push(new FormGroup({ x: new FormControl(0), y: new FormControl(0) }));
    this.cdr.detectChanges();
  }
  // Remove test point
  removeTestPoint(idx: number) {
    this.testPointsArray.removeAt(idx);
    this.cdr.detectChanges();
  }

  // Helpers to get controls for the tables
  getPointsControls(group: AbstractControl): FormGroup[] {
    return (group.get('points') as FormArray).controls as FormGroup[];
  }

  getPointsArray(group: AbstractControl): FormArray {
    return group.get('points') as FormArray;
  }

  // Handle test point input changes
  updateTestPoint(idx: number, dim: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const group = this.testPointsArray.at(idx) as FormGroup;
    const x = dim === 0 ? Number(input.value) : group.value.x;
    const y = dim === 1 ? Number(input.value) : group.value.y;
    group.setValue({ x, y });
  }
  // Handle training point input changes
  updatePoint(pointsArray: FormArray, pointIdx: number, dim: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const group = pointsArray.at(pointIdx) as FormGroup;
    const x = dim === 0 ? Number(input.value) : group.value.x;
    const y = dim === 1 ? Number(input.value) : group.value.y;
    group.setValue({ x, y });
  }
}

// Form interface definition
export interface TaskTypeForm {
  k: FormControl<number>;
  metric: FormControl<string>;
  numTrain: FormControl<number>;
  xMin: FormControl<number>;
  xMax: FormControl<number>;
  yMin: FormControl<number>;
  yMax: FormControl<number>;
  numTest: FormControl<number>;
  xLabel: FormControl<string>;
  yLabel: FormControl<string>;
  tiebreaker: FormControl<string>;
  trainLabels: FormControl<string[]>;
  trainPoints: FormArray; 
  testPoints: FormArray; 
}

