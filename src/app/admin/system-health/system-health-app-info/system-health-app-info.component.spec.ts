import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemHealthAppInfoComponent } from './system-health-app-info.component';

describe('SystemHealthAppInfoComponent', () => {
  let component: SystemHealthAppInfoComponent;
  let fixture: ComponentFixture<SystemHealthAppInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemHealthAppInfoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SystemHealthAppInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
