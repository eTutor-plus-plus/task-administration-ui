import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskAppsComponent } from './task-apps.component';

describe('TaskAppsComponent', () => {
  let component: TaskAppsComponent;
  let fixture: ComponentFixture<TaskAppsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskAppsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskAppsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
