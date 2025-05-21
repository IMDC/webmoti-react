import { clientEnv } from "./clientEnv";

export const BACKGROUND_FILTER_VIDEO_CONSTRAINTS: MediaStreamConstraints['video'] = {
  width: 640,
  height: 480,
  frameRate: 24,
};

export const DEFAULT_VIDEO_CONSTRAINTS: MediaStreamConstraints['video'] = {
  width: 1920,
  height: 1080,
  frameRate: 24,
};

// These are used to store the selected media devices in localStorage
export const SELECTED_AUDIO_INPUT_KEY = 'TwilioVideoApp-selectedAudioInput';
export const SELECTED_AUDIO_OUTPUT_KEY = 'TwilioVideoApp-selectedAudioOutput';
export const SELECTED_VIDEO_INPUT_KEY = 'TwilioVideoApp-selectedVideoInput';

// This is used to store the current background settings in localStorage
export const SELECTED_BACKGROUND_SETTINGS_KEY = 'TwilioVideoApp-selectedBackgroundSettings';

export const GALLERY_VIEW_ASPECT_RATIO = 9 / 16; // 16:9
export const GALLERY_VIEW_MARGIN = 3;

// webmoti camera names
export const WEBMOTI_CAMERA_1 = 'Student-View';
export const WEBMOTI_CAMERA_2 = 'Board-View';

// uncomment for testing (and comment other)
// const API_DOMAIN_ = '127.0.0.1:8080/api'
// export const HTTPS_SERVER_URL = `http://${API_DOMAIN_}`
// export const WS_SERVER_URL = `ws://${API_DOMAIN_}/ws`;

const API_DOMAIN_ = clientEnv.API_DOMAIN;
export const HTTPS_SERVER_URL = `https://${API_DOMAIN_}`;
export const WS_SERVER_URL = `wss://${API_DOMAIN_}/ws`;

export const enum MsgTypes {
  Hand = 'HAND',
  ToggleDevice = 'TOGGLEDEVICE',
  MuteDevice = 'MUTEDEVICE',
  Notify = 'NOTIFY',
}

export const enum HandActions {
  Raise = 'RAISE',
  Lower = 'LOWER',
  ReRaise = 'RERAISE',
}

// custom event names
export const enum Events {
  ZoomChanged = 'webmotizoomchanged',
  Fireworks = 'fireworks',
}
