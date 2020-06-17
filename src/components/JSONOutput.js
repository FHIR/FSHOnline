import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  box: {
    padding: theme.spacing(2),
    color: theme.palette.text.primary,
    background: theme.palette.grey[400],
    width: '50%',
    height: '100%'
  }
}));

export default function JSONOutput() {
  const classes = useStyles();

  return (
    <Box className={classes.box} border={1}>
      <h4>JSON GOES HERE</h4>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse at nibh rhoncus leo tempus vulputate vel ut
        risus. Sed elementum fermentum velit, et efficitur nulla pulvinar quis. Donec nec aliquet justo. Vivamus sed
        accumsan sapien, eu tincidunt arcu. Curabitur fringilla, mi eget ultricies dictum, purus sem suscipit dolor, sit
        amet venenatis risus nibh eget ligula. Integer imperdiet in libero in suscipit. Proin tempor neque massa, ut
        auctor leo dictum vel. Sed ac porta leo.
      </p>
    </Box>
  );
}
