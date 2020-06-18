import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import TopBar from './components/TopBar';
import JSONOutput from './components/JSONOutput';
import ConsoleComponent from './components/ConsoleComponent';
import CodeMirrorComponent from './components/CodeMirrorComponent';

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

  return (
    <div className="root">
      <TopBar />
      <Grid className={classes.container} container>
        <Grid className={classes.itemTop} item xs={6}>
          <CodeMirrorComponent />
        </Grid>
        <Grid className={classes.itemTop} item xs={6}>
          <JSONOutput />
        </Grid>
        <Grid className={classes.itemBottom} item xs={12}>
          <ConsoleComponent />
        </Grid>
      </Grid>
    </div>
  );
}
