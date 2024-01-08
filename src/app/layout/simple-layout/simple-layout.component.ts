import { booleanAttribute, Component, Input } from '@angular/core';

import { TranslocoDirective, TranslocoPipe, TranslocoService } from '@ngneat/transloco';

import { AuthService } from '../../auth';
import { environment } from '../../../environments/environment';

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
  constructor(private readonly translationService: TranslocoService,
              private readonly authService: AuthService) {
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
