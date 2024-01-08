import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslocoDirective, TranslocoPipe, TranslocoService } from '@ngneat/transloco';

import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessagesModule } from 'primeng/messages';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

import { getValidationErrorMessage, UserDto, UserService } from '../../../api';

/**
 * Form: Change Password
 */
@Component({
  selector: 'dke-change-password-form',
  standalone: true,
  imports: [
    MessagesModule,
    ReactiveFormsModule,
    TranslocoDirective,
    InputTextModule,
    TranslocoPipe,
    ButtonModule
  ],
  templateUrl: './change-password-form.component.html',
  styleUrl: './change-password-form.component.scss'
})
export class ChangePasswordFormComponent {
  /**
   * The error message function.
   */
  readonly getError: (control: FormControl, fieldTranslationKey: string) => string = (control, fieldTranslationKey) =>
    getValidationErrorMessage(this.translationService, control, fieldTranslationKey);

  /**
   * The current user.
   */
  readonly user: UserDto;

  /**
   * The form.
   */
  readonly form: FormGroup<Form>;

  /**
   * Returns whether data are loading.
   */
  loading: boolean;

  /**
   * Creates a new instance of class ChangePasswordFormComponent.
   */
  constructor(private readonly userService: UserService,
              private readonly dialogRef: DynamicDialogRef,
              private readonly translationService: TranslocoService,
              private readonly messageService: MessageService,
              dialogConf: DynamicDialogConfig) {
    this.user = dialogConf.data.user;
    this.loading = false;
    this.form = new FormGroup<Form>({
      password: new FormControl<string | null>(null, [Validators.required, Validators.minLength(6), Validators.maxLength(64)])
    });
  }

  /**
   * Submits the form.
   */
  async submit(): Promise<void> {
    if (this.form.invalid)
      return;

    this.loading = true;
    try {
      await this.userService.changePassword(this.user.id, this.form.value as any, this.user.lastModifiedDate);
      this.messageService.add({
        severity: 'success',
        detail: this.translationService.translate('users.success.update', {username: this.user.username}),
        key: 'global'
      });
      this.dialogRef.close(true);
    } catch (err) {
      let msg = this.translationService.translate('users.errors.update', {username: this.user.username});
      if (err instanceof HttpErrorResponse && err.status === 409)
        msg += ' ' + this.translationService.translate('common.concurrency-error');
      this.messageService.add({severity: 'error', detail: msg});
    } finally {
      this.loading = false;
    }
  }

  /**
   * Closes the dialog without saving changes.
   */
  cancel(): void {
    this.dialogRef.close(false);
  }
}

interface Form {
  password: FormControl<string | null>;
}
