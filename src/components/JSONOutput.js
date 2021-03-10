import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Grid } from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import CodeMirrorComponent from './CodeMirrorComponent';

const useStyles = makeStyles((theme) => ({
  box: {
    color: theme.palette.text.primary,
    background: theme.palette.background.paper,
    height: '100%',
    noWrap: false
  }
}));

const theme = createMuiTheme({
  typography: {
    fontFamily: 'Open Sans'
  }
});

const getIterablePackage = (defsPackage) => {
  return [
    ...defsPackage.profiles,
    ...defsPackage.extensions,
    ...defsPackage.instances,
    ...defsPackage.valueSets,
    ...defsPackage.codeSystems
  ];
};

export default function JSONOutput(props) {
  const classes = useStyles();
  const [fhirDefinitions, setFhirDefinitions] = useState([]);
  const { setIsOutputObject } = props;
  const [currentDef, setCurrentDef] = useState(0); // JULIA will update with file explorer

  useEffect(() => {
    // This case represents when we receive a new Package from SUSHI
    if (props.displaySUSHI && props.text && props.isObject) {
      // Indicate that we no longer have new data we need to load so we don't come back here too early
      setIsOutputObject(false);
      const packageJSON = JSON.parse(props.text);
      setFhirDefinitions(getIterablePackage(packageJSON));
    }
  }, [props.displaySUSHI, props.text, props.isObject, setIsOutputObject]);

  const updateTextValue = (text) => {
    // We're waiting for a new package to load, so we don't want the editor to update yet
    if (props.isWaiting) return;

    // Update the definition we're currently editing
    const updatedDefs = fhirDefinitions;
    try {
      updatedDefs[currentDef] = JSON.parse(text);
    } catch (e) {
      // Invalid JSON typed. Decide if/how to alert.
    }
    setFhirDefinitions(updatedDefs);
    props.updateTextValue(updatedDefs);
  };

  // TODO: need somewhere to display error content?
  const displayValue = fhirDefinitions.length ? JSON.stringify(fhirDefinitions[currentDef], null, 2) : props.text;

  return (
    <ThemeProvider theme={theme}>
      <Box className={classes.box} border={1} overflow="scroll">
        <Grid container>
          <Grid item xs={9} style={{ height: '75vh' }}>
            <CodeMirrorComponent
              value={displayValue}
              initialText={displayValue}
              updateTextValue={updateTextValue}
              mode={'application/json'}
            />
          </Grid>
          <Grid item xs={3}>
            {fhirDefinitions.map((a, i) => (
              <button key={i} onClick={() => setCurrentDef(i)}>{`${a.resourceType}/${a.id}`}</button>
            ))}
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
}
