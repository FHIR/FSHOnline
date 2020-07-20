import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Button } from '@material-ui/core';
import { playgroundApp } from '../utils/PlaygroundApp';
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

  //Sets the shouldRunSUSHI to true
  async function handleClick() {
    props.onClick(true);
    const outPackage = await playgroundApp(props.text);
    console.log(outPackage);
  }

  return (
    <Box className={classes.box}>
      <Button className={classes.button} onClick={handleClick} testid="Button">
        Run
      </Button>
    </Box>
  );
}
