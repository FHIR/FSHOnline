import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Button, Typography } from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import ImportExportIcon from '@material-ui/icons/ImportExport';
import WarningIcon from '@material-ui/icons/Warning';
import ErrorIcon from '@material-ui/icons/Error';

const useStyles = makeStyles((theme) => ({
  consoleControls: {
    padding: theme.spacing(1),
    background: '#C0C0C0',
    height: '1vh',
    display: 'flex;',
    alignItems: 'center',
    justifyContent: 'left'
  },
  box: {
    padding: theme.spacing(2),
    color: theme.palette.common.white,
    background: theme.palette.common.black
  },
  warning: {
    color: 'khaki'
  },
  error: {
    color: 'red'
  },
  pre: {
    margin: '0px'
  }
}));

const theme = createMuiTheme({
  typography: {
    fontFamily: 'Open Sans'
  }
});

export default function Console(props) {
  const classes = useStyles();

  const toggleExpandConsole = () => {
    props.setExpandConsole(!props.expandConsole);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        className={classes.consoleControls}
        style={{ borderBottom: !props.expandConsole ? '5px solid #2c4f85' : '' }}
      >
        <Button onClick={toggleExpandConsole}>
          {props.expandConsole ? 'Collapse Console   ' : 'Expand Console   '}
          <ImportExportIcon />
          <WarningIcon className={classes.warning} />
          {props.warningCount} Warnings
          <ErrorIcon className={classes.error} />
          {props.errorCount} Errors
        </Button>
      </Box>
      <Box
        style={{ display: props.expandConsole ? 'block' : 'none', height: '28vh', borderBottom: '2px solid black' }}
        className={classes.box}
        overflow="scroll"
      >
        <Typography variant="subtitle1">Console</Typography>
        {props.consoleMessages.map((message, i) => {
          return (
            <pre key={i} className={classes.pre}>
              {message}
            </pre>
          );
        })}
      </Box>
    </ThemeProvider>
  );
}
