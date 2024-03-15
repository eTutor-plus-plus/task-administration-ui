import { languages } from 'monaco-editor';

declare const monaco: { languages: typeof languages };

export function registerDroolsLanguage(): void { // copied from java language and then adjusted to drools
  console.debug('[Monaco] Registering Drools language');
  monaco.languages.register({id: 'drools'});
  monaco.languages.setLanguageConfiguration('drools', {
    wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
    comments: {
      lineComment: '//',
      blockComment: ['/*', '*/']
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')']
    ],
    autoClosingPairs: [
      {open: '{', close: '}'},
      {open: '[', close: ']'},
      {open: '(', close: ')'},
      {open: '"', close: '"'},
      {open: '\'', close: '\''}
    ],
    surroundingPairs: [
      {open: '{', close: '}'},
      {open: '[', close: ']'},
      {open: '(', close: ')'},
      {open: '"', close: '"'},
      {open: '\'', close: '\''},
      {open: '<', close: '>'}
    ],
    folding: {
      markers: {
        start: new RegExp('^\\s*rule\\s*"\\s*'),
        end: new RegExp('^\\s*end')
      }
    },
    onEnterRules: [
      {
        beforeText: new RegExp('\\b(?:rule|when)\\b.*$', 'i'),
        action: {indentAction: monaco.languages.IndentAction.Indent}
      },
      {
        beforeText: new RegExp('.*'),
        afterText: new RegExp('\\b(?:then|end)\\b.*$', 'i'),
        action: {indentAction: monaco.languages.IndentAction.Outdent}
      }
    ]
  });
  monaco.languages.setMonarchTokensProvider('drools', {
    defaultToken: '',

    keywords: [
      'continue',
      'for',
      'new',
      'switch',
      'package',
      'boolean',
      'do',
      'if',
      'this',
      'break',
      'double',
      'throw',
      'byte',
      'else',
      'import',
      'case',
      'instanceof',
      'return',
      'catch',
      'int',
      'short',
      'try',
      'char',
      'void',
      'class',
      'finally',
      'long',
      'float',
      'while',
      'true',
      'false',
      'extends',
      'implements',
      'super',
      // Drools
      'rule',
      'end',
      'unit',
      'query',
      'when',
      'then',
      'salience',
      'date-expires',
      'date-effective',
      'declare',
      'no-loop',
      'lock-on-active',
      'agenda-group',
      'auto-focus',
      'ruleflow-group',
      'activation-group',
      'dialect',
      'enabled',
      'duration',
      'modify',
      'update',
      'insert',
      'insertLogical',
      'delete',
      'not',
      'function',
      'global',
      'from',
      'collect',
      'accumulate',
      'after',
      'before',
      'coincides',
      'during',
      'includes',
      'finishes',
      'finished',
      'by',
      'meets',
      'met',
      'overlaps',
      'overlapped',
      'starts',
      'eval'
    ],

    operators: [
      '=',
      '>',
      '<',
      '!',
      '~',
      '?',
      ':',
      '==',
      '<=',
      '>=',
      '!=',
      '&&',
      '||',
      '++',
      '--',
      '+',
      '-',
      '*',
      '/',
      '&',
      '|',
      '^',
      '%',
      '<<',
      '>>',
      '>>>',
      '+=',
      '-=',
      '*=',
      '/=',
      '&=',
      '|=',
      '^=',
      '%=',
      '<<=',
      '>>=',
      '>>>='
    ],

    // we include these common regular expressions
    symbols: /[=><!~?:&|+\-*\/\^%]+/,
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
    digits: /\d+(_+\d+)*/,
    octaldigits: /[0-7]+(_+[0-7]+)*/,
    binarydigits: /[0-1]+(_+[0-1]+)*/,
    hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,

    // The main tokenizer for our languages
    tokenizer: {
      root: [
        // Special keyword with a dash
        ['non-sealed', 'keyword.non-sealed'],

        // identifiers and keywords
        [
          /[a-zA-Z_$][\w$]*/,
          {
            cases: {
              '@keywords': {token: 'keyword.$0'},
              '@default': 'identifier'
            }
          }
        ],

        // whitespace
        {include: '@whitespace'},

        // delimiters and operators
        [/[{}()\[\]]/, '@brackets'],
        [/[<>](?!@symbols)/, '@brackets'],
        [
          /@symbols/,
          {
            cases: {
              '@operators': 'delimiter',
              '@default': ''
            }
          }
        ],

        // @ annotations.
        [/@\s*[a-zA-Z_\$][\w\$]*/, 'annotation'],

        // numbers
        [/(@digits)[eE]([\-+]?(@digits))?[fFdD]?/, 'number.float'],
        [/(@digits)\.(@digits)([eE][\-+]?(@digits))?[fFdD]?/, 'number.float'],
        [/0[xX](@hexdigits)[Ll]?/, 'number.hex'],
        [/0(@octaldigits)[Ll]?/, 'number.octal'],
        [/0[bB](@binarydigits)[Ll]?/, 'number.binary'],
        [/(@digits)[fFdD]/, 'number.float'],
        [/(@digits)[lL]?/, 'number'],

        // delimiter: after number because of .\d floats
        [/[;,.]/, 'delimiter'],

        // strings
        [/"([^"\\]|\\.)*$/, 'string.invalid'], // non-teminated string
        [/"""/, 'string', '@multistring'],
        [/"/, 'string', '@string'],

        // characters
        [/'[^\\']'/, 'string'],
        [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
        [/'/, 'string.invalid']
      ],

      whitespace: [
        [/[ \t\r\n]+/, ''],
        [/\/\*\*(?!\/)/, 'comment.doc', '@javadoc'],
        [/\/\*/, 'comment', '@comment'],
        [/\/\/.*$/, 'comment']
      ],

      comment: [
        [/[^\/*]+/, 'comment'],
        // [/\/\*/, 'comment', '@push' ],    // nested comment not allowed :-(
        // [/\/\*/,    'comment.invalid' ],    // this breaks block comments in the shape of /* //*/
        [/\*\//, 'comment', '@pop'],
        [/[\/*]/, 'comment']
      ],
      //Identical copy of comment above, except for the addition of .doc
      javadoc: [
        [/[^\/*]+/, 'comment.doc'],
        // [/\/\*/, 'comment.doc', '@push' ],    // nested comment not allowed :-(
        [/\/\*/, 'comment.doc.invalid'],
        [/\*\//, 'comment.doc', '@pop'],
        [/[\/*]/, 'comment.doc']
      ],

      string: [
        [/[^\\"]+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/"/, 'string', '@pop']
      ],

      multistring: [
        [/[^\\"]+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/"""/, 'string', '@pop'],
        [/./, 'string']
      ]
    }
  });
}
