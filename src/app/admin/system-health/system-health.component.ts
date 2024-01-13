import { Component, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoDirective, TranslocoPipe } from '@ngneat/transloco';

import { SystemHealthService } from '../../api';

/**
 * Base component for the System Health page.
 */
@Component({
  selector: 'dke-system-health',
  standalone: true,
  imports: [
    NgClass,
    RouterOutlet,
    TranslocoDirective,
    TranslocoPipe,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './system-health.component.html',
  styleUrl: './system-health.component.scss'
})
export class SystemHealthComponent implements OnInit {

  /**
   * The available tabs.
   */
  availableTabs: string[];

  /**
   * Creates a new instance of class SystemHealthComponent.
   */
  constructor(private readonly healthService: SystemHealthService) {
    this.availableTabs = [];
  }

  /**
   * Initializes the component.
   */
  ngOnInit(): void {
    this.healthService.loadAvailableEndpoints().then(endpoints => this.availableTabs = endpoints);
  }

}
