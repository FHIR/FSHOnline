import React, { useState, useEffect } from 'react';
import { inflateSync } from 'browserify-zlib';
import { makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import { expandLink } from './utils/BitlyWorker';
import TopBar from './components/TopBar';
import JSONOutput from './components/JSONOutput';
import ConsoleComponent from './components/ConsoleComponent';
import CodeMirrorComponent from './components/CodeMirrorComponent';
import SUSHIControls from './components/SUSHIControls';

const useStyles = makeStyles((theme) => ({
  container: {
    height: '100%',
    flexGrow: 1
  },
  fullHeightGrid: {
    height: '100%'
  },
  collapsedMain: {
    width: '100%',
    height: 'calc(100vh - 116px - 300px)'
  },
  expandedMain: {
    width: '100%',
    height: 'calc(100vh - 116px - 25px)'
  },
  collapsedConsole: {
    height: '25px',
    width: '100%'
  },
  expandedConsole: {
    height: '300px',
    width: '100%'
  },
  top: {
    height: '116px'
  }
}));

const log = console.log; //eslint-disable-line no-unused-vars
let consoleMessages = [];
let errorAndWarningMessages = [];
let errorString = '';
let warningString = '';
let errorCount = 0;
let warningCount = 0;
console.log = function getMessages(message) {
  consoleMessages.push(message);
  if (message && (message.startsWith('error') || message.startsWith('warn'))) {
    errorAndWarningMessages.push(message);
    if (message.startsWith('error')) errorCount++;
    else warningCount++;
  }
  if (errorCount > 0) {
    errorString = `${errorCount} Error`;
    if (errorCount !== 1) errorString += 's';
  }
  if (warningCount > 0) {
    warningString = `${warningCount} Warning`;
    if (warningCount !== 1) warningString += 's';
  }
};

export async function decodeFSH(encodedFSH) {
  if (encodedFSH.text === undefined) {
    return 'Edit FSH here!';
  } else {
    const promisedURL = await expandLink(encodedFSH);

    // Removes the encoded data from the end of the url, starting at index 38
    const sliced64 = promisedURL.long_url.slice(40);
    if (!promisedURL.long_url.includes('https://fshschool.org/FSHOnline/#/share/') || sliced64.length === 0) {
      return 'Edit FSH here!';
    } else {
      const displayText = inflateSync(Buffer.from(sliced64, 'base64')).toString('utf-8');
      return displayText;
    }
  }
}

export default function App(props) {
  const classes = useStyles();
  const text64 = props.match.params;
  const [doRunSUSHI, setDoRunSUSHI] = useState(false);
  const [inputText, setInputText] = useState('Edit FSH here!');
  const [initialText, setInitialText] = useState('Edit FSH here!');
  const [outputText, setOutputText] = useState('Your JSON Output Will Display Here: ');
  const [isOutputObject, setIsOutputObject] = useState(false);
  const [expandConsole, setExpandConsole] = useState(false);

  useEffect(() => {
    async function waitForFSH() {
      setInitialText(await decodeFSH(text64));
    }
    waitForFSH();
  }, [text64]);

  function resetLogMessages() {
    consoleMessages = [];
    errorAndWarningMessages = [];
    errorString = '';
    warningString = '';
    errorCount = 0;
    warningCount = 0;
  }

  function handleSUSHIControls(doRunSUSHI, sushiOutput, isObject) {
    setDoRunSUSHI(doRunSUSHI);
    setOutputText(sushiOutput);
    setIsOutputObject(isObject);
  }

  function updateInputTextValue(text) {
    setInputText(text);
  }

  return (
    <div className="root" style={{ height: '100vh' }}>
      <div className={classes.top}>
        <TopBar />
        <SUSHIControls onClick={handleSUSHIControls} text={inputText} resetLogMessages={resetLogMessages} />
      </div>
      <div className={expandConsole ? classes.collapsedMain : classes.expandedMain}>
        <Grid className={classes.container} container>
          <Grid item xs={6} className={classes.fullHeightGrid}>
            <CodeMirrorComponent value={inputText} initialText={initialText} updateTextValue={updateInputTextValue} />
          </Grid>
          <Grid item xs={6} className={classes.fullHeightGrid}>
            <JSONOutput
              displaySUSHI={doRunSUSHI}
              text={outputText}
              isObject={isOutputObject}
              errorsAndWarnings={errorAndWarningMessages}
            />
          </Grid>
        </Grid>
      </div>
      <div className={expandConsole ? classes.expandedConsole : classes.collapsedConsole}>
        <ConsoleComponent
          consoleMessages={consoleMessages}
          warningCount={warningString}
          errorCount={errorString}
          expandConsole={expandConsole}
          setExpandConsole={setExpandConsole}
        />
      </div>
    </div>
  );
}
