import { sliceDependency } from '../../src/utils/helpers';

describe('#sliceDependency()', () => {
  it('should correctly parse a given array of dependencies', () => {
    const input = 'hl7.fhir.us.core#3.1.1, , testing#123';
    const dependencies = sliceDependency(input);
    expect(dependencies).toEqual([
      { packageId: 'hl7.fhir.us.core', version: '3.1.1' },
      { packageId: 'testing', version: '123' }
    ]);
  });

  it('should correctly parse an empty array of dependencies', () => {
    const input = '';
    const dependencies = sliceDependency(input);
    expect(dependencies).toEqual([]);
  });

  it('should filter out dependencies that do not specify a version', () => {
    const input = 'hl7.fhir.example.typo@1.0.0, hl7.fhir.us.core#3.1.1, hl7.fhir.example.noversion';
    const dependencies = sliceDependency(input);
    expect(dependencies).toEqual([{ packageId: 'hl7.fhir.us.core', version: '3.1.1' }]);
  });
});
