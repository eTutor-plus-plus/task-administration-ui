import { Component } from '@angular/core';
import { TaskTypeFormComponent } from '../task-type-form.component';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { TranslocoDirective } from '@ngneat/transloco';

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
export class TaskTypeHierarchicalClusteringComponent extends TaskTypeFormComponent<TaskTypeForm>{
    protected override initForm(): void {
        this.form.addControl('nDataPoints', new FormControl<number | null>(null, [Validators.required]));
    }

  constructor() {
    super();
  }

}

interface TaskTypeForm{
  nDataPoints: FormControl<number | null>;
}
