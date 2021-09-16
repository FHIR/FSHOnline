import React, { useState } from 'react';
import { deflateSync } from 'browserify-zlib';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { makeStyles } from '@material-ui/core/styles';
import { Link as LinkIcon } from '@material-ui/icons';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextareaAutosize,
  Tooltip,
  Link,
  TextField,
  Box
} from '@material-ui/core';
import { generateLink } from '../utils/BitlyWorker';
import { theme } from '../App';

const useStyles = makeStyles((theme) => ({
  iconButton: {
    color: theme.palette.common.white,
    padding: '3px'
  },
  textArea: {
    width: '100%',
    color: theme.palette.text.primary,
    fontWeight: 'bold'
  }
}));

export default function ShareLink(props) {
  const classes = useStyles();
  const [openShare, setOpenShare] = useState(false);
  const [shareError, setShareError] = useState(false);
  const [openGist, setOpenGist] = useState(false);
  const [openGistError, setOpenGistError] = useState(false);
  const [{ copied, copyButton }, setCopied] = useState({ copied: false, copyButton: 'Copy to Clipboard' });
  const [link, setLink] = useState();
  const [gistLink, setGistLink] = useState();

  const updateGistLink = (event) => {
    const gistId = event.target.value.match(/gist\.github\.com\/[^/]+\/(.+)/)?.[1];
    if (gistId) {
      setGistLink(`https://fshschool.org/FSHOnline/#/gist/${gistId}`);
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
    setCopied({ copied: false, copyButton: 'Generate Link from Gist' });
  };

  const handleCloseGist = () => {
    setOpenGist(false);
    setShareError(false);
  };

  const handleGistCopy = () => {
    if (gistLink) {
      setCopied({ copied: true, copyButton: 'Link Copied to Clipboard' });
    } else {
      setOpenGistError(true);
    }
  };

  const handleCloseGistError = () => {
    setOpenGistError(false);
  };

  const handleOpenShare = async () => {
    let encoded;
    if (props.config?.canonical || props.config?.version || props.config?.dependencies) {
      encoded = deflateSync(
        JSON.stringify({ c: props.config?.canonical, v: props.config?.version, d: props.config?.dependencies }) +
          '\n' +
          props.shareText
      ).toString('base64');
    } else {
      encoded = deflateSync(props.shareText).toString('base64');
    }
    const longLink = `https://fshschool.org/FSHOnline/#/share/${encoded}`;
    const bitlyLink = await generateLink(longLink);
    if (bitlyLink.errorNeeded === true) {
      handleShareError();
    } else {
      // Removes the encoded data from the end of the url, starting at index 15
      const bitlySlice = bitlyLink.link.slice(15);
      const displayLink = `https://fshschool.org/FSHOnline/#/share/${bitlySlice}`;
      setLink(displayLink);
      setOpenShare(true);
      setCopied({ copied: false, copyButton: 'Copy to Clipboard' });
    }
  };

  const handleCloseShare = () => {
    setOpenShare(false);
    setShareError(false);
  };

  return (
    <>
      <Tooltip title="Share FSH" placement="top" arrow>
        <IconButton name="Share FSH" className={classes.iconButton} onClick={handleOpenShare}>
          <LinkIcon fontSize="small" style={{ transform: 'rotate(-45deg)' }} />
        </IconButton>
      </Tooltip>
      <Dialog open={openShare} onClose={handleCloseShare} aria-labelledby="form-dialog-title" maxWidth="sm" fullWidth>
        <DialogTitle id="form-dialog-title">Share</DialogTitle>
        <DialogContent>
          <DialogContentText>Use this link to share your FSH with others!</DialogContentText>
          <TextareaAutosize
            id="link"
            disabled
            label="Your Link"
            defaultValue={link}
            className={classes.textArea}
            style={{ resize: 'none' }}
          ></TextareaAutosize>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleOpenGist} color="primary" style={{ align: 'left' }}>
            Create Link with Gist
          </Button>
          <Box style={{ flex: '1 0 0', hidden: true }} />
          <CopyToClipboard text={link} onCopy={() => setCopied({ copied: true, copyButton: 'Link Copied' })}>
            <Button color={copied ? 'secondary' : 'primary'}>{copyButton}</Button>
          </CopyToClipboard>
          <Button onClick={handleCloseShare} color="primary">
            Done
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openGist} onClose={handleCloseGist} aria-labelledby="alert-dialog-title" maxWidth="sm" fullWidth>
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
          <CopyToClipboard text={gistLink} onCopy={handleGistCopy}>
            <Button color={copied ? 'secondary' : 'primary'}>{copyButton}</Button>
          </CopyToClipboard>
          <Button onClick={handleCloseGist} color="primary">
            Done
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openGistError} onClose={handleCloseGistError} aria-labelledby="alert-dialog-title" maxWidth="lg">
        <DialogTitle id="alert-dialog-title">Error Creating Gist Link</DialogTitle>
        <DialogContent>
          <DialogContentText>Could not generate a link from your Gist URL. Ensure the URL is valid.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseGistError} color="primary" autoFocus>
            Keep Swimming!
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
