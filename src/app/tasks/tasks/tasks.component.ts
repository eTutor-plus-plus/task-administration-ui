import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoDirective, TranslocoPipe } from '@ngneat/transloco';
import { Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { ConfirmationService, SharedModule } from 'primeng/api';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';

import { AuthService, Role } from '../../auth';
import { TableOverviewComponent } from '../../layout';
import { EMPTY_PAGE, OrganizationalUnitDto, OrganizationalUnitService, StatusEnum, TaskDto, TaskGroupDto, TaskGroupService, TaskService } from '../../api';
import { convertStringToSeverity } from '../helpers';
import { CheckboxModule } from 'primeng/checkbox';

/**
 * Page: Tasks Overview
 */
@Component({
  selector: 'dke-tasks',
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
    DropdownModule,
    CheckboxModule
  ],
  providers: [ConfirmationService],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss'
})
export class TasksComponent extends TableOverviewComponent<TaskDto, TaskService> implements OnInit, OnDestroy {

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

  /**
   * The task groups.
   */
  taskGroups: TaskGroupDto[];

  /**
   * The type dropdown values.
   */
  types: { value: string, text: string }[];

  /**
   * The status dropdown values.
   */
  readonly statuses: { value: StatusEnum, text: string }[];

  /**
   * Whether to show the exam task column.
   *
   * The checkboxes in this column belong to a feature that is not finished yet
   * (they are not bound to the task data), so the column is hidden for now.
   * Set to {@code true} to show it again once the feature is completed.
   */
  readonly showExamTaskColumn: boolean = false;

  /**
   * The value of the task ID search input.
   */
  idSearch: number | null = null;

  /**
   * The task ID the table is currently restricted to, or {@code null} if no ID search is active.
   */
  activeIdSearch: number | null = null;

  private readonly destroy$: Subject<void> = new Subject<void>();

  /**
   * Creates a new instance of class TasksComponent.
   */
  constructor(entityService: TaskService,
              private readonly organizationalUnitService: OrganizationalUnitService,
              private readonly taskGroupService: TaskGroupService,
              private readonly authService: AuthService,
              private readonly router: Router,
              private readonly route: ActivatedRoute) {
    super(entityService, [{field: 'organizationalUnit.name', order: 1}, {field: 'taskType', order: 1}, {field: 'taskGroup.name', order: 1}, {field: 'title', order: 1}], 'tasks.');
    this.organizationalUnits = [];
    this.taskGroups = [];
    this.types = [];
    this.role = authService.user?.maxRole ?? 'TUTOR';
    this.showOrganizationalUnit = authService.user?.isFullAdmin || (authService?.user?.roles.length ?? 0) > 1;
    this.statuses = [
      {value: StatusEnum.DRAFT, text: this.translationService.translate('taskStatus.' + StatusEnum.DRAFT)},
      {value: StatusEnum.READY_FOR_APPROVAL, text: this.translationService.translate('taskStatus.' + StatusEnum.READY_FOR_APPROVAL)},
      {value: StatusEnum.APPROVED, text: this.translationService.translate('taskStatus.' + StatusEnum.APPROVED)}
    ];
    if (!this.showOrganizationalUnit)
      this.defaultSort = this.defaultSort.slice(1);
  }

  /**
   * Loads organizational units and listens for user changes.
   */
  ngOnInit(): void {
    this.authService.userChanged.pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.role = user?.maxRole ?? 'TUTOR';
        this.showOrganizationalUnit = user?.isFullAdmin || (user?.roles.length ?? 0) > 1;
      });
    if (this.showOrganizationalUnit)
      this.loadOrganizationalUnits();
    this.loadTaskGroups();

    this.entityService.getTypes()
      .then(value => this.types = value.map(x => {
        return {
          text: this.translationService.translate('taskTypes.' + x + '.title'),
          value: x
        };
      }).sort((a, b) => a.text.localeCompare(b.text))); // ignore errors
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

  /**
   * Gets the name of the task group.
   */
  getTaskGroupName(id?: number): string {
    if (!id)
      return '--';
    const tg = this.taskGroups.find(x => x.id === id);
    return tg?.name ?? id.toString();
  }

  /**
   * Shows only the task with the ID entered in the search input.
   */
  async searchById(): Promise<void> {
    const id = this.idSearch;
    if (id === null || id === undefined || !Number.isInteger(id) || id <= 0) {
      await this.clearIdSearch();
      return;
    }
    this.activeIdSearch = id;
    await this.reload();
  }

  /**
   * Clears the task ID search and shows all tasks again.
   */
  async clearIdSearch(): Promise<void> {
    this.idSearch = null;
    if (this.activeIdSearch === null)
      return;
    this.activeIdSearch = null;
    await this.reload();
  }

  //#region --- Parent Overrides ---
  override async loadTableData(evt: TableLazyLoadEvent): Promise<void> {
    const id = this.activeIdSearch;
    if (id === null)
      return super.loadTableData(evt);

    try {
      setTimeout(() => this.loading = true);
      const result = await this.entityService.get(id);
      this.tableData = {
        content: [result.dto],
        page: {number: 0, size: 1, totalPages: 1, totalElements: 1}
      };
    } catch (err) {
      this.tableData = EMPTY_PAGE;
      const notFound = err instanceof HttpErrorResponse && (err.status === 404 || err.status === 403);
      this.messageService.add({
        severity: notFound ? 'warn' : 'error',
        detail: notFound
          ? this.translationService.translate(this.baseTranslationKey + 'errors.idNotFound', {id})
          : this.translationService.translate(this.baseTranslationKey + 'errors.loadSingle'),
        life: 10000,
        key: 'global'
      });
    } finally {
      setTimeout(() => this.loading = false);
    }
  }

  override getMessageParams(entity: TaskDto, type: 'error' | 'success'): Record<string, unknown> {
    return {name: entity.title};
  }

  override getId(entity: TaskDto): string | number {
    return entity.id;
  }

  override async create(): Promise<void> {
    await this.router.navigate(['create'], {relativeTo: this.route});
  }

  override async edit(entity: TaskDto): Promise<void> {
    await this.router.navigate(['edit', entity.id], {relativeTo: this.route});
  }

  override canEdit(entity: TaskDto): boolean {
    const user = this.authService.user;
    if (!user)
      return false;

    if (user.isFullAdmin)
      return true;

    const role = user.roles.find(x => x.organizationalUnit == entity.organizationalUnitId)?.role;
    return role !== 'TUTOR' || (entity.status !== 'APPROVED' && !entity.examTask);
  }

  override canDelete(entity: TaskDto): boolean {
    const user = this.authService.user;
    if (!user)
      return false;

    if (user.isFullAdmin)
      return true;

    const role = user.roles.find(x => x.organizationalUnit == entity.organizationalUnitId)?.role;
    if (role === 'TUTOR')
      return !entity.examTask && entity.status !== 'APPROVED';

    return true;
  }

  canSync(entity: TaskDto): boolean {
    const user = this.authService.user;
    if (!user)
      return false;
    if (entity.status !== 'APPROVED')
      return false;

    if (user.isFullAdmin)
      return true;

    const role = user.roles.find(x => x.organizationalUnit == entity.organizationalUnitId)?.role;
    return role ? role !== 'TUTOR' : false;
  }

  //#endregion

  /**
   * Downloads all task groups.
   */
  async download(): Promise<void> {
    try {
      this.startLoading();
      const result = await this.entityService.export();
      const a = document.createElement('a');
      a.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(result);
      a.download = 'tasks.json';
      a.click();
    } catch (err) {
      console.error('[TasksComponent] Could not download tasks', err);
      this.messageService.add({
        severity: 'error',
        detail: this.translationService.translate(this.baseTranslationKey + 'errors.load'),
        life: 10000,
        key: 'global'
      });
    } finally {
      this.finishLoading();
    }
  }

  private async loadOrganizationalUnits(): Promise<void> {
    try {
      const result = await this.organizationalUnitService.load(0, 999999, [{field: 'name', order: 1}]);
      this.organizationalUnits = result.content;
    } catch (err) {
      console.error('[TasksComponent] Could not load organizational units', err);
      this.messageService.add({
        severity: 'error',
        detail: this.translationService.translate('organizationalUnits.errors.load'),
        life: 10000,
        key: 'global'
      });
    }
  }

  private async loadTaskGroups(): Promise<void> {
    try {
      const result = await this.taskGroupService.load(0, 999999, [{field: 'name', order: 1}]);
      this.taskGroups = result.content;
    } catch (err) {
      console.error('[TasksComponent] Could not load task groups', err);
      this.messageService.add({
        severity: 'error',
        detail: this.translationService.translate('taskGroups.errors.load'),
        life: 10000,
        key: 'global'
      });
    }
  }

  async sync(entity: TaskDto): Promise<void> {
    try {
      await this.entityService.syncWithMoodle(entity.id);
      this.messageService.add({
        key: 'global',
        summary: this.translationService.translate(this.baseTranslationKey + 'success.moodleSync'),
        severity: 'info'
      });
      setTimeout(() => this.reload(), 2000);
    } catch (err) {
      // ignore
    }
  }

  public readonly convertStringToSeverity = convertStringToSeverity;

  examChanged() {
    
  }
}
