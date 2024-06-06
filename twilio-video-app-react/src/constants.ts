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
export const WEBMOTI_CAMERA_1 = 'Class-View';
export const WEBMOTI_CAMERA_2 = 'Board-View';

export const REMOTE_IT_URL = 'https://jmn2f42hjgfv.connect.remote.it/raisehand';

export const enum MsgTypes {
  Hand = 'HAND',
  ModeSwitch = 'MODESWITCH',
  ToggleDevice = 'TOGGLEDEVICE',
  MuteDevice = 'MUTEDEVICE',
  Notify = 'NOTIFY',
}

export const enum HandActions {
  Raise = 'RAISE',
  Lower = 'LOWER',
  ReRaise = 'RERAISE',
}
