import { languages } from 'monaco-editor';

declare const monaco: { languages: typeof languages };

export function registerClusteringLanguage(): void {
  console.debug('[Monaco] Registering Clustering language');

  monaco.languages.register({ id: 'clustering' });

  monaco.languages.setLanguageConfiguration('clustering', {
    autoClosingPairs: [
      { open: '[', close: ']' },
      { open: '(', close: ')' },
    ],
    surroundingPairs: [
      { open: '[', close: ']' },
      { open: '(', close: ')' },
    ]
  });

  monaco.languages.setMonarchTokensProvider('clustering', {
    tokenizer: {
      root: [
        // Iteration delimiter (must be on its own line)
        [/^--\s*$/, 'keyword'],

        // Square brackets
        [/\[/, 'delimiter.bracket.square.open'],
        [/\]/, 'delimiter.bracket.square.close'],

        // Round brackets
        [/\(/, 'delimiter.bracket.round.open'],
        [/\)/, 'delimiter.bracket.round.close'],

        // Colon between centroid and labels
        [/:/, 'delimiter'],

        // Comma between coordinates and labels
        [/\,/, 'delimiter'],

        // Semicolon between clusters
        [/;/, 'delimiter'],

        // Numbers
        [/\d+.\d+/, 'number'],
        [/\d+/, 'number'], 

        // Labels like A, B, C
        [/[A-Z]\b/, 'identifier'],

        // Whitespace
        [/\s+/, 'white'],

        // Anything else = invalid
        [/./, 'invalid']
      ]
    }
  });
}
