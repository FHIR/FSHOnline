import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Button, Typography, ThemeProvider } from '@material-ui/core';
import { createMuiTheme, StylesProvider } from '@material-ui/core/styles';
import '../style/ButtonComponents.css';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    background: '#2c4f85',
    position: 'static',
    height: '50%',
    boxShadow: '0'
  },
  title: {
    fontSize: 20,
    flexGrow: 1,
    marginLeft: theme.spacing(-1),
    edge: 'start',
    fontWeight: 700
  }
}));

const theme = createMuiTheme({
  typography: {
    fontFamily: 'Open Sans'
  }
});

export default function TopBar() {
  const classes = useStyles();
  return (
    <ThemeProvider theme={theme}>
      <AppBar className={classes.root}>
        <Toolbar>
          <Typography className={classes.title}>FSH ONLINE</Typography>
          <ThemeProvider theme={theme}>
            <StylesProvider injectFirst>
              <Button classes={{ root: 'docButton' }} href="https://fshschool.org/" target="_blank">
                Back to School
              </Button>
            </StylesProvider>
          </ThemeProvider>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}
