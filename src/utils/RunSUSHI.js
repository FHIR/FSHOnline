import { pad, padStart, padEnd } from 'lodash';
import { fhirdefs, sushiExport, sushiImport, utils } from 'fsh-sushi';
import { gofshExport, processor, utils as gofshUtils } from 'gofsh';
import { loadExternalDependencies, fillTank, checkForDatabaseUpgrade, cleanDatabase } from './Processing';
import { sliceDependency } from './helpers';

const FSHTank = sushiImport.FSHTank;
const RawFSH = sushiImport.RawFSH;
const exportFHIR = sushiExport.exportFHIR;
const logger = utils.logger;
const stats = utils.stats;
const getRandomPun = utils.getRandomPun;
const Type = utils.Type;
const FHIRDefinitions = fhirdefs.FHIRDefinitions;

async function loadAndCleanDatabase(defs, dependencies) {
  let helperUpdate = await checkForDatabaseUpgrade(dependencies);
  let loadExternalDependenciesReturn = { defs, emptyDependencies: [] };

  if (helperUpdate.shouldUpdate) {
    loadExternalDependenciesReturn = await loadExternalDependencies(defs, helperUpdate.version + 1, dependencies);
    defs = loadExternalDependenciesReturn.defs;
  } else {
    loadExternalDependenciesReturn = await loadExternalDependencies(defs, helperUpdate.version, dependencies);
    defs = loadExternalDependenciesReturn.defs;
  }

  // Cleans out database of any empty objectStores
  await cleanDatabase(loadExternalDependenciesReturn.emptyDependencies, helperUpdate.version + 2);
  return defs;
}

/**
 * Run GoFSH
 * Note: This function is very similar to FhirToFsh in GoFSH.
 * The only difference is that FSH Online must load dependencies into IndexedDB.
 * If FhirToFsh ever supports a way to load dependencies in the browser,
 * we can update this to simply use that function.
 * @param {array} input array of JSON definitions to be processed
 * @param {object} options - config options for GoFSH based on user input and defaults
 * dependencies: user set, defaults to []
 * @param {FHIRDefinitions} testDefs - this should only be used by the unit tests so they can provide their own definitions.
 * @returns {string} the FSH
 */
export async function runGoFSH(input, options, testDefs = null) {
  // Read in the resources, either as JSON objects or as strings
  const docs = []; // WildFHIR[]
  input.forEach((resource, i) => {
    const location = `Input_${i}`;
    if (typeof resource === 'string') {
      try {
        resource = JSON.parse(resource);
      } catch (e) {
        logger.error(`Could not parse ${location} to JSON`);
        return;
      }
    }
    if (gofshUtils.isProcessableContent(resource, location)) {
      docs.push(new processor.WildFHIR(resource, location));
    }
  });

  // Set up the FHIRProcessor
  const lake = new processor.LakeOfFHIR(docs);
  let defs = testDefs || new FHIRDefinitions(); // The tests pass in their own set of definitions to use
  const fisher = new gofshUtils.MasterFisher(lake, defs);
  const fhirProcessor = new processor.FHIRProcessor(lake, fisher);

  // Process the configuration
  const configuration = fhirProcessor.processConfig(options.dependencies ?? []);

  // Load dependencies, including those inferred from an IG file, and those given as input
  let dependencies = configuration.config.dependencies
    ? configuration.config.dependencies.map((dep) => `${dep.packageId}#${dep.version}`)
    : [];
  dependencies = sliceDependency(dependencies.join(','));
  defs = await loadAndCleanDatabase(defs, dependencies);

  // Process the FHIR to rules, and then export to FSH
  const pkg = await gofshUtils.getResources(fhirProcessor, configuration);

  // Return the string of FSH definitions
  const fsh = new gofshExport.FSHExporter(pkg).apiExport('string');
  return fsh;
}

/**
 * Load dependencies (FHIR R4) and run SUSHI on provided text
 *
 * @param {string} input - string containing FSH text
 * @param {object} config - Configuration for SUSHI based on user input and defaults
 * config.canonical: user set, defaults to http://example.org
 * config.version: user set, defaults to 1.0.0
 * config.FSHOnly: true
 * config.fhirVersion: [4.0.1]
 *
 * @returns Package with FHIR resources
 */
export async function runSUSHI(input, config, dependencyArr) {
  stats.reset();

  // Load dependencies
  let defs = new FHIRDefinitions();
  defs = await loadAndCleanDatabase(defs, dependencyArr);

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

  logger.info('Converting FSH to FHIR resources...');
  const outPackage = exportFHIR(tank, defs);

  console.log(' ');
  printResults(outPackage);

  // Remove snapshots
  outPackage.profiles = outPackage.profiles.map((p) => p.toJSON(false));
  outPackage.extensions = outPackage.extensions.map((e) => e.toJSON(false));

  return outPackage;
}

function printResults(pkg) {
  const numError = stats.numError;
  const numWarn = stats.numWarn;
  // NOTE: These variables are creatively names to align well in the strings below while keeping prettier happy
  const prNum = pad(pkg.profiles.length.toString(), 8);
  const extnNum = pad(pkg.extensions.length.toString(), 10);
  const vstNum = pad(pkg.valueSets.length.toString(), 9);
  const cdsysNum = pad(pkg.codeSystems.length.toString(), 11);
  const insNum = pad(pkg.instances.length.toString(), 9);
  const errorNumMsg = pad(`${numError} Error${numError !== 1 ? 's' : ''}`, 13);
  const wrNumMsg = padStart(`${numWarn} Warning${numWarn !== 1 ? 's' : ''}`, 12);

  const aWittyMessageInvolvingABadFishPun = padEnd(getRandomPun(numError, numWarn), 36);
  const color = numError > 0 ? 'red' : numWarn > 0 ? '#b36200' : 'green'; // eslint-disable-line no-unused-vars

  /* eslint-disable no-useless-concat */
  // NOTE: Doing some funky things w/ strings on some lines to keep overall alignment in the code
  const results = [
    '╔' + '════════════════════════ SUSHI RESULTS ══════════════════════════' + '╗',
    '║' + ' ╭──────────┬────────────┬───────────┬─────────────┬───────────╮ ' + '║',
    '║' + ' │ Profiles │ Extensions │ ValueSets │ CodeSystems │ Instances │ ' + '║',
    '║' + ' ├──────────┼────────────┼───────────┼─────────────┼───────────┤ ' + '║',
    '║' + ` │ ${prNum} │ ${extnNum} │ ${vstNum} │ ${cdsysNum} │ ${insNum} │ ` + '║',
    '║' + ' ╰──────────┴────────────┴───────────┴─────────────┴───────────╯ ' + '║',
    '║' + '                                                                 ' + '║',
    '╠' + '═════════════════════════════════════════════════════════════════' + '╣',
    '║' + ` ${aWittyMessageInvolvingABadFishPun} ${errorNumMsg} ${wrNumMsg} ` + '║',
    '╚' + '═════════════════════════════════════════════════════════════════' + '╝'
  ];
  results.forEach((r) => console.log(r));
  // results.forEach((r) => console.log(`%c${r}`, `color:${clr}`)); // Color formatting for browser console
}
