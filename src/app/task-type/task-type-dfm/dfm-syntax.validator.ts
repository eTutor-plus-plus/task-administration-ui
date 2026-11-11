type TokenKind = 'word' | '{' | '}' | ';' | '-' | '=' | '->' | '(' | ')' | '[' | ']' | 'end';

interface Token {
  kind: TokenKind;
  value: string;
}

interface HierarchyReference {
  name: string;
  kind: 'shared' | 'cross';
  // the hierarchy declaration the reference occurs in, or null if it occurs in a dimension
  owner: string | null;
}

// Mirrors the tokenizer of the DFM parser: Java's Character.isWhitespace (no non-breaking spaces)
// and Character.isLetterOrDigit on UTF-16 characters (letters and decimal digits, no supplementary characters).
const WHITESPACE = '(?:[\\t\\n\\u000B\\f\\r\\u001C-\\u001F]|(?![\\u00A0\\u2007\\u202F])[\\p{Zs}\\p{Zl}\\p{Zp}])+';
const WORD = '[\\p{L}\\p{Nd}_]+';
const COMMENT = '\\/\\/[^\\n]*';
const TOKEN_PATTERN = new RegExp(`${WHITESPACE}|${COMMENT}|${WORD}|->|[{};=\\-()\\[\\]]`, 'uy');
const WORD_PATTERN = new RegExp(`^${WORD}$`, 'u');
const WHITESPACE_PATTERN = new RegExp(`^${WHITESPACE}$`, 'u');
const COMMENT_PATTERN = new RegExp(`^${COMMENT}$`, 'u');
const SUPPLEMENTARY_CHARACTER = /[\u{10000}-\u{10FFFF}]/u;

export function isValidDfmSyntax(source: string): boolean {
  if (!source.trim())
    return false;

  const tokens = tokenize(source);
  // comment-only input contains no declarations and is rejected like empty input
  return tokens !== null && tokens.length > 1 && new DfmSyntaxParser(tokens).parse();
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
    if (WHITESPACE_PATTERN.test(value) || COMMENT_PATTERN.test(value))
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
  private readonly hierarchyDeclarations = new Set<string>();
  private readonly hierarchyReferences: HierarchyReference[] = [];
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
      } else if (this.acceptWord('hierarchy')) {
        if (!this.parseHierarchyDeclaration())
          return false;
      } else if (!this.parseConnection()) {
        return false;
      }

      if (!this.expect(';'))
        return false;
    }

    if (!this.resolveHierarchyReferences())
      return false;

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
      if (this.parseHierarchy(null) === null)
        return false;
      this.accept(';');
      if (this.accept('}'))
        return true;
      if (this.is('end'))
        return false;
    }
  }

  // hierarchy Name { chain; chain; }: at least one chain, every chain starts with the level of the first chain
  // and that level is no reference
  private parseHierarchyDeclaration(): boolean {
    const name = this.takeWord();
    if (name === null || !this.expect('{') || this.is('}'))
      return false;

    let entry: string | null = null;
    while (!this.accept('}')) {
      const chain = this.parseHierarchy(name);
      if (chain === null || chain.head === null || chain.headIsReference)
        return false;
      if (entry !== null && entry !== chain.head)
        return false;
      entry = chain.head;
      this.accept(';');
    }

    if (this.hierarchyDeclarations.has(name))
      return false;
    this.hierarchyDeclarations.add(name);
    return true;
  }

  // returns null for invalid syntax; a {shared} or {cross} reference must end its chain and cannot be optional
  private parseHierarchy(owner: string | null): {head: string | null; headIsReference: boolean} | null {
    let head: string | null = null;
    let headIsReference = false;
    while (!this.is(';') && !this.is('}')) {
      const optionalLevel = this.accept('(');
      let marker: string | null = null;
      if (this.accept('{')) {
        marker = this.takeWord();
        if (!marker || !this.expect('}'))
          return null;
      }
      const name = this.takeWord();
      if (!name)
        return null;
      if (optionalLevel && !this.expect(')'))
        return null;

      const kind = marker?.toLowerCase();
      const reference = kind === 'shared' || kind === 'cross';
      if (kind === 'shared' || kind === 'cross') {
        if (optionalLevel || (!this.is(';') && !this.is('}')))
          return null;
        this.hierarchyReferences.push({name, kind, owner});
      }
      if (head === null) {
        head = name;
        headIsReference = reference;
      }

      if (this.is(';') || this.is('}'))
        break;

      const optionalConnection = this.accept('(');
      if (!this.parseConnector())
        return null;
      if (optionalConnection && !this.expect(')'))
        return null;
    }
    return {head, headIsReference};
  }

  // every reference needs a declaration, a hierarchy is either shared or cross-dimensional, and declarations
  // must not refer to themselves, neither directly nor through other declarations
  private resolveHierarchyReferences(): boolean {
    const usedAs = new Map<string, string>();
    for (const reference of this.hierarchyReferences) {
      if (!this.hierarchyDeclarations.has(reference.name))
        return false;
      const firstUse = usedAs.get(reference.name);
      if (firstUse !== undefined && firstUse !== reference.kind)
        return false;
      usedAs.set(reference.name, reference.kind);
    }

    // true while a declaration is being visited, false once it is done
    const state = new Map<string, boolean>();
    const hasCycle = (name: string): boolean => {
      if (state.has(name))
        return false;
      state.set(name, true);
      for (const reference of this.hierarchyReferences.filter(candidate => candidate.owner === name)) {
        if (state.get(reference.name) === true || hasCycle(reference.name))
          return true;
      }
      state.set(name, false);
      return false;
    };
    return ![...this.hierarchyDeclarations].some(hasCycle);
  }

  // a connector is '-', '=' or '->', or a described connection: '-[text]-', '=[text]=' or '-[text]->'
  private parseConnector(): boolean {
    if (this.accept('->'))
      return true;
    const opening = this.is('-') ? '-' : this.is('=') ? '=' : null;
    if (opening === null)
      return false;
    this.position++;
    if (!this.accept('['))
      return true;
    if (!this.takeWord() || !this.expect(']'))
      return false;
    return opening === '=' ? this.accept('=') : this.accept('-') || this.accept('->');
  }

  private parseConnection(): boolean {
    const fact = this.takeWord();
    if (fact === null || !this.expect('-'))
      return false;
    if (this.accept('[') && (!this.takeWord() || !this.expect(']') || !this.expect('-')))
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
