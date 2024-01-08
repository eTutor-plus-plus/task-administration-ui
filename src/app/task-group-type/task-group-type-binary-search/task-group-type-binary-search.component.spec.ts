import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskGroupTypeBinarySearchComponent } from './task-group-type-binary-search.component';

describe('TaskGroupTypeBinarySearchComponent', () => {
  let component: TaskGroupTypeBinarySearchComponent;
  let fixture: ComponentFixture<TaskGroupTypeBinarySearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskGroupTypeBinarySearchComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskGroupTypeBinarySearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
