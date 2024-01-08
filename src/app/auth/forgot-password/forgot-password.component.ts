import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { TranslocoDirective, TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';

import { SimpleLayoutComponent } from '../../layout';
import { AccountService, getValidationErrorMessage } from '../../api';

/**
 * Page: Forgot Password
 */
@Component({
  selector: 'dke-forgot-password',
  standalone: true,
  imports: [
    SimpleLayoutComponent,
    ButtonModule,
    InputTextModule,
    MessagesModule,
    ReactiveFormsModule,
    RouterLink,
    TranslocoDirective,
    TranslocoPipe
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  /**
   * The login form.
   */
  readonly form: FormGroup<Form>;

  /**
   * Whether a loading operation is in progress.
   */
  loading: boolean;

  /**
   * Whether the request was successful.
   */
  success: boolean;

  /**
   * Creates a new instance of class ForgotPasswordComponent.
   */
  constructor(private readonly translationService: TranslocoService,
              private readonly messageService: MessageService,
              private readonly accountService: AccountService) {
    this.loading = false;
    this.success = false;
    this.form = new FormGroup<Form>({username: new FormControl<string | null>(null, [Validators.required])});
  }

  /**
   * Returns the error message for the specified form field.
   *
   * @param formField The form field.
   */
  getErrorMessage(formField: string): string {
    return getValidationErrorMessage(this.translationService, (this.form.controls as any)[formField], 'auth.forgot.' + formField);
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
      await this.accountService.requestPasswordReset(this.form.value.username!);
      this.messageService.add({
        severity: 'success',
        summary: this.translationService.translate('auth.forgot.messages.success_summary'),
        detail: this.translationService.translate('auth.forgot.messages.success_detail')
      });
      this.success = true;
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
        summary: this.translationService.translate('auth.forgot.messages.failed'),
        detail: detail
      });
      this.success = false;
    } finally {
      this.loading = false;
    }
  }
}

interface Form {
  username: FormControl<string | null>;
}
