import cases from './testdata/parser-cases.json';
import { isValidDfmSyntax } from './dfm-syntax.validator';

// Each case was run against the real DFM parser (POST /api/dfm/parse); `valid` is the verdict of
// DfmParser.parse. `fragmentValid` is the verdict of DfmParser.parseFragment (parts of a model, e.g. evaluation
// criteria) and defaults to `valid`. The validator must agree, otherwise users get no early feedback or a false error.
describe('isValidDfmSyntax parity with the DFM parser', () => {
  const entries = cases.map(({name, dfm, valid, ...rest}) => ({
    name, dfm, valid, fragmentValid: (rest as {fragmentValid?: boolean}).fragmentValid ?? valid
  }));

  it.each(entries.map(({name, dfm, valid}) => [name, dfm, valid] as [string, string, boolean]))(
    '%s',
    (_, source, valid) => {
      expect(isValidDfmSyntax(source)).toBe(valid);
    });

  it.each(entries.map(({name, dfm, fragmentValid}) => [name, dfm, fragmentValid] as [string, string, boolean]))(
    'as fragment: %s',
    (_, source, valid) => {
      expect(isValidDfmSyntax(source, {fragment: true})).toBe(valid);
    });
});
