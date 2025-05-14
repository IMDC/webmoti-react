import { styled } from '@mui/material/styles';

import { Button, Tooltip } from '@mui/material';
import ScreenShareIcon from '../../../icons/ScreenShareIcon';

import useScreenShareParticipant from '../../../hooks/useScreenShareParticipant/useScreenShareParticipant';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';

const PREFIX = 'SCREEN_SHARE_TEXT';

const classes = {
  button: `${PREFIX}-button`,
};

const StyledTooltip = styled(Tooltip)(({ theme }) => ({
  [`& .${classes.button}`]: {
    '&[disabled]': {
      color: '#bbb',
      '& svg *': {
        fill: '#bbb',
      },
    },
  },
}));

export const SCREEN_SHARE_TEXT = 'Share Screen';
export const STOP_SCREEN_SHARE_TEXT = 'Stop Sharing Screen';
export const SHARE_IN_PROGRESS_TEXT = 'Cannot share screen when another user is sharing';
export const SHARE_NOT_SUPPORTED_TEXT = 'Screen sharing is not supported with this browser';

export default function ToggleScreenShareButton(props: { disabled?: boolean }) {
  const screenShareParticipant = useScreenShareParticipant();
  const { toggleScreenShare } = useVideoContext();
  const disableScreenShareButton = Boolean(screenShareParticipant);
  const isScreenShareSupported = navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia;
  const isDisabled = props.disabled || disableScreenShareButton || !isScreenShareSupported;

  let tooltipMessage = '';

  if (disableScreenShareButton) {
    tooltipMessage = SHARE_IN_PROGRESS_TEXT;
  }

  if (!isScreenShareSupported) {
    tooltipMessage = SHARE_NOT_SUPPORTED_TEXT;
  }

  return (
    <StyledTooltip
      title={tooltipMessage}
      placement="top"
      PopperProps={{ disablePortal: true }}
      style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
    >
      <span>
        {/* The span element is needed because a disabled button will not emit hover events and we want to display
          a tooltip when screen sharing is disabled */}
        <Button
          className={classes.button}
          onClick={toggleScreenShare}
          disabled={isDisabled}
          startIcon={<ScreenShareIcon />}
          data-cy-share-screen
        >
          {SCREEN_SHARE_TEXT}
        </Button>
      </span>
    </StyledTooltip>
  );
}
