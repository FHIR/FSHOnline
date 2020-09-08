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
    fontFamily: 'Consolas',
    noWrap: false
  }
}));

const renderErrorMessage = (errors = []) => {
  if (errors.length > 0) {
    return (
      <span>
        <h4>Errors</h4>
        {errors.map((error, i) => (
          <pre key={i}>{error}</pre>
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
  const errorContent = renderErrorMessage(props.errors);
  const displayContent = renderDisplayContent(props.displaySUSHI, props.text, props.isObject);

  return (
    <Box className={classes.box} border={1} overflow="scroll">
      <h3>SUSHI Output</h3>
      {errorContent}
      {displayContent}
    </Box>
  );
}
