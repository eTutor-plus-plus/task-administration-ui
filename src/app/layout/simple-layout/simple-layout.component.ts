import { booleanAttribute, Component, Input } from '@angular/core';

import { TranslocoDirective, TranslocoPipe, TranslocoService } from '@ngneat/transloco';

import { environment } from '../../../environments/environment';

/**
 * Plain layout with only the child component and the logo.
 */
@Component({
  selector: 'dke-simple-layout',
  standalone: true,
  imports: [
    TranslocoDirective,
    TranslocoPipe
  ],
  templateUrl: './simple-layout.component.html',
  styleUrl: './simple-layout.component.scss'
})
export class SimpleLayoutComponent {

  /**
   * Whether to show the language toggle.
   */
  @Input({transform: booleanAttribute}) showLanguageToggle = true;

  /**
   * The URL of the impressum.
   */
  readonly impressUrl: string;

  /**
   * The current language.
   */
  currentLanguage: string;

  /**
   * Creates a new instance of class SimpleLayoutComponent.
   */
  constructor(private readonly translationService: TranslocoService) {
    this.currentLanguage = translationService.getActiveLang();
    this.impressUrl = environment.impressUrl;
  }

  /**
   * Toggles the language.
   */
  toggleLanguage(): void {
    this.currentLanguage = this.currentLanguage === 'de' ? 'en' : 'de';
    this.translationService.setActiveLang(this.currentLanguage);
  }

}
