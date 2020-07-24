import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Button, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    color: 'white',
    background: '#30638E',
    position: 'static',
    height: '50%'
  },
  docButton: {
    margin: theme.spacing(1),
    color: 'white',
    background: 'linear-gradient(45deg, #30638E 30%, #285a85 90%)',
    boxShadow: '0 3px 5px 2px #285a85'
  },
  title: {
    flexGrow: 1,
    edge: 'start'
  }
}));

export default function ButtonAppBar() {
  const classes = useStyles();
  return (
    <AppBar className={classes.root}>
      <Toolbar>
        <Typography className={classes.title} variant="h6">
          FSH Playground
        </Typography>
        <Button className={classes.docButton}>Documentation</Button>
      </Toolbar>
    </AppBar>
  );
}
