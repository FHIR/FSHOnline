import { pad, padStart, sample, padEnd } from 'lodash';
import { fhirdefs, sushiExport, sushiImport, utils } from 'fsh-sushi';
import { loadExternalDependencies, fillTank } from './Processing';

const FSHTank = sushiImport.FSHTank;
const RawFSH = sushiImport.RawFSH;
const exportFHIR = sushiExport.exportFHIR;
const logger = utils.logger;
const stats = utils.stats;
const Type = utils.Type;
const FHIRDefinitions = fhirdefs.FHIRDefinitions;

/**
 * TODO: Keep a running tally of errors because the logger stats do not reset between SUSHI runs
 * If we have a way to clear the stats in the logger, these variables should be removed and we can
 * just use stats.numError and stats.numWarn similar to SUSHI.
 */
let startingErrors = 0;
let startingWarns = 0;

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
export async function runSUSHI(input, config) {
  // Load dependencies
  let defs = new FHIRDefinitions();
  const version = 1;
  defs = await loadExternalDependencies(defs, version);

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
  const { errors, warns } = printResults(outPackage, startingErrors, startingWarns);
  startingErrors = errors;
  startingWarns = warns;

  // Remove snapshots
  outPackage.profiles = outPackage.profiles.map((p) => p.toJSON(false));
  outPackage.extensions = outPackage.extensions.map((e) => e.toJSON(false));

  return outPackage;
}

function printResults(pkg, startError, startWarn) {
  const numError = stats.numError - startError;
  const numWarn = stats.numWarn - startWarn;
  // NOTE: These variables are creatively names to align well in the strings below while keeping prettier happy
  const prNum = pad(pkg.profiles.length.toString(), 8);
  const extnNum = pad(pkg.extensions.length.toString(), 10);
  const vstNum = pad(pkg.valueSets.length.toString(), 9);
  const cdsysNum = pad(pkg.codeSystems.length.toString(), 11);
  const insNum = pad(pkg.instances.length.toString(), 9);
  const errorNumMsg = pad(`${numError} Error${numError !== 1 ? 's' : ''}`, 13);
  const wrNumMsg = padStart(`${numWarn} Warning${numWarn !== 1 ? 's' : ''}`, 12);
  let resultStatus;
  if (numError === 0 && numWarn === 0) {
    resultStatus = 'clean';
  } else if (numError > 0) {
    resultStatus = 'errors';
  } else {
    resultStatus = 'warnings';
  }
  const aWittyMessageInvolvingABadFishPun = padEnd(sample(MESSAGE_MAP[resultStatus]), 36);
  const color = COLOR_MAP[resultStatus]; // eslint-disable-line no-unused-vars

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
  return { errors: numError, warns: numWarn };
}

const MESSAGE_MAP = {
  clean: [
    'That went swimmingly!',
    'O-fish-ally error free!',
    "Nice! You're totally krilling it!",
    'Cool and So-fish-ticated!',
    'Well hooked and landed!',
    'You earned a PhD in Ichthyology!',
    'You rock, lobster!',
    'Everything is ship-shape!',
    'Ex-clam-ation point!',
    'Ac-clam-ations!',
    'Fin-tastic job!',
    "You're dolphinitely doing great!"
  ],
  warnings: [
    'Not bad, but you cod do batter!',
    'Something smells fishy...',
    'Warnings... Water those about?',
    'Looks like you are casting about.',
    'A bit pitchy, but tuna-ble.'
  ],
  errors: [
    'Ick! Errors!',
    'Some-fin went wrong...',
    'Unfor-tuna-tely, there are errors.',
    'That really smelt.',
    'You spawned some errors.',
    'Just keep swimming, Dory.',
    'This is the one that got away.',
    'The docs might be bene-fish-al.',
    'This was a turtle disaster.',
    'Something went eely wrong there.',
    'Documentation may be kelp-ful.'
  ]
};

const COLOR_MAP = {
  clean: 'green',
  warnings: '#b36200',
  errors: 'red'
};

export default runSUSHI;
