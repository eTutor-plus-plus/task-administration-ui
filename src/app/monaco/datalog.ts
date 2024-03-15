import { languages } from 'monaco-editor';

declare const monaco: { languages: typeof languages };

export function registerDatalogLanguage(): void {
  console.debug('[Monaco] Registering Datalog language');
  monaco.languages.register({id: 'datalog'});
  monaco.languages.setLanguageConfiguration('datalog', {
    comments: {
      lineComment: '%'
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
    ],
    autoClosingPairs: [
      {open: '{', close: '}'},
      {open: '[', close: ']'},
      {open: '(', close: ')'},
      {open: '\'', close: '\''},
      {open: '"', close: '"'},
    ],
    surroundingPairs: [
      {open: '{', close: '}'},
      {open: '[', close: ']'},
      {open: '(', close: ')'},
      {open: '\'', close: '\''},
      {open: '"', close: '"'},
    ],
  });
  monaco.languages.setMonarchTokensProvider('datalog', {
    // Set defaultToken to invalid to see what you do not tokenize yet
    defaultToken: 'invalid',

    keywords: [
      'not', 'v', 'true', 'false', '_'
    ],

    operators: [
      ':-', ':~', '-', '?'
    ],

    brackets: [
      {open: '{', close: '}', token: 'delimiter.curly'},
      {open: '[', close: ']', token: 'delimiter.square'},
      {open: '(', close: ')', token: 'delimiter.parenthesis'}
    ],

    // Define the tokens
    tokenizer: {
      root: [
        // Keywords and operators
        [/[a-z_$][\w$]*/, {
          cases: {
            '@keywords': 'keyword',
            '@default': 'identifier',
          },
        }],
        [/[A-Z][\w$]*/, 'type.identifier'],

        // Operators
        [/\$[\w$]*/, 'variable'],
        [/[=<>!]+/, 'operator'],

        // Delimiters and brackets
        [/[{}()[\]]/, '@brackets'],

        // Strings
        [/'([^'\\]|\\.)*$/, 'string.invalid'],  // single quote string
        [/"/, 'string', '@string.double'],

        // Comments
        [/%.*/, 'comment'],
      ],

      string: [
        [/'/, 'string', '@pop'],
        [/[^']+/, 'string'],
      ],
    },
  });
}
