type TokenKind = 'word' | '{' | '}' | ';' | '-' | '=' | '->' | '(' | ')' | 'end';

interface Token {
  kind: TokenKind;
  value: string;
}

// Mirrors the tokenizer of the DFM parser: Java's Character.isWhitespace (no non-breaking spaces)
// and Character.isLetterOrDigit on UTF-16 characters (letters and decimal digits, no supplementary characters).
const WHITESPACE = '(?:[\\t\\n\\u000B\\f\\r\\u001C-\\u001F]|(?![\\u00A0\\u2007\\u202F])[\\p{Zs}\\p{Zl}\\p{Zp}])+';
const WORD = '[\\p{L}\\p{Nd}_]+';
const TOKEN_PATTERN = new RegExp(`${WHITESPACE}|${WORD}|->|[{};=\\-()]`, 'uy');
const WORD_PATTERN = new RegExp(`^${WORD}$`, 'u');
const WHITESPACE_PATTERN = new RegExp(`^${WHITESPACE}$`, 'u');
const SUPPLEMENTARY_CHARACTER = /[\u{10000}-\u{10FFFF}]/u;

export function isValidDfmSyntax(source: string): boolean {
  if (!source.trim())
    return false;

  const tokens = tokenize(source);
  return tokens !== null && new DfmSyntaxParser(tokens).parse();
}

function tokenize(source: string): Token[] | null {
  const tokens: Token[] = [];
  let position = 0;

  while (position < source.length) {
    TOKEN_PATTERN.lastIndex = position;
    const match = TOKEN_PATTERN.exec(source);
    if (!match)
      return null;

    position = TOKEN_PATTERN.lastIndex;
    const value = match[0];
    if (WHITESPACE_PATTERN.test(value))
      continue;

    let kind: TokenKind;
    if (WORD_PATTERN.test(value)) {
      if (SUPPLEMENTARY_CHARACTER.test(value))
        return null;
      kind = 'word';
    } else
      kind = value as TokenKind;
    tokens.push({kind, value});
  }

  tokens.push({kind: 'end', value: ''});
  return tokens;
}

// Keep this grammar aligned with the DfmParser used by the DFM task app.
class DfmSyntaxParser {
  private position = 0;
  private readonly factNames = new Set<string>();
  // number of declarations per name; the parser consumes one declaration per connection
  private readonly dimensionDeclarations = new Map<string, number>();
  private readonly connections: Array<{fact: string; dimension: string}> = [];

  constructor(private readonly tokens: Token[]) {
  }

  parse(): boolean {
    while (!this.is('end')) {
      if (this.acceptWord('fact')) {
        if (!this.parseFact())
          return false;
      } else if (this.acceptWord('dimension')) {
        if (!this.parseDimension())
          return false;
      } else if (!this.parseConnection()) {
        return false;
      }

      if (!this.expect(';'))
        return false;
    }

    return this.connections.every(connection => {
      const remaining = this.dimensionDeclarations.get(connection.dimension) ?? 0;
      if (!this.factNames.has(connection.fact) || remaining === 0)
        return false;
      this.dimensionDeclarations.set(connection.dimension, remaining - 1);
      return true;
    });
  }

  private parseFact(): boolean {
    const name = this.takeWord();
    if (name === null || !this.expect('{'))
      return false;

    this.factNames.add(name);
    while (!this.accept('}')) {
      if (this.accept('{') && (!this.takeWord() || !this.expect('}')))
        return false;
      if (!this.takeWord())
        return false;
      this.accept(';');
      if (this.is('end'))
        return false;
    }
    return true;
  }

  private parseDimension(): boolean {
    const name = this.takeWord();
    if (name === null || !this.expect('{'))
      return false;

    this.dimensionDeclarations.set(name, (this.dimensionDeclarations.get(name) ?? 0) + 1);
    if (this.accept('}'))
      return true;

    while (true) {
      if (!this.parseHierarchy())
        return false;
      this.accept(';');
      if (this.accept('}'))
        return true;
      if (this.is('end'))
        return false;
    }
  }

  private parseHierarchy(): boolean {
    while (!this.is(';') && !this.is('}')) {
      const optionalLevel = this.accept('(');
      if (this.accept('{') && (!this.takeWord() || !this.expect('}')))
        return false;
      if (!this.takeWord())
        return false;
      if (optionalLevel && !this.expect(')'))
        return false;

      if (this.is(';') || this.is('}'))
        return true;

      const optionalConnection = this.accept('(');
      if (!this.accept('-') && !this.accept('=') && !this.accept('->'))
        return false;
      if (optionalConnection && !this.expect(')'))
        return false;
    }
    return true;
  }

  private parseConnection(): boolean {
    const fact = this.takeWord();
    if (fact === null || !this.expect('-'))
      return false;
    const dimension = this.takeWord();
    if (dimension === null)
      return false;
    this.connections.push({fact, dimension});
    return true;
  }

  private takeWord(): string | null {
    if (!this.is('word'))
      return null;
    return this.tokens[this.position++].value;
  }

  private acceptWord(value: string): boolean {
    if (!this.is('word') || this.tokens[this.position].value.toLowerCase() !== value)
      return false;
    this.position++;
    return true;
  }

  private expect(kind: TokenKind): boolean {
    return this.accept(kind);
  }

  private accept(kind: TokenKind): boolean {
    if (!this.is(kind))
      return false;
    this.position++;
    return true;
  }

  private is(kind: TokenKind): boolean {
    return this.tokens[this.position].kind === kind;
  }
}
