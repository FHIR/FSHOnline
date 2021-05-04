import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Button, Typography, Box } from '@material-ui/core';
import { StylesProvider } from '@material-ui/core/styles';
import { ExitToApp } from '@material-ui/icons';
import '../style/TopBarStyling.css';
import logo from '../style/FSH-online-logo.png';

const useStyles = makeStyles((theme) => ({
  root: {
    background: '#30638e',
    position: 'static',
    boxShadow: '0'
  },
  title: {
    fontSize: 20,
    fontWeight: 700
  },
  logo: {
    height: '55px',
    width: '63px'
  },
  toolbarBox: {
    alignItems: 'center'
  },
  exitIcon: {
    paddingLeft: '3px',
    transform: 'scaleX(-1)'
  },
  docButton: {
    color: theme.palette.common.white,
    backgroundColor: '#30638e',
    fontSize: '0.875rem',
    fontWeight: 700,
    '&:hover': {
      background: theme.palette.success.light
    }
  },
  versionText: {
    color: theme.palette.common.white,
    fontSize: '0.8rem',
    fontStyle: 'italic',
    marginTop: '-5px'
  }
}));

export default function TopBar() {
  const classes = useStyles();
  return (
    <AppBar className={classes.root}>
      <Toolbar>
        <Box className={classes.toolbarBox} display="flex" flexGrow={1} flexDirection="row">
          <Box order={1} display="flex" flexGrow={1} flexDirection="row">
            <Box order={1} alignSelf="center">
              <img src={logo} alt="logo" className={classes.logo} />
            </Box>
            <Box order={2} alignSelf="center" m={1}>
              <StylesProvider injectFirst>
                <Typography order={1} className={classes.title}>
                  FSH ONLINE
                </Typography>
                <Typography order={2} className={classes.versionText}>
                  Powered by SUSHI v1.3.2 and GoFSH v1.1.0
                </Typography>
              </StylesProvider>
            </Box>
          </Box>
          <Box order={1}>
            <StylesProvider injectFirst>
              <Button className={classes.docButton} href="https://fshschool.org/" target="_blank">
                <ExitToApp className={classes.exitIcon} fontSize="small" />
                Back to School
              </Button>
            </StylesProvider>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
