import { registerXQueryLanguage } from './xquery';
import { registerXPathLanguage } from './xpath';
import { registerDatalogLanguage } from './datalog';

/**
 * Called on monaco editor initialization.
 * Can be used to register additional languages, themes, etc.
 */
export function customizeMonaco(): void {
  registerXQueryLanguage();
  registerXPathLanguage();
  registerDatalogLanguage();
}
