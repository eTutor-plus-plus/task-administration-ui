import { languages } from 'monaco-editor';

declare const monaco: { languages: typeof languages };

export function registerPlantUmlLanguage(): void {
  monaco.languages.register({id: 'plantuml'});

  monaco.languages.setMonarchTokensProvider('plantuml', {
    // Set defaultToken to invalid to see what you do not tokenize yet
    defaultToken: 'invalid',

    keywords: [
      'actor', 'usecase', 'class', 'interface', 'abstract', 'enum', 'component', 'state', 'object',
      'note', 'package', 'node', 'rectangle', 'folder', 'frame', 'cloud', 'database', 'storage',
      'artifact', 'file', 'card', 'queue', 'stack', 'rel', 'use', 'include', 'extend', 'import',
      'footnote', 'legend', 'title', 'caption', 'autonumber', 'hide', 'show', 'skinparam', 'skin',
      'top', 'bottom', 'top to bottom direction', 'packageStyle', 'stereotype', 'list', 'table',
      'detach', 'no', 'legend', 'header', 'footer', 'center', 'rotate', 'ref', 'return', 'repeat',
      'start', 'stop', 'partition', 'footer', 'header', 'center', 'rotate', 'ref', 'return',
      'repeat', 'start', 'stop', 'partition', 'namespace', 'page', 'up', 'down', 'if', 'else', 'endif',
      'while', 'endwhile', 'fork', 'again', 'kill', 'left', 'right', 'up', 'down', 'of', 'over', 'end',
      'activate', 'deactivate', 'destroy', 'create', 'newpage', 'box', 'alt', 'else', 'opt', 'loop',
      'par', 'break', 'critical', 'note', 'rnote', 'hnote', 'legend', 'group', 'left', 'right', 'link',
      'over', 'end', 'detach'
    ],

    operators: [
      '=', '->', '--', ':', '()', '[]', '{}', '||', '()', '[]', '{}', '||', '+', '-', '*', '/', '&', '|', '<', '>', '<<', '>>', '<=', '>=', '==', '!=', '===', '!==', '...', '::', '->*', '--*', 'o', '*', 'x', 'as', '..', '==', '__', '--', '==', '()', '[]', '{}', '||', '+', '-', '*', '/', '&', '|', '<', '>', '<<', '>>', '<=', '>=', '==', '!=', '===', '!==', '...', '::', '->*', '--*', 'o', '*', 'x', 'as', '..', '==', '__', '--', '=='
    ],

    // we include these common regular expressions
    symbols: /[=><!~?:&|+\-*\/\^%]+/,

    // C# style strings
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    // The main tokenizer for our languages
    tokenizer: {
      root: [
        // identifiers and keywords
        [/[a-z_$][\w$]*/, {
          cases: {
            '@keywords': 'keyword',
            '@default': 'identifier'
          }
        }],
        [/[A-Z][\w\$]*/, 'type.identifier'],  // to show class names nicely
        // whitespace
        {include: '@whitespace'},

        // delimiters and operators
        [/[{}()\[\]]/, '@brackets'],
        [/[<>](?!@symbols)/, '@brackets'],
        [/@symbols/, {
          cases: {
            '@operators': 'operator',
            '@default': ''
          }
        }],

        // numbers
        [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
        [/0[xX][0-9a-fA-F]+/, 'number.hex'],
        [/\d+/, 'number'],

        // delimiter: after number because of .\d floats
        [/[;,.]/, 'delimiter'],

        // strings
        [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
        [/"/, 'string', '@string'],

        // characters
        [/'[^\\']'/, 'string'],
        [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
        [/'/, 'string.invalid']
      ],

      whitespace: [
        [/[ \t\r\n]+/, ''],
        [/#.*$/, 'comment'],
      ],

      string: [
        [/[^\\"]+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/"/, 'string', '@pop']
      ],
    },
  });
}
