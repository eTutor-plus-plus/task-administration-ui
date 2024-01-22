import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslocoPipe } from '@ngneat/transloco';
import { Audited } from '../../../api';

/**
 * Component: Audit-Information
 */
@Component({
  selector: 'dke-audit-information',
  standalone: true,
  imports: [DatePipe, TranslocoPipe],
  templateUrl: './audit-information.component.html',
  styleUrl: './audit-information.component.scss'
})
export class AuditInformationComponent {
  /**
   * The object with the audit data.
   */
  @Input({required: true}) data?: Audited | null;

  /**
   * Creates a new instance of class {@link AuditInformationComponent}.
   */
  constructor() {
  }

  /**
   * Get identifier of the audited item.
   */
  getId(): string | undefined {
    if (this.data && 'id' in this.data) {
      return this.data.id + '';
    }
    return undefined;
  }
}
