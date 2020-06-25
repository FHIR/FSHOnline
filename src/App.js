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

export default function App() {
  const classes = useStyles();

  const [shouldRunSUSHI, setShouldRunSUSHI] = useState(false);
  const [text, setText] = useState('Edit FSH Here!');

  function updateShouldRunSUSHI(runVariable) {
    setShouldRunSUSHI(runVariable);
  }
  function updateTextValue(text) {
    setText(text);
  }

  return (
    <div className="root">
      <TopBar />
      <RunButton onClick={updateShouldRunSUSHI} />
      <Grid className={classes.container} container>
        <Grid className={classes.itemTop} item xs={6}>
          <CodeMirrorComponent
            value={text}
            updateTextValue={updateTextValue}
            updateShouldRunSUSHI={updateShouldRunSUSHI}
          />
        </Grid>
        <Grid className={classes.itemTop} item xs={6}>
          <JSONOutput value={shouldRunSUSHI} text={text} />
        </Grid>
        <Grid className={classes.itemBottom} item xs={12}>
          <ConsoleComponent />
        </Grid>
      </Grid>
    </div>
  );
}
