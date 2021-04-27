import { sliceDependency } from '../../utils/helpers';

describe('#sliceDependency()', () => {
  it('should correctly parse a given array of dependencies', () => {
    const input = 'hl7.fhir.us.core#3.1.1, , testing#123';
    const returnArr = sliceDependency(input);
    expect(returnArr).toEqual([
      ['hl7.fhir.us.core', '3.1.1'],
      ['testing', '123']
    ]);
  });

  it('should correctly parse an empty array of dependencies', () => {
    const input = '';
    const returnArr = sliceDependency(input);
    expect(returnArr).toEqual([]);
  });
});
