import { registerXQueryLanguage } from './xquery';
import { registerXPathLanguage } from './xpath';

/**
 * Called on monaco editor initialization.
 * Can be used to register additional languages, themes, etc.
 */
export function customizeMonaco(): void {
  registerXQueryLanguage();
  registerXPathLanguage();
}
