import { playgroundApp } from '../../utils/PlaygroundApp';
import * as processing from '../../utils/Processing';
import Patient from './StructureDefinition-Patient.json';
import StructureDefinition from './StructureDefinition-StructureDefinition.json';
import 'fake-indexeddb/auto';
import { FHIRDefinitions } from 'fsh-sushi/dist/fhirdefs';

describe('#playgroundApp', () => {
  it('should return an undefined package when we get invalid FHIRDefinitions', async () => {
    const FHIRDefs = new FHIRDefinitions();
    const loadDefsSpy = jest
      .spyOn(processing, 'loadExternalDependenciesPlayground')
      .mockReset()
      .mockResolvedValue(FHIRDefs);
    const text =
      'Profile: FishPatient Parent: Patient Id: fish-patient Title: "Fish Patient" Description: "A patient that is a type of fish."';
    const outPackage = await playgroundApp(text);
    expect(loadDefsSpy).toHaveBeenCalled();
    expect(outPackage).toBeUndefined();
  });

  it('should return the correct output pacakge when proper FSH code is entered', async () => {
    const FHIRDefs = new FHIRDefinitions();
    FHIRDefs.add(Patient);
    FHIRDefs.add(StructureDefinition);
    const loadSpy = jest
      .spyOn(processing, 'loadExternalDependenciesPlayground')
      .mockReset()
      .mockResolvedValue(FHIRDefs);
    const text =
      'Profile: FishPatient\nParent: Patient\nId: fish-patient\nTitle: "Fish Patient"\n Description: "A patient that is a type of fish."';
    const outPackage = await playgroundApp(text);
    expect(loadSpy).toHaveBeenCalled();
    expect(outPackage.profiles).toHaveLength(1);
  });

  it('should return an undefined package when the config is invalid', async () => {
    const configSpy = jest.spyOn(processing, 'readConfigPlayground').mockImplementation(() => {
      throw new Error('Bad Config');
    });
    const loadSpyConfig = jest
      .spyOn(processing, 'loadExternalDependenciesPlayground')
      .mockReset()
      .mockResolvedValue(new FHIRDefinitions());

    const outPackage = await playgroundApp();
    expect(configSpy).toHaveBeenCalled();
    expect(loadSpyConfig).toHaveBeenCalledTimes(0);
    expect(outPackage).toBeUndefined();
  });
});
