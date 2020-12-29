import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
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

function decodeFSH(encodedFsh) {
  if (encodedFsh.text === undefined) {
    return;
  }
  try {
    return Buffer.from(encodedFsh.text, 'base64').toString('utf-8');
  } catch (error) {
    console.log(error);
  }
}

export default function AppFromLink(props) {
  const classes = useStyles();
  const text64 = props.match.params;
  const decodedText = decodeFSH(text64);
  const [doRunSUSHI, setDoRunSUSHI] = useState(false);
  const [inputText, setInputText] = useState(decodedText);
  const [outputText, setOutputText] = useState('Your JSON Output Will Display Here: ');
  const [isOutputObject, setIsOutputObject] = useState(false);

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
