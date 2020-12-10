import React, { useState } from 'react';
import { makeStyles, createMuiTheme } from '@material-ui/core/styles';
import { Box, Button, ThemeProvider } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { runSUSHI } from '../utils/RunSUSHI';
import './CodeMirrorComponent';
import '../style/ButtonComponents.css';

const useStyles = makeStyles((theme) => ({
  box: {
    padding: theme.spacing(1),
    color: theme.palette.text.primary,
    background: theme.palette.background.paper,
    height: '4vh',
    display: 'flex;',
    alignItems: 'center',
    justifyContent: 'center'
  },
  button: {
    color: theme.palette.common.white,
    background: theme.palette.success.dark,
    textTransform: 'none',
    fontWeight: 'bold',
    '&:hover': {
      background: theme.palette.success.main
    }
  },
  secondaryButton: {
    color: theme.palette.common.white,
    background: '#2c4f85',
    textTransform: 'none',
    fontWeight: 'bold',
    marginLeft: '5px',
    '&:hover': {
      background: '#385f9c'
    }
  }
}));

const theme = createMuiTheme({
  typography: {
    fontFamily: 'Open Sans'
  }
});

function replacer(key, value) {
  if (key === 'config') {
    return undefined;
  }
  return value;
}

export default function SUSHIControls(props) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [canonical, setCanonical] = useState('http://example.org');
  const [version, setVersion] = useState('1.0.0');

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const updateCanonical = (event) => {
    const newCanonical = event.target.value;
    setCanonical(newCanonical);
  };

  const updateVersion = (event) => {
    const newVersion = event.target.value;
    setVersion(newVersion);
  };

  //Sets the doRunSUSHI to true
  async function handleRunClick() {
    props.resetLogMessages();
    props.onClick(true, 'Loading...', false);
    let isObject = true;
    const config = { canonical, version, FSHOnly: true, fhirVersion: ['4.0.1'] };
    const outPackage = await runSUSHI(props.text, config);
    let jsonOutput = JSON.stringify(outPackage, replacer, 2);
    if (outPackage && outPackage.codeSystems) {
      if (
        !outPackage.codeSystems.length &&
        !outPackage.extensions.length &&
        !outPackage.instances.length &&
        !outPackage.profiles.length &&
        !outPackage.valueSets.length
      ) {
        isObject = false;
        jsonOutput = '';
      }
    } else {
      isObject = false;
      jsonOutput = '';
    }

    props.onClick(true, jsonOutput, isObject);
  }

  return (
    <ThemeProvider theme={theme}>
      <Box className={classes.box} borderRight={1} borderLeft={1}>
        <Button className={classes.button} onClick={handleRunClick} testid="Button">
          Run
        </Button>
        <Button className={classes.secondaryButton} onClick={handleOpen}>
          Configuration
        </Button>
        <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">SUSHI Configuration Settings</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Change the configuration options to use when running SUSHI on your FSH
            </DialogContentText>
            <TextField
              id="canonical"
              margin="dense"
              fullWidth
              label="Canonical URL"
              defaultValue={canonical}
              onChange={updateCanonical}
            />
            <TextField
              id="version"
              margin="dense"
              fullWidth
              label="Version"
              defaultValue={version}
              onChange={updateVersion}
            />
            <TextField
              id="dependencies"
              disabled
              margin="dense"
              label="Dependencies"
              helperText="(Not yet supported) dependencyA#id, dependencyB#id"
              defaultValue="dependency#id"
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Done
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
