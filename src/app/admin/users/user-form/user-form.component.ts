import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective, TranslocoPipe } from '@ngneat/transloco';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { DateTime } from 'luxon';
import { Subject, takeUntil } from 'rxjs';
import { cloneDeep } from 'lodash-es';

import { OrganizationalUnitDto, OrganizationalUnitService, RoleEnum, UserDto, UserService } from '../../../api';
import { AuditInformationComponent, DialogEditFormComponent } from '../../../layout';
import { AuthService } from '../../../auth';

/**
 * Form: User
 */
@Component({
  selector: 'dke-user-form',
  standalone: true,
  imports: [
    AuditInformationComponent,
    ButtonModule,
    InputTextModule,
    MessagesModule,
    ReactiveFormsModule,
    TranslocoPipe,
    TranslocoDirective,
    CheckboxModule,
    CalendarModule,
    DropdownModule
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent extends DialogEditFormComponent<UserDto, UserService, UserForm> implements OnInit, OnDestroy {

  /**
   * Whether the current user is full administrator.
   */
  isFullAdmin: boolean;

  /**
   * The organizational units for the form array.
   */
  organizationalUnitsData: (OrganizationalUnitDto & { disabled: boolean })[][];

  /**
   * The available roles.
   */
  readonly roles: { value: RoleEnum, label: string, disabled: boolean }[] = [
    {value: 'ADMIN', label: this.translationService.translate('roles.' + 'ADMIN'), disabled: false},
    {value: 'INSTRUCTOR', label: this.translationService.translate('roles.' + 'INSTRUCTOR'), disabled: false},
    {value: 'TUTOR', label: this.translationService.translate('roles.' + 'TUTOR'), disabled: false}
  ];

  private organizationalUnits: OrganizationalUnitDto[];
  private readonly destroy$ = new Subject<void>();

  /**
   * Creates a new instance of class UserFormComponent.
   */
  constructor(entityService: UserService,
              private readonly authService: AuthService,
              private readonly organizationalUnitService: OrganizationalUnitService) {
    super(entityService, new FormGroup<UserForm>({
      username: new FormControl<string | null>(null, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
      firstName: new FormControl<string | null>(null, [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
      lastName: new FormControl<string | null>(null, [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
      email: new FormControl<string | null>(null, [Validators.required, Validators.minLength(6), Validators.maxLength(255), Validators.email]),
      enabled: new FormControl<boolean | null>(true, [Validators.required]),
      activated: new FormControl<Date | null>(null, []),
      fullAdmin: new FormControl<boolean | null>(false, [Validators.required]),
      lockoutEnd: new FormControl<Date | null>(null, []),
      organizationalUnits: new FormArray<FormGroup<RoleForm>>([])
    }), 'users.');
    this.organizationalUnits = [];
    this.organizationalUnitsData = [];
    this.isFullAdmin = false;
  }

  /**
   * Initializes the form.
   */
  ngOnInit(): void {
    this.isFullAdmin = this.authService.user?.isFullAdmin ?? false;

    this.form.controls.organizationalUnits.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateAvailableUnits());
    this.authService.userChanged
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => this.isFullAdmin = user?.isFullAdmin ?? false);

    if (this.dialogConf.data?.entity?.lockoutEnd) {
      const dt = DateTime.fromISO(this.dialogConf.data.entity.lockoutEnd);
      if (dt.isValid)
        this.form.patchValue({lockoutEnd: dt.toJSDate()});
    }
    if (this.dialogConf.data?.entity?.activated) {
      const dt = DateTime.fromISO(this.dialogConf.data.entity.activated);
      if (dt.isValid)
        this.form.patchValue({activated: dt.toJSDate()});
    }

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
   * Adds a new organizational unit to the form array.
   */
  addOrganizationalUnit(): void {
    this.form.controls.organizationalUnits.push(new FormGroup<RoleForm>({
      organizationalUnit: new FormControl<number | null>(this.organizationalUnits.length > 1 ? null : this.organizationalUnits.length > 0 ? this.organizationalUnits[0].id : null, [Validators.required]),
      role: new FormControl<string | null>(null, [Validators.required])
    }));

    this.organizationalUnitsData.push(cloneDeep(this.organizationalUnits).map(uo => {
      return {...uo, disabled: false};
    }));
    this.updateAvailableUnits();
  }

  /**
   * Removes the organizational unit at the specified index from the form array.
   *
   * @param index The index in the form array.
   */
  removeOrganizationalUnit(index: number): void {
    this.form.controls.organizationalUnits.removeAt(index);
    this.organizationalUnitsData.splice(index, 1);
    this.updateAvailableUnits();
  }

  override getId(entity: UserDto): string | number {
    return entity.id;
  }

  override getLastModifiedDate(entity: UserDto): string | null {
    return entity.lastModifiedDate;
  }

  override getMessageParams(entity: UserDto | {
    username: any;
  }, type: 'successCreate' | 'errorCreate' | 'successUpdate' | 'errorUpdate'): Record<string, unknown> {
    return {username: entity.username};
  }

  private async loadOrganizationalUnits(): Promise<void> {
    this.startLoading();
    try {
      const organizationalUnits = await this.organizationalUnitService.load(0, 999999, [{field: 'name', order: 1}]);
      const user = this.authService.user;
      if (!user)
        return; // should never happen

      // get OUs depending on user permissions
      if (user.isFullAdmin) {
        this.organizationalUnits = organizationalUnits.content;
      } else {
        // get OUs where the current user is admin, only there he/she is allowed to add users
        const arr: OrganizationalUnitDto[] = [];
        for (let ou of organizationalUnits.content) {
          const assignment = user.roles.find(x => x.role === 'ADMIN' && x.organizationalUnit === ou.id);
          if (assignment)
            arr.push(ou);
        }
        this.organizationalUnits = arr;
      }

      // set form data
      if (this.dialogConf.data?.entity) {
        for (let i = 0; i < this.dialogConf.data.entity.organizationalUnits?.length; i++) {
          this.addOrganizationalUnit();
        }
        this.form.patchValue({organizationalUnits: this.dialogConf.data.entity.organizationalUnits});
      }
    } catch (err) {
      console.error('[UserForm] Could not load organizational units', err);
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

  private updateAvailableUnits(): void {
    // find already used units
    const used: number[] = [];
    for (let control of this.form.controls.organizationalUnits.controls) {
      if (control.value.organizationalUnit)
        used.push(control.value.organizationalUnit);
    }

    // disable used units
    for (let i = 0; i < this.form.controls.organizationalUnits.controls.length; i++) {
      const control = this.form.controls.organizationalUnits.controls[i];
      if (this.organizationalUnitsData.length > i) {
        for (let ou of this.organizationalUnitsData[i]) {
          ou.disabled = used.includes(ou.id) && control.value.organizationalUnit !== ou.id;
        }
      }
    }
  }
}

interface UserForm {
  username: FormControl<string | null>;
  firstName: FormControl<string | null>;
  lastName: FormControl<string | null>;
  email: FormControl<string | null>;
  enabled: FormControl<boolean | null>;
  activated: FormControl<Date | null>;
  fullAdmin: FormControl<boolean | null>;
  lockoutEnd: FormControl<Date | null>;
  organizationalUnits: FormArray<FormGroup<RoleForm>>;
}

interface RoleForm {
  organizationalUnit: FormControl<number | null>;
  role: FormControl<string | null>;
}
