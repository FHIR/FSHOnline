import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Button } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import WarningIcon from '@material-ui/icons/Warning';
import ErrorIcon from '@material-ui/icons/Error';
import CheckIcon from '@material-ui/icons/Check';

const useStyles = makeStyles((theme) => ({
  consoleControls: {
    background: '#191919',
    height: '34px',
    boxSizing: 'border-box',
    display: 'flex;',
    alignItems: 'center',
    justifyContent: 'left'
  },
  box: {
    paddingLeft: '29px', // Same padding as header of code mirror
    color: theme.palette.common.white,
    background: '#191919',
    height: 'calc(100% - 34px)',
    overflow: 'scroll',
    boxSizing: 'border-box'
  },
  button: {
    padding: 0,
    color: theme.palette.common.white,
    textTransform: 'none'
  },
  expandIcon: {
    width: '29px' // Lines up with padding
  },
  warning: {
    paddingRight: '5px',
    paddingLeft: '20px',
    color: 'khaki'
  },
  error: {
    paddingRight: '5px',
    paddingLeft: '20px',
    color: 'red'
  },
  success: {
    paddingRight: '5px',
    paddingLeft: '20px',
    color: 'green'
  },
  pre: {
    margin: '0px'
  }
}));

export default function Console(props) {
  const classes = useStyles();

  const toggleExpandConsole = () => {
    props.setExpandConsole(!props.expandConsole);
  };

  return (
    <>
      <Box className={classes.consoleControls}>
        <Button onClick={toggleExpandConsole} className={classes.button}>
          {props.expandConsole ? (
            <ExpandMore className={classes.expandIcon} />
          ) : (
            <ExpandLess className={classes.expandIcon} />
          )}
          Console
          <WarningIcon style={{ display: props.warningCount ? 'block' : 'none' }} className={classes.warning} />
          {props.warningCount ? `${props.warningCount}` : ''}
          <ErrorIcon style={{ display: props.errorCount ? 'block' : 'none' }} className={classes.error} />
          {props.errorCount ? `${props.errorCount}` : ''}
          <CheckIcon
            className={classes.success}
            style={{
              display: props.consoleMessages.length > 0 && !props.warningCount && !props.errorCount ? 'block' : 'none'
            }}
          />
          {props.consoleMessages.length > 0 && !props.warningCount && !props.errorCount ? `Success!` : ''}
        </Button>
      </Box>
      <Box style={{ display: props.expandConsole ? 'block' : 'none' }} className={classes.box}>
        {props.consoleMessages.map((message, i) => {
          return (
            <pre key={i} className={classes.pre}>
              {message}
            </pre>
          );
        })}
      </Box>
    </>
  );
}
