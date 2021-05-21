import React, { useState } from 'react';
// import { Link as RouterLink } from 'react-router-dom';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import { PlayArrow, Settings } from '@material-ui/icons';
import { Box, Button, CircularProgress, Grid, IconButton, Tooltip } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { runSUSHI, runGoFSH } from '../utils/FSHHelpers';
import { sliceDependency } from '../utils/helpers';
import { TreeView, TreeItem } from '@material-ui/lab';
import CodeMirrorComponent from './CodeMirrorComponent';

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
  link: {
    color: '#2c4f85',
    fontWeight: 'bold',
    '&:hover': {
      color: '#526580'
    },
    fontSize: 14
  },
  dialogPaper: {
    maxHeight: '100vh',
    minHeight: '47vh'
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
  const [openExamples, setOpenExamples] = useState(false);
  const [openConfig, setOpenConfig] = useState(false);
  const [canonical, setCanonical] = useState('');
  const [version, setVersion] = useState('');
  const [dependencies, setDependencies] = useState('');
  const [isSUSHIRunning, setIsSUSHIRunning] = useState(false);
  const [isGoFSHRunning, setIsGoFSHRunning] = useState(false);
  const [isFetchingExample, setIsFetchingExample] = useState(false);
  const [currentExample, setCurrentExample] = useState('');

  const handleOpenExamples = () => {
    setOpenExamples(true);
  };

  const handleCloseExamples = () => {
    setOpenExamples(false);
  };

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

  async function fetchFSH(event, value) {
    if (!value.endsWith('.fsh')) return;
    setIsFetchingExample(true);
    const utf8Decoder = new TextDecoder('utf-8');
    let responseReader = await fetch(props.exampleFilePaths[value]).then((response) => response.body.getReader());
    let fshString = '';
    const { value: chunk } = await responseReader.read();
    fshString += utf8Decoder.decode(chunk);
    setIsFetchingExample(false);
    setCurrentExample(fshString);
  }

  function updateExampleValue(text) {
    setCurrentExample(text);
  }

  const renderTree = (nodes) => (
    <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.name}>
      {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
    </TreeItem>
  );

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
        <Button className={classes.button} onClick={handleOpenExamples}>
          Examples
        </Button>
        <Tooltip title="Configuration" placement="top" arrow>
          <IconButton name="Configuration" className={classes.iconButton} onClick={handleOpenConfig}>
            <Settings />
          </IconButton>
        </Tooltip>
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
      <Dialog
        open={openExamples}
        onClose={handleCloseExamples}
        aria-labelledby="form-dialog-title"
        maxWidth="lg"
        fullWidth
        scroll="paper"
        classes={{ paper: classes.dialogPaper }}
      >
        <DialogTitle id="form-dialog-title">Examples</DialogTitle>
        <DialogContent>
          <DialogContentText>Use our pre-created examples to learn FSH and get swimming!</DialogContentText>
          <Grid container>
            <Grid item xs={4}>
              <TreeView
                className={classes.root}
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpanded={['root']}
                defaultExpandIcon={<ChevronRightIcon />}
                onNodeSelect={fetchFSH}
              >
                {renderTree(props.exampleConfig)}
              </TreeView>
            </Grid>
            <Grid item xs={8}>
              <CodeMirrorComponent
                name={'Example'}
                value={currentExample}
                initialText={currentExample}
                updateTextValue={updateExampleValue}
                mode={'fsh'}
                placeholder={isFetchingExample ? 'Fetching example...' : 'Select an example'}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseExamples} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
