import { Component } from '@angular/core';
import { TranslocoDirective, TranslocoPipe } from '@ngneat/transloco';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { SimpleLayoutComponent } from '../simple-layout/simple-layout.component';

/**
 * Page: Not Found
 */
@Component({
  selector: 'dke-not-found',
  standalone: true,
  imports: [
    TranslocoDirective,
    TranslocoPipe,
    ButtonModule,
    RouterLink,
    SimpleLayoutComponent
  ],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {
  /**
   * Creates a new instance of class NotFoundComponent.
   */
  constructor() {
  }
}
