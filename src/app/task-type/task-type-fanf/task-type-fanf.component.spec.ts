import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTypeFanfComponent } from './task-type-fanf.component';

describe('TaskTypeFanfComponent', () => {
  let component: TaskTypeFanfComponent;
  let fixture: ComponentFixture<TaskTypeFanfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTypeFanfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskTypeFanfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
