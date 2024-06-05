import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideTransloco } from '@ngneat/transloco';
import { provideRouter, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { LoginComponent } from './login.component';
import { API_URL } from '../../app.config';
import { translocoTestConfig } from '../../translation-loader.service.spec';
import { AccountService, SystemHealthService } from '../../api';
import { AuthService } from '../auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;

  let serverHealthy = jest.fn();
  let loginMock = jest.fn();
  let userAuthenticated = false;

  const healthMock = {loadHealth: serverHealthy};
  const authMock = {isAuthenticated: () => userAuthenticated, login: (username: string, password: string) => loginMock(username, password)};

  beforeEach(async () => {
    serverHealthy.mockClear();
    serverHealthy.mockResolvedValue(true);

    loginMock.mockClear();
    loginMock.mockResolvedValue(true);

    userAuthenticated = false;

    await TestBed.configureTestingModule({
      imports: [LoginComponent, NoopAnimationsModule],
      providers: [
        provideTransloco(translocoTestConfig),
        provideRouter([
          {path: '', component: LoginComponent},
          {path: 'auth', children: [{path: 'login', component: LoginComponent}]}
        ]),
        MessageService,
        {provide: API_URL, useValue: 'http://localhost'},
        {provide: SystemHealthService, useValue: healthMock},
        {provide: AuthService, useValue: authMock}
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show loading until health information is loaded', () => {
    // Act
    component.ngOnInit();

    // Assert
    expect(component.loading).toBe(true);
    expect(component.appAvailable).toBe(false);
  });

  it('should redirect if user is authenticated', async () => {
    // Arrange
    userAuthenticated = true;
    await fixture.ngZone?.run(async () => await router.navigate(['auth', 'login']));

    // Act
    component.ngOnInit();
    await new Promise(f => setTimeout(f, 500)); // wait for navigation to complete

    // Assert
    expect(router.routerState.snapshot.url).toBe('/');
  });

  it('should show warning if session expired', async () => {
    // Arrange
    userAuthenticated = true;
    await fixture.ngZone?.run(async () => await router.navigate(['auth', 'login'], {state: {expired: true}}));

    // Act
    fixture.detectChanges();
    await new Promise(f => setTimeout(f, 500)); // wait for navigation to complete
    fixture.detectChanges();

    // Assert
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('.p-message-warn')).toBeDefined();
    expect(element.querySelector('.p-message-warn')?.innerHTML).toContain('Your session has expired. Please sign in again.');
  });

  it('should fill username if set by router', async () => {
    // Arrange
    userAuthenticated = true;
    await fixture.ngZone?.run(async () => await router.navigate(['auth', 'login'], {state: {username: 'test'}}));

    // Act
    fixture.detectChanges();
    await new Promise(f => setTimeout(f, 500)); // wait for navigation to complete
    fixture.detectChanges();

    // Assert
    expect(component.form.value.username).toBe('test');
  });

  it('should show form if server is healthy', async () => {
    // Act
    fixture.detectChanges();
    await new Promise(f => setTimeout(f, 500));
    fixture.detectChanges();

    // Assert
    expect(component.appAvailable).toBe(true);
    expect(component.loading).toBe(false);

    const element: HTMLElement = fixture.nativeElement;
    expect(element.getElementsByTagName('form')).toHaveLength(1);
    expect(element.querySelector('.p-message-warn')).toBeFalsy();
  });

  it('should show error and hide login form if server is not healthy', async () => {
    // Arrange
    serverHealthy.mockClear();
    serverHealthy.mockRejectedValueOnce(new Error('server unreachable'));

    // Act
    fixture.detectChanges();
    await new Promise(f => setTimeout(f, 500));
    fixture.detectChanges();

    // Assert
    expect(component.appAvailable).toBe(false);
    expect(component.loading).toBe(false);

    const element: HTMLElement = fixture.nativeElement;
    expect(element.getElementsByTagName('form')).toHaveLength(0);
    expect(element.querySelector('.p-message-warn')).toBeDefined();
    expect(element.querySelector('.p-message-warn')?.innerHTML).toContain('The eTutor-Server is currently not available. Please try again later.');
  });

  it('should show error if username is empty', async () => {
    // Arrange
    component.form.controls.username.markAsDirty();

    // Act
    fixture.detectChanges();
    await new Promise(f => setTimeout(f, 500));
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('#username + .p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if password is empty', async () => {
    // Arrange
    component.form.controls.password.markAsDirty();

    // Act
    fixture.detectChanges();
    await new Promise(f => setTimeout(f, 500));
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('#password + .p-error');
    expect(msg).toBeTruthy();
  });

  it('should disable submit button on invalid form', async () => {
    // Act
    fixture.detectChanges();
    await new Promise(f => setTimeout(f, 500));
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    expect(elem.querySelector('form button')?.hasAttribute('disabled')).toBe(true);
  });

  it('should enable submit button on valid form', async () => {
    // Act
    fixture.detectChanges();
    await new Promise(f => setTimeout(f, 500));
    component.form.patchValue({password: '123456', username: 'test'});
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    expect(elem.querySelector('form button')?.hasAttribute('disabled')).toBe(false);
  });

  it('should not submit form on invalid form', async () => {
    // Act
    await fixture.ngZone?.run(async () => await router.navigate(['auth', 'login']));
    await component.login();

    // Assert
    expect(router.routerState.snapshot.url).toBe('/auth/login');
  });

  it('should submit on click on button', async () => {
    // Arrange
    await fixture.ngZone?.run(async () => await router.navigateByUrl('/auth/login'));
    fixture.detectChanges();
    await new Promise(f => setTimeout(f, 500));
    component.form.patchValue({password: '123456', username: 'test'});
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
    await fixture.ngZone?.run(async () => await router.navigateByUrl('/auth/login'));
    component.ngOnInit();
    await new Promise(f => setTimeout(f, 500));
    component.form.patchValue({password: '123456', username: 'test'});
    fixture.detectChanges();

    // Act
    await component.login();
    fixture.detectChanges();

    // Assert
    expect(router.routerState.snapshot.url).toBe('/');
  });

  it('should show error message on failed submit', async () => {
    // Arrange
    loginMock.mockClear();
    loginMock.mockRejectedValueOnce(false);

    await fixture.ngZone?.run(async () => await router.navigateByUrl('/auth/login'));
    component.ngOnInit();
    await new Promise(f => setTimeout(f, 500));
    component.form.patchValue({password: '123456', username: 'test'});
    fixture.detectChanges();

    // Act
    await component.login();
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const messages = elem.getElementsByClassName('p-message-error');

    expect(messages).toHaveLength(1);
    expect(messages[0].innerHTML).toContain('Unknown error');
  });
});

