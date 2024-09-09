import React, { createContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { inflateSync } from 'browserify-zlib';
import FileSaver from 'file-saver';
import JSZip from 'jszip';
import { debounce, partition } from 'lodash';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, ThemeProvider } from '@material-ui/core';
import { expandLink } from './utils/BitlyWorker';
import TopBar from './components/TopBar';
import JSONEditor from './components/JSONEditor';
import FSHEditor from './components/FSHEditor';
import Console from './components/Console';
import FSHControls from './components/FSHControls';
import theme from './theme';

const useStyles = makeStyles(() => ({
  container: {
    height: '100%',
    flexGrow: 1
  },
  fullHeightGrid: {
    height: '100%'
  },
  editorPane: {
    // From MaterialUI Grid:
    flexGrow: '0'
    // maxWidth and flexBasis set inline based on state
  },
  resize: {
    height: '100%',
    width: '4px',
    cursor: 'col-resize',
    '&:hover': {
      background: theme.palette.common.lightBlue
    }
  },
  resizeBlue: {
    background: '#487AA2'
  },
  resizeCursor: {
    cursor: 'col-resize'
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

const githubURL = 'https://raw.githubusercontent.com/FSHSchool/FSHOnline-Examples/main';
const defaultInfoMessage = 'There are no messages to display in the console.';
const defaultProblemMessage = 'There are no problems to display in the console.';
let infoMessages = [defaultInfoMessage];
let problemMessages = [defaultProblemMessage];
let problemCount = 0;
let problemColor = '#FDD835'; // Default yellow color for warnings
let exampleMetadata = {};
console._stdout = {}; // mock out console._stdout so SUSHI/GoFSH logger messages are captured
console.log = console._stdout.write = function getMessages(message) {
  if (message && (message.startsWith('error') || message.startsWith('warn'))) {
    if (problemMessages[0] === defaultProblemMessage) {
      problemMessages = [];
    }
    problemCount++;
    problemMessages.push(message);
    if (message.startsWith('error')) {
      problemColor = '#FD6668';
    }
  }
  if (infoMessages[0] === defaultInfoMessage) {
    infoMessages = [];
  }
  infoMessages.push(message);
};

/*
Parses metadata into a separate object and converts the manifest into a form that can
be consumed by the TreeView component
*/
function convertManifest(childrenArr) {
  childrenArr.forEach((element) => {
    if (element.type === 'category') {
      convertManifest(element.children);
    }
    element.id = element.path.replaceAll('%20', '-'); // Spaces in file names are replaced with '%20' in Github urls
    if (element.type === 'file') {
      exampleMetadata[element.id] = {
        path: `${githubURL}/Examples/${element.path}`,
        description: element.description,
        name: element.name
      };
    }
    delete element.type;
    delete element.path;
  });
}

async function getManifestFromGit() {
  let manifestJSON = await fetch(`${githubURL}/index.json`).then((response) => response.json());
  convertManifest(manifestJSON.children);
  return [...manifestJSON.children];
}

export async function decodeFSH(encodedFSH) {
  if (encodedFSH === undefined) {
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

async function getGistContent(gistId) {
  const gistContent = await fetch(`https://api.github.com/gists/${gistId}`).then((res) => res.json());
  let fshContent = '';
  for (let f of Object.values(gistContent?.files || {})) {
    if (f.truncated) {
      fshContent += await fetch(f.raw_url).then((res) => res.text());
    } else {
      fshContent += f.content;
    }
    fshContent += '\n\n';
  }
  return fshContent.trim();
}

export const ExpandedConsoleContext = createContext(false);

export default function App(props) {
  const classes = useStyles();
  const params = useParams();
  const [showNewFHIRText, setShowNewFHIRText] = useState(false);
  const [inputFSHText, setInputFSHText] = useState('');
  const [inputFHIRText, setInputFHIRText] = useState(['']);
  const [initialText, setInitialText] = useState('');
  const [isWaitingForFHIR, setIsWaitingForFHIR] = useState(false);
  const [isWaitingForFSH, setIsWaitingForFSH] = useState(false);
  const [expandConsole, setExpandConsole] = useState(false);
  const [exampleConfig, setExampleConfig] = useState([]);
  const [exampleFilePaths, setExampleFilePaths] = useState({});
  const [leftWidth, setLeftWidth] = useState(41.666667); // Initial width based off grid item xs={5} size to align with FSHControls
  const [isDragging, setIsDragging] = useState(false);
  const [configToShare, setConfigToShare] = useState({ canonical: '', version: '', fhirVersion: [], dependencies: '' });
  const [sharedConfig, setSharedConfig] = useState({});
  const [isLineWrapped, setIsLineWrapped] = useState(false);

  useEffect(() => {
    async function waitForFSH() {
      if (props.path === 'share') {
        const text = await decodeFSH(params.id);
        const splitIndex = text.indexOf('\n');
        const config = text.slice(0, splitIndex);
        let parsedConfig;
        let fshContent = text;
        try {
          const rawConfig = JSON.parse(config);
          if (rawConfig.c != null && rawConfig.v != null && rawConfig.d != null) {
            parsedConfig = {
              canonical: rawConfig.c,
              version: rawConfig.v,
              fhirVersion: rawConfig.f || [], // Need to support old share links that did not have fhirVersion
              dependencies: rawConfig.d
            };
            // If the config is successfully parsed and has the expected properties,
            // we can assume the true FSH content begins on the next line
            fshContent = text.slice(splitIndex + 1);
          }
        } catch (e) {
          // If parse fails, it is likely decoding a legacy link in which all content is FSH, so just don't
          // set the parsedConfig, and set fshContent to all of the text
        }
        setSharedConfig(parsedConfig || {});
        setInitialText(fshContent);
      } else if (props.path === 'gist') {
        const fshContent = await getGistContent(params.id);
        setInitialText(fshContent);
      }
    }
    async function fetchExamples() {
      setExampleConfig(await getManifestFromGit());
      setExampleFilePaths(exampleMetadata);
    }
    waitForFSH();
    fetchExamples();
  }, [params, props.path]);

  function resetLogMessages() {
    infoMessages = [defaultInfoMessage];
    problemMessages = [defaultProblemMessage];
    problemCount = 0;
    problemColor = '#FDD835';
  }

  function handleSUSHIControls(showNewText, sushiOutput, isWaiting) {
    setShowNewFHIRText(showNewText);
    setInputFHIRText(sushiOutput); // JSONEditor component handles resetting initial text, so don't reset here
    setIsWaitingForFHIR(isWaiting);
  }

  function handleGoFSHControls(fshText, isWaiting) {
    setIsWaitingForFSH(isWaiting);
    setInitialText(fshText === '' ? null : fshText); // Reset initial text to null if empty in order to display placeholder text
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

  function handleConfigChange(config) {
    setConfigToShare(config);
  }

  function handleResetWidth() {
    setLeftWidth(41.666667);
  }

  function onMouseDown(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function onMouseUp(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function onTouchStart() {
    setIsDragging(true);
  }

  function onTouchEnd() {
    setIsDragging(false);
  }

  function setLineWrap(wrapSelected) {
    setIsLineWrapped(wrapSelected);
  }

  function debouncedMove(clientX) {
    if (isDragging) {
      const newPercentage = (clientX / window.innerWidth) * 100;
      if (newPercentage > 10 && newPercentage < 76) {
        setLeftWidth(newPercentage);
      }
    }
  }

  function onMouseMove(e) {
    const clientX = e.clientX;
    if (isDragging) {
      debounce(() => debouncedMove(clientX), 10)();
    }
  }

  function onTouchMove(e) {
    const clientX = e.touches[0].clientX;
    if (isDragging) {
      debounce(() => debouncedMove(clientX), 10)();
    }
  }

  function getFileName(name, nameMap) {
    if (nameMap.get(name)) {
      let count = nameMap.get(name);
      let nameWithCount = `${name}-${count}`;
      while (nameMap.get(nameWithCount)) {
        count = count + 1;
        nameWithCount = `${name}-${count}`;
      }
      nameMap.set(name, count + 1); // Keep track of how many times the name has been used in this zip file
      name = nameWithCount; // Append a number if the file name has been used already
      nameMap.set(nameWithCount, 1); // Keep track of the new file name we created so we don't use it again
    } else {
      nameMap.set(name, 1);
    }
    return name;
  }

  function saveAll() {
    const nameMap = new Map();

    // Build zip file
    const zip = new JSZip();
    zip.file('FSH.fsh', inputFSHText);

    // Prioritize FHIR definitions that have a provided id when naming files
    const [defWithId, defWithUntitledId] = partition(inputFHIRText, (def) => def.id && def.id !== 'Untitled');
    defWithId.forEach((def) => {
      let resourceObj;
      try {
        resourceObj = JSON.parse(def.def);
      } catch {
        /* Ignore errors and just default to name without resourceType */
      }
      const name = getFileName(resourceObj?.resourceType ? `${resourceObj.resourceType}-${def.id}` : def.id, nameMap);
      const value = def.def ?? null;
      zip.file(`${name}.json`, value);
    });
    defWithUntitledId.forEach((def) => {
      let resourceObj;
      try {
        resourceObj = JSON.parse(def.def);
      } catch {
        /* Ignore errors and just default to name without resourceType */
      }
      const id = def.id ?? 'Untitled';
      const name = getFileName(resourceObj.resourceType ? `${resourceObj.resourceType}-${id}` : id, nameMap);
      const value = def.def ?? null;
      zip.file(`${name}.json`, value);
    });

    // Generate blob of zip and save
    zip.generateAsync({ type: 'blob' }).then((blob) => {
      FileSaver.saveAs(blob, 'fshonline.zip');
    });
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="root" style={{ height: '100vh' }}>
        <div className={classes.top}>
          <TopBar />
          <FSHControls
            onSUSHIClick={handleSUSHIControls}
            onGoFSHClick={handleGoFSHControls}
            onConfigChange={handleConfigChange}
            config={sharedConfig}
            fshText={inputFSHText}
            gofshText={inputFHIRText}
            resetLogMessages={resetLogMessages}
            exampleConfig={exampleConfig}
            exampleMetadata={exampleFilePaths}
            isWaiting={isWaitingForFSH || isWaitingForFHIR}
            saveAll={saveAll}
            setIsLineWrapped={setLineWrap}
            isLineWrapped={isLineWrapped}
          />
        </div>
        <div className={expandConsole ? classes.collapsedMain : classes.expandedMain}>
          <ExpandedConsoleContext.Provider value={expandConsole}>
            <Grid
              className={clsx(classes.container, isDragging && classes.resizeCursor)}
              container
              onTouchMove={onTouchMove}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            >
              <Grid
                item
                className={clsx(classes.fullHeightGrid, classes.editorPane)}
                style={{ maxWidth: `calc(${leftWidth}% - 2px)`, flexBasis: `calc(${leftWidth}% - 2px)` }}
              >
                <FSHEditor
                  text={inputFSHText}
                  initialText={initialText}
                  updateTextValue={updateInputFSHTextValue}
                  isWaiting={isWaitingForFSH}
                  setInitialText={setInitialText}
                  config={configToShare}
                  isLineWrapped={isLineWrapped}
                />
              </Grid>
              <Grid
                item
                className={clsx(classes.resize, isDragging && classes.resizeBlue)}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                onMouseDown={onMouseDown}
                onDoubleClick={handleResetWidth}
              />
              <Grid
                item
                className={clsx(classes.fullHeightGrid, classes.editorPane)}
                style={{
                  maxWidth: `calc(${100 - leftWidth}% - 2px)`,
                  flexBasis: `calc(${100 - leftWidth}% - 2px)`
                }}
              >
                <JSONEditor
                  text={inputFHIRText}
                  showNewText={showNewFHIRText}
                  setShowNewText={setShowNewFHIRText}
                  isWaiting={isWaitingForFHIR}
                  updateTextValue={updateInputFHIRTextValue}
                  isLineWrapped={isLineWrapped}
                />
              </Grid>
            </Grid>
          </ExpandedConsoleContext.Provider>
        </div>
        <div className={expandConsole ? classes.expandedConsole : classes.collapsedConsole}>
          <Console
            consoleMessages={infoMessages}
            problemMessages={problemMessages}
            problemCount={problemCount}
            problemColor={problemColor}
            expandConsole={expandConsole}
            setExpandConsole={setExpandConsole}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}
