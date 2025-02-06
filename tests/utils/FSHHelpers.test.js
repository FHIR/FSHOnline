import 'fake-indexeddb/auto';
import { EOL } from 'os';
import { runSUSHI, runGoFSH } from '../../src/utils/FSHHelpers';
import { loadTestDefinitions } from '../testhelpers/loadTestDefinitions';
import '../testhelpers/loggerSpy'; // suppresses logs in test output

const mocks = vi.hoisted(() => {
  return {
    mockLoad: vi.fn()
  };
});

vi.mock('sql.js', () => {
  class Database {}
  return {
    default: () => {},
    initSqlJs: new Database()
  };
});

vi.mock('fhir-package-loader', async (importOriginal) => {
  const actual = await importOriginal();
  class MockFHIRRegistryClient extends actual.FHIRRegistryClient {
    async resolveVersion() {
      return Promise.resolve('9.9.9');
    }
  }
  return {
    ...actual,
    FHIRRegistryClient: MockFHIRRegistryClient
  };
});

vi.mock('fsh-sushi', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    utils: {
      ...actual.utils,
      loadExternalDependencies: mocks.mockLoad
    }
  };
});

vi.mock('gofsh', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    utils: {
      ...actual.utils,
      loadExternalDependencies: mocks.mockLoad
    }
  };
});

const defaultConfig = {
  canonical: 'http://example.org',
  version: '1.0.0',
  FSHOnly: true,
  fhirVersion: ['4.0.1']
};

describe('#runSUSHI', () => {
  it('should return an undefined package when we get invalid FHIRDefinitions', async () => {
    const text =
      'Profile: FishPatient Parent: Patient Id: fish-patient Title: "Fish Patient" Description: "A patient that is a type of fish."';
    const outPackage = await runSUSHI(text, defaultConfig);
    expect(outPackage).toBeUndefined();
  });

  it('should return the correct output package when proper FSH code is entered', async () => {
    const testLoad = vi.fn(async (defs) => {
      await loadTestDefinitions(defs);
    });
    mocks.mockLoad.mockImplementation(testLoad);
    const text =
      'Profile: FishPatient\nParent: Patient\nId: fish-patient\nTitle: "Fish Patient"\n Description: "A patient that is a type of fish."';
    const outPackage = await runSUSHI(text, defaultConfig);
    expect(testLoad).toHaveBeenCalled();
    expect(outPackage.profiles).toHaveLength(1);
    mocks.mockLoad.mockRestore();
  });

  it('should not return inline instances in the output package', async () => {
    const testLoad = vi.fn(async (defs) => {
      await loadTestDefinitions(defs);
    });
    mocks.mockLoad.mockImplementation(testLoad);
    const text =
      'Instance: ZeroScore\nInstanceOf: Quantity\nUsage: #inline\n* value = 0\n* code = #{score}\n* system = "http://unitsofmeasure.org"\n* unit = "Punktwert"' +
      '\n\nInstance: JohnDoe\nInstanceOf: Patient\n* name.given = "John"\n* name.family = "Doe"';
    const outPackage = await runSUSHI(text, defaultConfig);
    expect(testLoad).toHaveBeenCalled();
    expect(outPackage.instances).toHaveLength(1);
    mocks.mockLoad.mockRestore();
  });

  it('should not include dependencies that did not include a version', async () => {
    const dependencies = [
      { packageId: 'hl7.fhir.example.typo$1.0.0', version: undefined },
      { packageId: 'hl7.fhir.us.core', version: '3.1.1' },
      { packageId: 'hl7.fhir.example.noversion', version: undefined }
    ];
    const testLoad = vi.fn(async (defs) => {
      await loadTestDefinitions(defs);
    });
    mocks.mockLoad.mockImplementation(testLoad);
    const text =
      'Profile: FishPatient\nParent: Patient\nId: fish-patient\nTitle: "Fish Patient"\n Description: "A patient that is a type of fish."';
    const outPackage = await runSUSHI(text, defaultConfig, dependencies);
    expect(testLoad).toHaveBeenCalled();
    expect(outPackage.profiles).toHaveLength(1);
    expect(outPackage.config.dependencies).toEqual([{ packageId: 'hl7.fhir.us.core', version: '3.1.1' }]); // only dependency with a version
    mocks.mockLoad.mockRestore();
  });
});

describe('#runGoFSH', () => {
  const patientDef = {
    resourceType: 'Patient',
    id: 'MyPatient',
    name: [
      {
        family: 'Smith',
        given: ['Jane']
      }
    ],
    gender: 'female'
  };
  const goFSHDefs = [JSON.stringify(patientDef)];

  it('should return a FSH definition without rules when we load invalid FHIRDefinitions', async () => {
    const dependencies = [];
    const expectedFSH = ['Instance: MyPatient', 'InstanceOf: Patient', 'Usage: #example'].join(EOL);
    const expectedConfig = {
      FSHOnly: true,
      applyExtensionMetadataToRoot: false,
      canonical: 'http://example.org',
      fhirVersion: ['4.0.1'],
      id: 'example',
      name: 'Example'
    };
    const outputFSH = await runGoFSH(goFSHDefs, { dependencies });
    expect(outputFSH).toEqual({ fsh: expectedFSH, config: expectedConfig });
  });

  it('should return a string of FSH when proper JSON is entered and there are valid FHIRDefinitions', async () => {
    const dependencies = [];
    const testLoad = vi.fn(async (defs) => {
      await loadTestDefinitions(defs);
    });
    mocks.mockLoad.mockImplementation(testLoad);

    const expectedFSH = [
      'Instance: MyPatient',
      'InstanceOf: Patient',
      'Usage: #example',
      '* name.family = "Smith"',
      '* name.given = "Jane"',
      '* gender = #female'
    ].join(EOL);
    const expectedConfig = {
      FSHOnly: true,
      applyExtensionMetadataToRoot: false,
      canonical: 'http://example.org',
      fhirVersion: ['4.0.1'],
      id: 'example',
      name: 'Example'
    };

    const outputFSH = await runGoFSH(goFSHDefs, { dependencies });

    expect(testLoad).toHaveBeenCalled();
    expect(outputFSH).toEqual({ fsh: expectedFSH, config: expectedConfig });
    mocks.mockLoad.mockRestore();
  });

  it('should not include dependencies that did not include a version', async () => {
    const dependencies = ['hl7.fhir.example.typo$1.0.0', 'hl7.fhir.us.core#3.1.1', 'hl7.fhir.example.noversion'];
    const testLoad = vi.fn(async (defs) => {
      await loadTestDefinitions(defs);
    });
    mocks.mockLoad.mockImplementation(testLoad);

    const expectedFSH = [
      'Instance: MyPatient',
      'InstanceOf: Patient',
      'Usage: #example',
      '* name.family = "Smith"',
      '* name.given = "Jane"',
      '* gender = #female'
    ].join(EOL);
    const expectedConfig = {
      FSHOnly: true,
      applyExtensionMetadataToRoot: false,
      canonical: 'http://example.org',
      fhirVersion: ['4.0.1'],
      dependencies: [{ packageId: 'hl7.fhir.us.core', version: '3.1.1' }], // only dependency with a version
      id: 'example',
      name: 'Example'
    };

    const outputFSH = await runGoFSH(goFSHDefs, { dependencies });

    expect(testLoad).toHaveBeenCalled();
    expect(outputFSH).toEqual({ fsh: expectedFSH, config: expectedConfig });
    mocks.mockLoad.mockRestore();
  });

  it('should return indented FSH when the indent option is true', async () => {
    const patientWithExtensionDef = {
      resourceType: 'Patient',
      id: 'MyPatient',
      name: [
        {
          given: ['Jane'],
          family: 'Smith',
          _family: {
            extension: [
              {
                url: 'http://example.org/StructureDefinition/family-extension',
                valueString: 'Extension value'
              }
            ]
          }
        }
      ]
    };
    const dependencies = [];
    const testLoad = vi.fn(async (defs) => {
      await loadTestDefinitions(defs);
    });
    mocks.mockLoad.mockImplementation(testLoad);

    const expectedFSH = [
      'Instance: MyPatient',
      'InstanceOf: Patient',
      'Usage: #example',
      '* name',
      '  * given = "Jane"',
      '  * family = "Smith"',
      '    * extension',
      '      * url = "http://example.org/StructureDefinition/family-extension"',
      '      * valueString = "Extension value"'
    ].join(EOL);
    const expectedConfig = {
      FSHOnly: true,
      applyExtensionMetadataToRoot: false,
      canonical: 'http://example.org',
      fhirVersion: ['4.0.1'],
      id: 'example',
      name: 'Example'
    };

    const outputFSH = await runGoFSH([JSON.stringify(patientWithExtensionDef)], { dependencies, indent: true });

    expect(testLoad).toHaveBeenCalled();
    expect(outputFSH).toEqual({ fsh: expectedFSH, config: expectedConfig });
    mocks.mockLoad.mockRestore();
  });

  it('should return unindented FSH when the indent option is false', async () => {
    const patientWithExtensionDef = {
      resourceType: 'Patient',
      id: 'MyPatient',
      name: [
        {
          given: ['Jane'],
          family: 'Smith',
          _family: {
            extension: [
              {
                url: 'http://example.org/StructureDefinition/family-extension',
                valueString: 'Extension value'
              }
            ]
          }
        }
      ]
    };
    const dependencies = [];
    const testLoad = vi.fn(async (defs) => {
      await loadTestDefinitions(defs);
    });
    mocks.mockLoad.mockImplementation(testLoad);

    const expectedFSH = [
      'Instance: MyPatient',
      'InstanceOf: Patient',
      'Usage: #example',
      '* name.given = "Jane"',
      '* name.family = "Smith"',
      '* name.family.extension.url = "http://example.org/StructureDefinition/family-extension"',
      '* name.family.extension.valueString = "Extension value"'
    ].join(EOL);
    const expectedConfig = {
      FSHOnly: true,
      applyExtensionMetadataToRoot: false,
      canonical: 'http://example.org',
      fhirVersion: ['4.0.1'],
      id: 'example',
      name: 'Example'
    };

    const outputFSH = await runGoFSH([JSON.stringify(patientWithExtensionDef)], { dependencies, indent: false });

    expect(testLoad).toHaveBeenCalled();
    expect(outputFSH).toEqual({ fsh: expectedFSH, config: expectedConfig });
    mocks.mockLoad.mockRestore();
  });
});
