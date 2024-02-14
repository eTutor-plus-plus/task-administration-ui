import { languages } from 'monaco-editor';

declare const monaco: { languages: typeof languages };

export function registerXQueryLanguage(): void {
  console.debug('[Monaco] Registering XQuery language');
  monaco.languages.register({id: 'xquery'});
  monaco.languages.setLanguageConfiguration('xquery', {
    comments: {
      blockComment: ['(:', ':)']
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
      {open: '\'', close: '\'', notIn: ['string', 'comment']},
      {open: '"', close: '"', notIn: ['string', 'comment']},
      {open: '(:', close: ':)', notIn: ['string']},
    ],
    surroundingPairs: [
      {open: '{', close: '}'},
      {open: '[', close: ']'},
      {open: '(', close: ')'},
      {open: '\'', close: '\''},
      {open: '"', close: '"'},
      { open: '(:', close: ':)' },
    ],
    indentationRules: {
      increaseIndentPattern: new RegExp('\\b(?:for|let|where|return|if|else)\\b'),
      decreaseIndentPattern: new RegExp('\\b(?:return|else)\\b'),
    },
    onEnterRules: [
      {
        beforeText: new RegExp(
          '\\b(?:for|let|where|return|if|else)\\b.*$',
          'i'
        ),
        action: {indentAction: monaco.languages.IndentAction.Indent},
      },
    ],
  });
  monaco.languages.setMonarchTokensProvider('xquery', {
    // Set defaultToken to invalid to see what you do not tokenize yet
    defaultToken: 'invalid',

    keywords: [
      'for', 'in', 'let', 'where', 'return', 'if', 'then', 'else', 'order', 'by', 'ascending', 'descending',
      'and', 'or', 'union', 'intersect', 'except', 'eq', 'ne', 'lt', 'le', 'gt', 'ge', 'div',
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
        { include: '@whitespace' },

        // Operators
        [/\$[\w$]*/, 'variable'],
        [/[=<>!]+/, 'operator'],

        // Delimiters and brackets
        [/[{}()[\]]/, '@brackets'],

        // Strings
        [/'([^'\\]|\\.)*$/, 'string.invalid'],  // single quote string
        [/"/, 'string', '@string.double'],

        // Comments
        [/\(:/, 'comment', '@comment']
      ],

      whitespace: [
        [/[ \t\r\n]+/, ''],
        [/\(:.*:\)/, 'comment']
      ],

      string: [
        [/'/, 'string', '@pop'],
        [/[^']+/, 'string'],
      ],

      comment: [
        [/[^(:]+/, 'comment'],
        [/:\)/, 'comment', '@pop'],
        [/:/, 'comment'],
        [/\(:/, 'comment'],
        [/[^:]+/, 'comment']
      ],
    },
  });
}
