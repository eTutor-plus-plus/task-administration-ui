import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTransloco } from '@ngneat/transloco';
import { BehaviorSubject } from 'rxjs';

import { MenuComponent } from './menu.component';
import { ApplicationUser, AuthService } from '../../auth';
import { translocoTestConfig } from '../../translation-loader.service.spec';

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;
  let userSub: BehaviorSubject<ApplicationUser | null>;

  beforeEach(async () => {
    userSub = new BehaviorSubject<ApplicationUser | null>(null);

    await TestBed.configureTestingModule({
      imports: [MenuComponent],
      providers: [
        provideRouter([]),
        provideTransloco(translocoTestConfig),
        {provide: AuthService, useValue: {userChanged: userSub.asObservable()}}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
