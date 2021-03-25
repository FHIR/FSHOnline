import React, { useState, useEffect } from 'react';
import { groupBy } from 'lodash';
import { makeStyles } from '@material-ui/core/styles';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction
} from '@material-ui/core';
import { Add, Delete, HighlightOff } from '@material-ui/icons';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import CodeMirrorComponent from './CodeMirrorComponent';

const useStyles = makeStyles((theme) => ({
  box: {
    color: theme.palette.text.primary,
    background: theme.palette.background.paper,
    height: '100%',
    noWrap: false
  },
  button: {
    textTransform: 'none',
    fontSize: '13px',
    width: '100%'
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
    paddingLeft: '19px' // width of icon
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
  const [fhirDefinitions, setFhirDefinitions] = useState([{}]);
  const { setIsOutputObject, updateTextValue: propsUpdateText } = props;
  const [currentDef, setCurrentDef] = useState(0);
  const [defsWithErrors, setDefsWithErrors] = useState([]);
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(-1);

  useEffect(() => {
    // This case represents when we receive a new Package from SUSHI
    if (props.displaySUSHI && props.text && props.isObject) {
      // Indicate that we no longer have new data we need to load so we don't come back here too early
      setIsOutputObject(false);
      const packageJSON = JSON.parse(props.text);
      const iterablePackage = getIterablePackage(packageJSON);
      setFhirDefinitions(iterablePackage);
      setCurrentDef(0);
      setInitialText(iterablePackage.length > 0 ? iterablePackage[0].def : '');
      propsUpdateText(iterablePackage); // The value of text kept on props should be the iterable and stringified package
    } else if (props.isWaiting) {
      setInitialText(null); // Reset the text to null when loading to reset the editor and display placeholder text
      setFhirDefinitions([]); // Reset FHIR definitions to clear out file tree
    }
  }, [props.displaySUSHI, props.text, props.isObject, props.isWaiting, propsUpdateText, setIsOutputObject]);

  const updateTextValue = (text) => {
    // We're waiting for a new package to load, so we don't want the editor to update yet
    if (props.isWaiting) return;

    // Update the definition we're currently editing
    const updatedDefs = [...fhirDefinitions];

    // Check if there is a JSON syntax error in the editor
    try {
      // If the editor is blank, we want to consider it an empty JSON object so that it is valid JSON
      const latestJSON = text === '' ? {} : JSON.parse(text);
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

    // This is a bit of a hack to make sure the editor can be reset by a setInitialText(null)
    if (initialText === null) {
      setInitialText(text);
    }
  };

  const addDefinition = () => {
    const updatedDefs = [...fhirDefinitions];
    updatedDefs.push({ resourceType: null, id: 'Untitled', def: null });
    setCurrentDef(updatedDefs.length - 1);
    setFhirDefinitions(updatedDefs);
    setInitialText(null);
    props.updateTextValue(updatedDefs);
  };

  const handleCloseAndDelete = (index) => {
    const updatedDefs = [...fhirDefinitions];
    updatedDefs.splice(index, 1); // Remove definition to be deleted
    if (updatedDefs.length === 0) {
      // Ensure list is not empty so there is always a definition in the file tree
      updatedDefs.push({ resourceType: null, id: 'Untitled', def: null });
    }
    setFhirDefinitions(updatedDefs);

    // If we deleted the currently viewed definition or any before it, update it
    if (index <= currentDef) {
      let newCurrentDef = 0;
      if (index < currentDef) {
        newCurrentDef = currentDef - 1;
      }
      setCurrentDef(newCurrentDef);
      const newCurrentDefText = updatedDefs.length > 0 ? updatedDefs[newCurrentDef].def : null;
      setInitialText(newCurrentDefText);
    }

    // Update error tracking
    const newErrors = [...defsWithErrors];
    if (defsWithErrors.includes(index)) {
      // If the definition had an error, remove it from the list
      newErrors.splice(defsWithErrors.indexOf(index), 1);
    }
    // Shift any indices that came after the deleted definition to properly track errors
    const shiftedErrors = newErrors.map((i) => (i < index ? i : i - 1));
    setDefsWithErrors(shiftedErrors);

    setOpenDeleteConfirmation(false);
    props.updateTextValue(updatedDefs);
  };

  const handleOpenDeleteConfirmation = (i) => {
    setOpenDeleteConfirmation(true);
    setDeleteIndex(i);
  };

  const handleCloseDeleteConfirmation = () => {
    setOpenDeleteConfirmation(false);
    setDeleteIndex(-1);
  };

  const renderDeleteModal = () => {
    const defToDelete = fhirDefinitions[deleteIndex];
    if (!defToDelete) {
      return;
    }
    const type = defToDelete.resourceType || 'Instance';
    const id = defToDelete.id || 'Untitled';
    return (
      <Dialog
        open={openDeleteConfirmation}
        onClose={handleCloseDeleteConfirmation}
        aria-labelledby="delete-confirmation-dialog"
      >
        <DialogTitle id="delete-confirmation-dialog-title">Delete FHIR definition</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the FHIR definition {type}/{id}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirmation} color="primary" autoFocus>
            Cancel
          </Button>
          <Button onClick={() => handleCloseAndDelete(deleteIndex)} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    );
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
                a.id?.toLowerCase() < b.id?.toLowerCase() ? -1 : a.id?.toLowerCase() > b.id?.toLowerCase() ? 1 : 0
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
                    {def.id || 'Untitled'}
                    <ListItemSecondaryAction>
                      <IconButton
                        className={classes.listIcon}
                        edge="end"
                        aria-label="delete"
                        data-testid={`${def.id}-delete-button`}
                        onClick={() => handleOpenDeleteConfirmation(currentIndex)}
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
          </List>
        );
      });
  };

  const displayValue = fhirDefinitions.length > 0 ? fhirDefinitions[currentDef].def : null;

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
            <Button className={classes.button} startIcon={<Add />} onClick={addDefinition}>
              Add FHIR Definition
            </Button>
            {renderFileTreeView()}
            {renderDeleteModal()}
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
}
