import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Button, Typography, ThemeProvider } from '@material-ui/core';
import { createMuiTheme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    color: 'white',
    background: '#30638E',
    position: 'static',
    height: '50%',
    boxShadow: '0'
  },
  docButton: {
    margin: theme.spacing(1),
    color: 'white',
    textTransform: 'none',
    fontWeight: 700
  },
  title: {
    fontSize: 20,
    flexGrow: 1,
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
          <Button className={classes.docButton} href="https://fshschool.org/" target="_blank">
            Documentation
          </Button>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}
