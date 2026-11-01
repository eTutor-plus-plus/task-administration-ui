import cases from './dfm-parser-cases.json';
import { isValidDfmSyntax } from './dfm-syntax.validator';

// Each case was run against the real DFM parser (POST /api/dfm/parse); `valid` is the parser's verdict.
// The validator must agree, otherwise users get no early feedback or a false error.
describe('isValidDfmSyntax parity with the DFM parser', () => {
  it.each(cases.map(({name, dfm, valid}) => [name, dfm, valid] as [string, string, boolean]))(
    '%s',
    (_, source, valid) => {
      expect(isValidDfmSyntax(source)).toBe(valid);
    });
});
