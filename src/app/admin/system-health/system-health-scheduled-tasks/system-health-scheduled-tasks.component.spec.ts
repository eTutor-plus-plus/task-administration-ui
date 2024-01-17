import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemHealthScheduledTasksComponent } from './system-health-scheduled-tasks.component';

describe('SystemHealthScheduledTasksComponent', () => {
  let component: SystemHealthScheduledTasksComponent;
  let fixture: ComponentFixture<SystemHealthScheduledTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemHealthScheduledTasksComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SystemHealthScheduledTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
