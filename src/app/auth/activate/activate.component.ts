import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { TranslocoDirective, TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';

import { SimpleLayoutComponent } from '../../layout';
import { AccountService, getValidationErrorMessage } from '../../api';
import { AuthService } from '../auth.service';

/**
 * Page: Activate Account
 */
@Component({
  selector: 'dke-activate',
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
  templateUrl: './activate.component.html',
  styleUrl: './activate.component.scss'
})
export class ActivateComponent implements OnInit {
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
   * The reset token.
   */
  private token: string | null;

  /**
   * Creates a new instance of class ActivateComponent.
   */
  constructor(private readonly translationService: TranslocoService,
              private readonly messageService: MessageService,
              private readonly accountService: AccountService,
              private readonly authService: AuthService,
              private readonly route: ActivatedRoute,
              private readonly router: Router) {
    this.loading = false;
    this.success = false;
    this.token = null;
    this.form = new FormGroup<Form>({
      password: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(64), Validators.minLength(6)]),
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
   * Retrieves the reset token form the URL.
   * If no token exists the user will be redirected to the login page.
   */
  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token)
      this.router.navigate(['auth', 'login']);
    if (this.authService.isAuthenticated())
      this.router.navigate(['/']);
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
    if (this.form.invalid || !this.token)
      return;

    this.messageService.clear();
    this.loading = true;

    try {
      await this.accountService.activateAccount(this.token, this.form.value.password!, this.form.value.passwordConfirmation!);
      this.messageService.add({
        severity: 'success',
        summary: this.translationService.translate('auth.activate.messages.success_summary'),
        detail: this.translationService.translate('auth.activate.messages.success_detail')
      });
      this.success = true;
    } catch (err) {
      let detail = 'Unknown error';
      if (err instanceof HttpErrorResponse) {
        if (err.status === 0)
          detail = this.translationService.translate('auth.forgot.messages.no_connection');
        else if (err.error?.detail)
          detail = err.error.detail;
        else
          detail = err.message;
      }
      this.messageService.add({
        severity: 'error',
        summary: this.translationService.translate('auth.activate.messages.failed'),
        detail: detail
      });
      this.success = false;
    } finally {
      this.loading = false;
    }
  }
}

interface Form {
  password: FormControl<string | null>;
  passwordConfirmation: FormControl<string | null>;
}
