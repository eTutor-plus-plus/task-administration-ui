import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Service for managing the selected app.
 */
@Injectable({providedIn: 'root'})
export class HealthSelectionService {

  private readonly selectedApp$ = new BehaviorSubject<string>('');

  /**
   * Emits an event when the selected app changed.
   */
  readonly selectedAppChanged = this.selectedApp$.asObservable();

  /**
   * Creates a new instance of class HealthSelectionService.
   */
  constructor() {
  }

  /**
   * Gets the currently selected app.
   */
  get selectedApp(): string {
    return this.selectedApp$.value;
  }

  /**
   * Sets the currently selected app.
   *
   * @param value The new value.
   */
  set selectedApp(value: string) {
    if (value?.trim().length === 0)
      this.selectedApp$.next('');
    else
      this.selectedApp$.next(value);
  }

}
