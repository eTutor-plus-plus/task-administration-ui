import { languages } from 'monaco-editor';

declare const monaco: { languages: typeof languages };

export function registerOrViewLanguage(): void {
  if (typeof monaco === 'undefined') return;
  console.debug('[Monaco] Registering OR-View (Oracle SQL) language');

  // 1. Sprache registrieren
  monaco.languages.register({ id: 'orview' });

  // 2. Konfiguration (Kommentare, Klammern)
  monaco.languages.setLanguageConfiguration('orview', {
    comments: {
      lineComment: '--',
      blockComment: ['/*', '*/']
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')']
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: "'", close: "'", notIn: ['string', 'comment'] },
      { open: '"', close: '"', notIn: ['string', 'comment'] },
      { open: '/*', close: ' */', notIn: ['string'] }
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: "'", close: "'" },
      { open: '"', close: '"' }
    ]
  });

  // 3. Tokenizer & Syntax Highlighting
  monaco.languages.setMonarchTokensProvider('orview', {
    defaultToken: '',
    tokenPostfix: '.sql',
    // Keywords werden case-insensitiv erkannt (SELECT = select = Select)
    ignoreCase: true,

    keywords: [
      // Standard SQL
      'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER',
      'TABLE', 'VIEW', 'INDEX', 'TRIGGER', 'PROCEDURE', 'FUNCTION', 'PACKAGE',
      'INTO', 'VALUES', 'SET', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'ON',
      'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL', 'LIKE', 'BETWEEN', 'EXISTS',
      'ORDER', 'BY', 'GROUP', 'HAVING', 'DISTINCT', 'AS', 'ASC', 'DESC',
      'UNION', 'INTERSECT', 'MINUS', 'ALL', 'ANY', 'SOME', 'REPLACE',

      // Oracle Object-Relational Specifics
      'TYPE', 'OBJECT', 'OF', 'WITH', 'IDENTIFIER',
      'CAST', 'MULTISET', 'NESTED', 'ARRAY', 'VARRAY', 'REF', 'DEREF',
      'VALUE', 'TREAT', 'UNDER', 'MAKE_REF', 'ONLY', 'SUBSTITUTABLE',
      'MEMBER', 'STATIC', 'MAP', 'CONSTRUCTOR',
      'SELF', 'RESULT', 'INSTANTIABLE', 'FINAL', 'OVERRIDING',

      // Datentypen
      'VARCHAR2', 'NUMBER', 'DATE', 'TIMESTAMP', 'CLOB', 'BLOB', 'CHAR', 'INTEGER', 'FLOAT', 'BOOLEAN'
    ],

    operators: [
      '=', '>', '<', '!', '~', '?', ':',
      '+', '-', '*', '/', '%', '&', '|', '^',
      '=>', '||'
    ],

    symbols: /[=><!~?:&|+\-*\/\^%]+/,

    tokenizer: {
      root: [
        // Identifier und Keywords — jetzt case-insensitiv durch ignoreCase: true
        [/[a-zA-Z_$][\w$]*/, { cases: { '@keywords': 'keyword', '@default': 'identifier' } }],

        [/\d*\.\d+([eE][-+]?\d+)?/, 'number.float'],
        [/\d+/, 'number'],

        [/'([^'\\]|\\.)*$/, 'string.invalid'],
        [/'/, 'string', '@string_single'],

        [/"([^"\\]|\\.)*$/, 'string.invalid'],
        [/"/, 'string', '@string_double'],

        [/\/\/.*$/, 'comment'],
        [/\/\*/, 'comment', '@comment'],
        [/--.*$/, 'comment'],

        [/[{}[\]()]/, '@brackets'],
        [/@symbols/, { cases: { '@operators': 'operator', '@default': '' } }]
      ],

      comment: [
        [/[^\/*]+/, 'comment'],
        [/\*\//, 'comment', '@pop'],
        [/[\/*]/, 'comment']
      ],

      string_single: [
        [/[^']+/, 'string'],
        [/''/, 'string'],
        [/'/, 'string', '@pop'],
        [/.$/, 'string.invalid']
      ],

      string_double: [
        [/[^"]+/, 'string'],
        [/""/, 'string'],
        [/"/, 'string', '@pop'],
        [/.$/, 'string.invalid']
      ]
    }
  });

  // 4. Auto-Completion
  monaco.languages.registerCompletionItemProvider('orview', {
    provideCompletionItems: () => ({
      suggestions: [

        // OBJECT TYPE
        {
          label: 'CREATE TYPE ... OBJECT',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            'CREATE OR REPLACE TYPE ${1:type_name} AS OBJECT (',
            '\t${2:attribute_name} ${3:datatype}',
            ');'
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Creates a new Oracle Object Type',
          range: undefined!
        },

        // COLLECTION TYPE
        {
          label: 'CREATE TYPE ... TABLE OF',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'CREATE OR REPLACE TYPE ${1:collection_name} AS TABLE OF ${2:object_type};',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Creates a Nested Table Type',
          range: undefined!
        },

        // OBJECT VIEW
        {
          label: 'CREATE VIEW OF ... WITH OBJECT IDENTIFIER',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            'CREATE OR REPLACE VIEW ${1:view_name} OF ${2:object_type}',
            'WITH OBJECT IDENTIFIER (${3:id_attribute}) AS',
            'SELECT ${4:attributes}',
            'FROM ${5:table_name};'
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Creates an Object View',
          range: undefined!
        },

        // UNDER VIEW
        {
          label: 'CREATE VIEW UNDER',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            'CREATE OR REPLACE VIEW ${1:subview_name}',
            'UNDER ${2:superview_name}',
            'AS SELECT ${3:*} FROM ${4:table};'
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Creates a subview using UNDER',
          range: undefined!
        },

        // MAKE_REF
        {
          label: 'MAKE_REF',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'MAKE_REF(${1:view}, ${2:alias})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Creates a reference to an object view',
          range: undefined!
        },

        // CAST MULTISET
        {
          label: 'CAST MULTISET',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            'CAST(',
            '\tMULTISET(',
            '\t\tSELECT ${1:columns}',
            '\t\tFROM ${2:table}',
            '\t) AS ${3:type}',
            ')'
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Nested collection pattern',
          range: undefined!
        },

        // Keywords
        { label: 'UNDER', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'UNDER', range: undefined! },
        { label: 'MAKE_REF', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'MAKE_REF', range: undefined! },
        { label: 'WITH OBJECT IDENTIFIER', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'WITH OBJECT IDENTIFIER', range: undefined! }
      ]
    })
  });
}
