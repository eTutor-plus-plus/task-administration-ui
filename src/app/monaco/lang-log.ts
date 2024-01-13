/**
 * Registers a language and theme for Java log files.
 */
export function registerLogLanguage(): void {
  // noinspection JSUnresolvedReference
  const monaco = (window as any).monaco;
  if(!monaco)
    return;

  monaco.languages.register({
    id: 'dke-log',
    extensions: ['.log'],
    aliases: ['Log', 'Log File'],
    mimetypes: ['text/log', 'text/plain']
  });
  monaco.languages.setMonarchTokensProvider('dke-log', {
    tokenizer: {
      root: [
        ['/ERROR/', 'error'],
        ['/WARN/', 'warn'],
        ['/INFO/', 'info'],
        ['/DEBUG/', 'debug'],
        ['/TRACE/', 'trace']
      ]
    }
  });
  monaco.editor.defineTheme('dke-log-light', {
    base: 'vs',
    inherit: true,
    rules: [
      {token: 'error', foreground: '#d53333', fontStyle: 'bold'},
      {token: 'warn', foreground: '#d5cd33', fontStyle: 'bold'},
      {token: 'info', foreground: '#427346', fontStyle: 'bold'},
      {token: 'debug', foreground: '#3f3c3c', fontStyle: 'bold'},
      {token: 'trace', foreground: '#8c8989', fontStyle: 'bold'}
    ],
    colors: {}
  });
}
