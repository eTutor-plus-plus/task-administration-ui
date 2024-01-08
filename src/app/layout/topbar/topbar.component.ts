import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';
import { StyleClassModule } from 'primeng/styleclass';
import { BadgeModule } from 'primeng/badge';
import { TranslocoDirective, TranslocoPipe, TranslocoService } from '@ngneat/transloco';

import { AuthService, ApplicationUser } from '../../auth';

/**
 * Layout-component: Topbar
 */
@Component({
  selector: '[dke-topbar]',
  standalone: true,
  imports: [RouterLink, StyleClassModule, BadgeModule, TranslocoPipe, TranslocoDirective],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements OnInit, OnDestroy {
  /**
   * The current user.
   */
  user: ApplicationUser | null;

  /**
   * The current language.
   */
  currentLanguage: string;

  private readonly destroy$ = new Subject<void>();

  /**
   * Creates a new instance of class TopbarComponent.
   */
  constructor(private readonly translationService: TranslocoService,
              private readonly authService: AuthService,
              private readonly router: Router) {
    this.user = null;
    this.currentLanguage = translationService.getActiveLang();
  }

  /**
   * Subscribes to user and language changes.
   */
  ngOnInit(): void {
    this.authService.userChanged
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => this.user = value);
    this.translationService.langChanges$.subscribe(val => this.currentLanguage = val);
  }

  /**
   * Unsubscribes from all subscriptions.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Toggles the language.
   */
  toggleLanguage(): void {
    this.currentLanguage = this.currentLanguage === 'de' ? 'en' : 'de';
    this.translationService.setActiveLang(this.currentLanguage);
  }

  /**
   * Log out the user.
   */
  async logout(): Promise<void> {
    this.authService.logout();
    await this.router.navigateByUrl('/auth/login');
  }
}
