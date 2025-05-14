import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective } from '@ngneat/transloco';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TaskTypeFormComponent } from '../task-type-form.component';

interface TaskTypeForm {
  solution: FormControl<string | null>;
}

@Component({
  selector: 'dke-task-type-owl',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslocoDirective,
    InputTextareaModule
  ],
  templateUrl: './task-type-owl.component.html',
  styleUrl: './task-type-owl.component.scss'
})
export class TaskTypeOwlComponent extends TaskTypeFormComponent<TaskTypeForm> {
  constructor() {
    super();
  }

  protected override initForm(): void {
    this.form.addControl('solution', new FormControl<string | null>('', [
      Validators.required,
      Validators.minLength(1)
    ]));
  }
}
