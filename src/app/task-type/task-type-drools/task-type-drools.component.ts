import { Component } from '@angular/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { PaginatorModule } from 'primeng/paginator';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { TranslocoDirective, TranslocoPipe } from '@ngneat/transloco';
import { ButtonModule } from 'primeng/button';
import { TreeSelectModule } from 'primeng/treeselect';
import { TaskTypeFormComponent } from '../task-type-form.component';
import { editor } from 'monaco-editor';
import { InputTextModule } from 'primeng/inputtext';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'dke-task-type-drools',
  standalone: true,
  imports: [
    MonacoEditorModule,
    PaginatorModule,
    ReactiveFormsModule,
    TranslocoDirective,
    ButtonModule,
    TranslocoPipe,
    TreeSelectModule,
    InputTextModule,
    NgForOf
  ],
  templateUrl: './task-type-drools.component.html',
  styleUrl: './task-type-drools.component.scss'
})


export class TaskTypeDroolsComponent extends TaskTypeFormComponent<TaskTypeForm> {
  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'java'
  };

  droolsClasses = new FormArray<FormGroup<{classname: FormControl<string|null>, classBody: FormControl<string|null>}>>([]);
  protected override initForm(): void {
    this.form.addControl('droolsSolution', new FormControl<string | null>(null));
    this.form.addControl('droolsObjects', new FormControl<string | null>(null));
    this.form.addControl('droolsValidationClassname', new FormControl<string | null>(null));
    this.form.addControl('droolsErrorWeighting', new FormControl<number | null>(null));
    this.form.addControl("droolsClasses", this.droolsClasses);
  }



  constructor() {
    super();

  }
  get itemsControls() {
    return this.droolsClasses.controls as FormGroup[];
  }
  addDroolsClass() {
    const itemsForm = new FormGroup({
      classname: new FormControl(''),
      classBody: new FormControl('')
    });
    this.droolsClasses.push(itemsForm);
  }

  removeDroolsClass(index: number) {
    this.droolsClasses.removeAt(index);
  }
}


interface TaskTypeForm {
  droolsSolution: FormControl<string | null>;
  droolsClasses: FormArray<FormGroup<{classname: FormControl<string|null>, classBody: FormControl<string|null>}>>;
  droolsObjects: FormControl<string | null>;
  droolsValidationClassname: FormControl<string | null>;
  droolsErrorWeighting: FormControl<number | null>;
}
