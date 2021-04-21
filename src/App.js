import React, { createContext, useState, useEffect } from 'react';
import { inflateSync } from 'browserify-zlib';
import { createMuiTheme, makeStyles } from '@material-ui/core/styles';
import { Grid, ThemeProvider } from '@material-ui/core';
import { expandLink } from './utils/BitlyWorker';
import TopBar from './components/TopBar';
import JSONOutput from './components/JSONOutput';
import FSHOutput from './components/FSHOutput';
import ConsoleComponent from './components/ConsoleComponent';
import FSHControls from './components/FSHControls';

const useStyles = makeStyles((theme) => ({
  container: {
    height: '100%',
    flexGrow: 1
  },
  fullHeightGrid: {
    height: '100%'
  },
  collapsedMain: {
    width: '100%',
    height: 'calc(100vh - 116px - 300px)'
  },
  expandedMain: {
    width: '100%',
    height: 'calc(100vh - 116px - 34px)'
  },
  collapsedConsole: {
    height: '25px',
    width: '100%'
  },
  expandedConsole: {
    height: '300px',
    width: '100%'
  },
  top: {
    height: '116px'
  }
}));

const theme = createMuiTheme({
  palette: {
    success: {
      main: '#057AAD'
    }
  },
  typography: {
    fontFamily: 'Open Sans'
  },
  overrides: {
    MuiTooltip: {
      tooltip: {
        backgroundColor: 'rgba(97, 97, 97, 1)'
      }
    }
  }
});

const log = console.log; //eslint-disable-line no-unused-vars
let consoleMessages = [];
let errorString = '';
let warningString = '';
let errorCount = 0;
let warningCount = 0;
console.log = function getMessages(message) {
  consoleMessages.push(message);
  if (message && (message.startsWith('error') || message.startsWith('warn'))) {
    if (message.startsWith('error')) errorCount++;
    else warningCount++;
  }
  if (errorCount > 0) {
    errorString = `${errorCount} Error`;
    if (errorCount !== 1) errorString += 's';
  }
  if (warningCount > 0) {
    warningString = `${warningCount} Warning`;
    if (warningCount !== 1) warningString += 's';
  }
};

export async function decodeFSH(encodedFSH) {
  if (encodedFSH.text === undefined) {
    return '';
  } else {
    const promisedURL = await expandLink(encodedFSH);

    // Removes the encoded data from the end of the url, starting at index 38
    const sliced64 = promisedURL.long_url.slice(40);
    if (!promisedURL.long_url.includes('https://fshschool.org/FSHOnline/#/share/') || sliced64.length === 0) {
      return '';
    } else {
      const displayText = inflateSync(Buffer.from(sliced64, 'base64')).toString('utf-8');
      return displayText;
    }
  }
}

export const ExpandedConsoleContext = createContext(false);

export default function App(props) {
  const classes = useStyles();
  const text64 = props.match.params;
  const [showNewFHIRText, setShowNewFHIRText] = useState(false);
  const [inputFSHText, setInputFSHText] = useState('');
  const [inputFHIRText, setInputFHIRText] = useState(['']);
  const [initialText, setInitialText] = useState('');
  const [isWaitingForFHIROutput, setIsWaitingForFHIROutput] = useState(false);
  const [isWaitingForFSHOutput, setIsWaitingForFSHOutput] = useState(false);
  const [expandConsole, setExpandConsole] = useState(false);

  useEffect(() => {
    async function waitForFSH() {
      setInitialText(await decodeFSH(text64));
    }
    waitForFSH();
  }, [text64]);

  function resetLogMessages() {
    consoleMessages = [];
    errorString = '';
    warningString = '';
    errorCount = 0;
    warningCount = 0;
  }

  function handleSUSHIControls(showNewText, sushiOutput, isWaiting) {
    setShowNewFHIRText(showNewText);
    setInputFHIRText(sushiOutput); // JSONOutput component handles resetting initial text, so don't reset here
    setIsWaitingForFHIROutput(isWaiting);
  }

  function handleGoFSHControls(fshOutput, isWaiting) {
    setIsWaitingForFSHOutput(isWaiting);
    setInitialText(fshOutput === '' ? null : fshOutput); // Reset initial text to null if empty in order to display placeholder text
  }

  function updateInputFSHTextValue(text) {
    // This is a bit of a hack to make sure the editor can be reset by a setInitialText(null)
    if (initialText === '' || initialText === null) {
      setInitialText(text);
    }
    setInputFSHText(text);
  }

  function updateInputFHIRTextValue(text) {
    setInputFHIRText(text);
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="root" style={{ height: '100vh' }}>
        <div className={classes.top}>
          <TopBar />
          <FSHControls
            onSUSHIClick={handleSUSHIControls}
            onGoFSHClick={handleGoFSHControls}
            fshText={inputFSHText}
            gofshText={inputFHIRText}
            resetLogMessages={resetLogMessages}
          />
        </div>
        <div className={expandConsole ? classes.collapsedMain : classes.expandedMain}>
          <ExpandedConsoleContext.Provider value={expandConsole}>
            <Grid className={classes.container} container>
              <Grid item xs={5} className={classes.fullHeightGrid} style={{ paddingRight: '1px' }}>
                <FSHOutput
                  text={inputFSHText}
                  initialText={initialText}
                  updateTextValue={updateInputFSHTextValue}
                  isWaiting={isWaitingForFSHOutput}
                  setInitialText={setInitialText}
                />
              </Grid>
              <Grid item xs={7} className={classes.fullHeightGrid} style={{ paddingLeft: '1px' }}>
                <JSONOutput
                  text={inputFHIRText}
                  showNewText={showNewFHIRText}
                  setShowNewText={setShowNewFHIRText}
                  isWaiting={isWaitingForFHIROutput}
                  updateTextValue={updateInputFHIRTextValue}
                />
              </Grid>
            </Grid>
          </ExpandedConsoleContext.Provider>
        </div>
        <div className={expandConsole ? classes.expandedConsole : classes.collapsedConsole}>
          <ConsoleComponent
            consoleMessages={consoleMessages}
            warningCount={warningString}
            errorCount={errorString}
            expandConsole={expandConsole}
            setExpandConsole={setExpandConsole}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}
