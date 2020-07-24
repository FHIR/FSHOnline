import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import TopBar from './components/TopBar';
import JSONOutput from './components/JSONOutput';
import ConsoleComponent from './components/ConsoleComponent';
import CodeMirrorComponent from './components/CodeMirrorComponent';
import RunButton from './components/RunButton';

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
let msgArray = [];
console.log = function getMessages(message) {
  msgArray.push(message);
};

export default function App() {
  const classes = useStyles();

  const [doRunSUSHI, setDoRunSUSHI] = useState(false);
  const [inputText, setInputText] = useState('Edit FSH Here!');
  const [outputText, setOutputText] = useState('Your JSON Output Will Display Here: ');
  const [isOutputObject, setIsOutputObject] = useState(false);

  function resetLogMessages() {
    msgArray = [];
  }

  function handleRunButton(doRunSUSHI, sushiOutput, isObject) {
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
      <RunButton onClick={handleRunButton} text={inputText} resetLogMessages={resetLogMessages} />
      <Grid className={classes.container} container>
        <Grid className={classes.itemTop} item xs={6}>
          <CodeMirrorComponent value={inputText} updateTextValue={updateInputTextValue} />
        </Grid>
        <Grid className={classes.itemTop} item xs={6}>
          <JSONOutput displaySUSHI={doRunSUSHI} text={outputText} isObject={isOutputObject} />
        </Grid>
        <Grid className={classes.itemBottom} item xs={12}>
          <ConsoleComponent msgArray={msgArray} />
        </Grid>
      </Grid>
    </div>
  );
}
