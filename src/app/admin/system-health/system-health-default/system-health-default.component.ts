import { Component } from '@angular/core';
import { TranslocoDirective } from '@ngneat/transloco';
import { MessagesModule } from 'primeng/messages';
import { SharedModule } from 'primeng/api';

/**
 * Default system health page.
 */
@Component({
  selector: 'dke-system-health-default',
  standalone: true,
  imports: [
    TranslocoDirective,
    MessagesModule,
    SharedModule
  ],
  templateUrl: './system-health-default.component.html',
  styleUrl: './system-health-default.component.scss'
})
export class SystemHealthDefaultComponent {
}
