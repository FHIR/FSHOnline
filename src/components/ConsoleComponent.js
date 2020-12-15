import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  box: {
    padding: theme.spacing(2),
    color: theme.palette.common.white,
    background: theme.palette.common.black,
    height: '200%'
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

  return (
    <ThemeProvider theme={theme}>
      <Box className={classes.box} overflow="scroll">
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
