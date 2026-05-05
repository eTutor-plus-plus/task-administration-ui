import { Component } from '@angular/core';
import { TaskTypeFormComponent } from '../task-type-form.component';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { TranslocoDirective } from '@ngneat/transloco';
import { combineLatest, startWith, Subscription } from 'rxjs';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  selector: 'dke-task-type-hierarchical-clustering',
  standalone: true,
  imports: [
    FormsModule,
    InputNumberModule,
    ReactiveFormsModule,
    TranslocoDirective,
    RadioButtonModule
  ],
  templateUrl: './task-type-hierarchical-clustering.component.html',
  styleUrl: './task-type-hierarchical-clustering.component.scss'
})
export class TaskTypeHierarchicalClusteringComponent extends TaskTypeFormComponent<TaskTypeForm> {
  protected override initForm(): void {
    this.form.addControl('assignmentType', new FormControl<AssignmentType | null>(AssignmentType.COORDINATES, [Validators.required]));
    this.form.addControl('distanceMetric', new FormControl<DistanceMetric | null>(DistanceMetric.EUCLIDEAN, [Validators.required]));
    this.form.get('assignmentType')!.valueChanges.subscribe(value => {
      const distanceControl = this.form.get('distanceMetric');

      if (value === AssignmentType.COORDINATES) {
        distanceControl?.setValidators([Validators.required]);
      } else {
        distanceControl?.clearValidators();
        distanceControl?.setValue(null);
      }
    });
    this.form.addControl('nDataPoints', new FormControl<number | null>(null));
    this.form.addControl('linkageMethod', new FormControl<LinkageMethod | null>(LinkageMethod.SINGLE, [Validators.required]));
    this.form.addControl('pointsPerCorrectCluster', new FormControl<number | null>(null, [Validators.required]));
    this.form.addControl('wrongOrderPenalty', new FormControl<number | null>(null));
    const nDataPointsControl = this.form.get('nDataPoints') as FormControl<number | null>;
    const pointsPerClusterControl = this.form.get('pointsPerCorrectCluster') as FormControl<number | null>;

    combineLatest([
      nDataPointsControl.valueChanges.pipe(startWith(nDataPointsControl.value)),
      pointsPerClusterControl.valueChanges.pipe(startWith(pointsPerClusterControl.value))
    ]).subscribe(([nDataPoints, pointsPerCluster]) => {
      if (nDataPointsControl.valid && pointsPerClusterControl.valid && nDataPoints != null && pointsPerCluster != null) {
        const maxPoints = (nDataPoints - 1) * pointsPerCluster;
        this.parentForm?.controls.maxPoints.setValue(maxPoints);
      } else {
        this.parentForm?.controls.maxPoints.setValue(null);
      }
    });

    this.form.addControl('coordinatePoints', new FormArray<FormGroup<{
        label: FormControl<string | null>;
        x: FormControl<number | null>;
        y: FormControl<number | null>;
    }>>([]));
    this.form.addControl('distanceMatrix', new FormGroup({
      labels: new FormArray<FormControl<string | null>>([]),
      distances: new FormArray<FormArray<FormControl<number | null>>>([])
    }));
  }

  protected readonly AssignmentType = AssignmentType;
  protected readonly DistanceMetric = DistanceMetric;
  protected readonly LinkageMethod = LinkageMethod;

  constructor() {
    super();
  }

  get coordinatePoints(): FormArray<FormGroup<{
      label: FormControl<string | null>;
      x: FormControl<number | null>;
      y: FormControl<number | null>;
    }>> {
    return this.form.get('coordinatePoints') as any;
  }

  get distanceMatrixGroup(): FormGroup {
    return this.form.controls.distanceMatrix as FormGroup;
  }

  get labelsArray(): FormArray<FormControl<string | null>> {
    return this.distanceMatrixGroup.get('labels') as FormArray<FormControl<string | null>>;
  }

  get distancesArray(): FormArray<FormArray<FormControl<number | null>>> {
    return this.distanceMatrixGroup.get('distances') as FormArray<FormArray<FormControl<number | null>>>;
  }

  getRow(rowIndex: number): FormArray<FormControl<number | null>> {
    return this.distancesArray.at(rowIndex) as FormArray<FormControl<number | null>>;
  }

  protected override onOriginalDataChanged(data: unknown): void {
    const typedData = data as {
      distanceMatrix?: { labels?: string[], distances?: number[][] },
      coordinatePoints?: { label: string; x: number; y: number }[]
    };

    const matrix = typedData?.distanceMatrix;
    const coordinates = typedData?.coordinatePoints;

    if (!this.form) return;

    if (coordinates && coordinates.length > 0) {
      const coordinateArray = new FormArray(
        coordinates.map(point =>
          new FormGroup({
            label: new FormControl(point.label, [Validators.required]),
            x: new FormControl(point.x, [Validators.required]),
            y: new FormControl(point.y, [Validators.required]),
          })
        )
      );

      this.form.setControl('coordinatePoints', coordinateArray);
    } else {
      // completely clear coordinate list if it is null
      this.form.setControl('coordinatePoints', new FormArray<FormGroup<{
          label: FormControl<string | null>;
          x: FormControl<number | null>;
          y: FormControl<number | null>;
        }>>([]));
    }

    if (matrix?.labels && matrix?.distances) {
      const labels = new FormArray(
        matrix.labels.map(l => new FormControl(l, [Validators.required]))
      );

      const distances = new FormArray(
        matrix.distances.map(row =>
          new FormArray(
            row.map(v => new FormControl(v, [Validators.required]))
          )
        )
      );

      this.distanceMatrixGroup.setControl('labels', labels);
      this.distanceMatrixGroup.setControl('distances', distances);

      setTimeout(() => this.syncSymmetry());
    }

    this.distanceMatrixGroup.updateValueAndValidity();
  }

  private symmetrySubscriptions: Subscription[] = [];

  private syncSymmetry(): void {
    this.symmetrySubscriptions.forEach(s => s.unsubscribe());
    this.symmetrySubscriptions = [];

    for (let i = 0; i < this.distancesArray.length; i++) {
      for (let j = 0; j < this.getRow(i).length; j++) {
        if (i === j) continue;

        const sub = this.getRow(i).at(j).valueChanges.subscribe(value => {
          const mirror = this.getRow(j).at(i);
          if (mirror.value !== value) {
            mirror.setValue(value, { emitEvent: false });
          }
        });

        this.symmetrySubscriptions.push(sub);
      }
    }
  }

  ngOnDestroy(): void {
    this.symmetrySubscriptions.forEach(s => s.unsubscribe());
  }
}

interface TaskTypeForm {
  assignmentType: FormControl<AssignmentType | null>
  distanceMetric: FormControl<DistanceMetric | null>
  nDataPoints: FormControl<number | null>;
  linkageMethod: FormControl<LinkageMethod | null>;
  pointsPerCorrectCluster: FormControl<number | null>;
  wrongOrderPenalty: FormControl<number | null>;
  coordinatePoints: FormArray<FormGroup<{
    label: FormControl<string | null>;
    x: FormControl<number | null>;
    y: FormControl<number | null>;
  }>>;
  distanceMatrix: FormGroup<{
    labels: FormArray<FormControl<string | null>>;
    distances: FormArray<FormArray<FormControl<number | null>>>;
  }>;
}

// enums with "labels" for backend compatibility
enum AssignmentType {
  COORDINATES = 'COORDINATES',
  MATRIX = 'MATRIX'
}

enum DistanceMetric {
  EUCLIDEAN = 'EUCLIDEAN',
  MANHATTAN = 'MANHATTAN'
}

enum LinkageMethod {
  SINGLE = 'SINGLE',
  COMPLETE = 'COMPLETE'
}
