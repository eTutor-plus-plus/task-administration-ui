import { languages } from 'monaco-editor';

declare const monaco: { languages: typeof languages };

export function registerCsvLanguage(): void {
  console.debug('[Monaco] Registering CSV language');
  monaco.languages.register({id: 'csv'});
  monaco.languages.setLanguageConfiguration('csv', {
    autoClosingPairs: [
      {open: '\'', close: '\''},
      {open: '"', close: '"'},
    ],
    surroundingPairs: [
      {open: '\'', close: '\''},
      {open: '"', close: '"'},
    ],
  });
  monaco.languages.setMonarchTokensProvider('csv', {
    tokenizer: {
      root: [
        // Rules for tokenizing CSV data
        [/'(?:[^'])*'/, 'string'], // Single quoted strings
        [/"/, 'string', '@doubleQuotedString'], // Double quoted strings
        [/'(?:[^']|'')*'/, 'string'], // Single quoted strings with escaped quotes
        [/[^'",;\n\r]+/, ''],
        [/[,;]/, 'variable'], // delimiter
        [/[\n\r]/, 'delimiter'], // Newline delimiter
      ],
      doubleQuotedString: [
        [/[^"]+/, 'string'],
        [/""/, 'string'], // Escaped double quotes
        [/"/, 'string', '@pop'], // End of double quoted string
      ],
    }
  });
}
