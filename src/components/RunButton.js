import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Button } from '@material-ui/core';
import { runSUSHI } from '../utils/RunSUSHI';
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

function replacer(key, value) {
  if (key === 'config') {
    return undefined;
  }
  return value;
}

export default function RunButton(props) {
  const classes = useStyles();

  //Sets the doRunSUSHI to true
  async function handleClick() {
    props.onClick(true, 'Loading...', false);
    let isObject = true;
    const outPackage = await runSUSHI(props.text);
    let jsonOutput = JSON.stringify(outPackage, replacer, 2);
    if (outPackage.codeSystems) {
      if (
        !outPackage.codeSystems.length &&
        !outPackage.extensions.length &&
        !outPackage.instances.length &&
        !outPackage.profiles.length &&
        !outPackage.valueSets.length
      ) {
        isObject = false;
        jsonOutput = 'Your FSH is invalid. Just keep swimming!';
      }
    } else {
      isObject = false;
      jsonOutput = 'Your FSH is invalid. Just keep swimming!';
    }

    props.onClick(true, jsonOutput, isObject);
  }

  return (
    <Box className={classes.box}>
      <Button className={classes.button} onClick={handleClick} testid="Button">
        Run
      </Button>
    </Box>
  );
}
