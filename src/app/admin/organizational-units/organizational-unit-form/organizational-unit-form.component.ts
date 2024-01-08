import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective, TranslocoPipe } from '@ngneat/transloco';

import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';

import { OrganizationalUnitDto, OrganizationalUnitService } from '../../../api';
import { AuditInformationComponent, DialogEditFormComponent } from '../../../layout';

/**
 * Form: Organizational Unit
 */
@Component({
  selector: 'dke-organizational-unit-form',
  standalone: true,
  imports: [
    ButtonModule,
    CalendarModule,
    CheckboxModule,
    DropdownModule,
    InputTextModule,
    MessagesModule,
    ReactiveFormsModule,
    TranslocoDirective,
    TranslocoPipe,
    AuditInformationComponent
  ],
  templateUrl: './organizational-unit-form.component.html',
  styleUrl: './organizational-unit-form.component.scss'
})
export class OrganizationalUnitFormComponent extends DialogEditFormComponent<OrganizationalUnitDto, OrganizationalUnitService, OrganizationalUnitForm> {

  /**
   * Creates a new instance of class OrganizationalUnitFormComponent.
   */
  constructor(entityService: OrganizationalUnitService) {
    super(entityService, new FormGroup<OrganizationalUnitForm>({
      name: new FormControl<string | null>(null, [Validators.required, Validators.minLength(2), Validators.maxLength(255)])
    }), 'organizationalUnits.');
  }

  override getId(entity: OrganizationalUnitDto): string | number {
    return entity.id;
  }

  override getLastModifiedDate(entity: OrganizationalUnitDto): string | null {
    return entity.lastModifiedDate;
  }

  override getMessageParams(entity: OrganizationalUnitDto | {
    name: any;
  }, type: 'successCreate' | 'errorCreate' | 'successUpdate' | 'errorUpdate'): Record<string, unknown> {
    return {name: entity.name};
  }

}

interface OrganizationalUnitForm {
  name: FormControl<string | null>;
}
