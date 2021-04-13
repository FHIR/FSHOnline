import React from 'react';
import { upperFirst } from 'lodash';
import { Box, IconButton, Tooltip } from '@material-ui/core';
import { Delete, FileCopy, Link, SaveAlt } from '@material-ui/icons';
import { UnControlled as ReactCodeMirror } from 'react-codemirror2';
import { makeStyles } from '@material-ui/core/styles';
import CodeMirror from 'codemirror';
import '../style/CodeMirrorComponent.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/addon/fold/foldgutter.css';
require('codemirror/addon/mode/simple');
require('codemirror/addon/edit/closebrackets');
require('codemirror/addon/display/placeholder');
require('codemirror/addon/comment/comment');
require('codemirror/addon/fold/foldgutter');
require('codemirror/addon/fold/brace-fold');
require('codemirror/mode/xml/xml');
require('codemirror/mode/javascript/javascript');

// Define FSH syntax highlighting
// Regular expressions from https://github.com/standardhealth/vscode-language-fsh/blob/master/syntaxes/fsh.tmLanguage.json
CodeMirror.defineSimpleMode('fsh', {
  meta: {
    lineComment: '//'
  },
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
      regex: /\b(and|codes|contains|descendent-of|exclude|exists|from|generalizes|include|in|insert|is-a|is-not-a|named|not-in|obeys|only|or|regex|system|units|valueset|where|D|MS|N|SU|TU|\\?!)\b/,
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
  },
  header: {
    fontFamily: 'Open Sans',
    color: theme.palette.common.white,
    background: '#424242', // Dark mode background
    padding: '5px',
    paddingLeft: '29px', // width of code mirror gutter
    height: '24px', // 24px + 10px of padding is total height
    lineHeight: '24px'
  },
  headerLabel: {
    float: 'left'
  },
  headerActions: {
    float: 'right'
  },
  iconButton: {
    color: theme.palette.common.white,
    padding: '3px'
  }
}));

export default function CodeMirrorComponent(props) {
  const classes = useStyles();

  //Updates both the text state with the codemirror value
  function updateText(text) {
    props.updateTextValue(text);
  }

  const renderActionIcon = (Icon, label, onClick, style = {}) => {
    return (
      <Tooltip title={upperFirst(label)} placement="top" arrow>
        <IconButton className={classes.iconButton} aria-label={label} onClick={onClick}>
          <Icon fontSize="small" style={style} />
        </IconButton>
      </Tooltip>
    );
  };

  const renderActionIcons = () => {
    return (
      <div className={classes.headerActions}>
        {props.mode === 'fsh' && renderActionIcon(Link, 'share', () => {}, { transform: 'rotate(-45deg)' })}
        {renderActionIcon(FileCopy, 'copy', () => {})}
        {renderActionIcon(SaveAlt, 'save', () => {})}
        {renderActionIcon(Delete, 'delete', () => {})}
      </div>
    );
  };

  return (
    <Box className={classes.box}>
      <div className={classes.header}>
        <div className={classes.headerLabel}>{props.name}</div>
        {renderActionIcons()}
      </div>
      <ReactCodeMirror
        className="react-codemirror2"
        value={props.initialText}
        options={{
          mode: props.mode,
          theme: 'material',
          placeholder: props.placeholder,
          autoCloseBrackets: true,
          lineNumbers: true,
          foldGutter: true,
          gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
          extraKeys: {
            'Ctrl-/': 'toggleComment',
            'Cmd-/': 'toggleComment',
            'Ctrl-Q': (cm) => {
              cm.foldCode(cm.getCursor());
            }
          }
        }}
        onChange={(editor, data, value) => {
          updateText(value);
        }}
      />
    </Box>
  );
}
