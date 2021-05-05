import React, { useState } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import { PlayArrow, Settings } from '@material-ui/icons';
import { Box, Button, CircularProgress, Grid } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { runSUSHI, runGoFSH } from '../utils/FSHHelpers';
import { sliceDependency } from '../utils/helpers';

const useStyles = makeStyles((theme) => ({
  box: {
    padding: theme.spacing(1),
    color: theme.palette.text.primary,
    background: theme.palette.background.paper,
    display: 'flex;',
    alignItems: 'center',
    justifyContent: 'center'
  },
  rightControls: {
    position: 'absolute',
    right: '24px'
  },
  secondaryButton: {
    color: theme.palette.success.main,
    '&:hover': {
      background: theme.palette.common.lighterBlue
    }
  },
  progressContainer: {
    width: '24px',
    height: '24px'
  },
  progress: {
    height: '1em !important',
    width: '1em !important',
    verticalAlign: 'middle',
    color: theme.palette.common.white
  },
  button: {
    color: theme.palette.common.white,
    background: theme.palette.success.main,
    borderRadius: '0',
    paddingRight: '15px',
    paddingLeft: '15px',
    '&:hover': {
      background: theme.palette.success.dark
    }
  },
  buttonLeft: {
    float: 'right',
    marginRight: '2px'
  },
  runIcon: {
    padding: '0px'
  }
}));

function replacer(key, value) {
  if (key === 'config') {
    return undefined;
  }
  return value;
}

export default function FSHControls(props) {
  const classes = useStyles();
  const [openConfig, setOpenConfig] = useState(false);
  const [canonical, setCanonical] = useState('');
  const [version, setVersion] = useState('');
  const [dependencies, setDependencies] = useState('');
  const [isSUSHIRunning, setIsSUSHIRunning] = useState(false);
  const [isGoFSHRunning, setIsGoFSHRunning] = useState(false);

  const handleOpenConfig = () => {
    setOpenConfig(true);
  };

  const handleCloseConfig = () => {
    setOpenConfig(false);
  };

  const updateCanonical = (event) => {
    const newCanonical = event.target.value;
    setCanonical(newCanonical);
  };

  const updateVersion = (event) => {
    const newVersion = event.target.value;
    setVersion(newVersion);
  };

  const updateDependencyString = (event) => {
    const dependencyString = event.target.value;
    setDependencies(dependencyString);
  };

  async function handleSUSHIClick() {
    if (props.isWaiting) {
      // If SUSHI or GoFSH is in the middle of processes, don't do anything
      return;
    }

    props.resetLogMessages();
    props.onSUSHIClick(true, [''], true);
    setIsSUSHIRunning(true);
    const dependencyArr = sliceDependency(dependencies);
    const config = {
      canonical: canonical ? canonical : 'http://example.org',
      version: version ? version : '1.0.0',
      FSHOnly: true,
      fhirVersion: ['4.0.1']
    };
    const outPackage = await runSUSHI(props.fshText, config, dependencyArr);
    let jsonOutput = JSON.stringify(outPackage, replacer, 2);
    if (outPackage && outPackage.codeSystems) {
      if (
        !outPackage.codeSystems.length &&
        !outPackage.extensions.length &&
        !outPackage.instances.length &&
        !outPackage.profiles.length &&
        !outPackage.valueSets.length
      ) {
        jsonOutput = [''];
      }
    } else {
      jsonOutput = [''];
    }

    props.onSUSHIClick(true, jsonOutput, false);
    setIsSUSHIRunning(false);
  }

  async function handleGoFSHClick() {
    if (props.isWaiting) {
      // If SUSHI or GoFSH is in the middle of processes, don't do anything
      return;
    }

    props.resetLogMessages();
    props.onGoFSHClick('', true);
    setIsGoFSHRunning(true);
    const gofshInputStrings = props.gofshText.map((def) => def.def).filter((d) => d);
    const parsedDependencies = dependencies === '' ? [] : dependencies.split(',');

    // Create small ImplementationGuide resource to send canonical and version information
    if (canonical || version) {
      const igResource = {
        resourceType: 'ImplementationGuide',
        fhirVersion: ['4.0.1'],
        id: '1',
        ...(canonical && { url: `${canonical}/ImplementationGuide/1` }),
        ...(version && { version: version })
      };
      gofshInputStrings.push(JSON.stringify(igResource, null, 2));
    }

    const options = { dependencies: parsedDependencies };
    const { fsh, config } = await runGoFSH(gofshInputStrings, options);
    props.onGoFSHClick(fsh, false);
    setIsGoFSHRunning(false);
    if (canonical === '' && config.canonical) setCanonical(config.canonical);
    if (version === '' && config.version) setVersion(config.version);
  }

  return (
    <Box className={classes.box}>
      <Grid container>
        <Grid item xs={5}>
          <Button className={clsx(classes.button, classes.buttonLeft)} onClick={handleSUSHIClick} testid="Button">
            Run SUSHI
            {isSUSHIRunning ? (
              <div className={classes.progressContainer}>
                <CircularProgress className={classes.progress} />
              </div>
            ) : (
              <PlayArrow className={classes.runIcon} />
            )}
          </Button>
        </Grid>
        <Grid item xs={7}>
          <Button className={classes.button} onClick={handleGoFSHClick} testid="GoFSH-button">
            {isGoFSHRunning ? (
              <div className={classes.progressContainer}>
                <CircularProgress className={classes.progress} />
              </div>
            ) : (
              <PlayArrow className={classes.runIcon} style={{ transform: 'scaleX(-1)' }} />
            )}
            Run GoFSH
          </Button>
        </Grid>
      </Grid>

      <div className={classes.rightControls}>
        <Button name="Configuration" className={classes.secondaryButton} onClick={handleOpenConfig}>
          <Settings /> Configuration
        </Button>
      </div>

      <Dialog open={openConfig} onClose={handleCloseConfig} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Configuration Settings</DialogTitle>
        <DialogContent>
          <DialogContentText>Change the configuration options to use with SUSHI and GoFSH</DialogContentText>
          <TextField
            id="canonical"
            margin="dense"
            fullWidth
            label="Canonical URL"
            helperText="Default: http://example.org"
            defaultValue={canonical}
            onChange={updateCanonical}
          />
          <TextField
            id="version"
            margin="dense"
            fullWidth
            label="Version"
            helperText="Default: 1.0.0"
            defaultValue={version}
            onChange={updateVersion}
          />
          <TextField
            id="dependencies"
            margin="dense"
            fullWidth
            label="Dependencies"
            helperText="Format: packageId#version, packageId#version (e.g., hl7.fhir.us.core#3.1.1)"
            defaultValue={dependencies}
            onChange={updateDependencyString}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfig} color="primary">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
