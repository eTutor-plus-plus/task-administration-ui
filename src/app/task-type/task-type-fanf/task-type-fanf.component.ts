import { Component } from '@angular/core';
import { Button } from 'primeng/button';
import { EditorComponent } from 'ngx-monaco-editor-v2';
import { InputTextModule } from 'primeng/inputtext';
import { NgForOf } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslocoDirective, TranslocoPipe } from '@ngneat/transloco';
import { TaskTypeFormComponent } from '../task-type-form.component';
import { GradingStrategy } from '../task-type-xquery/grading-strategy.enum';

@Component({
  selector: 'dke-task-type-fanf',
  standalone: true,
  imports: [
    Button,
    EditorComponent,
    InputTextModule,
    NgForOf,
    PaginatorModule,
    ReactiveFormsModule,
    TranslocoDirective,
    TranslocoPipe
  ],
  templateUrl: './task-type-fanf.component.html',
  styleUrl: './task-type-fanf.component.scss'
})
export class TaskTypeFanfComponent extends TaskTypeFormComponent<TaskTypeForm> {
  constructor() {
    super();
  }
  subtypeOptions =
    [
    { name: this.translationService.translate('taskTypes.fanf.subtype.keysDetermination') , id: 0 },
    { name: this.translationService.translate('taskTypes.fanf.subtype.attributeClosure') , id: 1},
      { name: this.translationService.translate('taskTypes.fanf.subtype.minimalCover') , id: 2},
      { name: this.translationService.translate('taskTypes.fanf.subtype.normalFormDetermination') , id: 3},
      { name: this.translationService.translate('taskTypes.fanf.subtype.normalization') , id: 4}
    ];


  protected override initForm(): void {
    this.form.addControl('baseRelationName', new FormControl<string | null>(null));
    this.form.addControl('baseRelationAttributes', new FormControl<string | null>(null));
    this.form.addControl('baseRelationDependencies', new FormControl<string | null>(null));
    this.form.addControl('subtype', new FormControl<number | null>(null));
    this.form.addControl('keysDeterminationPenaltyPerMissingKey', new FormControl<number | null>(null));
    this.form.addControl('keysDeterminationPenaltyPerIncorrectKey', new FormControl<number | null>(null));
    this.form.addControl('attributeClosureBaseAttributes', new FormControl<string | null>(null));
    this.form.addControl('attributeClosurePenaltyPerMissingAttribute', new FormControl<number | null>(null));
    this.form.addControl('attributeClosurePenaltyPerIncorrectAttribute', new FormControl<number | null>(null));
    this.form.addControl('minimalCoverPenaltyPerNonCanonicalDependency', new FormControl<number | null>(null));
    this.form.addControl('minimalCoverPenaltyPerTrivialDependency', new FormControl<number | null>(null));
    this.form.addControl('minimalCoverPenaltyPerExtraneousDependency', new FormControl<number | null>(null));
    this.form.addControl('minimalCoverPenaltyPerRedundantDependency', new FormControl<number | null>(null));
    this.form.addControl('minimalCoverPenaltyPerMissingDependencyVsSolution', new FormControl<number | null>(null));
    this.form.addControl('minimalCoverPenaltyPerIncorrectDependencyVsSolution', new FormControl<number | null>(null));
  this.form.addControl('normalFormDeterminationPenaltyForIncorrectOverallNormalform', new FormControl<number | null>(null));
    this.form.addControl('normalFormDeterminationPenaltyPerIncorrectDependencyNormalform', new FormControl<number | null>(null));
    this.form.addControl('normalizationTargetLevel', new FormControl<string | null>(null));
    this.form.addControl('normalizationMaxLostDependencies', new FormControl<number | null>(null));
    this.form.addControl('normalizationPenaltyPerLostAttribute', new FormControl<number | null>(null));
    this.form.addControl('normalizationPenaltyForLossyDecomposition', new FormControl<number | null>(null));
    this.form.addControl('normalizationPenaltyPerNonCanonicalDependency', new FormControl<number | null>(null));
    this.form.addControl('normalizationPenaltyPerTrivialDependency', new FormControl<number | null>(null));
    this.form.addControl('normalizationPenaltyPerExtraneousAttributeInDependencies', new FormControl<number | null>(null));
    this.form.addControl('normalizationPenaltyPerRedundantDependency', new FormControl<number | null>(null));
    this.form.addControl('normalizationPenaltyPerExcessiveLostDependency', new FormControl<number | null>(null));
    this.form.addControl('normalizationPenaltyPerMissingNewDependency', new FormControl<number | null>(null));
    this.form.addControl('normalizationPenaltyPerIncorrectNewDependency', new FormControl<number | null>(null));
    this.form.addControl('normalizationPenaltyPerMissingKey', new FormControl<number | null>(null));
    this.form.addControl('normalizationPenaltyPerIncorrectKey', new FormControl<number | null>(null));
    this.form.addControl('normalizationPenaltyPerIncorrectNFRelation', new FormControl<number | null>(null));
  }

}


interface TaskTypeForm {
  baseRelationAttributes: FormControl<string | null>;
  baseRelationDependencies: FormControl<string | null>;
  baseRelationName: FormControl<string | null>;
  subtype: FormControl<number | null>;
  keysDeterminationPenaltyPerMissingKey: FormControl<number | null>;
  keysDeterminationPenaltyPerIncorrectKey: FormControl<number | null>;
  attributeClosureBaseAttributes: FormControl<string | null>;
  attributeClosurePenaltyPerMissingAttribute: FormControl<number | null>;
  attributeClosurePenaltyPerIncorrectAttribute: FormControl<number | null>;
  minimalCoverPenaltyPerNonCanonicalDependency: FormControl<number | null>;
  minimalCoverPenaltyPerTrivialDependency: FormControl<number | null>;
  minimalCoverPenaltyPerExtraneousDependency: FormControl<number | null>;
  minimalCoverPenaltyPerRedundantDependency: FormControl<number | null>;
  minimalCoverPenaltyPerMissingDependencyVsSolution: FormControl<number | null>;
  minimalCoverPenaltyPerIncorrectDependencyVsSolution: FormControl<number | null>;
  normalFormDeterminationPenaltyForIncorrectOverallNormalform: FormControl<number | null>;
  normalFormDeterminationPenaltyPerIncorrectDependencyNormalform: FormControl<number | null>;
  normalizationTargetLevel: FormControl<string | null>;
  normalizationMaxLostDependencies: FormControl<number | null>;
  normalizationPenaltyPerLostAttribute: FormControl<number | null>;
  normalizationPenaltyForLossyDecomposition: FormControl<number | null>;
  normalizationPenaltyPerNonCanonicalDependency: FormControl<number | null>;
  normalizationPenaltyPerTrivialDependency: FormControl<number | null>;
  normalizationPenaltyPerExtraneousAttributeInDependencies: FormControl<number | null>;
  normalizationPenaltyPerRedundantDependency: FormControl<number | null>;
  normalizationPenaltyPerExcessiveLostDependency: FormControl<number | null>;
  normalizationPenaltyPerMissingNewDependency: FormControl<number | null>;
  normalizationPenaltyPerIncorrectNewDependency: FormControl<number | null>;
  normalizationPenaltyPerMissingKey: FormControl<number | null>;
  normalizationPenaltyPerIncorrectKey: FormControl<number | null>;
  normalizationPenaltyPerIncorrectNFRelation: FormControl<number | null>;
}
