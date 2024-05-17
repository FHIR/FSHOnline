import { pad, padStart, padEnd } from 'lodash';
import { fhirdefs, sushiExport, sushiImport, utils } from 'fsh-sushi';
import { gofshExport, processor, utils as gofshUtils } from 'gofsh';
import { fillTank, loadAndCleanDatabase } from './Processing';
import { sliceDependency } from './helpers';
import { fshOnlineLogger as logger, setCurrentLogger } from './logger';

const FSHTank = sushiImport.FSHTank;
const RawFSH = sushiImport.RawFSH;
const exportFHIR = sushiExport.exportFHIR;
const sushiStats = utils.stats;
const gofshStats = gofshUtils.stats;
const getRandomPun = utils.getRandomPun;
const Type = utils.Type;
const FHIRDefinitions = fhirdefs.FHIRDefinitions;

/**
 * Run GoFSH
 * Note: This function is very similar to FhirToFsh in GoFSH.
 * The only difference is that FSH Online must load dependencies into IndexedDB.
 * If FhirToFsh ever supports a way to load dependencies in the browser,
 * we can update this to simply use that function.
 * @param {array} input array of JSON definitions to be processed
 * @param {object} options config options for GoFSH based on user input and defaults
 * dependencies: user set, defaults to []
 * indent: user set, defaults to false
 * @returns {string} the FSH
 */
export async function runGoFSH(input, options) {
  gofshStats.reset();
  setCurrentLogger('gofsh');

  // Read in the resources as strings
  const docs = [];
  input.forEach((resource, i) => {
    const location = `Input_${i}`;
    try {
      resource = JSON.parse(resource);
      if (!resource.resourceType) {
        logger.error(`FHIR JSON ${resource.id ?? location} is missing the required "resourceType" property`);
      }
    } catch (e) {
      logger.error(`Could not parse ${location} to JSON`);
      return;
    }
    if (gofshUtils.isProcessableContent(resource, location)) {
      docs.push(new processor.WildFHIR({ content: resource }, location));
    }
  });

  // Set up the FHIRProcessor
  const lake = new processor.LakeOfFHIR(docs);
  let defs = new FHIRDefinitions();
  const fisher = new gofshUtils.MasterFisher(lake, defs);
  const fhirProcessor = new processor.FHIRProcessor(lake, fisher);

  // Process the configuration
  const goFSHDependencies = options.dependencies.map((d) => d.replace('#', '@')); // GoFSH expects a different format
  const configuration = fhirProcessor.processConfig(goFSHDependencies ?? []); // The created IG files includes the user specified FHIR Version

  // Load dependencies, including those inferred from an IG file, and those given as input
  let dependencies = configuration?.config.dependencies
    ? configuration?.config.dependencies.map((dep) => `${dep.packageId}#${dep.version}`)
    : [];
  dependencies = sliceDependency(dependencies.join(','));

  const coreFhirVersion = configuration?.config.fhirVersion[0] ?? '4.0.1';
  const dependenciesToAdd = addCoreFHIRVersionAndAutomaticDependencies(dependencies, coreFhirVersion);
  dependencies.push(...dependenciesToAdd);

  defs = await loadAndCleanDatabase(defs, dependencies);

  // Process the FHIR to rules, and then export to FSH
  const pkg = await gofshUtils.getResources(fhirProcessor, configuration, { indent: options.indent });

  // Return the string of FSH definitions
  const fsh = new gofshExport.FSHExporter(pkg).apiExport('string');
  logger.info('Done converting definitions');
  printGoFSHresults(pkg);
  return { fsh, config: configuration?.config ?? {} };
}

/**
 * Load dependencies (FHIR R4) and run SUSHI on provided text
 *
 * @param {string} input - string containing FSH text
 * @param {object} config - Configuration for SUSHI based on user input and defaults
 * config.canonical: user set, defaults to http://example.org
 * config.version: user set, defaults to 1.0.0
 * config.FSHOnly: true
 * config.fhirVersion: [4.0.1] - NOTE fhirVersion array will only have one item in it
 *
 * @returns Package with FHIR resources
 */
export async function runSUSHI(input, config, dependencies = []) {
  sushiStats.reset();
  setCurrentLogger('sushi');

  // Load dependencies
  let defs = new FHIRDefinitions();
  const dependenciesToAdd = addCoreFHIRVersionAndAutomaticDependencies(dependencies, config.fhirVersion[0]);
  dependencies.push(...dependenciesToAdd);
  defs = await loadAndCleanDatabase(defs, dependencies);

  // Load and fill FSH Tank
  let tank = FSHTank;
  try {
    const rawFSH = [new RawFSH(input)];
    tank = fillTank(rawFSH, config);
  } catch (e) {
    logger.error('Something went wrong when importing the FSH definitions');
    return;
  }

  // Check for StructureDefinition
  const structDef = defs.fishForFHIR('StructureDefinition', Type.Resource);
  if (structDef?.version !== config.fhirVersion[0]) {
    logger.error(
      'StructureDefinition resource not found. The FHIR package in the browser cache' +
        ' may be corrupt. Clear cookies and site data on this webpage to reload the FHIR package.'
    );
    return;
  }

  logger.info('Converting FSH to FHIR resources...');
  const outPackage = exportFHIR(tank, defs);

  const count =
    outPackage.profiles.length +
    outPackage.extensions.length +
    outPackage.logicals.length +
    outPackage.resources.length +
    // Don't count the inline instances that won't have their own JSON output
    // but do include them in the SUSHI Results box (so don't filter out of outPackage here)
    outPackage.instances.filter((i) => i._instanceMeta.usage !== 'Inline').length +
    outPackage.valueSets.length +
    outPackage.codeSystems.length;

  logger.info(`Exported ${count} FHIR resources as JSON.`);

  console.log(' ');
  printSUSHIResults(outPackage);

  // Remove snapshots
  outPackage.profiles = outPackage.profiles.map((p) => p.toJSON(false));
  outPackage.extensions = outPackage.extensions.map((e) => e.toJSON(false));
  outPackage.logicals = outPackage.logicals.map((l) => l.toJSON(false));
  outPackage.resources = outPackage.resources.map((r) => r.toJSON(false));

  // Filter out inline instances
  outPackage.instances = outPackage.instances.filter((i) => i._instanceMeta.usage !== 'Inline');

  return outPackage;
}

function printSUSHIResults(pkg) {
  const numError = sushiStats.numError;
  const numWarn = sushiStats.numWarn;
  // NOTE: These variables are creatively names to align well in the strings below while keeping prettier happy
  const profileNum = pad(pkg.profiles.length.toString(), 13);
  const extentNum = pad(pkg.extensions.length.toString(), 12);
  const logiclNum = pad(pkg.logicals.length.toString(), 12);
  const resourcNum = pad(pkg.resources.length.toString(), 13);
  const valueSetsNumber = pad(pkg.valueSets.length.toString(), 18);
  const codeSystemsNum = pad(pkg.codeSystems.length.toString(), 17);
  const instancesNumber = pad(pkg.instances.length.toString(), 18);
  const errorNumMsg = pad(`${numError} Error${numError !== 1 ? 's' : ''}`, 13);
  const wrNumMsg = padStart(`${numWarn} Warning${numWarn !== 1 ? 's' : ''}`, 12);

  const aWittyMessageInvolvingABadFishPun = padEnd(getRandomPun(numError, numWarn), 36);
  const color = numError > 0 ? 'red' : numWarn > 0 ? '#b36200' : 'green'; // eslint-disable-line no-unused-vars

  /* eslint-disable no-useless-concat */
  // NOTE: Doing some funky things w/ strings on some lines to keep overall alignment in the code
  const results = [
    '╔' + '════════════════════════ SUSHI RESULTS ══════════════════════════' + '╗',
    '║' + ' ╭───────────────┬──────────────┬──────────────┬───────────────╮ ' + '║',
    '║' + ' │    Profiles   │  Extensions  │   Logicals   │   Resources   │ ' + '║',
    '║' + ' ├───────────────┼──────────────┼──────────────┼───────────────┤ ' + '║',
    '║' + ` │ ${profileNum} │ ${extentNum} │ ${logiclNum} │ ${resourcNum} │ ` + '║',
    '║' + ' ╰───────────────┴──────────────┴──────────────┴───────────────╯ ' + '║',
    '║' + ' ╭────────────────────┬───────────────────┬────────────────────╮ ' + '║',
    '║' + ' │      ValueSets     │    CodeSystems    │     Instances      │ ' + '║',
    '║' + ' ├────────────────────┼───────────────────┼────────────────────┤ ' + '║',
    '║' + ` │ ${valueSetsNumber} │ ${codeSystemsNum} │ ${instancesNumber} │ ` + '║',
    '║' + ' ╰────────────────────┴───────────────────┴────────────────────╯ ' + '║',
    '║' + '                                                                 ' + '║',
    '╠' + '═════════════════════════════════════════════════════════════════' + '╣',
    '║' + ` ${aWittyMessageInvolvingABadFishPun} ${errorNumMsg} ${wrNumMsg} ` + '║',
    '╚' + '═════════════════════════════════════════════════════════════════' + '╝'
  ];
  results.forEach((r) => console.log(r));
  // results.forEach((r) => console.log(`%c${r}`, `color:${clr}`)); // Color formatting for browser console
}

function printGoFSHresults(pkg) {
  const proNum = pad(pkg.profiles.length.toString(), 18);
  const extNum = pad(pkg.extensions.length.toString(), 17);
  const logNum = pad(pkg.logicals.length.toString(), 18);
  const resNum = pad(pkg.resources.length.toString(), 18);
  const vsNum = pad(pkg.valueSets.length.toString(), 17);
  const csNum = pad(pkg.codeSystems.length.toString(), 18);
  const instNum = pad(pkg.instances.length.toString(), 18);
  const invNum = pad(pkg.invariants.length.toString(), 17);
  const mapNum = pad(pkg.mappings.length.toString(), 18);
  const errNumMsg = pad(`${gofshStats.numError} Error${gofshStats.numError !== 1 ? 's' : ''}`, 12);
  const wrnNumMsg = padStart(`${gofshStats.numWarn} Warning${gofshStats.numWarn !== 1 ? 's' : ''}`, 12);
  const aWittyMessageInvolvingABadFishPun = padEnd(getRandomPun(gofshStats.numError, gofshStats.numWarn), 37);

  // prettier-ignore
  const results = [
    '╔' + '═════════════════════════ GoFSH RESULTS ═════════════════════════' + '╗',
    '║' + ' ╭────────────────────┬───────────────────┬────────────────────╮ ' + '║',
    '║' + ' │      Profiles      │    Extensions     │      Logicals      │ ' + '║',
    '║' + ' ├────────────────────┼───────────────────┼────────────────────┤ ' + '║',
    '║' + ` │ ${    proNum     } │ ${    extNum    } │ ${    logNum     } │ ` + '║',
    '║' + ' ╰────────────────────┴───────────────────┴────────────────────╯ ' + '║',
    '║' + ' ╭────────────────────┬───────────────────┬────────────────────╮ ' + '║',
    '║' + ' │     Resources      │     ValueSets     │     CodeSystems    │ ' + '║',
    '║' + ' ├────────────────────┼───────────────────┼────────────────────┤ ' + '║',
    '║' + ` │ ${    resNum     } │ ${    vsNum     } │ ${     csNum     } │ ` + '║',
    '║' + ' ╰────────────────────┴───────────────────┴────────────────────╯ ' + '║',
    '║' + ' ╭────────────────────┬───────────────────┬────────────────────╮ ' + '║',
    '║' + ' │     Instances      │    Invariants     │      Mappings      │ ' + '║',
    '║' + ' ├────────────────────┼───────────────────┼────────────────────┤ ' + '║',
    '║' + ` │ ${    instNum    } │ ${    invNum    } │ ${    mapNum     } │ ` + '║',
    '║' + ' ╰────────────────────┴───────────────────┴────────────────────╯ ' + '║',
    '║' + '                                                                 ' + '║',
    '╠' + '═════════════════════════════════════════════════════════════════' + '╣',
    '║' + ` ${aWittyMessageInvolvingABadFishPun } ${errNumMsg} ${wrnNumMsg} ` + '║',
    '╚' + '═════════════════════════════════════════════════════════════════' + '╝'
  ];

  console.log(' ');
  results.forEach((r) => console.log(r));
}

function addCoreFHIRVersionAndAutomaticDependencies(dependencies, coreFHIRVersion) {
  const dependenciesToAdd = [];
  const coreFHIRPackage = {
    packageId: getCoreFHIRPackageIdentifier(coreFHIRVersion),
    version: coreFHIRVersion
  };
  const hasCoreFHIR = hasDependency(dependencies, coreFHIRPackage);
  if (!hasCoreFHIR) {
    dependenciesToAdd.push(coreFHIRPackage);
  }
  AUTOMATIC_DEPENDENCIES.filter(
    (dep) => dep.fhirVersions == null || dep.fhirVersions.some((v) => coreFHIRPackage.version.startsWith(v))
  ).forEach((dep) => {
    const dependencyToAdd = { packageId: dep.packageId, version: dep.version, isAutomatic: true };
    if (!hasDependency(dependencies, dependencyToAdd, true)) {
      dependenciesToAdd.push(dependencyToAdd);
    }
  });
  return dependenciesToAdd;
}

function hasDependency(dependenciesList, currentDependency, ignoreVersion = false) {
  return dependenciesList.some(
    (dep) =>
      dep.packageId === currentDependency.packageId && (ignoreVersion || dep.version === currentDependency.version)
  );
}

export function getCoreFHIRPackageIdentifier(fhirVersion) {
  if (/^4\.0\.1$/.test(fhirVersion)) {
    return `hl7.fhir.r4.core`;
  } else if (/^4\.3\.\d+$/.test(fhirVersion)) {
    return `hl7.fhir.r4b.core`;
  } else if (/^5\.0\.\d+$/.test(fhirVersion)) {
    return `hl7.fhir.r5.core`;
  } else {
    return `hl7.fhir.r4.core`;
  }
}

const AUTOMATIC_DEPENDENCIES = [
  {
    packageId: 'hl7.fhir.uv.tools',
    version: 'latest'
  },
  {
    packageId: 'hl7.terminology.r4',
    version: 'latest',
    fhirVersions: ['4.0', '4.3']
  },
  {
    packageId: 'hl7.terminology.r5',
    version: 'latest',
    fhirVersions: ['5.0']
  },
  {
    packageId: 'hl7.fhir.uv.extensions.r4',
    version: 'latest',
    fhirVersions: ['4.0', '4.3']
  },
  {
    packageId: 'hl7.fhir.uv.extensions.r5',
    version: 'latest',
    fhirVersions: ['5.0']
  }
];
