import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective, TranslocoPipe } from '@ngneat/transloco';
import { Subject, takeUntil } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';

import { AuditInformationComponent, DialogEditFormComponent } from '../../../layout';
import { OrganizationalUnitDto, OrganizationalUnitService, TaskCategoryDto, TaskCategoryService } from '../../../api';

/**
 * Task Category Form
 */
@Component({
  selector: 'dke-task-category-form',
  standalone: true,
  imports: [
    ButtonModule,
    CalendarModule,
    CheckboxModule,
    DropdownModule,
    InputTextModule,
    MessagesModule,
    ReactiveFormsModule,
    TranslocoDirective,
    TranslocoPipe,
    AuditInformationComponent
  ],
  templateUrl: './task-category-form.component.html',
  styleUrl: './task-category-form.component.scss'
})
export class TaskCategoryFormComponent extends DialogEditFormComponent<TaskCategoryDto, TaskCategoryService, TaskCategoryForm> implements OnInit, OnDestroy {

  /**
   * The organizational units.
   */
  organizationalUnitDropdowns: OrganizationalUnitDto[];

  /**
   * The parent categories.
   */
  parentDropdowns: TaskCategoryDto[];

  /**
   * Whether the form should be readonly.
   */
  readonly readonly: boolean;

  private categories: TaskCategoryDto[];
  private editableUnits: number[];
  private readonly destroy$ = new Subject<void>();

  /**
   * Creates a new instance of class TaskCategoryFormComponent.
   */
  constructor(entityService: TaskCategoryService,
              private readonly ouService: OrganizationalUnitService) {
    super(entityService, new FormGroup<TaskCategoryForm>({
      name: new FormControl<string | null>(null, [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
      parentId: new FormControl<number | null>(null, []),
      organizationalUnitId: new FormControl<number | null>(null, [Validators.required])
    }), 'taskCategories.');
    this.parentDropdowns = [];
    this.organizationalUnitDropdowns = [];
    this.categories = [];
    if (this.dialogConf.data) {
      this.readonly = this.dialogConf.data.readonly ?? false;
      this.editableUnits = this.dialogConf.data.editableUnits;
    } else {
      this.readonly = false;
      this.editableUnits = [];
    }
  }

  /**
   * Initializes the form.
   */
  ngOnInit(): void {
    this.loadOrganizationalUnits();
    this.loadTaskCategories();

    if (!this.readonly)
      this.form.controls.organizationalUnitId.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(val => this.setAllowedParents(val));
  }

  /**
   * Unsubscribes from all subscriptions.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  override getId(entity: TaskCategoryDto): string | number {
    return entity.id;
  }

  override getLastModifiedDate(entity: TaskCategoryDto): string | null {
    return entity.lastModifiedDate;
  }

  override getMessageParams(entity: TaskCategoryDto | {
    name: any;
    parentId: any;
    organizationalUnitId: any;
  }, type: 'successCreate' | 'errorCreate' | 'successUpdate' | 'errorUpdate'): Record<string, unknown> {
    return {name: entity.name};
  }

  private async loadOrganizationalUnits(): Promise<void> {
    try {
      this.startLoading();
      if (this.readonly && this.originalEntity) {
        const result = await this.ouService.get(this.originalEntity.organizationalUnitId);
        this.organizationalUnitDropdowns = [result];
      } else {
        const result = await this.ouService.load(0, 9999, [{field: 'name', order: 1}]);
        this.organizationalUnitDropdowns = result.content;
      }

      if (!this.readonly) {
        this.organizationalUnitDropdowns = this.organizationalUnitDropdowns.filter(x => this.editableUnits.includes(x.id));
        if (!this.originalEntity && this.organizationalUnitDropdowns.length === 1)
          this.form.patchValue({organizationalUnitId: this.organizationalUnitDropdowns[0].id});
        this.setAllowedParents();
      }
    } catch (err) {
      console.error('[TaskCategoryFormComponent] Could not load organizational units', err);
      this.messageService.add({
        severity: 'error',
        detail: this.translationService.translate('organizationalUnits.errors.load'),
        life: 10000,
        key: 'global'
      });
    } finally {
      this.finishLoading();
    }
  }

  private async loadTaskCategories(): Promise<void> {
    try {
      this.startLoading();
      if (this.readonly && this.originalEntity) {
        if (this.originalEntity.parentId) {
          const result = await this.entityService.get(this.originalEntity.parentId);
          this.categories = [result];
        } else
          this.categories = [];
      } else {
        const result = await this.entityService.load(0, 9999, [{field: 'name', order: 1}]);
        this.categories = result.content;
      }

      if (!this.readonly)
        this.setAllowedParents();
    } catch (err) {
      console.error('[TaskCategoryFormComponent] Could not load task categories', err);
      this.messageService.add({
        severity: 'error',
        detail: this.translationService.translate('taskCategories.errors.load'),
        life: 10000,
        key: 'global'
      });
    } finally {
      this.finishLoading();
    }
  }

  private setAllowedParents(ouId?: number | null): void {
    const ou = ouId ?? this.form.value.organizationalUnitId;
    this.parentDropdowns = this.categories.filter(x => x.organizationalUnitId === ou);
    if (!this.originalEntity)
      return;

    // do not allow select self as parent
    this.parentDropdowns = this.parentDropdowns.filter(x => x.id !== this.originalEntity?.id);

    // try to prevent loops already in form (find categories that depend on this entity)
    const children: number[] = this.findChildren(this.originalEntity.id);
    this.parentDropdowns = this.parentDropdowns.filter(x => !children.includes(x.id));
  }

  private findChildren(parentId: number): number[] {
    const result: number[] = [];
    for (const c of this.parentDropdowns.filter(x => x.parentId === parentId)) {
      result.push(c.id);
      result.push(...this.findChildren(c.id));
    }
    return result;
  }
}

interface TaskCategoryForm {
  name: FormControl<string | null>;
  parentId: FormControl<number | null>;
  organizationalUnitId: FormControl<number | null>;
}
