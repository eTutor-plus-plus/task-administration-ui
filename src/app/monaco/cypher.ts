import { languages } from 'monaco-editor';

declare const monaco: { languages: typeof languages };

export function registerCypherLanguage(): void {
  console.debug('[Monaco] Registering Cypher language');
  monaco.languages.register({id: 'cypher'});
  monaco.languages.setLanguageConfiguration('cypher', {
    comments: {
      lineComment: '//',
      blockComment: ['/*', '*/']
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
      {open: '`', close: '`', notIn: ['string', 'comment']},
    ],
    surroundingPairs: [
      {open: '{', close: '}'},
      {open: '[', close: ']'},
      {open: '(', close: ')'},
      {open: '\'', close: '\''},
      {open: '"', close: '"'},
      {open: '`', close: '`'},
    ]
  });
  monaco.languages.setMonarchTokensProvider('cypher', {
    ignoreCase: true,

    keywords: [
      'all', 'any', 'as', 'asc', 'ascending', 'by', 'call', 'case', 'contains', 'count', 'create', 'delete',
      'desc', 'descending', 'detach', 'distinct', 'else', 'end', 'ends', 'exists', 'false', 'fieldterminator',
      'foreach', 'in', 'is', 'limit', 'load', 'mandatory', 'match', 'merge', 'none', 'not', 'null', 'on',
      'optional', 'or', 'order', 'remove', 'require', 'return', 'set', 'single', 'skip', 'starts', 'then',
      'true', 'union', 'unwind', 'using', 'when', 'where', 'with', 'xor', 'yield'
    ],

    operators: [
      '=', '<>', '<', '>', '<=', '>=', '+', '-', '*', '/', '%', '=~', '!', '.', '..', ':', '|'
    ],

    builtins: [
      'abs', 'acos', 'asin', 'atan', 'atan2', 'avg', 'ceil', 'coalesce', 'collect', 'cos', 'cot',
      'date', 'datetime', 'degrees', 'duration', 'e', 'elementid', 'endnode', 'exp', 'floor',
      'head', 'id', 'keys', 'labels', 'last', 'left', 'length', 'linenumber', 'localdatetime',
      'localtime', 'log', 'log10', 'max', 'min', 'nodes', 'percentilecont', 'percentiledisc',
      'pi', 'point', 'properties', 'radians', 'rand', 'range', 'reduce', 'relationships', 'replace',
      'reverse', 'right', 'round', 'sign', 'sin', 'size', 'split', 'sqrt', 'startnode', 'stdev',
      'stdevp', 'substring', 'sum', 'tail', 'time', 'timestamp', 'tolower', 'tostring', 'toupper',
      'trim', 'type'
    ],

    brackets: [
      {open: '{', close: '}', token: 'delimiter.curly'},
      {open: '[', close: ']', token: 'delimiter.square'},
      {open: '(', close: ')', token: 'delimiter.parenthesis'}
    ],

    tokenizer: {
      root: [
        {include: '@whitespace'},
        [/[{}()[\]]/, '@brackets'],
        [/[;,.]/, 'delimiter'],
        [/[$][a-zA-Z_][\w$]*/, 'variable'],
        [/[a-zA-Z_][\w$]*/, {
          cases: {
            '@keywords': 'keyword',
            '@builtins': 'predefined',
            '@default': 'identifier'
          }
        }],
        [/:`/, {token: 'type.identifier', next: '@escapedSymbol'}],
        [/:[a-zA-Z_][\w$]*/, 'type.identifier'],
        [/\d*\.\d+([eE][-+]?\d+)?/, 'number.float'],
        [/\d+/, 'number'],
        [/<>|<=|>=|=~|[=<>+\-*/%!|.:]+/, 'operator'],
        [/'/, 'string', '@stringSingle'],
        [/"/, 'string', '@stringDouble'],
        [/`/, 'identifier.quote', '@escapedIdentifier']
      ],

      whitespace: [
        [/[ \t\r\n]+/, ''],
        [/\/\/.*$/, 'comment'],
        [/\/\*/, 'comment', '@comment']
      ],

      stringSingle: [
        [/[^\\']+/, 'string'],
        [/\\./, 'string.escape'],
        [/'/, 'string', '@pop']
      ],

      stringDouble: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string.escape'],
        [/"/, 'string', '@pop']
      ],

      comment: [
        [/[^/*]+/, 'comment'],
        [/\*\//, 'comment', '@pop'],
        [/[/*]/, 'comment']
      ],

      escapedIdentifier: [
        [/[^`]+/, 'identifier.quote'],
        [/`/, 'identifier.quote', '@pop']
      ],

      escapedSymbol: [
        [/[^`]+/, 'type.identifier'],
        [/`/, 'type.identifier', '@pop']
      ],
    },
  });
  monaco.languages.registerCompletionItemProvider('cypher', {
    provideCompletionItems: () => ({
      suggestions: [
        {
          label: 'MATCH',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'MATCH ',
          range: undefined!
        },
        {
          label: 'WHERE',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'WHERE ',
          range: undefined!
        },
        {
          label: 'RETURN',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'RETURN ',
          range: undefined!
        },
        {
          label: 'CREATE',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'CREATE ',
          range: undefined!
        },
        {
          label: 'cypher-query',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: ['MATCH (${1:n})', 'RETURN ${1:n}'].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: undefined!
        }
      ]
    })
  });
}
