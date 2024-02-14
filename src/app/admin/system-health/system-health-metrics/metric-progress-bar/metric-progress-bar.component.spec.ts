import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricProgressBarComponent } from './metric-progress-bar.component';

describe('MetricProgressBarComponent', () => {
  let component: MetricProgressBarComponent;
  let fixture: ComponentFixture<MetricProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricProgressBarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MetricProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
