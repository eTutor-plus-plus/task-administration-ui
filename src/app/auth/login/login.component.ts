import { AfterViewInit, Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { TranslocoDirective, TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';

import { AuthService } from '../auth.service';
import { getValidationErrorMessage, SystemHealthService } from '../../api';
import { SimpleLayoutComponent } from '../../layout';

/**
 * Login page
 */
@Component({
  selector: 'dke-login',
  standalone: true,
  imports: [
    InputTextModule,
    ButtonModule,
    TranslocoPipe,
    TranslocoDirective,
    ReactiveFormsModule,
    RouterLink,
    MessagesModule,
    SimpleLayoutComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, AfterViewInit {
  /**
   * The login form.
   */
  readonly form: FormGroup<LoginForm>;

  /**
   * Whether a loading operation is in progress.
   */
  loading: boolean;

  /**
   * Whether the application is available.
   */
  appAvailable: boolean;

  /**
   * Creates a new instance of class LoginComponent.
   */
  constructor(private readonly translationService: TranslocoService,
              private readonly messageService: MessageService,
              private readonly authService: AuthService,
              private readonly healthService: SystemHealthService,
              private readonly router: Router,
              private readonly route: ActivatedRoute) {
    this.loading = false;
    this.appAvailable = false;
    this.form = new FormGroup<LoginForm>({
      username: new FormControl<string | null>(null, [Validators.required]),
      password: new FormControl<string | null>(null, [Validators.required])
    });
  }

  /**
   * Check server state.
   */
  ngOnInit(): void {
    this.healthService.loadHealth()
      .then(() => {
        this.appAvailable = true;
      })
      .catch(() => {
        this.appAvailable = false;
        this.messageService.add({
          severity: 'warn',
          detail: this.translationService.translate('auth.login.messages.unavailable')
        });
      });
  }

  /**
   * Displays a session expiration message in case of expired session.
   */
  ngAfterViewInit(): void {
    if (this.route.snapshot.queryParamMap.has('expired') && this.route.snapshot.queryParamMap.get('expired') == 'true') {
      setTimeout(() => this.messageService.add({
        severity: 'warn',
        detail: this.translationService.translate('auth.login.expired')
      }));
    }
  }

  /**
   * Performs the login.
   */
  async login(): Promise<void> {
    if (this.form.invalid)
      return;

    this.messageService.clear();
    this.loading = true;

    try {
      await this.authService.login(this.form.value.username!, this.form.value.password!);
      this.messageService.add({
        severity: 'success',
        summary: this.translationService.translate('auth.login.messages.login_success_summary'),
        detail: this.translationService.translate('auth.login.messages.login_success_detail')
      });
      await this.router.navigate(['/']);
    } catch (err) {
      let detail = 'Unknown error';
      if (err instanceof HttpErrorResponse) {
        if (err.status === 400)
          detail = this.translationService.translate('auth.login.messages.bad_credentials');
        else if (err.status === 0)
          detail = this.translationService.translate('auth.login.messages.no_connection');
        else if (err.error?.detail)
          detail = err.error.detail;
        else
          detail = err.message;
      }
      this.messageService.add({
        severity: 'error',
        summary: this.translationService.translate('auth.login.messages.login_failed'),
        detail: detail
      });
      this.form.patchValue({password: null});
      this.loading = false;
    }
  }

  /**
   * Returns the error message for the specified form field.
   *
   * @param formField The form field.
   */
  getErrorMessage(formField: string): string {
    return getValidationErrorMessage(this.translationService, (this.form.controls as any)[formField], 'auth.login.' + formField);
  }
}

interface LoginForm {
  username: FormControl<string | null>;
  password: FormControl<string | null>;
}
