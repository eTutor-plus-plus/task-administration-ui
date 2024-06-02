import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideTransloco } from '@ngneat/transloco';
import { MessageService } from 'primeng/api';

import { AuthService } from '../auth.service';
import { API_URL } from '../../app.config';
import { AccountService } from '../../api';
import { ResetPasswordComponent } from './reset-password.component';
import { translocoTestConfig } from '../../translation-loader.service.spec';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let router: Router;
  let userAuthenticated = false;

  beforeEach(async () => {
    userAuthenticated = false;

    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent, NoopAnimationsModule],
      providers: [
        provideTransloco(translocoTestConfig),
        provideRouter([
          {path: '', component: ResetPasswordComponent},
          {path: 'reset', component: ResetPasswordComponent},
          {path: 'auth', children: [{path: 'login', component: ResetPasswordComponent}]}
        ]),
        MessageService,
        {provide: API_URL, useValue: 'http://localhost'},
        {provide: AuthService, useValue: {isAuthenticated: () => userAuthenticated}},
        {provide: AccountService, useValue: {resetPassword: (token: string, pwd: string, conf: string) => Promise.resolve()}}
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;

    router.initialNavigation();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect if user is authenticated', async () => {
    // Arrange
    userAuthenticated = true;
    await fixture.ngZone?.run(async () => await router.navigate(['reset']));

    // Act
    component.ngOnInit();
    await new Promise(f => setTimeout(f, 500)); // wait for navigation to complete

    // Assert
    expect(router.routerState.snapshot.url).toBe('/');
  });

  it('should redirect if no token is set in the query', async () => {
    // Arrange
    await fixture.ngZone?.run(async () => await router.navigateByUrl('/reset'));

    // Act
    component.ngOnInit();
    await new Promise(f => setTimeout(f, 500)); // wait for navigation to complete

    // Assert
    expect(router.routerState.snapshot.url).toBe('/auth/login');
  });

  it('should not redirect if a token is set in the query', async () => {
    // Arrange
    await fixture.ngZone?.run(async () => await router.navigateByUrl('/reset?token=1234'));

    // Act
    component.ngOnInit();
    await new Promise(f => setTimeout(f, 500)); // wait for navigation to complete

    // Assert
    expect(router.routerState.snapshot.url).toBe('/reset?token=1234');
  });

  it('should show error if password is required', () => {
    // Arrange
    component.form.controls.password.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('#password + .p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if password is too short', () => {
    // Arrange
    component.form.patchValue({password: '123'});
    component.form.controls.password.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('#password + .p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if password is too long', () => {
    // Arrange
    component.form.patchValue({password: '1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz'});
    component.form.controls.password.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('#password + .p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if password confirmation is required', () => {
    // Arrange
    component.form.controls.passwordConfirmation.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('#passwordConfirmation + .p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if passwords do not match', () => {
    // Arrange
    component.form.patchValue({password: 'Passwort123', passwordConfirmation: 'Passwort456'});
    component.form.controls.passwordConfirmation.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('#passwordConfirmation + .p-error');
    expect(msg).toBeTruthy();
  });

  it('should disable submit button on invalid form', () => {
    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    expect(elem.querySelector('form button')?.hasAttribute('disabled')).toBe(true);
  });

  it('should disable submit button during loading operation', () => {
    // Act
    component.loading = true;
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    expect(elem.querySelector('form button')?.hasAttribute('disabled')).toBe(true);
  });

  it('should enable submit button on valid form', () => {
    // Act
    component.form.patchValue({password: '123456', passwordConfirmation: '123456'});
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    expect(elem.querySelector('form button')?.hasAttribute('disabled')).toBe(false);
  });

  it('should not submit form on invalid form', async () => {
    // Act
    await component.submit();

    // Assert
    expect(component.success).toBe(false);
  });

  it('should submit on click on button', async () => {
    // Arrange
    await fixture.ngZone?.run(async () => await router.navigateByUrl('/reset?token=1234'));
    component.ngOnInit();
    component.form.patchValue({password: '123456', passwordConfirmation: '123456'});
    fixture.detectChanges();

    // Act
    const elem: HTMLElement = fixture.nativeElement;
    const btn: HTMLButtonElement = elem.querySelector('form button')!;
    btn.click();

    // Assert
    expect(component.loading).toBe(true);
  });

  it('should show success message on successful submit', async () => {
    // Arrange
    await fixture.ngZone?.run(async () => await router.navigateByUrl('/reset?token=1234'));
    component.ngOnInit();
    component.form.patchValue({password: '123456', passwordConfirmation: '123456'});
    fixture.detectChanges();

    // Act
    await component.submit();
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    expect(component.success).toBe(true);
    expect(elem.getElementsByClassName('p-message-success')).toHaveLength(1);
  });

  it('should show error message on failed submit', async () => {
    // Arrange
    TestBed.inject(AccountService).resetPassword = (token: string, pwd: string, conf: string) => Promise.reject('This is an error.');
    await fixture.ngZone?.run(async () => await router.navigateByUrl('/reset?token=1234'));
    component.ngOnInit();
    component.form.patchValue({password: '123456', passwordConfirmation: '123456'});
    fixture.detectChanges();

    // Act
    await component.submit();
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const messages = elem.getElementsByClassName('p-message-error');

    expect(component.success).toBe(false);
    expect(messages).toHaveLength(1);
    expect(messages[0].innerHTML).toContain('Unknown error');
  });
});
