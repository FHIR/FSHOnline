import React, { useState } from 'react';
import { deflateSync } from 'browserify-zlib';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import { Link, PlayArrow, Settings } from '@material-ui/icons';
import { Box, Button, CircularProgress, Grid, IconButton, TextareaAutosize, Tooltip } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { runSUSHI, runGoFSH } from '../utils/FSHHelpers';
import { sliceDependency } from '../utils/helpers';
import { generateLink } from '../utils/BitlyWorker';
import './CodeMirrorComponent';

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
    right: '0'
  },
  iconButton: {
    color: theme.palette.success.main
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
    textTransform: 'none',
    fontWeight: 'bold',
    '&:hover': {
      background: theme.palette.success.light
    }
  },
  buttonLeft: {
    float: 'right',
    marginRight: '2px'
  },
  runIcon: {
    padding: '0px'
  },
  textArea: {
    width: '100%',
    color: theme.palette.text.primary,
    fontWeight: 'bold'
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
  const [openShare, setOpenShare] = useState(false);
  const [openShareError, setOpenShareError] = useState(false);
  const [link, setLink] = useState();
  const [{ copied, copyButton }, setCopied] = useState({ copied: false, copyButton: 'Copy to Clipboard' });
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

  const handleOpenShare = async () => {
    const encoded = deflateSync(props.fshText).toString('base64');
    const longLink = `https://fshschool.org/FSHOnline/#/share/${encoded}`;
    const bitlyLink = await generateLink(longLink);
    if (bitlyLink.errorNeeded === true) {
      handleOpenShareError();
    } else {
      // Removes the encoded data from the end of the url, starting at index 15
      const bitlySlice = bitlyLink.link.slice(15);
      const displayLink = `https://fshschool.org/FSHOnline/#/share/${bitlySlice}`;
      setLink(displayLink);
      setOpenShare(true);
      setCopied({ copied: false, copyButton: 'Copy to Clipboard' });
    }
  };

  const handleOpenShareError = () => {
    setOpenShareError(true);
  };

  const handleCloseShareError = () => {
    setOpenShareError(false);
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

  async function handleSUSHIClick() {
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
              <CircularProgress className={classes.progress} />
            ) : (
              <PlayArrow className={classes.runIcon} style={{ transform: 'scaleX(-1)' }} />
            )}
            Run GoFSH
          </Button>
        </Grid>
      </Grid>

      <div className={classes.rightControls}>
        <Tooltip title="Share FSH" placement="top" arrow>
          <IconButton className={classes.iconButton} onClick={handleOpenShare}>
            <Link style={{ transform: 'rotate(-45deg)' }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Configuration" placement="top" arrow>
          <IconButton className={classes.iconButton} onClick={handleOpenConfig}>
            <Settings />
          </IconButton>
        </Tooltip>
      </div>

      <Dialog open={openConfig} onClose={handleCloseConfig} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Configuration Settings</DialogTitle>
        <DialogContent>
          <DialogContentText>Change the configuration options to use when running SUSHI and GoFSH</DialogContentText>
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
      <Dialog open={openShare} onClose={handleCloseShare} aria-labelledby="form-dialog-title" maxWidth="sm" fullWidth>
        <DialogTitle id="form-dialog-title">Share</DialogTitle>
        <DialogContent>
          <DialogContentText>Use this link to share your FSH with others!</DialogContentText>
          <TextareaAutosize
            id="link"
            disabled
            label="Your Link"
            defaultValue={link}
            onChange={updateLink}
            className={classes.textArea}
          ></TextareaAutosize>
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
      <Dialog open={openShareError} onClose={handleCloseShareError} aria-labelledby="alert-dialog-title" maxWidth="lg">
        <DialogTitle id="alert-dialog-title">Share Error</DialogTitle>
        <DialogContent>
          <DialogContentText>There was a problem sharing your FSH. Your FSH file may be too long.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseShareError} color="primary" autoFocus>
            Keep Swimming!
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
