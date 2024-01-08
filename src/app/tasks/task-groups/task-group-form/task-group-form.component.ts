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
import { EditorModule } from 'primeng/editor';

import { AuditInformationComponent, EditFormComponent } from '../../../layout';
import { AuthService, Role } from '../../../auth';
import { OrganizationalUnitDto, OrganizationalUnitService, StatusEnum, TaskGroupDto, TaskGroupService } from '../../../api';
import { TaskGroupForm, TaskGroupTypeRegistry } from '../../../task-group-type';

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
    EditorModule,
    AuditInformationComponent,
    NgComponentOutlet,
    DatePipe
  ],
  templateUrl: './task-group-form.component.html',
  styleUrl: './task-group-form.component.scss'
})
export class TaskGroupFormComponent extends EditFormComponent<TaskGroupDto, TaskGroupService, TaskGroupForm> implements OnInit, OnDestroy {

  /**
   * The quill module configuration.
   */
  readonly quillModules = {htmlEditButton: {}};

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

  private allOrganizationalUnits: OrganizationalUnitDto[];
  private readonly destroy$ = new Subject<void>();

  /**
   * Creates a new instance of class TaskGroupFormComponent.
   */
  constructor(entityService: TaskGroupService,
              private readonly organizationalUnitService: OrganizationalUnitService,
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
    this.organizationalUnits = [];
    this.allOrganizationalUnits = [];
    this.types = TaskGroupTypeRegistry.getTaskTypes().map(x => {
      return {value: x, text: this.translationService.translate('taskGroupTypes.' + x + '.title')};
    });
    this.statuses = [
      {value: StatusEnum.DRAFT, text: this.translationService.translate('taskStatus.' + StatusEnum.DRAFT), disabled: false},
      {value: StatusEnum.READY_FOR_APPROVAL, text: this.translationService.translate('taskStatus.' + StatusEnum.READY_FOR_APPROVAL), disabled: false},
      {value: StatusEnum.APPROVED, text: this.translationService.translate('taskStatus.' + StatusEnum.APPROVED), disabled: false}
    ];
    this.role = this.authService.user?.maxRole ?? 'tutor';
  }

  /**
   * Initializes the form
   */
  ngOnInit(): void {
    // Listen to user role changes
    this.authService.userChanged.pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.role = user?.maxRole ?? 'tutor';
        this.setStatusDisablesAndReadonly();
        this.setOrganizationalUnits();
      });

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
      });

    // Load organizational units
    this.loadOrganizationalUnits();

    // Load data from route
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(async value => {
        const id = value.get('id');
        if (id) {
          await this.loadTaskGroup(id);
        } else {
          this.originalEntity = null;
        }
        this.setStatusDisablesAndReadonly();
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

  override async onSuccess(operation: 'create' | 'update'): Promise<void> {
    await this.router.navigate(['taskGroups']);
  }

  //#endregion

  private async loadTaskGroup(id: string | number): Promise<void> {
    try {
      const data = await this.entityService.get(+id);
      this.originalEntity = data.dto;
      this.additionalData = data.additionalData;
      this.form.patchValue(this.originalEntity);
      this.setStatusDisablesAndReadonly();
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
    }
  }

  private async loadOrganizationalUnits(): Promise<void> {
    try {
      this.allOrganizationalUnits = (await this.organizationalUnitService.load(0, 999999, [{field: 'name', order: 1}])).content;
      this.setOrganizationalUnits();
    } catch (err) {
      console.error('[TaskGroupFormComponent] Could not load organizational units', err);
      this.messageService.add({
        severity: 'error',
        detail: this.translationService.translate('organizationalUnits.errors.load'),
        life: 10000,
        key: 'global'
      });
    }
  }

  private updateDropdownTranslations(): void {
    this.statuses = this.statuses.map(value => {
      return {
        ...value,
        label: this.translationService.translate('taskStatus.' + value.value)
      };
    });

    this.types = this.types.map(value => {
      return {
        ...value,
        label: this.translationService.translate('taskGroupTypes.' + value.value + '.title')
      };
    });
  }

  private setOrganizationalUnits(): void {
    const user = this.authService.user;
    if (!user) {
      this.organizationalUnits = [];
      return;
    }

    this.organizationalUnits = this.allOrganizationalUnits.filter(x => user.isFullAdmin || user.roles.find(r => r.organizationalUnit === x.id));
    if (this.organizationalUnits.length === 1 && !this.form.value.organizationalUnitId)
      this.form.patchValue({organizationalUnitId: this.organizationalUnits[0].id});
  }

  private setStatusDisablesAndReadonly(): void {
    const user = this.authService.user;
    if (!user)
      return; // should never happen

    // check if readonly
    this.readonly = this.role === 'tutor' && !!this.originalEntity && this.originalEntity.status === 'APPROVED';
    if (this.readonly)
      this.form.disable();
    else
      this.form.enable();

    // set status disabled
    this.statuses = this.statuses.map(s => {
      return {
        ...s,
        disabled: s.value === 'APPROVED' && this.role === 'tutor'
      };
    });
  }

}
