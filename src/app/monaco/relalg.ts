import { languages } from 'monaco-editor';

declare const monaco: { languages: typeof languages };

export function registerRelationalAlgebraLanguage(): void {
  console.debug('[Monaco] Registering Relational Algebra language');
  monaco.languages.register({id: 'relalg'});
  monaco.languages.setLanguageConfiguration('relalg', {
    brackets: [
      ['[', ']'],
      ['(', ')'],
      ['{', '}'],
      ['⊏', '⊐'],
    ],
    autoClosingPairs: [
      {open: '{', close: '}'},
      {open: '[', close: ']'},
      {open: '(', close: ')'},
      {open: '⊏', close: '⊐'},
      {open: '\'', close: '\'', notIn: ['string']},
      {open: '"', close: '"', notIn: ['string']}
    ],
    surroundingPairs: [
      {open: '{', close: '}'},
      {open: '[', close: ']'},
      {open: '(', close: ')'},
      {open: '⊏', close: '⊐'},
      {open: '\'', close: '\''},
      {open: '"', close: '"'}
    ]
  });
  monaco.languages.setMonarchTokensProvider('relalg', {
    // Set defaultToken to invalid to see what you do not tokenize yet
    defaultToken: 'invalid',

    keywords: [
      'selection', 'projection', 'renaming', 'union', 'intersection', 'minus', 'cartesianproduct', 'join', 'rightsemi', 'leftsemi', 'division', 'leftarrow',
      'σ', 'π', 'ρ', '←', '-', '×', '⊏', '⊐', '⋈', '⋊', '⋉', '÷'
    ],

    operators: [
      '=', '<', '>', '>=', '<=', '!=', '<>'
    ],

    brackets: [
      {open: '{', close: '}', token: 'delimiter.curly'},
      {open: '[', close: ']', token: 'delimiter.square'},
      {open: '(', close: ')', token: 'delimiter.parenthesis'},
      {open: '⊏', close: '⊐', token: 'delimiter.square'}
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
        {include: '@whitespace'},

        // Operators
        [/\$[\w$]*/, 'variable'],
        [/[=<>!]+/, 'operator'],

        // Delimiters and brackets
        [/[{}()[\]⊏⊐]/, '@brackets'],

        // Strings
        [/'([^'\\]|\\.)*$/, 'string.invalid'],  // single quote string
        [/"/, 'string', '@string.double']
      ],

      whitespace: [
        [/[ \t\r\n]+/, ''],
        [/\(:.*:\)/, 'comment']
      ],

      string: [
        [/'/, 'string', '@pop'],
        [/[^']+/, 'string']
      ]
    },
  });
  monaco.languages.registerCompletionItemProvider('relalg', {
    provideCompletionItems: () => ({
      suggestions: [
        {
          label: 'PROJECTION',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'PROJECTION',
          range: undefined!
        },
        {
          label: 'SELECTION',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'SELECTION',
          range: undefined!
        },
        {
          label: 'RENAMING',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'RENAMING',
          range: undefined!
        },
        {
          label: 'JOIN',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'JOIN',
          range: undefined!
        },
        {
          label: 'RIGHTSEMI',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'RIGHTSEMI',
          range: undefined!
        },
        {
          label: 'LEFTSEMI',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'LEFTSEMI',
          range: undefined!
        },
        {
          label: 'JOIN',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'JOIN',
          range: undefined!
        },
        {
          label: 'DIVISION',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'DIVISION',
          range: undefined!
        },
        {
          label: 'UNION',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'UNION',
          range: undefined!
        },
        {
          label: 'INTERSECTION',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'INTERSECTION',
          range: undefined!
        },
        {
          label: 'CARTESIANPRODUCT',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'CARTESIANPRODUCT',
          range: undefined!
        },
        {
          label: 'MINUS',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'MINUS',
          range: undefined!
        },

        {
          label: 'σ',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'σ',
          range: undefined!,
          documentation: 'Selection operator'
        },
        {
          label: 'π',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'π',
          range: undefined!,
          documentation: 'Projection operator'
        },
        {
          label: 'ρ',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'ρ',
          range: undefined!,
          documentation: 'Renaming operator'
        },
        {
          label: '∪',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: '∪',
          range: undefined!,
          documentation: 'Union operator'
        },
        {
          label: '∩',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: '∩',
          range: undefined!,
          documentation: 'Intersection operator'
        },
        {
          label: '−',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: '−',
          range: undefined!,
          documentation: 'Minus operator'
        },
        {
          label: '-',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: '-',
          range: undefined!,
          documentation: 'Minus operator'
        },
        {
          label: '×',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: '×',
          range: undefined!,
          documentation: 'Cartesian Product operator'
        },
        {
          label: '⊏⊐',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: '⊏⊐',
          range: undefined!,
          documentation: 'Theta-join'
        },
        {
          label: '⋈',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: '⋈',
          range: undefined!,
          documentation: 'Join operator'
        },
        {
          label: '⋊',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: '⋊',
          range: undefined!,
          documentation: 'Right Semijoin operator'
        },
        {
          label: '⋉',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: '⋉',
          range: undefined!,
          documentation: 'Left Semijoin operator'
        },
        {
          label: '⟗',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: '⟗',
          range: undefined!,
          documentation: 'Full Outer Join operator'
        },
        {
          label: '÷',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: '÷',
          range: undefined!,
          documentation: 'Division operator'
        },
        {
          label: '←',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: '←',
          range: undefined!,
          documentation: 'Left arrow'
        },

        {
          label: 'PROJECTION Template',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'PROJECTION[${1:columns}](${2:relation})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: undefined!
        },
        {
          label: 'SELECTION Template',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'SELECTION[${1:predicate}](${2:relation})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: undefined!
        },
        {
          label: 'RENAMING Template',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'RENAMING[${1:columnName} LEFTARROW ${2:alias}](${3:relation})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: undefined!
        },
        {
          label: 'THETA-JOIN Template',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '(${1:relation1}{${2:predicate}}${3:relation2})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: undefined!
        },
        {
          label: 'JOIN Template',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '(${1:relation1} JOIN ${3:relation2})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: undefined!
        },
        {
          label: 'DIVISION Template',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '(${1:relation1} DIVISION ${3:relation2})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: undefined!
        },
        {
          label: 'UNION Template',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '(${1:relation1} UNION ${3:relation2})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: undefined!
        },
        {
          label: 'INTERSECTION Template',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '(${1:relation1} INTERSECTION ${3:relation2})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: undefined!
        },
        {
          label: 'CARTESIANPRODUCT Template',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '(${1:relation1} CARTESIANPRODUCT ${3:relation2})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: undefined!
        },
        {
          label: 'MINUS Template',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '(${1:relation1} MINUS ${3:relation2})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: undefined!
        },
      ]
    })
  });
}
