import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemHealthLogFileComponent } from './system-health-log-file.component';

describe('SystemHealthLogFileComponent', () => {
  let component: SystemHealthLogFileComponent;
  let fixture: ComponentFixture<SystemHealthLogFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemHealthLogFileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SystemHealthLogFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
