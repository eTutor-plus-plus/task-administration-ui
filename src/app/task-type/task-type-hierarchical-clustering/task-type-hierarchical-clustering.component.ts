import { Component } from '@angular/core';
import { TaskTypeFormComponent } from '../task-type-form.component';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { TranslocoDirective } from '@ngneat/transloco';
import { Subscription } from 'rxjs';

@Component({
  selector: 'dke-task-type-hierarchical-clustering',
  standalone: true,
  imports: [
    FormsModule,
    InputNumberModule,
    ReactiveFormsModule,
    TranslocoDirective
  ],
  templateUrl: './task-type-hierarchical-clustering.component.html',
  styleUrl: './task-type-hierarchical-clustering.component.scss'
})
export class TaskTypeHierarchicalClusteringComponent extends TaskTypeFormComponent<TaskTypeForm> {
  protected override initForm(): void {
    this.form.addControl('nDataPoints', new FormControl<number | null>(null, [Validators.required]));
    this.form.addControl('distanceMatrix', new FormGroup({
      labels: new FormArray<FormControl<string | null>>([]),
      distances: new FormArray<FormArray<FormControl<number | null>>>([])
    }));
  }

    constructor() {
    super();
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
    const typedData = data as { distanceMatrix?: { labels?: string[], distances?: number[][] } };
    const matrix = typedData?.distanceMatrix;

    if (!matrix?.labels || !matrix?.distances || !this.form) return;

    this.labelsArray.clear();
    this.distancesArray.clear();

    for (const label of matrix.labels) {
      this.labelsArray.push(new FormControl<string | null>(label, [Validators.required]));
    }

    for (const row of matrix.distances) {
      const rowArray = new FormArray<FormControl<number | null>>(
        row.map(value => new FormControl<number | null>(value, [Validators.required]))
      );
      this.distancesArray.push(rowArray);
    }

    this.syncSymmetry();
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
  nDataPoints: FormControl<number | null>;
  distanceMatrix: FormGroup<{
    labels: FormArray<FormControl<string | null>>;
    distances: FormArray<FormArray<FormControl<number | null>>>;
  }>;
}
