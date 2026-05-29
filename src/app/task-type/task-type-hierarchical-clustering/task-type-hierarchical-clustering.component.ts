import { ChangeDetectorRef, Component } from '@angular/core';
import { TaskTypeFormComponent } from '../task-type-form.component';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { TranslocoDirective } from '@ngneat/transloco';
import { combineLatest, startWith, Subscription } from 'rxjs';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TaskService } from '../../api';
import { Button, ButtonDirective } from 'primeng/button';

@Component({
  selector: 'dke-task-type-hierarchical-clustering',
  standalone: true,
  imports: [
    FormsModule,
    InputNumberModule,
    ReactiveFormsModule,
    TranslocoDirective,
    RadioButtonModule,
    ButtonDirective
  ],
  templateUrl: './task-type-hierarchical-clustering.component.html',
  styleUrl: './task-type-hierarchical-clustering.component.scss'
})
export class TaskTypeHierarchicalClusteringComponent extends TaskTypeFormComponent<TaskTypeForm> {

  protected override initForm(): void {
    // add controls
    this.form.addControl('assignmentType', new FormControl<AssignmentType | null>(AssignmentType.COORDINATES, [Validators.required]));
    this.form.addControl('distanceMetric', new FormControl<DistanceMetric | null>(DistanceMetric.EUCLIDEAN, [Validators.required]));
    this.form.addControl('nDataPoints', new FormControl<number | null>(null, [Validators.required]));
    this.form.addControl('linkageMethod', new FormControl<LinkageMethod | null>(LinkageMethod.SINGLE, [Validators.required]));
    this.form.addControl('pointsPerCorrectCluster', new FormControl<number | null>(null, [Validators.required]));
    this.form.addControl('wrongOrderPenalty', new FormControl<number | null>(null));
    this.form.addControl('coordinateSystem', new FormGroup({
        minX: new FormControl<number | null>(0),
        maxX: new FormControl<number | null>(10),
        minY: new FormControl<number | null>(0),
        maxY: new FormControl<number | null>(10),
        coordinateList: new FormArray<FormGroup<{
            label: FormControl<string | null>;
            x: FormControl<number | null>;
            y: FormControl<number |null>;
        }>>([])
    }));
    this.form.addControl('distanceMatrix', new FormGroup({
      labels: new FormArray<FormControl<string | null>>([]),
      distances: new FormArray<FormArray<FormControl<number | null>>>([])
    }));

    // changing validators for type-specific fields
    this.form.get('assignmentType')!.valueChanges.subscribe(value => {
      const metricControl = this.form.get('distanceMetric');
      const minXControl = this.minXControl;
      const maxXControl = this.maxXControl;
      const minYControl = this.minYControl;
      const maxYControl = this.maxYControl;

      if (value === AssignmentType.COORDINATES) {
        metricControl?.setValidators([Validators.required]);
        minXControl?.setValidators([Validators.required]);
        maxXControl?.setValidators([Validators.required]);
        minYControl?.setValidators([Validators.required]);
        maxYControl?.setValidators([Validators.required]);
      } else {
        metricControl?.clearValidators();
        minXControl?.clearValidators();
        maxXControl?.clearValidators();
        minYControl?.clearValidators();
        maxYControl?.clearValidators();
      }
    });

    // automatic max points calculation
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
  }



  protected readonly AssignmentType = AssignmentType;
  protected readonly DistanceMetric = DistanceMetric;
  protected readonly LinkageMethod = LinkageMethod;

  solution?: string;
  dendrogram?: Blob;
  dendrogramUrl?: string;

  constructor() {
    super();
  }

  // getters
  get coordinateSystem(): FormGroup {
    return this.form.get('coordinateSystem') as FormGroup;
  }

  get minXControl(): FormControl<number | null> {
    return this.coordinateSystem.get('minX') as FormControl<number | null>;
  }

  get maxXControl(): FormControl<number | null> {
    return this.coordinateSystem.get('maxX') as FormControl<number | null>;
  }

  get minYControl(): FormControl<number | null> {
    return this.coordinateSystem.get('minY') as FormControl<number | null>;
  }

  get maxYControl(): FormControl<number | null> {
    return this.coordinateSystem.get('maxY') as FormControl<number | null>;
  }

  get coordinateList(): FormArray<FormGroup<{
      label: FormControl<string | null>;
      x: FormControl<number | null>;
      y: FormControl<number | null>;
    }>> {
    return this.coordinateSystem.get('coordinateList') as FormArray<FormGroup<{
      label: FormControl<string | null>;
      x: FormControl<number | null>;
      y: FormControl<number | null>;
    }>>;
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



  downloadDendrogram(): void {
    if (!this.dendrogram || this.dendrogramUrl == null) {
      return;
    }

    const a = document.createElement('a');
    a.href = this.dendrogramUrl;
    a.download = 'dendrogram.png';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }



  protected override onOriginalDataChanged(data: unknown): void {
    const typedData = data as {
      distanceMatrix?: { labels?: string[], distances?: number[][] },
      coordinateSystem?: {
        minX: number; maxX: number;
        minY: number; maxY: number;
        coordinateList: { label: string; x: number; y: number; }[];
      },
      solution?: string,
      dendrogram?: string
    };

    this.solution = typedData?.solution;
    const base64 = typedData?.dendrogram;

    // convert from base64 to image/url
    if (base64) {
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      this.dendrogram = new Blob([byteArray], { type: 'image/png' });
      this.dendrogramUrl = URL.createObjectURL(this.dendrogram);
    }


    if (!this.form) return;

    // parse coordinate data to form controls
    const coordinateSystem = typedData?.coordinateSystem;
    const coordinateSystemGroup = this.coordinateSystem;

    if (coordinateSystem) {
      coordinateSystemGroup.patchValue({
        minX: coordinateSystem.minX,
        maxX: coordinateSystem.maxX,
        minY: coordinateSystem.minY,
        maxY: coordinateSystem.maxY,
      });

      const coordinateList = this.coordinateList;

      coordinateList.clear();

      coordinateSystem.coordinateList?.forEach(point => {
        coordinateList.push(
          new FormGroup({
            label: new FormControl(point.label, [Validators.required]),
            x: new FormControl(point.x, [Validators.required]),
            y: new FormControl(point.y, [Validators.required]),
          })
        );
      });

    } else {
      coordinateSystemGroup.patchValue({
        minX: 0,
        maxX: 10,
        minY: 0,
        maxY: 10,
      });

      this.coordinateList.clear();
    }


    // parse distance matrix data to form controls
    const matrix = typedData?.distanceMatrix;

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

    // ensure that data gets updated/reloaded
    this.distanceMatrixGroup.updateValueAndValidity();
    this.coordinateSystem.updateValueAndValidity();
  }


  private symmetrySubscriptions: Subscription[] = [];

  // matrix synchronization to ensure symmetry
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
    if (this.dendrogramUrl) {
      URL.revokeObjectURL(this.dendrogramUrl);
    }
  }
}


interface TaskTypeForm {
  assignmentType: FormControl<AssignmentType | null>;
  distanceMetric: FormControl<DistanceMetric | null>;
  nDataPoints: FormControl<number | null>;
  linkageMethod: FormControl<LinkageMethod | null>;
  pointsPerCorrectCluster: FormControl<number | null>;
  wrongOrderPenalty: FormControl<number | null>;
  coordinateSystem: FormGroup<{
    minX: FormControl<number | null>;
    maxX: FormControl<number | null>;
    minY: FormControl<number | null>;
    maxY: FormControl<number | null>;
    coordinateList: FormArray<FormGroup<{
      label: FormControl<string | null>;
      x: FormControl<number | null>;
      y: FormControl<number | null>;
    }>>
  }>;
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
