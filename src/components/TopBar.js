import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Button, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    color: theme.palette.text.primary,
    background: theme.palette.warning.dark,
    position: 'static'
  },
  docButton: {
    margin: theme.spacing(2)
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
        <Button className={classes.docButton} variant="outlined">
          Documentation
        </Button>
      </Toolbar>
    </AppBar>
  );
}
