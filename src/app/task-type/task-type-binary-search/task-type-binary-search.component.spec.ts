import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTypeBinarySearchComponent } from './task-type-binary-search.component';

describe('TaskTypeBinarySearchComponent', () => {
  let component: TaskTypeBinarySearchComponent;
  let fixture: ComponentFixture<TaskTypeBinarySearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTypeBinarySearchComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskTypeBinarySearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
