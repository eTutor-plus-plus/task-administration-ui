import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { TaskTypeFormComponent } from '../task-type-form.component';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { NgIf, NgForOf } from '@angular/common';
import { TranslocoDirective, TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { editor } from 'monaco-editor';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { SubmissionDto, TaskService } from '../../api';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'dke-task-type-clustering',
  standalone: true,
  imports: [
    TooltipModule,
    ConfirmDialogModule,
    MonacoEditorModule,
    TranslocoDirective,
    TranslocoPipe,
    ReactiveFormsModule,
    DropdownModule,
    InputNumberModule,
    ButtonModule,
    NgIf,
    NgForOf
  ],
  providers: [ConfirmationService],
  templateUrl: './task-type-clustering.component.html',
  styleUrl: './task-type-clustering.component.scss'
})
export class TaskTypeClusteringComponent extends TaskTypeFormComponent<TaskTypeForm> {
  
  constructor(
    private confirmationService: ConfirmationService,
    private changeDetectorRef: ChangeDetectorRef,
    private transloco: TranslocoService,
    private readonly taskService: TaskService) {
    super();
    
  }

  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'clustering'
  };
  
  public testSetOriginalData(data: any): void {
    this.onOriginalDataChanged(data);
  }


  protected override onOriginalDataChanged(originalData: unknown | undefined): void {
    if (!this.form || !originalData) {
      console.log('Form is not initialized or originalData is undefined');
      return;
    }
    this.initialValues.numberOfClusters = this.form.get('numberOfClusters')?.value;
    this.initialValues.distanceMetric = this.form.get('distanceMetric')?.value;
    this.initialValues.taskLength = this.form.get('taskLength')?.value;
  }
  
  initialValues: any = {};

  distanceMetricOptions = [
    { label: this.transloco.translate('taskTypes.clustering.metric.euclidean'), value: DistanceMetric.EUCLIDEAN },
    { label: this.transloco.translate('taskTypes.clustering.metric.manhattan'), value: DistanceMetric.MANHATTAN }
  ];

  taskLengthOptions = [
    { label: this.transloco.translate('taskTypes.clustering.taskLength.short'), value: TaskLengthLevel.SHORT },
    { label: this.transloco.translate('taskTypes.clustering.taskLength.medium'), value: TaskLengthLevel.MEDIUM },
    { label: this.transloco.translate('taskTypes.clustering.taskLength.long'), value: TaskLengthLevel.LONG }
  ];

  protected override initForm() {
    this.form.addControl('numberOfClusters', new FormControl<number | null>(null, [Validators.required, Validators.min(2), Validators.max(5)]));
    //this.form.addControl('numberOfDataPoints', new FormControl<number | null>(null, [Validators.required, Validators.min(2), Validators.max(20)]));
    this.form.addControl('distanceMetric', new FormControl<DistanceMetric | null>(null, [Validators.required]));
    this.form.addControl('taskLength', new FormControl<TaskLengthLevel | null>(null, [Validators.required]));
    this.form.addControl('solution', new FormControl<string | null>(null));

    this.form.addControl('deductionWrongClusters', new FormControl<number | null>(null, [Validators.required]));
    this.form.addControl('deductionWrongLabels', new FormControl<number | null>(null, [Validators.required]));
    this.form.addControl('deductionWrongCentroids', new FormControl<number | null>(null, [Validators.required]));
  }


  ngOnInit() {
    // Save the initial form values
    this.initialValues = {
      numberOfClusters: this.form.get('numberOfClusters')?.value,
      distanceMetric: this.form.get('distanceMetric')?.value,
      taskLength: this.form.get('taskLength')?.value
    };
  }

  protected override getFormDefaultValues(): Partial<{ [K in keyof TaskTypeForm]: any }> | undefined {
    return {
      numberOfClusters: 2,
      distanceMetric: DistanceMetric.EUCLIDEAN,
      taskLength: TaskLengthLevel.SHORT,
      solution: null,

      deductionWrongClusters: 2,
      deductionWrongLabels: 1,
      deductionWrongCentroids: 1,
    };
  }

  showSolution = false;

  toggleSolution() {
    this.showSolution = !this.showSolution;
  }
  
  get showDeleteDescriptionButton(): boolean {
    if (!this.task?.id) return false;

    return (
      this.form.get('numberOfClusters')?.value !== this.initialValues.numberOfClusters ||
      this.form.get('distanceMetric')?.value !== this.initialValues.distanceMetric ||
      this.form.get('taskLength')?.value !== this.initialValues.taskLength
    );
  }

  confirmClearDescription() {
    this.confirmationService.confirm({
      message: this.transloco.translate('taskTypes.clustering.confirmDeleteDesc.message'),
      header: this.transloco.translate('taskTypes.clustering.confirmDeleteDesc.header'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.transloco.translate('taskTypes.clustering.confirmDeleteDesc.accept'),
      rejectLabel: this.transloco.translate('taskTypes.clustering.confirmDeleteDesc.reject'),
      accept: () => {
        this.clearDescription();
      }
    });
  }

  clearDescription() {
    this.parentForm?.get('descriptionDe')?.setValue('');
    this.parentForm?.get('descriptionEn')?.setValue('');
  }

}

export enum DistanceMetric {
  EUCLIDEAN = 'EUCLIDEAN',
  MANHATTAN = 'MANHATTAN'
}

export enum TaskLengthLevel {
  SHORT = 'SHORT',
  MEDIUM = 'MEDIUM',
  LONG = 'LONG'
  //FULL_OPTIMIZATION = 'FULL_OPTIMIZATION'
}

interface TaskTypeForm {
  numberOfClusters: FormControl<number | null>;
  //numberOfDataPoints: FormControl<number | null>;
  distanceMetric: FormControl<DistanceMetric | null>;
  taskLength: FormControl<TaskLengthLevel | null>;
  solution: FormControl<string | null>;

  deductionWrongClusters: FormControl<number | null>;
  deductionWrongLabels: FormControl<number | null>;
  deductionWrongCentroids: FormControl<number | null>;
}
