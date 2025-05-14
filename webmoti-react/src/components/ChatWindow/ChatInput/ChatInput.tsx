import React, { useEffect, useRef, useState } from 'react';

import { styled } from '@mui/material/styles';
import {
  Button,
  CircularProgress,
  Grid,
  Select,
  MenuItem,
  IconButton,
  Theme,
  TextareaAutosize,
  SelectChangeEvent,
} from '@mui/material';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import HearingIcon from '@mui/icons-material/Hearing';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Conversation } from '@twilio/conversations';
import clsx from 'clsx';

import FileAttachmentIcon from '../../../icons/FileAttachmentIcon';
import SendMessageIcon from '../../../icons/SendMessageIcon';
import { useAppState } from '../../../state';
import { isMobile } from '../../../utils';
import Snackbar from '../../Snackbar/Snackbar';
import TTSMessage from '../TTSMessage';

const PREFIX = 'ChatInput';

const classes = {
  chatInputContainer: `${PREFIX}-chatInputContainer`,
  textArea: `${PREFIX}-textArea`,
  button: `${PREFIX}-button`,
  buttonContainer: `${PREFIX}-buttonContainer`,
  fileButtonContainer: `${PREFIX}-fileButtonContainer`,
  chatButtonContainer: `${PREFIX}-chatButtonContainer`,
  fileButtonLoadingSpinner: `${PREFIX}-fileButtonLoadingSpinner`,
  textAreaContainer: `${PREFIX}-textAreaContainer`,
  isTextareaFocused: `${PREFIX}-isTextareaFocused`,
  voiceSelect: `${PREFIX}-voiceSelect`,
  menuItem: `${PREFIX}-menuItem`,
  previewButton: `${PREFIX}-previewButton`
};

const Root = styled('div')((
  {
    theme: Theme
  }
) => ({
  [`&.${classes.chatInputContainer}`]: {
    borderTop: '1px solid #e4e7e9',
    borderBottom: '1px solid #e4e7e9',
    padding: '1em 1.2em 1em',
  },

  [`& .${classes.textArea}`]: {
    width: '100%',
    border: '0',
    resize: 'none',
    fontSize: '14px',
    fontFamily: 'Inter',
    outline: 'none',
  },

  [`& .${classes.button}`]: {
    padding: '0.56em',
    minWidth: 'auto',
    '&:disabled': {
      background: 'none',
      '& path': {
        fill: '#d8d8d8',
      },
    },
  },

  [`& .${classes.buttonContainer}`]: {
    margin: '1em 0 0 1em',
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },

  [`& .${classes.fileButtonContainer}`]: {
    position: 'relative',
    marginRight: '1em',
  },

  [`& .${classes.chatButtonContainer}`]: {
    display: 'flex',
  },

  [`& .${classes.fileButtonLoadingSpinner}`]: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },

  [`& .${classes.textAreaContainer}`]: {
    display: 'flex',
    marginTop: '0.4em',
    padding: '0.48em 0.7em',
    border: '2px solid transparent',
  },

  [`& .${classes.isTextareaFocused}`]: {
    borderColor: theme.palette.primary.main,
    borderRadius: '4px',
  },

  [`& .${classes.voiceSelect}`]: {
    marginRight: '1em',
    minWidth: '120px',
  },

  [`& .${classes.menuItem}`]: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },

  [`& .${classes.previewButton}`]: {
    marginLeft: '1em',
  }
}));

interface ChatInputProps {
  conversation: Conversation;
  isChatWindowOpen: boolean;
  isTTSModeOn?: boolean;
  toggleTTSMode?: () => void;
  addTTSMsg?: (message: TTSMessage) => void;
}

const ALLOWED_FILE_TYPES =
  'audio/*, image/*, text/*, video/*, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document .xslx, .ppt, .pdf, .key, .svg, .csv';

const VOICE_OPTIONS = [
  { value: 'MATILDA', label: 'Matilda' },
  { value: 'ROGER', label: 'Roger' },
  { value: 'SARAH', label: 'Sarah' },
  { value: 'CHARLIE', label: 'Charlie' },
  { value: 'CALLUM', label: 'Callum' },
  { value: 'RIVER', label: 'River' },
  { value: 'LIAM', label: 'Liam' },
  { value: 'ALICE', label: 'Alice' },
  { value: 'CHRIS', label: 'Chris' },
  { value: 'LILY', label: 'Lily' },
];

export default function ChatInput({
  conversation,
  isChatWindowOpen,
  toggleTTSMode,
  addTTSMsg,
  isTTSModeOn = false,
}: ChatInputProps) {

  const [messageBody, setMessageBody] = useState('');
  const [isSendingFile, setIsSendingFile] = useState(false);
  const [fileSendError, setFileSendError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].value);
  const isValidMessage = /\S/.test(messageBody);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const [isTTSLoading, setIsTTSLoading] = useState(false);
  const { setError } = useAppState();

  useEffect(() => {
    if (isChatWindowOpen) {
      // When the chat window is opened, we will focus on the text input.
      // This is so the user doesn't have to click on it to begin typing a message.
      textInputRef.current?.focus();
    }
  }, [isChatWindowOpen]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageBody(event.target.value);
  };

  const handleVoiceChange = (event: SelectChangeEvent) => {
    setSelectedVoice(event.target.value as string);
  };

  // ensures pressing enter + shift creates a new line, so that enter on its own only sends the message:
  const handleReturnKeyPress = (event: React.KeyboardEvent) => {
    if (!isMobile && event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage(messageBody);
    }
  };

  const handleSendMessage = (message: string) => {
    if (isValidMessage) {
      conversation.sendMessage(message.trim());
      setMessageBody('');
    }
  };

  const handleSendFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      var formData = new FormData();
      formData.append('userfile', file);
      setIsSendingFile(true);
      setFileSendError(null);
      conversation
        .sendMessage(formData)
        .catch((e: Error) => {
          if (e.code === 413) {
            setFileSendError('File size is too large. Maximum file size is 150MB.');
          } else {
            setFileSendError('There was a problem uploading the file. Please try again.');
          }
          console.log('Problem sending file: ', e);
        })
        .finally(() => {
          setIsSendingFile(false);
        });
    }
  };

  const handleTtsButton = async () => {
    if (!isValidMessage) {
      return;
    }

    const msg = messageBody.trim();

    setIsTTSLoading(true);
    const ttsMsg = new TTSMessage(msg, selectedVoice);

    try {
      await ttsMsg.fetchSpeech();
      ttsMsg.play();
      if (addTTSMsg) {
        addTTSMsg(ttsMsg);
      }
      setMessageBody('');
    } catch {
      setError(Error('Failed to fetch speech'));
    } finally {
      setIsTTSLoading(false);
    }
  };

  const handlePreviewVoice = async (voice: string) => {
    try {
      await TTSMessage.playVoicePreview(voice);
    } catch {
      setError(Error('Failed to fetch speech preview'));
    }
  };

  return (
    <Root className={classes.chatInputContainer}>
      <Snackbar
        open={Boolean(fileSendError)}
        headline="Error"
        message={fileSendError || ''}
        variant="error"
        handleClose={() => setFileSendError(null)}
      />
      <div className={clsx(classes.textAreaContainer, { [classes.isTextareaFocused]: isTextareaFocused })}>
        {/* 
        Here we add the "isTextareaFocused" class when the user is focused on the TextareaAutosize component.
        This helps to ensure a consistent appearance across all browsers. Adding padding to the TextareaAutosize
        component does not work well in Firefox. See: https://github.com/twilio/twilio-video-app-react/issues/498
        */}
        <TextareaAutosize
          data-testid="chatinput-textarea"
          minRows={1}
          maxRows={3}
          className={classes.textArea}
          aria-label="chat input"
          placeholder={
            isTTSModeOn
              ? 'Type a question and click the ear button to preview it. Then click send for the professor to hear it.'
              : 'Write a message...'
          }
          onKeyPress={handleReturnKeyPress}
          onChange={handleChange}
          value={messageBody}
          data-cy-chat-input
          ref={textInputRef}
          onFocus={() => setIsTextareaFocused(true)}
          onBlur={() => setIsTextareaFocused(false)}
        />
      </div>
      <Grid container alignItems="flex-end" justifyContent="flex-end" wrap="nowrap">
        {/* Since the file input element is invisible, we can hardcode an empty string as its value.
        This allows users to upload the same file multiple times. */}
        <input
          data-testid="file-input"
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={handleSendFile}
          value={''}
          accept={ALLOWED_FILE_TYPES}
          aria-label="File Input"
        />
        <div className={classes.buttonContainer}>
          <Button className={classes.button} onClick={toggleTTSMode} color="primary">
            {isTTSModeOn ? (
              <>
                <ArrowLeftIcon />
                Chat
              </>
            ) : (
              <>
                Question TTS
                <ArrowRightIcon />
              </>
            )}
          </Button>

          {isTTSModeOn ? (
            <>
              <Select
                value={selectedVoice}
                onChange={handleVoiceChange}
                className={classes.voiceSelect}
                variant="outlined"
              >
                {VOICE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value} className={classes.menuItem}>
                    <span>{option.label}</span>
                    <IconButton
                      size="small"
                      className={classes.previewButton}
                      // prevent dropdown menu opening
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreviewVoice(option.value);
                      }}
                    >
                      <PlayArrowIcon fontSize="small" />
                    </IconButton>
                  </MenuItem>
                ))}
              </Select>
              <Button
                className={classes.button}
                onClick={handleTtsButton}
                disabled={!isValidMessage || isTTSLoading}
                color="primary"
                variant="contained"
              >
                <HearingIcon />
                {isTTSLoading && <CircularProgress size={24} className={classes.fileButtonLoadingSpinner} />}
              </Button>
            </>
          ) : (
            <div className={classes.chatButtonContainer}>
              <div className={classes.fileButtonContainer}>
                <Button
                  data-testid="attach-file-button"
                  className={classes.button}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSendingFile}
                  aria-label="Attach File Button"
                >
                  <FileAttachmentIcon />
                </Button>
                {isSendingFile && (
                  <CircularProgress
                    data-testid="file-upload-spinner"
                    size={24}
                    className={classes.fileButtonLoadingSpinner}
                  />
                )}
              </div>
              <Button
                className={classes.button}
                onClick={() => handleSendMessage(messageBody)}
                color="primary"
                variant="contained"
                disabled={!isValidMessage}
                data-cy-send-message-button
                data-testid="send-message-button"
              >
                <SendMessageIcon />
              </Button>
            </div>
          )}
        </div>
      </Grid>
    </Root>
  );
}
