import { runSUSHI } from '../../utils/RunSUSHI';
import * as processing from '../../utils/Processing';
import Patient from './fixtures/StructureDefinition-Patient.json';
import StructureDefinition from './fixtures/StructureDefinition-StructureDefinition.json';
import 'fake-indexeddb/auto';
import { fhirdefs } from 'fsh-sushi';

const FHIRDefinitions = fhirdefs.FHIRDefinitions;
const defaultConfig = {
  canonical: 'http://example.org',
  version: '1.0.0',
  FSHOnly: true,
  fhirVersion: ['4.0.1']
};

describe('#runSUSHI', () => {
  it('should return an undefined package when we get invalid FHIRDefinitions', async () => {
    const fhirDefs = new FHIRDefinitions();
    const dependencyArr = [];
    const loadDefsSpy = jest
      .spyOn(processing, 'loadExternalDependencies')
      .mockReset()
      .mockResolvedValue({ defs: fhirDefs, emptyDependencies: [] });
    const checkForDatabaseUpgradeSpy = jest
      .spyOn(processing, 'checkForDatabaseUpgrade')
      .mockReset()
      .mockResolvedValue({ shouldUpdate: false, version: 1 });
    const text =
      'Profile: FishPatient Parent: Patient Id: fish-patient Title: "Fish Patient" Description: "A patient that is a type of fish."';
    const outPackage = await runSUSHI(text, defaultConfig, dependencyArr);
    expect(loadDefsSpy).toHaveBeenCalled();
    expect(checkForDatabaseUpgradeSpy).toHaveBeenCalled();
    expect(outPackage).toBeUndefined();
  });

  it('should return the correct output package when proper FSH code is entered', async () => {
    const FHIRDefs = new FHIRDefinitions();
    FHIRDefs.add(Patient);
    FHIRDefs.add(StructureDefinition);
    const loadSpy = jest
      .spyOn(processing, 'loadExternalDependencies')
      .mockReset()
      .mockResolvedValue({ defs: FHIRDefs, emptyDependencies: [] });
    const checkForDatabaseUpgradeSpy = jest
      .spyOn(processing, 'checkForDatabaseUpgrade')
      .mockReset()
      .mockResolvedValue({ shouldUpdate: false, version: 1 });
    const text =
      'Profile: FishPatient\nParent: Patient\nId: fish-patient\nTitle: "Fish Patient"\n Description: "A patient that is a type of fish."';
    const outPackage = await runSUSHI(text, defaultConfig);
    expect(loadSpy).toHaveBeenCalled();
    expect(checkForDatabaseUpgradeSpy).toHaveBeenCalled();
    expect(outPackage.profiles).toHaveLength(1);
  });

  it('should return an empty package when fillTank does not execute properly', async () => {
    const FHIRDefs = new FHIRDefinitions();
    FHIRDefs.add(Patient);
    FHIRDefs.add(StructureDefinition);
    const loadSpy = jest
      .spyOn(processing, 'loadExternalDependencies')
      .mockReset()
      .mockResolvedValue({ defs: FHIRDefs, emptyDependencies: [] });
    const checkForDatabaseUpgradeSpy = jest
      .spyOn(processing, 'checkForDatabaseUpgrade')
      .mockReset()
      .mockResolvedValue({ shouldUpdate: false, version: 1 });
    const fillTankSpy = jest
      .spyOn(processing, 'fillTank')
      .mockReset()
      .mockImplementation(() => {
        throw new Error('Failed to fill tank');
      });
    const input = 'Improper FSH code!';
    const outPackage = await runSUSHI(input, defaultConfig);
    expect(loadSpy).toHaveBeenCalled();
    expect(checkForDatabaseUpgradeSpy).toHaveBeenCalled();
    expect(fillTankSpy).toHaveBeenCalled();
    expect(outPackage).toBeUndefined();
  });
});
