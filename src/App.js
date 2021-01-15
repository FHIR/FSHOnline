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
    return 'Edit FSH here!';
  } else {
    const promisedURL = await expandLink(encodedFSH);

    // Removes the encoded data from the end of the url, starting at index 38
    const sliced64 = promisedURL.long_url.slice(38);
    const displayText = inflateSync(Buffer.from(sliced64, 'base64')).toString('utf-8');
    return displayText;
  }
}

export default function App(props) {
  const classes = useStyles();
  const text64 = props.match.params;
  const [doRunSUSHI, setDoRunSUSHI] = useState(false);
  const [inputText, setInputText] = useState('Edit FSH here!');
  const [outputText, setOutputText] = useState('Your JSON Output Will Display Here: ');
  const [isOutputObject, setIsOutputObject] = useState(false);

  useEffect(() => {
    async function waitForFSH() {
      setInputText(await decodeFSH(text64));
    }
    waitForFSH();
  }, [text64]);

  function resetLogMessages() {
    consoleMessages = [];
    errorAndWarningMessages = [];
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
    <div className="root">
      <TopBar />
      <SUSHIControls onClick={handleSUSHIControls} text={inputText} resetLogMessages={resetLogMessages} />
      <Grid className={classes.container} container>
        <Grid className={classes.itemTop} item xs={6}>
          <CodeMirrorComponent value={inputText} updateTextValue={updateInputTextValue} />
        </Grid>
        <Grid className={classes.itemTop} item xs={6}>
          <JSONOutput
            displaySUSHI={doRunSUSHI}
            text={outputText}
            isObject={isOutputObject}
            errorsAndWarnings={errorAndWarningMessages}
          />
        </Grid>
        <Grid className={classes.itemBottom} item xs={12}>
          <ConsoleComponent consoleMessages={consoleMessages} />
        </Grid>
      </Grid>
    </div>
  );
}
