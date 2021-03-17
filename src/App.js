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
    flexGrow: 1
  },
  itemTop: {
    height: '75vh'
  },
  itemBottom: {
    height: '25vh'
  }
}));

const log = console.log; //eslint-disable-line no-unused-vars
let consoleMessages = [];
let errorAndWarningMessages = [];
console.log = function getMessages(message) {
  consoleMessages.push(message);
  if (message && (message.startsWith('error') || message.startsWith('warn'))) {
    errorAndWarningMessages.push(message);
  }
};

export async function decodeFSH(encodedFSH) {
  if (encodedFSH.text === undefined) {
    return '';
  } else {
    const promisedURL = await expandLink(encodedFSH);

    // Removes the encoded data from the end of the url, starting at index 38
    const sliced64 = promisedURL.long_url.slice(40);
    if (!promisedURL.long_url.includes('https://fshschool.org/FSHOnline/#/share/') || sliced64.length === 0) {
      return '';
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
  const [inputFSHText, setInputFSHText] = useState('');
  const [inputGoFSHText, setInputGoFSHText] = useState(['']);
  const [initialText, setInitialText] = useState('');
  const [isOutputObject, setIsOutputObject] = useState(false);
  const [isWaitingForFHIROutput, setIsWaitingForFHIROutput] = useState(false);
  const [isWaitingForFSHOutput, setIsWaitingForFSHOutput] = useState(false);

  useEffect(() => {
    async function waitForFSH() {
      setInitialText(await decodeFSH(text64));
    }
    waitForFSH();
  }, [text64]);

  function resetLogMessages() {
    consoleMessages = [];
    errorAndWarningMessages = [];
  }

  function handleSUSHIControls(doRunSUSHI, sushiOutput, isObject, isWaiting) {
    setDoRunSUSHI(doRunSUSHI);
    setInputGoFSHText(sushiOutput);
    setIsOutputObject(isObject);
    setIsWaitingForFHIROutput(isWaiting);
  }

  function handleGoFSHControls(fshOutput, isWaiting) {
    setIsWaitingForFSHOutput(isWaiting);
    setInitialText(fshOutput);
  }

  function updateInputFSHTextValue(text) {
    setInputFSHText(text);
  }

  function updateInputGoFSHTextValue(text) {
    setInputGoFSHText(text);
  }

  return (
    <div className="root">
      <TopBar />
      <SUSHIControls
        onClick={handleSUSHIControls}
        onGoFSHClick={handleGoFSHControls}
        fshText={inputFSHText}
        gofshText={inputGoFSHText}
        resetLogMessages={resetLogMessages}
      />
      <Grid className={classes.container} container>
        <Grid className={classes.itemTop} item xs={5}>
          <CodeMirrorComponent
            value={inputFSHText}
            initialText={initialText}
            updateTextValue={updateInputFSHTextValue}
            mode={'fsh'}
            placeholder={isWaitingForFSHOutput ? 'Loading...' : 'Edit FSH here!'}
          />
        </Grid>
        <Grid className={classes.itemTop} item xs={7}>
          <JSONOutput
            displaySUSHI={doRunSUSHI}
            text={inputGoFSHText}
            isObject={isOutputObject}
            isWaiting={isWaitingForFHIROutput}
            errorsAndWarnings={errorAndWarningMessages}
            updateTextValue={updateInputGoFSHTextValue}
            setIsOutputObject={setIsOutputObject}
          />
        </Grid>
        <Grid className={classes.itemBottom} item xs={12}>
          <ConsoleComponent consoleMessages={consoleMessages} />
        </Grid>
      </Grid>
    </div>
  );
}
