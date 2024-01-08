import { Component } from '@angular/core';
import { TranslocoDirective, TranslocoPipe } from '@ngneat/transloco';

import { ConfirmationService, SharedModule } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { TableDialogOverviewComponent } from '../../layout';
import { OrganizationalUnitDto, OrganizationalUnitService } from '../../api';
import { OrganizationalUnitFormComponent } from './organizational-unit-form/organizational-unit-form.component';

/**
 * Page: Organizational Units Overview
 */
@Component({
  selector: 'dke-organizational-units',
  standalone: true,
  imports: [
    ButtonModule,
    ConfirmPopupModule,
    InputTextModule,
    SharedModule,
    TableModule,
    TagModule,
    TranslocoDirective,
    TranslocoPipe,
    TooltipModule
  ],
  providers: [ConfirmationService, DialogService],
  templateUrl: './organizational-units.component.html',
  styleUrl: './organizational-units.component.scss'
})
export class OrganizationalUnitsComponent extends TableDialogOverviewComponent<OrganizationalUnitDto, OrganizationalUnitService> {

  /**
   * Creates a new instance of class OrganizationalUnitsComponent.
   */
  constructor(organizationalUnitService: OrganizationalUnitService) {
    super(organizationalUnitService, [{field: 'name', order: 1}], 'organizationalUnits.', OrganizationalUnitFormComponent, {
      style: {
        'max-width': '60em',
        'min-width': '30em'
      }
    });
  }

  override getId(entity: OrganizationalUnitDto): string | number {
    return entity.id;
  }

  override getMessageParams(entity: OrganizationalUnitDto, type: 'success' | 'error'): Record<string, unknown> {
    return {name: entity.name};
  }

}
