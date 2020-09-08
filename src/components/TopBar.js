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
    textTransform: 'none',
    fontWeight: 'bold'
  },
  title: {
    flexGrow: 1,
    edge: 'start',
    fontWeight: 'bold'
  }
}));

export default function TopBar() {
  const classes = useStyles();
  return (
    <AppBar className={classes.root}>
      <Toolbar>
        <Typography className={classes.title} variant="h6">
          FSH Online
        </Typography>
        <Button className={classes.docButton} href="https://fshschool.org/" target="_blank">
          Documentation
        </Button>
      </Toolbar>
    </AppBar>
  );
}
