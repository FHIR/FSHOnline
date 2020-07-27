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

  //Updates both the text state with the codemirror value
  function updateText(text) {
    props.updateTextValue(text);
  }
  return (
    <Box className={classes.box}>
      <CodeMirror
        className="react-codemirror2"
        value={'Edit FSH here!'}
        options={{
          theme: 'material',
          lineNumbers: true
        }}
        onChange={(editor, data, value) => {
          updateText(value);
        }}
      />
    </Box>
  );
}
