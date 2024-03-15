import { registerXQueryLanguage } from './xquery';
import { registerXPathLanguage } from './xpath';
import { registerDatalogLanguage } from './datalog';
import { registerCsvLanguage } from './csv';
import { registerDroolsLanguage } from './drools';

/**
 * Called on monaco editor initialization.
 * Can be used to register additional languages, themes, etc.
 */
export function customizeMonaco(): void {
  registerXQueryLanguage();
  registerXPathLanguage();
  registerDatalogLanguage();
  registerCsvLanguage();
  registerDroolsLanguage();
}
