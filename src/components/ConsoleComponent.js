import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  box: {
    padding: theme.spacing(2),
    color: theme.palette.common.white,
    background: theme.palette.common.black,
    height: '200%'
  },
  pre: {
    margin: '0px'
  }
}));

export default function Console(props) {
  const classes = useStyles();

  return (
    <Box className={classes.box} overflow="scroll">
      <h3>Console</h3>
      {props.consoleMessages.map((message, i) => {
        return (
          <pre key={i} className={classes.pre}>
            {message}
          </pre>
        );
      })}
    </Box>
  );
}
