import { Component } from '@angular/core';
import { TaskTypeFormComponent } from '../task-type-form.component';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { TranslocoDirective } from '@ngneat/transloco';
import { combineLatest, startWith, Subscription } from 'rxjs';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonDirective } from 'primeng/button';

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

  /**
   * Initializes the clustering assignment form, configures type-dependent
   * validation, and automatically updates the maximum achievable points.
   */
  protected override initForm(): void {
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
        y: FormControl<number | null>;
      }>>([])
    }));

    this.form.addControl('distanceMatrix', new FormGroup({
      labels: new FormArray<FormControl<string | null>>([]),
      distances: new FormArray<FormArray<FormControl<number | null>>>([])
    }));

    // Toggle validators depending on the selected assignment type.
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

    const nDataPointsControl = this.form.get('nDataPoints') as FormControl<number | null>;
    const pointsPerClusterControl = this.form.get('pointsPerCorrectCluster') as FormControl<number | null>;

    // Recalculate the maximum score whenever either input changes.
    combineLatest([
      nDataPointsControl.valueChanges.pipe(startWith(nDataPointsControl.value)),
      pointsPerClusterControl.valueChanges.pipe(startWith(pointsPerClusterControl.value))
    ]).subscribe(([nDataPoints, pointsPerCluster]) => {
      if (nDataPointsControl.valid && pointsPerClusterControl.valid && nDataPoints != null && pointsPerCluster != null) {
        // A clustering task with n points requires n - 1 merge operations.
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

  /**
   * Initializes the clustering form component.
   */
  constructor() {
    super();
  }

  /**
   * Access the coordinate system group containing min/max values and coordinates.
   */
  get coordinateSystem(): FormGroup {
    return this.form.get('coordinateSystem') as FormGroup;
  }

  /**
   * Min X value control
   */
  get minXControl(): FormControl<number | null> {
    return this.coordinateSystem.get('minX') as FormControl<number | null>;
  }

  /**
   * Max X value control
   */
  get maxXControl(): FormControl<number | null> {
    return this.coordinateSystem.get('maxX') as FormControl<number | null>;
  }

  /**
   * Min Y value control
   */
  get minYControl(): FormControl<number | null> {
    return this.coordinateSystem.get('minY') as FormControl<number | null>;
  }

  /**
   * Max Y value control
   */
  get maxYControl(): FormControl<number | null> {
    return this.coordinateSystem.get('maxY') as FormControl<number | null>;
  }

  /**
   * Array of coordinate points, each with label, x, and y.
   */
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

  /**
   * Distance matrix group containing labels and distances arrays
   */
  get distanceMatrixGroup(): FormGroup {
    return this.form.controls.distanceMatrix as FormGroup;
  }

  /**
   * Array of labels for the distance matrix
   */
  get labelsArray(): FormArray<FormControl<string | null>> {
    return this.distanceMatrixGroup.get('labels') as FormArray<FormControl<string | null>>;
  }

  /**
   * 2D array of distances between points
   */
  get distancesArray(): FormArray<FormArray<FormControl<number | null>>> {
    return this.distanceMatrixGroup.get('distances') as FormArray<FormArray<FormControl<number | null>>>;
  }

  /**
   * Retrieve a specific row from the distance matrix.
   * @param rowIndex Index of the row to get
   */
  getRow(rowIndex: number): FormArray<FormControl<number | null>> {
    return this.distancesArray.at(rowIndex) as FormArray<FormControl<number | null>>;
  }


  /**
   * Triggers download of the generated dendrogram as a PNG file.
   * Does nothing if no dendrogram is available.
   */
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


  /**
   * Loads specific persisted assignment data into the form and restores the
   * generated solution and dendrogram.
   * <p>
   * The dendrogram is loaded as a byte array reflecting an image in PNG format.
   * Additionally, an image URL is created for display and download.
   * <p>
   * The new values of the coordinate system and distance matrix are patched in
   * place of the old values. For that purpose, the arrays are resized if necessary.
   * This approach ensures that the new values are loaded in a way that changes are
   * reflected correctly in the UI after saving a task.
   */
  protected override onOriginalDataChanged(data: unknown): void {
    const typedData = data as {
      distanceMatrix?: { labels?: string[]; distances?: number[][] };
      coordinateSystem?: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
        coordinateList: { label: string; x: number; y: number }[];
      };
      solution?: string;
      dendrogram?: string;
    };

    this.solution = typedData?.solution;
    const base64 = typedData?.dendrogram;

    // Convert the stored Base64 image into a Blob and object URL
    if (base64) {
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      this.dendrogram = new Blob([byteArray], {type: 'image/png'});
      this.dendrogramUrl = URL.createObjectURL(this.dendrogram);
    }

    if (!this.form) {
      return;
    }

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
      const newPoints = coordinateSystem?.coordinateList ?? [];

      // Resize the coordinate list to match incoming list length
      while (coordinateList.length > newPoints.length) {
        coordinateList.removeAt(coordinateList.length - 1);
      }

      while (coordinateList.length < newPoints.length) {
        coordinateList.push(new FormGroup({
          label: new FormControl<string | null>(null, [Validators.required]),
          x: new FormControl<number | null>(null, [Validators.required]),
          y: new FormControl<number | null>(null, [Validators.required]),
        }));
      }

      // Patch new values
      newPoints.forEach((point, index) => {
        coordinateList.at(index).patchValue({
          label: point.label,
          x: point.x,
          y: point.y,
        });
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

    const matrix = typedData?.distanceMatrix;

    if (matrix?.labels && matrix?.distances) {
      // Unsubscribe old symmetry subscriptions so no listeners fire when updating values
      this.symmetrySubscriptions.forEach(s => s.unsubscribe());
      this.symmetrySubscriptions = [];

      const labels = this.labelsArray;
      const distances = this.distancesArray;
      const newLabels = matrix.labels;
      const newDistances = matrix.distances;

      // Resize and patch labels array to match incoming data
      while (labels.length > newLabels.length) {
        labels.removeAt(labels.length - 1);
      }

      while (labels.length < newLabels.length) {
        labels.push(new FormControl<string | null>(null, [Validators.required]));
      }

      newLabels.forEach((label, i) => labels.at(i).setValue(label));

      // Resize rows to match incoming data
      while (distances.length > newDistances.length) {
        distances.removeAt(distances.length - 1);
      }

      while (distances.length < newDistances.length) {
        distances.push(new FormArray<FormControl<number | null>>([]));
      }

      // Resize and patch each row's cells to match incoming data
      newDistances.forEach((row, i) => {
        const rowArray = distances.at(i) as FormArray<FormControl<number | null>>;

        while (rowArray.length > row.length) {
          rowArray.removeAt(rowArray.length - 1);
        }

        while (rowArray.length < row.length) {
          rowArray.push(new FormControl<number | null>(null, [Validators.required]));
        }

        row.forEach((value, j) => rowArray.at(j).setValue(value));
      });

      this.syncSymmetry();
    }

    // Force revalidation after replacing form controls
    this.distanceMatrixGroup.updateValueAndValidity();
    this.coordinateSystem.updateValueAndValidity();
  }


  private symmetrySubscriptions: Subscription[] = [];

  /**
   * Sets up two-way synchronization for the distance matrix to enforce symmetry.
   * Whenever a value at [i][j] changes, the mirrored value at [j][i] is updated.
   *
   * The synchronization of symmetry is needed for validity of a matrix as well as
   * to ensure consistent behavior of calculations.
   */
  private syncSymmetry(): void {
    // Unsubscribe previous symmetry subscriptions to avoid duplicate updates
    this.symmetrySubscriptions.forEach(s => s.unsubscribe());
    this.symmetrySubscriptions = [];

    for (let i = 0; i < this.distancesArray.length; i++) {
      for (let j = 0; j < this.getRow(i).length; j++) {
        if (i === j) continue; // skip diagonal, as it doesn't need mirroring

        // Subscribe to changes and update the mirrored cell without triggering another event
        const sub = this.getRow(i).at(j).valueChanges.subscribe(value => {
          const mirror = this.getRow(j).at(i);
          if (mirror.value !== value) {
            mirror.setValue(value, {emitEvent: false});
          }
        });

        this.symmetrySubscriptions.push(sub);
      }
    }
  }

  /**
   * Cleanup routine for the component.
   * - Unsubscribes all symmetry subscriptions to prevent memory leaks.
   * - Revokes the dendrogram object URL if one exists.
   */
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
