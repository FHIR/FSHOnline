import { setExampleText } from '../../utils/ParseExamples';

describe('#setExampleText', () => {
  it('import and get text from a file in our source code', async () => {
    const expected = 'This is an example test file to test our ParseExamples() function.';
    const result = await setExampleText('ParseExampleText');
    expect(expected).toEqual(result);
  });
});
