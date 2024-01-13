import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective, TranslocoPipe } from '@ngneat/transloco';
import { Subject, takeUntil } from 'rxjs';

import { ConfirmationService, SharedModule } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';

import { AuthService, Role } from '../../auth';
import { TableDialogOverviewComponent } from '../../layout';
import { OrganizationalUnitDto, OrganizationalUnitService, TaskCategoryDto, TaskCategoryService } from '../../api';
import { TaskCategoryFormComponent } from './task-category-form/task-category-form.component';

/**
 * Page: Task Categories Overview
 */
@Component({
  selector: 'dke-task-categories',
  standalone: true,
  imports: [
    ButtonModule,
    ConfirmPopupModule,
    InputTextModule,
    SharedModule,
    TableModule,
    TagModule,
    TranslocoDirective,
    TranslocoPipe,
    TooltipModule,
    NgClass,
    InputNumberModule,
    FormsModule,
    DropdownModule
  ],
  providers: [ConfirmationService, DialogService],
  templateUrl: './task-categories.component.html',
  styleUrl: './task-categories.component.scss'
})
export class TaskCategoriesComponent extends TableDialogOverviewComponent<TaskCategoryDto, TaskCategoryService> implements OnInit, OnDestroy {

  /**
   * The highest role of the current user.
   */
  role: Role;

  /**
   * Whether to show organizational unit column.
   */
  showOrganizationalUnit: boolean;

  /**
   * The organizational units.
   */
  organizationalUnits: OrganizationalUnitDto[];

  private readonly destroy$: Subject<void> = new Subject<void>();

  /**
   * Creates a new instance of class TaskAppsComponent.
   */
  constructor(entityService: TaskCategoryService,
              private readonly organizationalUnitService: OrganizationalUnitService,
              private readonly authService: AuthService) {
    super(entityService, [{field: 'organizationalUnit.name', order: 1}, {field: 'parent.id', order: -1}, {
      field: 'name',
      order: 1
    }], 'taskCategories.', TaskCategoryFormComponent, {
      style: {
        'max-width': '60em',
        'min-width': '30em'
      }
    });
    this.organizationalUnits = [];
    this.role = authService.user?.maxRole ?? 'tutor';
    this.showOrganizationalUnit = authService.user?.isFullAdmin || (authService?.user?.roles.length ?? 0) > 1;
  }

  /**
   * Loads organizational units and listens for user changes.
   */
  ngOnInit(): void {
    this.authService.userChanged.pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.role = user?.maxRole ?? 'tutor';
        this.showOrganizationalUnit = user?.isFullAdmin || (user?.roles.length ?? 0) > 1;
      });
    if (this.showOrganizationalUnit)
      this.loadOrganizationalUnits();
  }

  /**
   * Unsubscribes from all subscriptions.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Gets the name of the organizational unit.
   */
  getOUName(id: number): string {
    const ou = this.organizationalUnits.find(x => x.id === id);
    return ou ? ou.name : id + '';
  }

  getId(entity: TaskCategoryDto): string | number {
    return entity.id;
  }

  getMessageParams(entity: TaskCategoryDto, type: 'success' | 'error'): Record<string, unknown> {
    return {name: entity.name};
  }

  override getAdditionalDialogData(action: 'create' | 'edit', entity: TaskCategoryDto | null): Record<string, unknown> {
    const user = this.authService.user;
    return {
      readonly: action === 'create' ? false : (!user || (!user.isFullAdmin &&
        user.roles.filter(x => x.organizationalUnit === entity?.organizationalUnitId && x.role === 'tutor').length > 0)),
      editableUnits: !user ? [] : (
        user.isFullAdmin ?
          this.organizationalUnits.map(x => x.id) :
          user.roles.filter(x => x.role !== 'tutor').map(x => x.organizationalUnit)
      )
    };
  }

  override canCreate(): boolean {
    return this.role !== 'tutor';
  }

  override canDelete(entity: TaskCategoryDto): boolean {
    const user = this.authService.user;
    if (!user)
      return false;

    if (user.isFullAdmin)
      return true;

    const ou = user.roles.find(x => x.organizationalUnit == entity.organizationalUnitId);
    return ou ? ou.role !== 'tutor' : false;
  }

  private async loadOrganizationalUnits(): Promise<void> {
    this.startLoading();
    try {
      const result = await this.organizationalUnitService.load(0, 999999, [{field: 'name', order: 1}]);
      this.organizationalUnits = result.content;
    } catch (err) {
      console.error('[TaskCategoriesComponent] Could not load organizational units', err);
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

}
