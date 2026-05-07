import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTypeDfmComponent } from './task-type-dfm.component';

describe('TaskTypeDfmComponent', () => {
  let component: TaskTypeDfmComponent;
  let fixture: ComponentFixture<TaskTypeDfmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTypeDfmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskTypeDfmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
