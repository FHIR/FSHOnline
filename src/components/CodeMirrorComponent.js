import React from 'react';
import { Box } from '@material-ui/core';
import { UnControlled as ReactCodeMirror } from 'react-codemirror2';
import { makeStyles } from '@material-ui/core/styles';
import CodeMirror from 'codemirror';
import '../style/CodeMirrorComponent.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
require('codemirror/addon/mode/simple');
require('codemirror/mode/xml/xml');
require('codemirror/mode/javascript/javascript');

// Define FSH syntax highlighting
// Regular expressions from https://github.com/standardhealth/vscode-language-fsh/blob/master/syntaxes/fsh.tmLanguage.json
CodeMirror.defineSimpleMode('fsh', {
  start: [
    // The regex matches the token, the token property contains the type
    {
      regex: /"(?:[^\\]|\\.)*?(?:"|$)/,
      token: 'atom'
    },
    {
      regex: /\b(Alias|CodeSystem|Expression|Extension|Description|Id|Instance|InstanceOf|Invariant|Mapping|Mixins|Parent|Profile|RuleSet|Severity|Source|Target|Title|Usage|ValueSet|XPath)(?=\s*:)\b/,
      token: 'keyword'
    },
    {
      // NOTE: Original regex has (?<=\s) at start and (?=\s) at the end. However, there are known shortcomings with look ahead/look behind with the simple mode approach
      regex: /\b(and|codes|contains|exclude|from|includes|is-a|is-not-a|named|obeys|only|or|system|units|valueset|where|D|MS|N|SU|TU|\\?!)\b/,
      token: 'def'
    },
    {
      regex: /(\(\s*)(exactly|example|extensible|preferred|required)(\s*\))/,
      token: 'def'
    },
    {
      regex: /\*|->|=|:/,
      token: 'def'
    },
    {
      regex: /\b(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*))\b/,
      token: 'atom'
    },
    {
      regex: /\b(true|false)\b/,
      token: 'string'
    },
    {
      regex: /#[^\s]*/,
      token: 'string'
    },
    { regex: /\/\/.*/, token: 'comment' },
    { regex: /\/\*/, token: 'comment', next: 'comment' }
  ],
  comment: [
    { regex: /.*?\*\//, token: 'comment', next: 'start' },
    { regex: /.*/, token: 'comment' }
  ]
});

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
      <ReactCodeMirror
        className="react-codemirror2"
        value={'Edit FSH here!'}
        options={{
          mode: 'fsh',
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
