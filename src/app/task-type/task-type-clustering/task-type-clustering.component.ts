import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { TaskTypeFormComponent } from '../task-type-form.component';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { NgIf, NgForOf } from '@angular/common';
import { TranslocoDirective, TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { editor } from 'monaco-editor';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { SubmissionDto, TaskService } from '../../api';

@Component({
  selector: 'dke-task-type-clustering',
  standalone: true,
  imports: [
    MonacoEditorModule,
    TranslocoDirective,
    TranslocoPipe,
    ReactiveFormsModule,
    DropdownModule,
    InputNumberModule,
    NgIf,
    NgForOf
  ],
  templateUrl: './task-type-clustering.component.html',
  styleUrl: './task-type-clustering.component.scss'
})
export class TaskTypeClusteringComponent extends TaskTypeFormComponent<TaskTypeForm> {
  
  constructor(private changeDetectorRef: ChangeDetectorRef,
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
  async fetchSolutionViaSubmission(): Promise<void> {

    try {
      this.loading = true;
      if (!this.task?.id) {
        console.error('Task ID is missing.');
        return;
      }
this.parentForm
      const result = await this.taskService.submit({
        taskId: this.task!.id,
        language: 'en',
        mode: 'DIAGNOSE',
        feedbackLevel: 3,
        submission: {
          input: '[(36,50): J]; [(40,41): B, D]'   // dummy payload
        }
      });

      // Try to extract solution string
      const feedbackLines: string[] = [];

      const general = result.grading?.generalFeedback;
      if (general) {
        feedbackLines.push('Solution: <br>', general, '');
      }

      result.grading?.criteria?.forEach(criterion => {
        feedbackLines.push(`<br> ${criterion.name}: <br>`, criterion.feedback, '');
      });
        console.log('Fetched solution:', result);

      this.form.get('solution')?.setValue(feedbackLines.join('\n'));

    } catch (err) {
      console.error('[TaskSubmissionComponent] Could not fetch solution via submission', err);
    } finally {
      this.loading = false;
    }
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
