import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Grid, List, ListItem } from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import CodeMirrorComponent from './CodeMirrorComponent';

const useStyles = makeStyles((theme) => ({
  box: {
    color: theme.palette.text.primary,
    background: theme.palette.background.paper,
    height: '100%',
    noWrap: false
  },
  list: {
    padding: 0
  },
  listItem: {
    padding: 0,
    margin: 0
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
  const [initialText, setInitialText] = useState('');
  const [fhirDefinitions, setFhirDefinitions] = useState([]);
  const { setIsOutputObject } = props;
  const [currentDef, setCurrentDef] = useState(0);

  useEffect(() => {
    // This case represents when we receive a new Package from SUSHI
    if (props.displaySUSHI && props.text && props.isObject) {
      // Indicate that we no longer have new data we need to load so we don't come back here too early
      setIsOutputObject(false);
      const packageJSON = JSON.parse(props.text);
      const iterablePackage = getIterablePackage(packageJSON);
      setFhirDefinitions(iterablePackage);
      setInitialText(iterablePackage.length > 0 ? JSON.stringify(iterablePackage[0], null, 2) : '');
    } else if (props.isWaiting) {
      // Set Loading... text
      setInitialText(props.text);
    }
  }, [props.displaySUSHI, props.text, props.isObject, props.isWaiting, setIsOutputObject]);

  const updateTextValue = (text) => {
    // We're waiting for a new package to load, so we don't want the editor to update yet
    if (props.isWaiting) return;

    // Update the definition we're currently editing
    const updatedDefs = [...fhirDefinitions];
    try {
      updatedDefs[currentDef] = JSON.parse(text);
    } catch (e) {
      // Invalid JSON typed. Decide if/how to alert.
    }
    setFhirDefinitions(updatedDefs);
    props.updateTextValue(updatedDefs);
  };

  const renderFileTreeView = () => {
    return (
      <List component="nav" className={classes.list}>
        {fhirDefinitions.map((a, i) => (
          <ListItem button key={i} className={classes.listItem} onClick={() => setCurrentDef(i)}>
            {`${a.resourceType}/${a.id}`}
          </ListItem>
        ))}
      </List>
    );
  };

  const displayValue = fhirDefinitions.length > 0 ? JSON.stringify(fhirDefinitions[currentDef], null, 2) : props.text;

  return (
    <ThemeProvider theme={theme}>
      <Box className={classes.box} border={1} overflow="scroll">
        <Grid container>
          <Grid item xs={9} style={{ height: '75vh' }}>
            <CodeMirrorComponent
              value={displayValue}
              initialText={initialText}
              updateTextValue={updateTextValue}
              mode={'application/json'}
              placeholder={'Edit and view FHIR Definitions here!'}
            />
          </Grid>
          <Grid item xs={3}>
            {renderFileTreeView()}
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
}
