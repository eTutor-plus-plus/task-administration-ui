import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditInformationComponent } from './audit-information.component';

describe('AuditInformationComponent', () => {
  let component: AuditInformationComponent;
  let fixture: ComponentFixture<AuditInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditInformationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AuditInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
