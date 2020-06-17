import React from 'react';
import { Box } from '@material-ui/core';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { makeStyles } from '@material-ui/core/styles';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
require('codemirror/mode/xml/xml');
require('codemirror/mode/javascript/javascript');

const useStyles = makeStyles((theme) => ({
  box: {
    width: '50%',
    height: '100%'
  }
}));

export default function CodeMirrorComponent() {
  const classes = useStyles();
  return (
    <Box className={classes.box} border={1}>
      <CodeMirror
        value="Edit Your FSH Here!"
        options={{
          theme: 'material',
          lineNumbers: true
        }}
        onChange={(editor, data, value) => {}}
      />
    </Box>
  );
}
