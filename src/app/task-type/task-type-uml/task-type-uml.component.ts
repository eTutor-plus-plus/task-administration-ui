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
  selector: 'dke-task-type-uml',
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
  templateUrl: './task-type-uml.component.html',
  styleUrl: './task-type-uml.component.scss'
})
export class TaskTypeUmlComponent extends TaskTypeFormComponent<TaskTypeForm> {

  readonly umlEditorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'sql'
  };

  umlBlock = new FormArray<FormGroup<{ umlBlockItem: FormControl<string | null> }>>([]);

  constructor() {
    super();
  }

  protected override initForm(): void {
    this.form.addControl('umlBlock', this.umlBlock);
  }

  get itemsControls() {
    return this.umlBlock.controls as FormGroup[];
  }

  addUmlBlock() {
    const itemsForm = new FormGroup({
      umlBlockItem: new FormControl('')
    });
    this.umlBlock.push(itemsForm);
  }
  removeUmlBlock(index: number) {
    this.umlBlock.removeAt(index);
  }
}

interface TaskTypeForm {
  umlBlock: FormArray<FormGroup<{umlBlockItem: FormControl<string | null> }>>;

}
