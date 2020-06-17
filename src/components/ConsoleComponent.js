import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  box: {
    padding: theme.spacing(2),
    color: theme.palette.common.white,
    background: theme.palette.common.black,
    height: '100%',
    width: '100%'
  }
}));

export default function Console() {
  const classes = useStyles();
  return (
    <Box className={classes.box} border={1}>
      <h1>Console is here</h1>
    </Box>
  );
}
