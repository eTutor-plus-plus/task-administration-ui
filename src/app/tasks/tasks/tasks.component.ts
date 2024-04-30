import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoDirective, TranslocoPipe } from '@ngneat/transloco';
import { Subject, takeUntil } from 'rxjs';

import { ConfirmationService, SharedModule } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';

import { AuthService, Role } from '../../auth';
import { TableOverviewComponent } from '../../layout';
import { OrganizationalUnitDto, OrganizationalUnitService, StatusEnum, TaskDto, TaskGroupDto, TaskGroupService, TaskService } from '../../api';

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
    DropdownModule
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
    super(entityService, [{field: 'organizationalUnit.name', order: 1}, {field: 'taskType', order: 1}, {field: 'title', order: 1}], 'tasks.');
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

  //#region --- Parent Overrides ---
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

  override canDelete(entity: TaskDto): boolean {
    const user = this.authService.user;
    if (!user)
      return false;

    if (user.isFullAdmin)
      return true;

    const role = user.roles.find(x => x.organizationalUnit == entity.organizationalUnitId)?.role;
    return role ? role !== 'TUTOR' || entity.status !== 'APPROVED' : false;
  }

  canSync(entity: TaskDto): boolean {
    const user = this.authService.user;
    if (!user)
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
}
