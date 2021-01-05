import React, { useState } from 'react';
import { makeStyles, createMuiTheme } from '@material-ui/core/styles';
import { Box, Button, TextareaAutosize, ThemeProvider } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { runSUSHI } from '../utils/RunSUSHI';
import { generateLink } from '../utils/GenerateLink';
import './CodeMirrorComponent';

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
  },
  textArea: {
    width: '100%'
  }
}));

const theme = createMuiTheme({
  typography: {
    fontFamily: 'Open Sans'
  },
  palette: {
    secondary: {
      main: '#357a38'
    }
  }
});

function replacer(key, value) {
  if (key === 'config') {
    return undefined;
  }
  return value;
}

export function sliceDependency(dependencies) {
  let returnArr = [];
  const arr = dependencies.split(',');
  for (let i = 0; i < arr.length; i++) {
    arr[i] = arr[i].trim();
    if (arr[i] === '') {
      continue;
    }
    let singleDep = arr[i].split('#');
    returnArr.push([singleDep[0], singleDep[1]]);
  }
  return returnArr;
}

export default function SUSHIControls(props) {
  const classes = useStyles();
  const [openConfig, setOpenConfig] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const [link, setLink] = useState();
  const [{ copied, copyButton }, setCopied] = useState({ copied: false, copyButton: 'Copy to Clipboard' });
  const [canonical, setCanonical] = useState('http://example.org');
  const [version, setVersion] = useState('1.0.0');
  const [dependencies, setDependencies] = useState('');

  const handleOpenConfig = () => {
    setOpenConfig(true);
  };

  const handleCloseConfig = () => {
    setOpenConfig(false);
  };

  const handleOpenShare = async () => {
    const encoded = new Buffer.from(props.text).toString('base64');
    const longLink = `https://fshschool.org/FSHOnline/${encoded}`;
    const shareLink = await generateLink(longLink);
    setLink(shareLink);
    setOpenShare(true);
    setCopied({ copied: false, copyButton: 'Copy to Clipboard' });
  };

  const handleCloseShare = () => {
    setOpenShare(false);
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

  const updateLink = (event) => {
    const newLink = event.target.value;
    setLink(newLink);
  };

  //Sets the doRunSUSHI to true
  async function handleRunClick() {
    props.resetLogMessages();
    props.onClick(true, 'Loading...', false);
    let isObject = true;
    const dependencyArr = sliceDependency(dependencies);
    const config = { canonical, version, FSHOnly: true, fhirVersion: ['4.0.1'] };
    const outPackage = await runSUSHI(props.text, config, dependencyArr);
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
      <Box className={classes.box} borderLeft={1} borderRight={1}>
        <Button className={classes.button} onClick={handleRunClick} testid="Button">
          Run
        </Button>
        <Button className={classes.secondaryButton} onClick={handleOpenConfig}>
          Configuration
        </Button>
        <Button className={classes.secondaryButton} onClick={handleOpenShare}>
          Share
        </Button>
        <Dialog open={openConfig} onClose={handleCloseConfig} aria-labelledby="form-dialog-title">
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
              margin="dense"
              fullWidth
              label="Dependencies"
              helperText="dependencyID#version, dependencyID#version"
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
        <Dialog open={openShare} onClose={handleCloseShare} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Share</DialogTitle>
          <DialogContent>
            <DialogContentText>Use this link to share your fsh with others!</DialogContentText>
            <div>
              <TextareaAutosize
                id="link"
                disabled
                margin="dense"
                label="Your Link"
                defaultValue={link}
                onChange={updateLink}
                className={classes.textArea}
              ></TextareaAutosize>
            </div>
          </DialogContent>
          <DialogActions>
            <CopyToClipboard text={link} onCopy={() => setCopied({ copied: true, copyButton: 'Link Copied' })}>
              <Button color={copied ? 'secondary' : 'primary'}>{copyButton}</Button>
            </CopyToClipboard>
            <Button onClick={handleCloseShare} color="primary">
              Done
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
