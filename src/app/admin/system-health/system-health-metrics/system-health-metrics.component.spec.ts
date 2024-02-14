import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemHealthMetricsComponent } from './system-health-metrics.component';

describe('SystemHealthMetricsComponent', () => {
  let component: SystemHealthMetricsComponent;
  let fixture: ComponentFixture<SystemHealthMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemHealthMetricsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SystemHealthMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
