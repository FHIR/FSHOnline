import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Button } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  consoleControls: {
    background: theme.palette.common.darkestGrey,
    height: '34px',
    boxSizing: 'border-box',
    display: 'flex;',
    alignItems: 'center',
    justifyContent: 'left'
  },
  box: {
    paddingLeft: '29px', // Same padding as header of code mirror
    color: theme.palette.common.white,
    background: theme.palette.common.darkestGrey,
    height: 'calc(100% - 34px)',
    overflow: 'scroll',
    boxSizing: 'border-box'
  },
  button: {
    marginRight: '20px',
    color: theme.palette.common.white,
    textTransform: 'none'
  },
  problemsButton: {
    padding: 0,
    color: theme.palette.common.white,
    textTransform: 'none'
  },
  expandIcon: {
    width: '29px' // Lines up with padding
  },
  pre: {
    margin: '0px'
  },
  circle: {
    'border-radius': '50%',
    'min-width': '22px',
    height: '22px',
    paddingLeft: 1,
    paddingRight: 1,
    background: '#21121d',
    'align-items': 'center',
    display: 'flex',
    marginLeft: 4,
    'justify-content': 'center'
  }
}));

export default function Console(props) {
  const classes = useStyles();
  const [problemsView, setProblemsView] = useState(false);

  const toggleExpandConsole = () => {
    if (props.expandConsole && problemsView) {
      setProblemsView(false);
    } else {
      props.setExpandConsole(!props.expandConsole);
      setProblemsView(false);
    }
  };

  const toggleProblemsConsole = () => {
    if (props.expandConsole && !problemsView) {
      setProblemsView(true);
    } else {
      setProblemsView(!problemsView);
      props.setExpandConsole(!props.expandConsole);
    }
  };

  return (
    <>
      <Box className={classes.consoleControls}>
        <Button
          onClick={toggleExpandConsole}
          className={classes.button}
          style={{
            'text-decoration': props.expandConsole && !problemsView ? 'underline' : 'none'
          }}
        >
          {props.expandConsole ? (
            <ExpandMore className={classes.expandIcon} />
          ) : (
            <ExpandLess className={classes.expandIcon} />
          )}
          Console
        </Button>
        {props.problemMessages.length > 0 && (
          <Button onClick={toggleProblemsConsole} className={classes.problemsButton}>
            <p
              style={{
                'text-decoration': props.expandConsole && problemsView ? 'underline' : 'none',
                margin: '0'
              }}
            >
              Problems
            </p>
            <div className={classes.circle}>{props.problemCount}</div>
          </Button>
        )}
      </Box>
      <Box style={{ display: props.expandConsole ? 'block' : 'none' }} className={classes.box}>
        {problemsView
          ? props.problemMessages.map((message, i) => {
              return (
                <pre key={i} className={classes.pre}>
                  {message}
                </pre>
              );
            })
          : props.consoleMessages.map((message, i) => {
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
