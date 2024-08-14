import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterOutlet } from '@angular/router';

import { getBrowserLang, TranslocoService } from '@ngneat/transloco';
import { PrimeNGConfig } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Subject, takeUntil } from 'rxjs';

/**
 * The main component of the application.
 */
@Component({
  selector: 'dke-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToastModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {

  private static readonly STORAGE_KEY: string = '@dke-etutor/lang';
  private readonly destroy$ = new Subject<void>();

  /**
   * Creates a new instance of class AppComponent.
   */
  constructor(private readonly primeNgConfig: PrimeNGConfig,
              private readonly translateService: TranslocoService,
              private readonly route: ActivatedRoute) {
    this.primeNgConfig.ripple = false;
    this.primeNgConfig.inputStyle.set('outlined');
  }

  /**
   * Initializes the applications' translations.
   */
  ngOnInit(): void {
    // Detect language
    // 1. Local Storage
    // 2. Query parameter
    // 3. Browser language
    let lang: string | undefined | null = localStorage.getItem(AppComponent.STORAGE_KEY);
    if (!lang)
      lang = this.route.snapshot.queryParamMap.get('lang');
    if (!lang)
      lang = getBrowserLang();

    // Set language and listen for language changes
    this.translateService.setActiveLang(lang === 'de' || lang === 'en' ? lang : 'en');
    this.translateService.langChanges$
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => localStorage.setItem(AppComponent.STORAGE_KEY, value));
    this.translateService.selectTranslateObject('primeng')
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => this.primeNgConfig.setTranslation(result));
  }

  /**
   * Unsubscribes from all subscriptions.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
