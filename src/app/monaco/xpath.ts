import { languages } from 'monaco-editor';

declare const monaco: { languages: typeof languages };

export function registerXPathLanguage(): void {
  console.debug('[Monaco] Registering XPath language');
  monaco.languages.register({id: 'xpath'});
  monaco.languages.setLanguageConfiguration('xpath', {
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')']
    ],
    autoClosingPairs: [
      {open: '{', close: '}'},
      {open: '[', close: ']'},
      {open: '(', close: ')'},
      {open: '\'', close: '\''},
      {open: '"', close: '"'}
    ],
    surroundingPairs: [
      {open: '{', close: '}'},
      {open: '[', close: ']'},
      {open: '(', close: ')'},
      {open: '\'', close: '\''},
      {open: '"', close: '"'}
    ]
  });
  monaco.languages.setMonarchTokensProvider('xpath', {
    keywords: [
      'eq', 'ne', 'lt', 'le', 'gt', 'ge', 'div',
      'in', 'every', 'some', 'satisifies', 'count', 'last', 'empty', 'avg', 'min', 'max', 'sum', 'ceiling',
      'not', 'substring', 'distinct-nodes', 'distinct-values', 'node-name'
    ],

    operators: [
      '=', '<', '>', '>=', '<=', '!=', '>>', '<<', '+', '-', '*'
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
        [/\d*\.\d+([eE][-+]?\d+)?/, 'number.float'],
        [/\d+/, 'number'],

        // Operators
        [/\$[\w$]*/, 'variable'],
        [/[=<>!]+/, 'operator'],

        // Delimiters and brackets
        [/[{}()[\]]/, '@brackets'],

        // Strings
        [/'([^'\\]|\\.)*$/, 'string.invalid'],  // single quote string
        [/"/, 'string', '@string.double'],
      ],

      string: [
        [/'/, 'string', '@pop'],
        [/[^']+/, 'string'],
      ],
    },
  });
}
