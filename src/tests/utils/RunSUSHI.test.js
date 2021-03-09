import { runSUSHI, runGoFSH } from '../../utils/RunSUSHI';
import * as processing from '../../utils/Processing';
import Patient from './fixtures/StructureDefinition-Patient.json';
import StructureDefinition from './fixtures/StructureDefinition-StructureDefinition.json';
import 'fake-indexeddb/auto';

const defaultConfig = {
  canonical: 'http://example.org',
  version: '1.0.0',
  FSHOnly: true,
  fhirVersion: ['4.0.1']
};

describe('#runSUSHI', () => {
  it('should return an undefined package when we get invalid FHIRDefinitions', async () => {
    const dependencyArr = [];
    const loadAndCleanDBSpy = jest
      .spyOn(processing, 'loadAndCleanDatabase')
      .mockReset()
      .mockImplementation((defs, deps) => {
        // Don't add any FHIR definitions to defs
        return Promise.resolve(defs);
      });
    const text =
      'Profile: FishPatient Parent: Patient Id: fish-patient Title: "Fish Patient" Description: "A patient that is a type of fish."';
    const outPackage = await runSUSHI(text, defaultConfig, dependencyArr);
    expect(loadAndCleanDBSpy).toHaveBeenCalled();
    expect(outPackage).toBeUndefined();
  });

  it('should return the correct output package when proper FSH code is entered', async () => {
    const loadAndCleanDBSpy = jest
      .spyOn(processing, 'loadAndCleanDatabase')
      .mockReset()
      .mockImplementation((defs, deps) => {
        // Add necessary FHIR definitions to defs
        defs.add(Patient);
        defs.add(StructureDefinition);
        return Promise.resolve(defs);
      });
    const text =
      'Profile: FishPatient\nParent: Patient\nId: fish-patient\nTitle: "Fish Patient"\n Description: "A patient that is a type of fish."';
    const outPackage = await runSUSHI(text, defaultConfig);
    expect(loadAndCleanDBSpy).toHaveBeenCalled();
    expect(outPackage.profiles).toHaveLength(1);
  });

  it('should return an empty package when fillTank does not execute properly', async () => {
    const loadAndCleanDBSpy = jest
      .spyOn(processing, 'loadAndCleanDatabase')
      .mockReset()
      .mockImplementation((defs, deps) => {
        // Add necessary FHIR definitions to defs
        defs.add(Patient);
        defs.add(StructureDefinition);
        return Promise.resolve(defs);
      });
    const fillTankSpy = jest
      .spyOn(processing, 'fillTank')
      .mockReset()
      .mockImplementation(() => {
        throw new Error('Failed to fill tank');
      });
    const input = 'Improper FSH code!';
    const outPackage = await runSUSHI(input, defaultConfig);
    expect(loadAndCleanDBSpy).toHaveBeenCalled();
    expect(fillTankSpy).toHaveBeenCalled();
    expect(outPackage).toBeUndefined();
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
    const loadAndCleanDBSpy = jest
      .spyOn(processing, 'loadAndCleanDatabase')
      .mockReset()
      .mockImplementation((defs, deps) => {
        // Don't add any FHIR definitions to defs
        return Promise.resolve(defs);
      });
    const expectedFSH = ['Instance: MyPatient', 'InstanceOf: Patient', 'Usage: #example'].join('\n');
    const outputFSH = await runGoFSH(goFSHDefs, { dependencies });
    expect(loadAndCleanDBSpy).toHaveBeenCalled();
    expect(outputFSH).toEqual(expectedFSH);
  });

  it('should return a string of FSH when proper JSON is entered and there are valid FHIRDefinitions', async () => {
    const dependencies = [];
    const loadAndCleanDBSpy = jest
      .spyOn(processing, 'loadAndCleanDatabase')
      .mockReset()
      .mockImplementation((defs, deps) => {
        // Add necessary FHIR definitions to defs
        defs.add(Patient);
        defs.add(StructureDefinition);
        return Promise.resolve(defs);
      });

    const expectedFSH = [
      'Instance: MyPatient',
      'InstanceOf: Patient',
      'Usage: #example',
      '* name[0].family = "Smith"',
      '* name[0].given[0] = "Jane"',
      '* gender = #female'
    ].join('\n');

    const outputFSH = await runGoFSH(goFSHDefs, { dependencies });

    expect(loadAndCleanDBSpy).toHaveBeenCalled();
    expect(outputFSH).toEqual(expectedFSH);
  });
});
