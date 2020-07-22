import React from 'react';
import { Box } from '@material-ui/core';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { makeStyles } from '@material-ui/core/styles';
import '../style/CodeMirrorComponent.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
require('codemirror/mode/xml/xml');
require('codemirror/mode/javascript/javascript');

const useStyles = makeStyles((theme) => ({
  box: {
    height: '100%'
  }
}));

export default function CodeMirrorComponent(props) {
  const classes = useStyles();

  //Updates both the text state with the codemirror value, and sets the doRunSUSHI back to false
  function updateTextAndRun(text) {
    props.updateTextValue(text);
    props.updateDoRunSUSHI(false);
  }
  return (
    <Box className={classes.box}>
      <CodeMirror
        className="react-codemirror2"
        value={props.value}
        options={{
          theme: 'material',
          lineNumbers: true
        }}
        onChange={(editor, data, value) => {
          updateTextAndRun(value);
        }}
      />
    </Box>
  );
}
