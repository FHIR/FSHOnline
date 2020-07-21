import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  box: {
    padding: theme.spacing(0, 2),
    color: theme.palette.text.primary,
    background: theme.palette.grey[400],
    height: '100%',
    fontFamily: 'Consolas',
    gutterButtom: true,
    noWrap: false
  }
}));

export default function JSONOutput(props) {
  const classes = useStyles();

  //Checks to insure the shouldRunSUSHI is true (aka button has been pressed) and there is text to display for the output
  if (props.shouldDisplaySUSHI && props.text) {
    return (
      <Box className={classes.box} border={1} overflow="scroll">
        <h4>Your Output: </h4>
        <pre>{props.text}</pre>
      </Box>
    );
  } else {
    return (
      <Box className={classes.box} border={1}>
        <h4>Your JSON Output Will Display Here: </h4>
      </Box>
    );
  }
}
