import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslocoDirective } from '@ngneat/transloco';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TaskGroupTypeFormComponent } from '../task-group-type-form.component';

interface TaskGroupTypeForm {
  solution: FormControl<string | null>;
}

@Component({
  selector: 'dke-task-group-type-owl',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslocoDirective,
    InputTextareaModule
  ],
  templateUrl: './task-group-type-owl.component.html',
  styleUrl: './task-group-type-owl.component.scss'
})
export class TaskGroupTypeOwlComponent extends TaskGroupTypeFormComponent<TaskGroupTypeForm> {
  constructor() {
    super();
  }

  protected override initForm(): void {
    /*this.form.addControl('solution', new FormControl<string | null>('', [
      Validators.required,
      Validators.minLength(1)
    ]));*/
  }
}
