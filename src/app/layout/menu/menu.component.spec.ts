import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { BehaviorSubject } from 'rxjs';

import { MenuComponent } from './menu.component';
import { ApplicationUser, AuthService } from '../../auth';

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;
  let userSub: BehaviorSubject<ApplicationUser | null>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuComponent, TranslocoTestingModule.forRoot({})],
      providers: [provideRouter([]), {provide: AuthService, useValue: {userChanged: userSub.asObservable()}}]
    }).compileComponents();

    userSub = new BehaviorSubject<ApplicationUser | null>(null);
    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
