import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricValueComponent } from './metric-value.component';
import { provideTransloco } from '@ngneat/transloco';
import { translocoTestConfig } from '../../../../translation-loader.service.spec';

describe('MetricValueComponent', () => {
  let component: MetricValueComponent;
  let fixture: ComponentFixture<MetricValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricValueComponent],
      providers: [provideTransloco(translocoTestConfig)]
    }).compileComponents();

    fixture = TestBed.createComponent(MetricValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
