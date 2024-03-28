import { Component } from '@angular/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { PaginatorModule } from 'primeng/paginator';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
  readonly droolsEditorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'drools'
  };
  readonly csvEditorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'csv'
  };
  readonly javaEditorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'java'
  };

  classes = new FormArray<FormGroup<{ classname: FormControl<string | null>, classBody: FormControl<string | null> }>>([]);

  constructor() {
    super();
  }

  override set formData(data: unknown) {
      super.formData = data;
      if(data) {
        this.setDroolsData(data);
      }
  }

  protected override initForm(): void {
    this.form.addControl('solution', new FormControl<string | null>(null));
    this.form.addControl('objects', new FormControl<string | null>(null));
    this.form.addControl('validationClassname', new FormControl<string | null>(null));
    this.form.addControl('errorWeighting', new FormControl<number | null>(null));
    this.form.addControl('classes', this.classes);
  }

  get itemsControls() {
    return this.classes.controls as FormGroup[];
  }

  addDroolsClass() {
    const itemsForm = new FormGroup({
      classname: new FormControl(''),
      classBody: new FormControl('')
    });
    this.classes.push(itemsForm);
  }

  removeDroolsClass(index: number) {
    this.classes.removeAt(index);
  }

  setDroolsData(dto: any) {
    // Clear the existing form array
    while (this.classes.length !== 0) {
      this.classes.removeAt(0);
    }

    // Add the classes from the DTO to the form array
    dto.classes.forEach((c: any) => {
      const classForm = new FormGroup({
        classname: new FormControl(c.classname),
        classBody: new FormControl(c.classBody)
      });
      this.classes.push(classForm);
    });
  }
}


interface TaskTypeForm {
  solution: FormControl<string | null>;
  classes: FormArray<FormGroup<{ classname: FormControl<string | null>, classBody: FormControl<string | null>}>>;
  objects: FormControl<string | null>;
  validationClassname: FormControl<string | null>;
  errorWeighting: FormControl<number | null>;
}
