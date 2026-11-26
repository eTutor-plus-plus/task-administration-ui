import { Component, isDevMode } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { StyleClassModule } from 'primeng/styleclass';
import { FooterComponent } from './footer/footer.component';
import { MenuComponent } from './menu/menu.component';
import { TopbarComponent } from './topbar/topbar.component';

/**
 * Main application layout.
 */
@Component({
  selector: 'dke-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    StyleClassModule,
    FooterComponent,
    MenuComponent,
    TopbarComponent
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {

  /**
   * Whether app is in dev-mode.
   */
  devEnvironment: boolean;

  /**
   * Creates a new instance of class LayoutComponent.
   */
  constructor() {
    this.devEnvironment = isDevMode();
  }
}
