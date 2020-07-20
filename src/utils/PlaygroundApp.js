import { FSHTank, RawFSH } from 'fsh-sushi/dist/import';
import { exportFHIR } from 'fsh-sushi/dist/export';
import { logger, Type } from 'fsh-sushi/dist/utils';
import { FHIRDefinitions } from 'fsh-sushi/dist/fhirdefs';
import { Configuration } from 'fsh-sushi/dist/fshtypes';
import { loadExternalDependenciesPlayground, fillTank, readConfigPlayground } from './Processing';

export async function playgroundApp(input) {
  // Hard Code config
  let config = Configuration;
  try {
    config = readConfigPlayground();
  } catch {
    logger.error('Something went wrong when creating the configuration');
    return;
  }

  // Load dependencies
  let defs = new FHIRDefinitions();
  const version = 1;
  defs = await loadExternalDependenciesPlayground(defs, version);

  // Load and fill FSH Tank
  let tank = FSHTank;
  try {
    const rawFSH = [new RawFSH(input)];
    tank = fillTank(rawFSH, config);
  } catch (e) {
    logger.error('Something went wrong when importing the FSH definitions');
    return;
  }
  //Check for StructureDefinition
  const structDef = defs.fishForFHIR('StructureDefinition', Type.Resource);
  if (structDef?.version !== '4.0.1') {
    logger.error(
      'StructureDefinition resource not found for v4.0.1. The FHIR R4 package in local cache' +
        ' may be corrupt. Local FHIR cache can be found at <home-directory>/.fhir/packages.' +
        ' For more information, see https://wiki.hl7.org/FHIR_Package_Cache#Location.'
    );
    return;
  }

  const outPackage = exportFHIR(tank, defs);
  return outPackage;
}

export default playgroundApp;
