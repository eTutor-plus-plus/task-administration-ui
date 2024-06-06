import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { provideTransloco } from '@ngneat/transloco';
import { MessageService } from 'primeng/api';

import { ForgotPasswordComponent } from './forgot-password.component';
import { translocoTestConfig } from '../../translation-loader.service.spec';
import { API_URL } from '../../app.config';
import { AuthService } from '../auth.service';
import { AccountService } from '../../api';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let userAuthenticated = false;

  beforeEach(async () => {
    userAuthenticated = false;

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent, NoopAnimationsModule],
      providers: [
        provideTransloco(translocoTestConfig),
        provideRouter([
          {path: '', component: ForgotPasswordComponent},
          {path: 'test', component: ForgotPasswordComponent}
        ]),
        MessageService,
        {provide: API_URL, useValue: 'http://localhost'},
        {provide: AuthService, useValue: {isAuthenticated: () => userAuthenticated}},
        {
          provide: AccountService, useValue: {requestPasswordReset: (_: string) => Promise.resolve()}
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect if user is authenticated', async () => {
    // Arrange
    userAuthenticated = true;
    const router = TestBed.inject(Router);
    router.initialNavigation();
    await fixture.ngZone?.run(async () => await router.navigate(['test']));

    // Act
    component.ngOnInit();
    await new Promise(f => setTimeout(f, 500)); // wait for navigation to complete

    // Assert
    expect(router.routerState.snapshot.url).toBe('/');
  });

  it('should show error if username is invalid', () => {
    // Arrange
    component.form.controls.username.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.username.invalid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    expect(elem.getElementsByClassName('p-error')).toHaveLength(1);
    expect(elem?.innerText.trim()).not.toHaveLength(0);
  });

  it('should disable submit button on invalid form', () => {
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
    component.form.setValue({username: 'test'});
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

  it('should submit on click on button', fakeAsync(() => {
    // Arrange
    component.form.setValue({username: 'test'});
    fixture.detectChanges();

    // Act
    const elem: HTMLElement = fixture.nativeElement;
    const btn: HTMLButtonElement = elem.querySelector('form button')!;
    btn.click();
    tick();

    // Assert
    expect(component.loading).toBe(true);
  }));

  it('should show success message on successful submit', async () => {
    // Arrange
    component.form.setValue({username: 'test'});
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
    TestBed.inject(AccountService).requestPasswordReset = (_: string) => Promise.reject('This is an error.');
    component.form.setValue({username: 'test'});
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
