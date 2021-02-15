import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Button, Typography, ThemeProvider, Box } from '@material-ui/core';
import { createMuiTheme, StylesProvider } from '@material-ui/core/styles';
import '../style/TopBarStyling.css';

const useStyles = makeStyles((theme) => ({
  root: {
    background: '#2c4f85',
    position: 'static',
    height: '50%',
    boxShadow: '0'
  },
  title: {
    fontSize: 20,
    marginLeft: theme.spacing(-1.2),
    padding: 2,
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
          <Box display="flex" flexGrow={1} flexDirection="row">
            <Box order={1} display="flex" flexGrow={1} flexDirection="row">
              <Box order={1} alignSelf="center">
                <Typography className={classes.title}>FSH ONLINE</Typography>
              </Box>
              <Box order={2} alignSelf="center" m={1}>
                <ThemeProvider theme={theme}>
                  <StylesProvider injectFirst>
                    <Typography order={2} classes={{ root: 'versionText' }}>
                      Powered by SUSHI v1.2.0
                    </Typography>
                  </StylesProvider>
                </ThemeProvider>
              </Box>
            </Box>
            <Box order={2}>
              <ThemeProvider theme={theme}>
                <StylesProvider injectFirst>
                  <Button classes={{ root: 'docButton' }} href="https://fshschool.org/" target="_blank">
                    Back to School
                  </Button>
                </StylesProvider>
              </ThemeProvider>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}
