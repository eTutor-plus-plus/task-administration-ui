import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { TaskTypeFormComponent } from '../task-type-form.component';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { NgIf, NgForOf } from '@angular/common';
import { TranslocoDirective, TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { editor } from 'monaco-editor';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

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
  
  constructor(private changeDetectorRef: ChangeDetectorRef, private transloco: TranslocoService) {
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

  difficultyOptions = [
    { label: this.transloco.translate('taskTypes.clustering.difficulty.easy'), value: DifficultyLevel.EASY },
    { label: this.transloco.translate('taskTypes.clustering.difficulty.medium'), value: DifficultyLevel.MEDIUM },
    { label: this.transloco.translate('taskTypes.clustering.difficulty.hard'), value: DifficultyLevel.HARD }
    //{ label: this.transloco.translate('taskTypes.clustering.difficulty.full'), value: DifficultyLevel.FULL_OPTIMIZATION }
  ];

  protected override initForm() {
    this.form.addControl('numberOfClusters', new FormControl<number | null>(null, [Validators.required, Validators.min(2), Validators.max(5)]));
    //this.form.addControl('numberOfDataPoints', new FormControl<number | null>(null, [Validators.required, Validators.min(2), Validators.max(20)]));
    this.form.addControl('distanceMetric', new FormControl<DistanceMetric | null>(null, [Validators.required]));
    this.form.addControl('difficulty', new FormControl<DifficultyLevel | null>(null, [Validators.required]));
  }

  protected override getFormDefaultValues(): Partial<{ [K in keyof TaskTypeForm]: any }> | undefined {
    return {
      numberOfClusters: 2,
      //numberOfDataPoints: 5,
      distanceMetric: DistanceMetric.EUCLIDEAN,
      difficulty: DifficultyLevel.EASY
    };
  }
}

export enum DistanceMetric {
  EUCLIDEAN = 'EUCLIDEAN',
  MANHATTAN = 'MANHATTAN'
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
  //FULL_OPTIMIZATION = 'FULL_OPTIMIZATION'
}

interface TaskTypeForm {
  numberOfClusters: FormControl<number | null>;
  //numberOfDataPoints: FormControl<number | null>;
  distanceMetric: FormControl<DistanceMetric | null>;
  difficulty: FormControl<DifficultyLevel | null>;
}
