import { ChangeDetectorRef, Component, OnDestroy, OnInit, Type } from '@angular/core';
import { DatePipe, NgComponentOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoDirective, TranslocoPipe } from '@ngneat/transloco';
import { distinctUntilChanged, Subject, takeUntil } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { BlockUIModule } from 'primeng/blockui';

import { AuditInformationComponent, DkeEditorComponent, EditFormComponent } from '../../../layout';
import { AuthService, Role } from '../../../auth';
import { OrganizationalUnitDto, OrganizationalUnitService, StatusEnum, TaskGroupDto, TaskGroupService } from '../../../api';
import { TaskGroupForm, TaskGroupTypeRegistry } from '../../../task-group-type';
import { TaskAppTypeService } from '../../task-app-type.service';

/**
 * Task Group Form
 */
@Component({
  selector: 'dke-task-group-form',
  standalone: true,
  imports: [
    TranslocoDirective,
    ButtonModule,
    TranslocoPipe,
    RouterLink,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    AuditInformationComponent,
    NgComponentOutlet,
    DatePipe,
    BlockUIModule,
    DkeEditorComponent
  ],
  templateUrl: './task-group-form.component.html',
  styleUrl: './task-group-form.component.scss'
})
export class TaskGroupFormComponent extends EditFormComponent<TaskGroupDto, TaskGroupService, TaskGroupForm> implements OnInit, OnDestroy {

  /**
   * Whether the form should be readonly.
   */
  readonly: boolean;

  /**
   * The type dropdown values.
   */
  types: { value: string, text: string }[];

  /**
   * The available statuses.
   */
  statuses: { text: string, value: StatusEnum, disabled: boolean }[];

  /**
   * The organizational units.
   */
  organizationalUnits: OrganizationalUnitDto[];

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
   * Whether the task type supports description generation.
   */
  supportsDescriptionGeneration: boolean;

  private availableTaskTypes: string[];
  private readonly destroy$ = new Subject<void>();

  /**
   * Creates a new instance of class TaskGroupFormComponent.
   */
  constructor(entityService: TaskGroupService,
              private readonly organizationalUnitService: OrganizationalUnitService,
              private readonly taskAppTypeService: TaskAppTypeService,
              private readonly authService: AuthService,
              private readonly route: ActivatedRoute,
              private readonly router: Router,
              private readonly changeDetectorRef: ChangeDetectorRef) {
    super(entityService, new FormGroup<TaskGroupForm>({
      name: new FormControl<string | null>(null, [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
      descriptionDe: new FormControl<string | null>(' ', []),
      descriptionEn: new FormControl<string | null>(' ', []),
      taskGroupType: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(100)]),
      status: new FormControl<StatusEnum | null>('DRAFT', [Validators.required]),
      organizationalUnitId: new FormControl<number | null>(null, [Validators.required]),
      additionalData: new FormGroup<any>({})
    }), 'taskGroups.');
    this.readonly = false;
    this.supportsDescriptionGeneration = false;
    this.organizationalUnits = [];
    this.availableTaskTypes = [];
    this.types = [];
    this.statuses = [
      {value: StatusEnum.DRAFT, text: this.translationService.translate('taskStatus.' + StatusEnum.DRAFT), disabled: false},
      {value: StatusEnum.READY_FOR_APPROVAL, text: this.translationService.translate('taskStatus.' + StatusEnum.READY_FOR_APPROVAL), disabled: false},
      {value: StatusEnum.APPROVED, text: this.translationService.translate('taskStatus.' + StatusEnum.APPROVED), disabled: false}
    ];
    this.role = this.authService.user?.maxRole ?? 'TUTOR';
  }

  /**
   * Initializes the form
   */
  ngOnInit(): void {
    // Listen to language changes
    this.translationService.langChanges$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateDropdownTranslations());

    // Load form for type
    this.form.controls.taskGroupType.valueChanges
      .pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe(value => {
        for (const x in this.form.controls.additionalData.controls) {
          this.form.controls.additionalData.removeControl(x);
        }
        this.componentForm = TaskGroupTypeRegistry.getComponent(value);
        this.supportsDescriptionGeneration = TaskGroupTypeRegistry.supportsDescriptionGeneration(value);
      });

    // Load organizational units
    this.loadOrganizationalUnits();
    this.loadTaskTypes();

    // Load data from route
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(async value => {
        const id = value.get('id');
        if (id) {
          await this.loadTaskGroup(id);
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
    await this.router.navigate(['taskGroups']);
  }

  override getId(entity: TaskGroupDto): string | number {
    return entity.id;
  }

  override getLastModifiedDate(entity: TaskGroupDto): string | null {
    return entity.lastModifiedDate;
  }

  override getMessageParams(entity: TaskGroupDto | {
    name: string;
  }, type: 'successCreate' | 'errorCreate' | 'successUpdate' | 'errorUpdate'): Record<string, unknown> {
    return {name: entity.name};
  }

  override async onSuccess(id: number | string, operation: 'create' | 'update'): Promise<void> {
    await this.loadTaskGroup(id);
  }

  override modifyValueBeforeSend(data: Partial<{ [K in keyof TaskGroupForm]: any }>, type: 'create' | 'update'): any {
    return {
      ...data,
      descriptionDe: data.descriptionDe ?? '',
      descriptionEn: data.descriptionEn ?? ''
    };
  }

  //#endregion

  /**
   * Loads the task group with the given id.
   *
   * @param id The id of the task group.
   */
  private async loadTaskGroup(id: string | number): Promise<void> {
    try {
      this.startLoading();
      const data = await this.entityService.get(+id);
      this.originalEntity = data.dto;
      this.additionalData = data.additionalData;
      this.form.patchValue(this.originalEntity);
      this.form.markAsPristine();
      this.role = this.authService.user?.isFullAdmin ?
        'FULL_ADMIN' :
        this.authService.user?.roles.find(x => x.organizationalUnit == data.dto.organizationalUnitId)?.role ?? 'TUTOR';
      this.setFormEnabledDisabled();
      this.changeDetectorRef.detectChanges(); // required to prevent error
    } catch (err) {
      console.error('[TaskGroupFormComponent] Could not load task group data', err);
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
      console.error('[TaskGroupFormComponent] Could not load organizational units', err);
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
   * Loads the available task types.
   */
  private async loadTaskTypes(): Promise<void> {
    try {
      const types = await this.taskAppTypeService.getAvailableTaskTypes();
      this.availableTaskTypes = TaskGroupTypeRegistry.getTaskTypes().filter(x => types.includes(x));
      if (this.availableTaskTypes.length === 0)
        this.availableTaskTypes = TaskGroupTypeRegistry.getTaskTypes();
    } catch (err) {
      this.availableTaskTypes = TaskGroupTypeRegistry.getTaskTypes();
    }
    this.updateDropdownTranslations();
  }

  /**
   * Sets the dropdown values based on the current language.
   */
  private updateDropdownTranslations(): void {
    this.statuses = this.statuses.map(value => {
      return {
        ...value,
        label: this.translationService.translate('taskStatus.' + value.value),
        disabled: value.value === StatusEnum.APPROVED && this.role === 'TUTOR'
      };
    });

    this.types = this.availableTaskTypes.map(x => {
      return {
        value: x,
        text: this.translationService.translate('taskGroupTypes.' + x + '.title')
      };
    });
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
}
