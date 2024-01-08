import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { TranslocoDirective } from '@ngneat/transloco';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../auth';

/**
 * Layout-component: Menu
 */
@Component({
  selector: 'dke-menu',
  standalone: true,
  imports: [TranslocoDirective, RouterLink, RouterLinkActive],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit, OnDestroy {

  /**
   * The current user role.
   */
  role: string | null = null;

  private readonly destroy$ = new Subject<void>();

  /**
   * Creates a new instance of class MenuComponent.
   */
  constructor(private readonly authService: AuthService) {
    this.role = null;
  }

  /**
   * Subscribes to user changes.
   */
  ngOnInit(): void {
    this.authService.userChanged
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => this.role = value ? value.maxRole : null);
  }

  /**
   * Unsubscribes from all subscriptions.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Returns whether the current user is instructor, admin or full admin.
   */
  isInstructorOrHigher(): boolean {
    return this.role === 'instructor' || this.isAdmin();
  }

  /**
   * Returns whether the current user is admin or full admin.
   */
  isAdmin(): boolean {
    return this.role === 'admin' || this.isFullAdmin();
  }

  /**
   * Returns whether the current user is full admin.
   */
  isFullAdmin(): boolean {
    return this.role === 'full_admin';
  }
}
