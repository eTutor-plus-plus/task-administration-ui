import { NgxMonacoEditorConfig } from 'ngx-monaco-editor-v2';
import { registerLogLanguage } from './lang-log';

/**
 * The monaco editor configuration.
 */
export const monacoConfig: NgxMonacoEditorConfig = {
  defaultOptions: {
    scrollBeyondLastLine: false,
    minimap: {enabled: false},
    automaticLayout: true
  },
  onMonacoLoad: () => {
  }
};
