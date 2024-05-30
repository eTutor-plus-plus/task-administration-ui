import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoService, TranslocoTestingModule } from '@ngneat/transloco';
import { MessageService } from 'primeng/api';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        TranslocoTestingModule.forRoot({})
      ],
      providers: [provideRouter([]), MessageService]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should set lang from storage', () => {
    // Arrange
    const transloco = TestBed.inject(TranslocoService);
    const lang = 'de';

    // Act
    localStorage.setItem('dke-lang', lang);
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    // Assert
    expect(transloco.getActiveLang()).toBe(lang);
  });

  it('should set lang from storage with invalid value', () => {
    // Arrange
    const transloco = TestBed.inject(TranslocoService);
    const lang = 'some language';

    // Act
    localStorage.setItem('dke-lang', lang);
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    // Assert
    expect(transloco.getActiveLang()).toBe('en');
  });
});
