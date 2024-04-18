import { ChangeDetectorRef, Component, OnDestroy, OnInit, Type } from '@angular/core';
import { DatePipe, NgComponentOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoDirective, TranslocoPipe } from '@ngneat/transloco';
import { distinctUntilChanged, Subject, takeUntil } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { EditorModule } from 'primeng/editor';
import { TreeSelectModule } from 'primeng/treeselect';
import { TreeNode } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogService } from 'primeng/dynamicdialog';
import { TagModule } from 'primeng/tag';
import { BlockUIModule } from 'primeng/blockui';
import { DialogModule } from 'primeng/dialog';

import { AuditInformationComponent, EditFormComponent } from '../../../layout';
import { ApplicationUser, AuthService, Role } from '../../../auth';
import {
  OrganizationalUnitDto,
  OrganizationalUnitService,
  StatusEnum,
  TaskCategoryDto, TaskCategoryService,
  TaskDto,
  TaskGroupDto,
  TaskGroupService,
  TaskService
} from '../../../api';
import { TaskForm, TaskTypeRegistry } from '../../../task-type';
import { TaskSubmissionComponent } from '../task-submission/task-submission.component';

/**
 * Task Form
 */
@Component({
  selector: 'dke-task-form',
  standalone: true,
  imports: [
    TranslocoDirective,
    ButtonModule,
    TranslocoPipe,
    RouterLink,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    EditorModule,
    AuditInformationComponent,
    NgComponentOutlet,
    DatePipe,
    InputNumberModule,
    TreeSelectModule,
    TagModule,
    BlockUIModule,
    DialogModule
  ],
  providers: [DialogService],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss'
})
export class TaskFormComponent extends EditFormComponent<TaskDto, TaskService, TaskForm> implements OnInit, OnDestroy {
  /**
   * The quill module configuration.
   */
  readonly quillModules = {
    htmlEditButton: {
      okText: this.translationService.translate('common.ok'),
      cancelText: this.translationService.translate('common.cancel'),
      msg: this.translationService.translate('quill-html-edit-hint')
    }
  };

  /**
   * Whether the form should be readonly.
   */
  readonly: boolean;

  /**
   * The type dropdown values.
   */
  types: { value: string, text: string }[];

  /**
   * The difficulty dropdown values.
   */
  difficulties: { value: number, text: string }[];

  /**
   * The available statuses.
   */
  statuses: { text: string, value: StatusEnum, disabled: boolean }[];

  /**
   * The organizational units.
   */
  organizationalUnits: OrganizationalUnitDto[];

  /**
   * The task groups.
   */
  taskGroups: TaskGroupDto[];

  /**
   * The task categories.
   */
  taskCategories: TreeNode[];

  /**
   * The role of the current user.
   */
  role: Role;

  /**
   * The component form.
   */
  componentForm?: Type<any>;

  /**
   * The task type specific data.
   */
  additionalData?: Record<string, unknown>;

  /**
   * The supported task group types.
   */
  supportedTaskGroupTypes: string[];

  /**
   * Whether the task type supports description generation.
   */
  supportsDescriptionGeneration: boolean;

  /**
   * Whether the task dialog details should be shown.
   */
  showTaskGroupDialog: boolean;

  /**
   * The current locale.
   */
  currentLocale: string;

  private allTaskCategories: TaskCategoryDto[];
  private allTaskGroups: TaskGroupDto[];
  private readonly destroy$ = new Subject<void>();

  /**
   * Creates a new instance of class TaskFormComponent.
   */
  constructor(entityService: TaskService,
              private readonly organizationalUnitService: OrganizationalUnitService,
              private readonly taskGroupService: TaskGroupService,
              private readonly taskCategoriesService: TaskCategoryService,
              private readonly authService: AuthService,
              private readonly route: ActivatedRoute,
              private readonly router: Router,
              private readonly dialogService: DialogService,
              private readonly changeDetectorRef: ChangeDetectorRef) {
    super(entityService, new FormGroup<TaskForm>({
      organizationalUnitId: new FormControl<number | null>(null, [Validators.required]),
      title: new FormControl<string | null>(null, [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
      descriptionDe: new FormControl<string | null>(' ', []),
      descriptionEn: new FormControl<string | null>(' ', []),
      difficulty: new FormControl<number | null>(1, [Validators.required, Validators.min(1), Validators.max(4)]),
      maxPoints: new FormControl<number | null>(1, [Validators.required, Validators.min(0)]),
      taskType: new FormControl<string | null>('none', [Validators.required, Validators.maxLength(100)]),
      status: new FormControl<StatusEnum | null>('DRAFT', [Validators.required]),
      taskGroupId: new FormControl<number | null>(null, []),
      taskCategoryIds: new FormArray<FormControl<TreeNode | null>>([]),
      additionalData: new FormGroup<any>({})
    }), 'tasks.');
    this.readonly = false;
    this.supportsDescriptionGeneration = false;
    this.showTaskGroupDialog = false;
    this.organizationalUnits = [];
    this.taskGroups = [];
    this.allTaskGroups = [];
    this.taskCategories = [];
    this.allTaskCategories = [];
    this.supportedTaskGroupTypes = [];
    this.types = [];
    this.statuses = [];
    this.difficulties = [];
    this.role = this.authService.user?.maxRole ?? 'TUTOR';
    this.currentLocale = this.translationService.getActiveLang();
  }

  /**
   * Initializes the form
   */
  ngOnInit(): void {
    // Listen to language changes
    this.translationService.langChanges$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateDropdownTranslations());

    // Listen to form changes
    this.form.controls.taskType.valueChanges
      .pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe(value => this.onTaskTypeChanged(value));
    this.form.controls.organizationalUnitId.valueChanges
      .pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe(value => this.onOrganizationalUnitChanged(value));

    // Load data
    this.loadOrganizationalUnits();
    this.loadTaskGroups();
    this.loadTaskCategories();
    this.updateDropdownTranslations();

    // Load data from route
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(async value => {
        const id = value.get('id');
        if (id) {
          await this.loadTask(id);
        } else {
          this.originalEntity = null;
          this.role = this.authService.user?.maxRole ?? 'TUTOR';
        }
        this.setDefaultOrganizationalUnitIfUnset();
        this.setFormEnabledDisabled();
      });
  }

  /**
   * Unsubscribes from all subscriptions.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //#region --- Base implementations ---

  override async cancel(): Promise<void> {
    await this.router.navigate(['tasks']);
  }

  override getId(entity: TaskDto): string | number {
    return entity.id;
  }

  override getLastModifiedDate(entity: TaskDto): string | null {
    return entity.lastModifiedDate;
  }

  override getMessageParams(entity: TaskDto | {
    title: string;
  }, type: 'successCreate' | 'errorCreate' | 'successUpdate' | 'errorUpdate'): Record<string, unknown> {
    return {name: entity.title};
  }

  override async onSuccess(id: number, operation: 'create' | 'update'): Promise<void> {
    await this.loadTask(id);
  }

  override modifyValueBeforeSend(data: Partial<{ [K in keyof TaskForm]: any }>, type: 'create' | 'update'): any {
    return {
      ...data,
      descriptionDe: data.descriptionDe ?? '',
      descriptionEn: data.descriptionEn ?? '',
      taskCategoryIds: data.taskCategoryIds ? data.taskCategoryIds.map((x: TreeNode) => x.data) : []
    };
  }

  //#endregion

  //#region --- Additional actions ---

  /**
   * Opens the dialog to test the task.
   */
  testTask(): void {
    if (!this.originalEntity)
      return;

    this.dialogService.open(TaskSubmissionComponent, {
      header: this.translationService.translate(this.baseTranslationKey + 'submitTest'),
      width: '90%',
      maximizable: true,
      style: {
        minWidth: '500px',
        minHeight: '500px'
      },
      data: {
        taskId: this.originalEntity.id,
        taskType: this.originalEntity.taskType
      }
    });
  }

  /**
   * Clones a task.
   */
  async clone(): Promise<void> {
    try {
      const value = this.form.value;
      value.title = value.title + ' (Clone)';
      const result = await this.entityService.create(this.modifyValueBeforeSend(value as any, 'create'));
      this.messageService.add({
        severity: 'success',
        detail: this.translationService.translate(this.baseTranslationKey + 'success.create', this.getMessageParams(result, 'successCreate')),
        key: 'global'
      });
      await this.onSuccess(this.getId(result) as number, 'create');
    } catch (err) {
      let detail = '';
      if (err instanceof HttpErrorResponse) {
        if (err.error?.detail)
          detail = err.error.detail;
        else
          detail = err.message;
      }

      this.messageService.add({
        severity: 'error',
        detail: this.translationService.translate(this.baseTranslationKey + 'errors.create', this.getMessageParams(this.form.value as any, 'errorCreate')) + ' ' + detail,
        key: 'global',
        life: 10000
      });
      this.onError('create', err);
    } finally {
      this.loading = false;
    }
  }

  /**
   * Shows the task group information dialog.
   */
  showTaskGroupInformation(): void {
    if (!this.getTaskGroup())
      return;

    this.showTaskGroupDialog = true;
  }

  //#endregion

  //#region --- Load data ---
  /**
   * Loads the task with the specified identifier.
   *
   * @param id The identifier of the task.
   */
  private async loadTask(id: string | number): Promise<void> {
    try {
      this.startLoading();
      const data = await this.entityService.get(+id);
      this.originalEntity = data.dto;
      this.additionalData = data.additionalData;
      this.form.patchValue({...this.originalEntity, taskCategoryIds: []});
      this.form.markAsPristine();
      this.role = this.authService.user?.roles.find(x => x.organizationalUnit == data.dto.organizationalUnitId)?.role ?? 'TUTOR';
      this.setFormEnabledDisabled();
      this.changeDetectorRef.detectChanges(); // required to prevent error
      this.onOrganizationalUnitChanged(this.originalEntity?.organizationalUnitId);
    } catch (err) {
      console.error('[TaskFormComponent] Could not load task data', err);
      let detail = 'Unknown error';
      if (err instanceof HttpErrorResponse) {
        if (err.error?.detail)
          detail = err.error.detail;
        else
          detail = err.message;
      }

      this.messageService.add({
        severity: 'error',
        detail: this.translationService.translate(this.baseTranslationKey + 'errors.loadSingle') + ' ' + detail,
        life: 10000,
        key: 'global'
      });
      await this.cancel();
    } finally {
      this.finishLoading();
    }
  }

  /**
   * Loads and sets organizational units.
   */
  private async loadOrganizationalUnits(): Promise<void> {
    const user = this.authService.user;
    if (!user) {
      this.organizationalUnits = [];
      this.taskGroups = [];
      return;
    }

    try {
      this.startLoading();

      // Set active organizational units (the user has to be full admin or must have a role in the organizational unit)
      const allOrganizationalUnits = (await this.organizationalUnitService.load(0, 999999, [{field: 'name', order: 1}])).content;
      this.organizationalUnits = allOrganizationalUnits // filter is necessary as user is allowed to query all organizational units
        .filter(x => user.isFullAdmin || user.roles.find(r => r.organizationalUnit === x.id));
      this.setDefaultOrganizationalUnitIfUnset();
    } catch (err) {
      console.error('[TaskFormComponent] Could not load organizational units', err);
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

  /**
   * Loads all task groups.
   */
  private async loadTaskGroups(): Promise<void> {
    try {
      this.startLoading();
      this.allTaskGroups = (await this.taskGroupService.load(0, 999999, [{field: 'name', order: 1}])).content;
    } catch (err) {
      console.error('[TaskFormComponent] Could not load task groups', err);
      this.messageService.add({
        severity: 'error',
        detail: this.translationService.translate('taskGroups.errors.load'),
        life: 10000,
        key: 'global'
      });
    } finally {
      this.finishLoading();
    }
  }

  /**
   * Loads all task categories.
   */
  private async loadTaskCategories(): Promise<void> {
    try {
      this.startLoading();
      this.allTaskCategories = (await this.taskCategoriesService.load(0, 999999, [{field: 'name', order: 1}])).content;
    } catch (err) {
      console.error('[TaskFormComponent] Could not load task categories', err);
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

  //#endregion

  /**
   * Gets the currently selected task group.
   */
  getTaskGroup(): TaskGroupDto | undefined {
    return this.taskGroups.find(x => x.id === this.form.value.taskGroupId);
  }

  /**
   * Adds a new task category row to the form.
   */
  addTaskCategory(): void {
    this.form.controls.taskCategoryIds.push(new FormControl<TreeNode | null>(null, []));
  }

  /**
   * Removes the task category at the specified index from the form array.
   * @param index The index in the form array.
   */
  removeTaskCategory(index: number): void {
    this.form.controls.taskCategoryIds.removeAt(index);
  }

  /**
   * Sets the dropdown values based on the current language.
   */
  private updateDropdownTranslations(): void {
    this.currentLocale = this.translationService.getActiveLang();
    this.types = TaskTypeRegistry.getTaskTypes().map(x => {
      return {value: x, text: this.translationService.translate('taskTypes.' + x + '.title')};
    }).sort((a, b) => a.text.localeCompare(b.text));
    this.statuses = [
      {value: StatusEnum.DRAFT, text: this.translationService.translate('taskStatus.' + StatusEnum.DRAFT), disabled: false},
      {value: StatusEnum.READY_FOR_APPROVAL, text: this.translationService.translate('taskStatus.' + StatusEnum.READY_FOR_APPROVAL), disabled: false},
      {value: StatusEnum.APPROVED, text: this.translationService.translate('taskStatus.' + StatusEnum.APPROVED), disabled: this.role === 'TUTOR'}
    ];
    this.difficulties = [
      {value: 1, text: this.translationService.translate('difficulty.1')},
      {value: 2, text: this.translationService.translate('difficulty.2')},
      {value: 3, text: this.translationService.translate('difficulty.3')},
      {value: 4, text: this.translationService.translate('difficulty.4')}
    ];
  }

  /**
   * Enables/disables the form based on the current role and status.
   *
   * The form is disabled if the user is a tutor and the task is approved.
   */
  private setFormEnabledDisabled(): void {
    this.readonly = this.role === 'TUTOR' && !!this.originalEntity && this.originalEntity.status === 'APPROVED';
    if (this.readonly)
      this.form.disable();
    else
      this.form.enable();
  }

  /**
   * Updates the form based on the selected task type.
   *
   * This method sets the task groups depending on the current user role, the selected organizational unit and the selected task type.
   * It also sets the additional form components based on the selected task type.
   *
   * @param value The selected task type.
   */
  private onTaskTypeChanged(value: string | null): void {
    // Set task group validation
    this.supportedTaskGroupTypes = TaskTypeRegistry.getSupportsTaskGroupTypes(value);
    this.supportsDescriptionGeneration = TaskTypeRegistry.supportsDescriptionGeneration(value);
    if (this.supportedTaskGroupTypes.length > 0) {
      this.form.controls.taskGroupId.addValidators(Validators.required);
      this.form.updateValueAndValidity();
    } else {
      this.form.controls.taskGroupId.removeValidators(Validators.required);
      this.form.controls.taskGroupId.setValue(null);
      this.form.updateValueAndValidity();
    }

    // Set supported task groups
    this.setTaskGroups(this.authService.user, this.form.value.organizationalUnitId);

    // Set task type form
    for (const x in this.form.controls.additionalData.controls) {
      this.form.controls.additionalData.removeControl(x);
    }
    this.componentForm = TaskTypeRegistry.getComponent(value);
    this.form.updateValueAndValidity();
  }

  /**
   * Sets the default organizational unit if it is not set and only one organizational unit is available.
   */
  private setDefaultOrganizationalUnitIfUnset(): void {
    if (!this.originalEntity && this.organizationalUnits.length === 1 && !this.form.value.organizationalUnitId) {
      this.form.patchValue({organizationalUnitId: this.organizationalUnits[0].id});
    }
  }

  /**
   * Sets the task groups based on the organizational unit and the user role.
   *
   * @param user The current user.
   * @param orgUnitId The selected organizational unit identifier.
   */
  private setTaskGroups(user: ApplicationUser | null, orgUnitId: number | null | undefined): void {
    if (!user || !orgUnitId) {
      this.taskGroups = [];
      return;
    }

    this.taskGroups = this.allTaskGroups.filter(x => x.organizationalUnitId === orgUnitId &&
      (user?.isFullAdmin || user?.roles.find(r => r.organizationalUnit === x.organizationalUnitId)) &&
      this.supportedTaskGroupTypes.includes(x.taskGroupType));
  }

  /**
   * Updates the task groups and task categories based on the selected organizational unit und current user role.
   *
   * @param value The selected organizational unit identifier.
   */
  private onOrganizationalUnitChanged(value: number | null): void {
    const user = this.authService.user;

    // Set task groups
    this.setTaskGroups(user, value);

    // Remove existing task category form fields
    const len = this.form.controls.taskCategoryIds.length;
    for (let i = 0; i < len; i++) {
      this.removeTaskCategory(0);
    }

    // Find selectable task categories depending on OU and user
    const selectableCategories = this.allTaskCategories.filter(x => x.organizationalUnitId === value &&
      (user?.isFullAdmin || user?.roles.find(r => r.organizationalUnit === x.organizationalUnitId)));

    /**
     * Recursively gets the child nodes of the specified parent identifier.
     *
     * @param parentId The parent identifier.
     */
    const getChildNodes = (parentId: number): TreeNode[] => {
      return selectableCategories.filter(x => x.parentId === parentId).map(x => {
        return {
          data: x.id,
          label: x.name,
          key: x.id + '',
          children: getChildNodes(x.id)
        };
      });
    };

    // Build tree
    this.taskCategories = selectableCategories.filter(x => !x.parentId).map(x => {
      return {
        data: x.id,
        label: x.name,
        key: x.id + '',
        children: getChildNodes(x.id)
      };
    });

    /**
     * Recursively searches for the specified identifier in the tree.
     *
     * @param node The current node.
     * @param id The identifier to search for.
     */
    const recursiveSearch = (node: TreeNode, id: number): TreeNode | null => {
      if (node.data === id)
        return node;
      for (const child of node.children ?? []) {
        const result = recursiveSearch(child, id);
        if (result)
          return result;
      }
      return null;
    };

    // Patch form value (if original entity is set)
    if (this.originalEntity && this.originalEntity.taskCategoryIds) {
      // Add form control for each task category
      for (let i = 0; i < (this.originalEntity.taskCategoryIds.length ?? 0); i++) {
        this.addTaskCategory();
      }

      // Patch form with nodes instead of task category ids
      const nodes: TreeNode[] = (this.originalEntity.taskCategoryIds.flatMap(x => {
        const result: TreeNode[] = [];
        for (const node of this.taskCategories) {
          const tmp = recursiveSearch(node, x);
          if (tmp)
            result.push(tmp);
        }
        return result;
      }).filter(x => !!x).map(x => x!)) ?? [];
      this.form.patchValue({taskCategoryIds: nodes});
    }
  }
}
