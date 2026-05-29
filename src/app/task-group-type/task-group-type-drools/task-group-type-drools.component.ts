import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { TaskGroupTypeFormComponent } from '../task-group-type-form.component';

@Component({
  selector: 'dke-task-group-type-drools',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './task-group-type-drools.component.html',
  styleUrl: './task-group-type-drools.component.scss'
})
export class TaskGroupTypeDroolsComponent extends TaskGroupTypeFormComponent<TaskGroupTypeForm> {

  public constructor() {
    super();
  }

  protected override initForm(): void {
  }
}

interface TaskGroupTypeForm {
}
