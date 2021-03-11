import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import ReactJson from 'react-json-view';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  box: {
    padding: theme.spacing(0.2, 2),
    color: theme.palette.text.primary,
    background: theme.palette.background.paper,
    height: '100%',
    boxSizing: 'border-box',
    noWrap: false
  }
}));

const theme = createMuiTheme({
  typography: {
    fontFamily: 'Open Sans'
  }
});

const renderErrorAndWarningContent = (errorsAndWarnings = []) => {
  if (errorsAndWarnings.length > 0) {
    return (
      <ThemeProvider theme={theme}>
        <span>
          <Typography variant="subtitle2">Errors and Warnings</Typography>
          {errorsAndWarnings.map((message, i) => (
            <pre key={i}>{message}</pre>
          ))}
        </span>
      </ThemeProvider>
    );
  }
  return;
};

const renderDisplayContent = (displaySUSHI, text, isObject) => {
  if (displaySUSHI && text && isObject) {
    const packageJSON = JSON.parse(text);
    return (
      <ThemeProvider theme={theme}>
        <span>
          <Typography variant="subtitle2">Results</Typography>
          <ReactJson src={packageJSON} displayDataTypes={false} collapsed={false} name={false} />
        </span>
      </ThemeProvider>
    );
  } else if (displaySUSHI && text) {
    return <pre>{text}</pre>;
  }
  return '';
};

export default function JSONOutput(props) {
  const classes = useStyles();
  const errorAndWarningContent = renderErrorAndWarningContent(props.errorsAndWarnings);
  const displayContent = renderDisplayContent(props.displaySUSHI, props.text, props.isObject);

  return (
    <ThemeProvider theme={theme}>
      <Box className={classes.box} border={1} overflow="scroll">
        <Typography variant="subtitle1">SUSHI Output</Typography>
        {errorAndWarningContent}
        {displayContent}
      </Box>
    </ThemeProvider>
  );
}
