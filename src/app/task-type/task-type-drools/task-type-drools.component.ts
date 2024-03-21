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
}

interface TaskTypeForm {
  solution: FormControl<string | null>;
  classes: FormArray<FormGroup<{ classname: FormControl<string | null>, classBody: FormControl<string | null> }>>;
  objects: FormControl<string | null>;
  validationClassname: FormControl<string | null>;
  errorWeighting: FormControl<number | null>;
}
