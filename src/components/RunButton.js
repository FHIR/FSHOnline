import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Button } from '@material-ui/core';
import './CodeMirrorComponent';

const useStyles = makeStyles((theme) => ({
  box: {
    padding: theme.spacing(1),
    color: theme.palette.text.primary,
    background: theme.palette.grey[400],
    height: '4vh',
    display: 'flex;',
    alignItems: 'center',
    justifyContent: 'center'
  },
  button: {
    color: theme.palette.common.white,
    background: theme.palette.success.dark
  }
}));

export default function RunButton(props) {
  const classes = useStyles();

  //Sets the runVariable to true
  function handleClick() {
    props.onClick(true);
  }

  return (
    <Box className={classes.box}>
      <Button className={classes.button} onClick={handleClick} testid="Button">
        Run
      </Button>
    </Box>
  );
}
