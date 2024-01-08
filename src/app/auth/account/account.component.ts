import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { TranslocoDirective, TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { Subject, takeUntil } from 'rxjs';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';

import { ApplicationUser } from '../models';
import { AuthService } from '../auth.service';
import { AccountService, getValidationErrorMessage, OrganizationalUnitDto, OrganizationalUnitService } from '../../api';

/**
 * Page: User Account
 */
@Component({
  selector: 'dke-account',
  standalone: true,
  imports: [
    TranslocoDirective,
    CardModule,
    TranslocoPipe,
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    MessagesModule
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent implements OnInit, OnDestroy {
  /**
   * The login form.
   */
  readonly form: FormGroup<Form>;

  /**
   * The user.
   */
  user: ApplicationUser | null;

  /**
   * Whether a loading operation is in progress.
   */
  loading: boolean;

  private organizationalUnits: OrganizationalUnitDto[];
  private readonly destroy$ = new Subject<void>();

  /**
   * Creates a new instance of class AccountComponent.
   */
  constructor(private readonly authService: AuthService,
              private readonly messageService: MessageService,
              private readonly accountService: AccountService,
              private readonly translationService: TranslocoService,
              private readonly organizationalUnitService: OrganizationalUnitService) {
    this.loading = false;
    this.user = null;
    this.organizationalUnits = [];
    this.form = new FormGroup<Form>({
      currentPassword: new FormControl<string | null>(null, [Validators.required]),
      password: new FormControl<string | null>(null, [Validators.required, Validators.minLength(6), Validators.maxLength(64)]),
      passwordConfirmation: new FormControl<string | null>(null, [Validators.required])
    }, {
      validators: [control => {
        const password = control.get('password');
        const passwordConfirmation = control.get('passwordConfirmation');

        if (password && passwordConfirmation && password.value !== passwordConfirmation.value) {
          return {equals: true};
        }
        return null;
      }]
    });
  }

  /**
   * Listens to user changes.
   */
  ngOnInit(): void {
    this.authService.userChanged.pipe(takeUntil(this.destroy$)).subscribe(user => this.user = user);
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
   * Returns the error message for the specified form field.
   *
   * @param formField The form field.
   */
  getErrorMessage(formField: string): string {
    return getValidationErrorMessage(this.translationService, (this.form.controls as any)[formField], 'auth.activate.' + formField);
  }

  /**
   * Submits the form.
   */
  async submit(): Promise<void> {
    if (this.form.invalid)
      return;

    this.messageService.clear();
    this.loading = true;

    try {
      await this.accountService.changePassword(this.form.value.currentPassword!, this.form.value.password!, this.form.value.passwordConfirmation!);
      this.messageService.add({
        severity: 'success',
        summary: this.translationService.translate('auth.change.messages.success_summary'),
        detail: this.translationService.translate('auth.change.messages.success_detail')
      });
    } catch (err) {
      let detail = 'Unknown error';
      if (err instanceof HttpErrorResponse) {
        if (err.error?.detail)
          detail = err.error.detail;
        else
          detail = err.message;
      }
      this.messageService.add({
        severity: 'error',
        summary: this.translationService.translate('auth.change.messages.failed'),
        detail: detail
      });
    } finally {
      this.loading = false;
      this.form.reset();
    }
  }

  /**
   * Returns the name of the organizational unit.
   *
   * @param id The OU identifier.
   */
  getOUName(id: number): string {
    const ou = this.organizationalUnits.find(x => x.id == id);
    return ou?.name ?? ('' + id);
  }

  private async loadOrganizationalUnits(): Promise<void> {
    try {
      const organizationalUnits = await this.organizationalUnitService.load(0, 999999, [{field: 'name', order: 1}]);
      this.organizationalUnits = organizationalUnits.content;
    } catch (err) {
      console.error('[AccountComponent] Could not load organizational units', err);
      this.messageService.add({
        severity: 'error',
        detail: this.translationService.translate('organizationalUnits.errors.load'),
        life: 10000,
        key: 'global'
      });
    }
  }
}

interface Form {
  currentPassword: FormControl<string | null>;
  password: FormControl<string | null>;
  passwordConfirmation: FormControl<string | null>;
}
