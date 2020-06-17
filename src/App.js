import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Box } from '@material-ui/core';
import TopBar from './components/TopBar';
import JSONOutput from './components/JSONOutput';
import ConsoleComponent from './components/ConsoleComponent';
import CodeMirrorComponent from './components/CodeMirrorComponent';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex'
  },
  itemTop: {
    display: 'flex'
  },
  itemBottom: {
    display: 'flex'
  }
}));

export default function App() {
  const classes = useStyles();

  return (
    <div className="root">
      <TopBar />
      {/* <Grid className={classes.container} container> */}
      {/* <Grid className={classes.itemTop} item xs={6}> */}
      <Box display="flex" flexWrap="nowrap" css={{ maxWidth: '100%', maxHeight: '100%' }}>
        <CodeMirrorComponent />
        {/* </Grid> */}
        {/* <Grid className={classes.itemTop} item xs={6}> */}
        <JSONOutput />
      </Box>
      {/* </Grid> */}
      {/* <Grid className={classes.itemBottom} item xs={12}> */}
      <ConsoleComponent />
      {/* </Grid> */}
      {/* </Grid> */}
    </div>
  );
}
