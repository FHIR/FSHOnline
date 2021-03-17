import React, { useState, useEffect } from 'react';
import { groupBy } from 'lodash';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Grid, List, ListItem } from '@material-ui/core';
import { HighlightOff } from '@material-ui/icons';
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
    padding: '5px',
    fontSize: '13px'
  },
  listItemError: {
    color: 'red',
    fontWeight: 'bold',
    paddingTop: '5px',
    paddingBottom: '5px',
    margin: 0
  },
  listItemSelected: {
    background: theme.palette.action.selected,
    paddingTop: '5px',
    paddingBottom: '5px',
    margin: 0
  },
  listItem: {
    paddingTop: '5px',
    paddingBottom: '5px',
    margin: 0
  },
  listIcon: {
    fontSize: '13px',
    padding: '3px'
  },
  blankIcon: {
    width: '19px' // width of icon
  }
}));

const theme = createMuiTheme({
  typography: {
    fontFamily: 'Open Sans'
  }
});

// Flatten the package so we can render and navigate it more easily,
// but keep high level attributes we'll need accessible
const getIterablePackage = (defsPackage) => {
  const defArray = [
    ...defsPackage.profiles,
    ...defsPackage.extensions,
    ...defsPackage.instances,
    ...defsPackage.valueSets,
    ...defsPackage.codeSystems
  ];
  return defArray.map((def) => ({ resourceType: def.resourceType, id: def.id, def: JSON.stringify(def, null, 2) }));
};

export default function JSONOutput(props) {
  const classes = useStyles();
  const [initialText, setInitialText] = useState('');
  const [fhirDefinitions, setFhirDefinitions] = useState([]);
  const { setIsOutputObject } = props;
  const [currentDef, setCurrentDef] = useState(0);
  const [defsWithErrors, setDefsWithErrors] = useState([]);

  useEffect(() => {
    // This case represents when we receive a new Package from SUSHI
    if (props.displaySUSHI && props.text && props.isObject) {
      // Indicate that we no longer have new data we need to load so we don't come back here too early
      setIsOutputObject(false);
      const packageJSON = JSON.parse(props.text);
      const iterablePackage = getIterablePackage(packageJSON);
      setFhirDefinitions(iterablePackage);
      setInitialText(iterablePackage.length > 0 ? iterablePackage[0].def : '');
    }
  }, [props.displaySUSHI, props.text, props.isObject, setIsOutputObject]);

  const updateTextValue = (text) => {
    // We're waiting for a new package to load, so we don't want the editor to update yet
    if (props.isWaiting) return;

    // Update the definition we're currently editing
    const updatedDefs = [...fhirDefinitions];

    // Check if there is a JSON syntax error in the editor
    try {
      const latestJSON = JSON.parse(text);
      // If there was an error, mark it as resolved
      if (defsWithErrors.includes(currentDef)) {
        const newErrors = [...defsWithErrors];
        newErrors.splice(defsWithErrors.indexOf(currentDef), 1);
        setDefsWithErrors(newErrors);
      }

      // If it's new, set metadata (definition text is set below)
      if (!fhirDefinitions[currentDef]) {
        updatedDefs[currentDef] = {
          resourceType: latestJSON.resourceType,
          id: latestJSON.id
        };
      }

      // Update resource type if it has changed
      if (!fhirDefinitions[currentDef] || latestJSON.resourceType !== fhirDefinitions[currentDef].resourceType) {
        updatedDefs[currentDef].resourceType = latestJSON.resourceType;
      }

      // Update id if it has changed or it is new
      if (!fhirDefinitions[currentDef] || latestJSON.id !== fhirDefinitions[currentDef].id) {
        updatedDefs[currentDef].id = latestJSON.id;
      }
    } catch (e) {
      // Invalid JSON typed. Keep track of index.
      if (!defsWithErrors.includes(currentDef)) {
        const newErrors = [...defsWithErrors];
        newErrors.push(currentDef);
        setDefsWithErrors(newErrors);
      }
    }

    // Update the text - regardless if it was valid JSON
    if (updatedDefs[currentDef]) {
      updatedDefs[currentDef].def = text;
    }
    setFhirDefinitions(updatedDefs);
    props.updateTextValue(updatedDefs);
  };

  const renderFileTreeView = () => {
    const order = ['StructureDefinitions', 'ValueSets', 'CodeSystems', 'Instances'];
    const grouped = groupBy(fhirDefinitions, (val) => {
      if (['StructureDefinition', 'ValueSet', 'CodeSystem'].includes(val.resourceType)) return `${val.resourceType}s`;
      return 'Instances';
    });

    return Object.keys(grouped)
      .sort((a, b) => order.indexOf(a) - order.indexOf(b)) // Sort so we keep a defined order of types in the tree
      .map((key) => {
        return (
          <List component="nav" key={key} className={classes.list}>
            {key}
            {grouped[key]
              .sort((a, b) =>
                a.id.toLowerCase() < b.id.toLowerCase() ? -1 : a.id.toLowerCase() > b.id.toLowerCase() ? 1 : 0
              ) // Sort ids alphabetically
              .map((def, i) => {
                const currentIndex = fhirDefinitions.indexOf(def);
                const isError = defsWithErrors.includes(currentIndex);
                return (
                  <ListItem
                    button
                    key={i}
                    data-testid={`${key}-defId`}
                    className={
                      isError
                        ? classes.listItemError
                        : currentIndex === currentDef
                        ? classes.listItemSelected
                        : classes.listItem
                    }
                    onClick={() => {
                      setCurrentDef(currentIndex);
                      setInitialText(def.def);
                    }}
                  >
                    {defsWithErrors.includes(currentIndex) ? (
                      <HighlightOff className={classes.listIcon} />
                    ) : (
                      <span className={classes.blankIcon} />
                    )}
                    {def.id}
                  </ListItem>
                );
              })}
          </List>
        );
      });
  };

  const displayValue = fhirDefinitions.length > 0 ? fhirDefinitions[currentDef].def : props.text;

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
              placeholder={props.isWaiting ? 'Loading...' : 'Edit and view FHIR Definitions here!'}
            />
          </Grid>
          <Grid item xs={3} style={{ overflow: 'scroll', height: '75vh' }}>
            {renderFileTreeView()}
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
}
