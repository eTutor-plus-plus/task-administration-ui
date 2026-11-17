import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

import { isValidDfmSyntax } from './dfm-syntax.validator';

// The sources belong to the graph fixtures that were produced by the real DFM parser, so they are all valid.
const FIXTURE_DIRECTORY = join(__dirname, 'testdata', 'graph-fixtures');
const validModels = readdirSync(FIXTURE_DIRECTORY)
  .filter(file => file.endsWith('.dfm'))
  .map(file => [file.replace(/\.dfm$/, ''), readFileSync(join(FIXTURE_DIRECTORY, file), 'utf8')]);

describe('isValidDfmSyntax', () => {
  it.each(validModels)('should accept the valid model "%s"', (_, source) => {
    expect(isValidDfmSyntax(source)).toBe(true);
  });

  it.each([
    ['a shared hierarchy referenced only once', 'hierarchy h { a; };\ndimension d { x - {shared} h; };\n'],
    ['a cross attribute referenced only once', 'hierarchy h { a; };\ndimension d { x - {cross} h; };\n'],
  ])('should reject %s, but accept it as a fragment', (_, source) => {
    expect(isValidDfmSyntax(source)).toBe(false);
    expect(isValidDfmSyntax(source, {fragment: true})).toBe(true);
  });

  it('should still reject an undeclared hierarchy in a fragment', () => {
    expect(isValidDfmSyntax('dimension d { x - {shared} h; };', {fragment: true})).toBe(false);
  });

  it.each([
    ['a missing semicolon after a fact', 'fact A { x; }\n'],
    ['an unclosed fact', 'fact A { x;\n'],
    ['a connection to an unknown dimension', 'fact A { x; };\nA - B;\n'],
    ['a connection from an unknown fact', 'dimension B { b - c; };\nA - B;\n'],
    ['a connection without declarations', 'A - B;\n'],
    ['an unexpected character', 'fact A { x; };\ndimension T { t # u; };\nA - T;\n'],
    ['empty input', ''],
    ['whitespace only', '  \n '],
  ])('should reject %s', (_, source) => {
    expect(isValidDfmSyntax(source)).toBe(false);
  });
});
