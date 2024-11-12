import React, { useState } from 'react';
import { deflateSync } from 'browserify-zlib';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { makeStyles } from '@material-ui/core/styles';
import { Link as LinkIcon, FileCopy } from '@material-ui/icons';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
  Link,
  TextField,
  Box
} from '@material-ui/core';
import theme from '../theme';

const useStyles = makeStyles((theme) => ({
  iconButton: {
    color: theme.palette.common.white,
    padding: '3px'
  },
  textArea: {
    width: '100%',
    color: theme.palette.text.primary,
    fontWeight: 'bold'
  },
  copyBox: {
    backgroundColor: theme.palette.common.lightestGrey,
    borderRadius: 2,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: '15px',
    paddingRight: '5px'
  },
  linkBox: {
    // Padding on the linkBox so scroll bar doesn't cover text
    paddingTop: '15px',
    paddingBottom: '15px',
    paddingRight: '5px',
    whiteSpace: 'nowrap',
    overflow: 'scroll',
    textOverflow: 'ellipsis'
  },
  copyButton: {
    padding: '8px',
    borderRadius: 0,
    '&:hover': {
      background: theme.palette.common.lightGrey
    }
  }
}));

export default function ShareLink(props) {
  const classes = useStyles();
  const [openShare, setOpenShare] = useState(false);
  const [shareError, setShareError] = useState(false);
  const [openGist, setOpenGist] = useState(false);
  const [openGistError, setOpenGistError] = useState(false);
  const [copyTip, setCopyTip] = useState('Copy to Clipboard');
  const [{ fshCopied, fshCopyButton }, setFshCopied] = useState({
    fshCopied: false,
    fshCopyButton: 'Copy FSH to Clipboard'
  });
  const [link, setLink] = useState();
  const [gistLink, setGistLink] = useState();
  const [showCreateGistButton, setshowCreateGistButton] = useState(true);

  const updateGistLink = (event) => {
    const gistId = event.target.value.match(/gist\.github\.com\/[^/]+\/(.+)/)?.[1];
    if (gistId) {
      setGistLink(`https://fshonline.fshschool.org/#/gist/${gistId}`);
    }
  };

  const handleShareError = () => {
    setShareError(true);
    handleOpenGist();
  };

  const handleOpenGist = () => {
    setOpenShare(false);
    setOpenGist(true);
    setGistLink('');
    setFshCopied({ fshCopied: false, fshCopyButton: 'Copy FSH to Clipboard' });
  };

  const handleCloseGist = () => {
    setOpenGist(false);
    setShareError(false);
  };

  const handleGenerateGistLink = () => {
    if (gistLink) {
      handleCloseGist();
      setLink(gistLink);
      setOpenShare(true);
      setCopyTip('Copy to Clipboard');
      setshowCreateGistButton(false);
    } else {
      setOpenGistError(true);
    }
  };

  const handleCloseGistError = () => {
    setOpenGistError(false);
  };

  const handleOpenShare = async () => {
    let encoded;
    if (
      props.config?.canonical ||
      props.config?.version ||
      props.config?.fhirVersion.length > 0 ||
      props.config?.dependencies
    ) {
      encoded = deflateSync(
        JSON.stringify({
          c: props.config?.canonical,
          v: props.config?.version,
          f: props.config?.fhirVersion,
          d: props.config?.dependencies
        }) +
          '\n' +
          props.shareText
      ).toString('base64');
    } else {
      encoded = deflateSync(props.shareText).toString('base64');
    }
    const longLink = `https://fshonline.fshschool.org/#/share/${encoded}`;
    if (longLink.length > 2048) {
      // Generally URLs should be shorter than 2048 characters
      handleShareError();
    } else {
      setLink(longLink);
      setOpenShare(true);
      setCopyTip('Copy to Clipboard');
      setshowCreateGistButton(true);
    }
  };

  const handleCloseShare = () => {
    setOpenShare(false);
    setShareError(false);
  };

  const handleFSHcopy = () => {
    setFshCopied({ fshCopied: true, fshCopyButton: 'FSH Copied to Clipboard' });
  };

  return (
    <>
      <Tooltip title="Share FSH" placement="top" arrow>
        <IconButton name="Share FSH" className={classes.iconButton} onClick={handleOpenShare}>
          <LinkIcon fontSize="small" style={{ transform: 'rotate(-45deg)' }} />
        </IconButton>
      </Tooltip>
      <Dialog open={openShare} onClose={handleCloseShare} aria-labelledby="form-dialog-title" maxWidth="md" fullWidth>
        <DialogTitle id="form-dialog-title">Share</DialogTitle>
        <DialogContent>
          <DialogContentText>Use this link to share your FSH with others!</DialogContentText>
          <Box className={classes.copyBox}>
            <Box className={classes.linkBox}>{link}</Box>
            <Tooltip title={copyTip} placement="top" arrow>
              <IconButton className={classes.copyButton}>
                <CopyToClipboard
                  text={`[FSH Online Link](${link})`}
                  onCopy={() => setCopyTip('Link Copied')}
                  options={{ format: 'text/plain' }}
                >
                  <FileCopy fontSize="small" />
                </CopyToClipboard>
              </IconButton>
            </Tooltip>
          </Box>
        </DialogContent>
        <DialogActions>
          {showCreateGistButton && (
            <Button onClick={handleOpenGist} color="primary" style={{ align: 'left' }}>
              Create Link with Gist
            </Button>
          )}
          <Box style={{ flex: '1 0 0', hidden: true }} />
          <Button onClick={handleCloseShare} color="primary">
            Done
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openGist} onClose={handleCloseGist} aria-labelledby="alert-dialog-title" maxWidth="md" fullWidth>
        <DialogTitle id="alert-dialog-title">Share with Gist</DialogTitle>
        {shareError && (
          <DialogContent style={{ color: theme.palette.common.red }}>
            Your FSH content is too long to share directly. Please use a Gist to share.
          </DialogContent>
        )}
        <DialogContent>
          Create a{' '}
          <Link id="gistURL" href="https://gist.github.com/" target="_blank">
            Gist
          </Link>{' '}
          and paste the URL below to generate a shareable FSH Online link.
          <TextField id="gistURLText" label="Gist URL" fullWidth onChange={updateGistLink} />
        </DialogContent>
        <DialogActions style={{ bottom: 0, right: 0 }}>
          <Button onClick={handleCloseGist} color="primary">
            Cancel
          </Button>
          <Box style={{ flex: '1 0 0', hidden: true }} />
          <CopyToClipboard text={props.shareText} onCopy={handleFSHcopy} style={{ align: 'left' }}>
            <Button color={fshCopied ? 'secondary' : 'primary'}>{fshCopyButton}</Button>
          </CopyToClipboard>
          <Button color="primary" onClick={handleGenerateGistLink} style={{ align: 'left' }}>
            Generate Link from Gist
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openGistError} onClose={handleCloseGistError} aria-labelledby="alert-dialog-title" maxWidth="lg">
        <DialogTitle id="alert-dialog-title">Error Creating Gist Link</DialogTitle>
        <DialogContent>
          <DialogContentText>Could not generate a link from your Gist URL. Ensure the URL is valid.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseGistError} color="primary">
            Keep Swimming!
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
