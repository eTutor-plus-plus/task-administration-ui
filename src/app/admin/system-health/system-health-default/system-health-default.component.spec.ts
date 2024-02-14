import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemHealthDefaultComponent } from './system-health-default.component';

describe('SystemHealthDefaultComponent', () => {
  let component: SystemHealthDefaultComponent;
  let fixture: ComponentFixture<SystemHealthDefaultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemHealthDefaultComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SystemHealthDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
