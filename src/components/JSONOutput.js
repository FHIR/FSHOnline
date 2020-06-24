import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  box: {
    padding: theme.spacing(0, 2),
    color: theme.palette.text.primary,
    background: theme.palette.grey[400],
    height: '100%',
    fontFamily: 'Consolas'
  }
}));

export default function JSONOutput(props) {
  const classes = useStyles();

  if (props.value && props.text) {
    return (
      <Box className={classes.box} border={1}>
        <h4>Your Output:</h4>
        <p>{props.text}</p>
      </Box>
    );
  } else {
    return (
      <Box className={classes.box} border={1}>
        <h4>Your Output Will Display Here:</h4>
      </Box>
    );
  }
}
