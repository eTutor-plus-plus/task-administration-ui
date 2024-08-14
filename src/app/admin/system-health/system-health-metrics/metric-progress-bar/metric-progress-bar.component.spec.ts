import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTransloco } from '@ngneat/transloco';

import { MetricProgressBarComponent } from './metric-progress-bar.component';
import { translocoTestConfig } from '../../../../translation-loader.service.spec';

describe('MetricProgressBarComponent', () => {
  let component: MetricProgressBarComponent;
  let fixture: ComponentFixture<MetricProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricProgressBarComponent],
      providers: [provideTransloco(translocoTestConfig)]
    }).compileComponents();

    fixture = TestBed.createComponent(MetricProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
