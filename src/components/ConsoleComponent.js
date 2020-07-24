import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  box: {
    padding: theme.spacing(2),
    color: theme.palette.common.white,
    background: theme.palette.common.black,
    height: '200%',
    fontFamily: 'Consolas'
  }
}));

const log = console.log; //eslint-disable-line no-unused-vars
let msgArray = [];
console.log = function getMessages(message) {
  msgArray.push(message);
};

export default function Console() {
  const classes = useStyles();

  return (
    <Box className={classes.box} overflow="scroll">
      <h3>Console</h3>
      {msgArray.map((msg, i) => {
        return <p key={i}>{msg}</p>;
      })}
    </Box>
  );
}
