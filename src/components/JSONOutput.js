import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import ReactJson from 'react-json-view';

const useStyles = makeStyles((theme) => ({
  box: {
    padding: theme.spacing(0, 2),
    color: theme.palette.text.primary,
    background: theme.palette.grey[400],
    height: '100%',
    noWrap: false
  }
}));

const renderErrorAndWarningContent = (errorsAndWarnings = []) => {
  if (errorsAndWarnings.length > 0) {
    return (
      <span>
        <h4>Errors and Warnings</h4>
        {errorsAndWarnings.map((message, i) => (
          <pre key={i}>{message}</pre>
        ))}
      </span>
    );
  }
  return;
};

const renderDisplayContent = (displaySUSHI, text, isObject) => {
  if (displaySUSHI && text && isObject) {
    const packageJSON = JSON.parse(text);
    return (
      <span>
        <h4>Results</h4>
        <ReactJson src={packageJSON} displayDataTypes={false} collapsed={false} name={false} />
      </span>
    );
  } else if (displaySUSHI && text) {
    return <pre>{text}</pre>;
  }
  return '';
};

export default function JSONOutput(props) {
  const classes = useStyles();
  const errorAndWarningContent = renderErrorAndWarningContent(props.errorsAndWarnings);
  const displayContent = renderDisplayContent(props.displaySUSHI, props.text, props.isObject);

  return (
    <Box className={classes.box} border={1} overflow="scroll">
      <h3>SUSHI Output</h3>
      {errorAndWarningContent}
      {displayContent}
    </Box>
  );
}
