import { Track, VideoBandwidthProfileOptions } from 'twilio-video';

export interface Settings {
  trackSwitchOffMode: VideoBandwidthProfileOptions['trackSwitchOffMode'];
  dominantSpeakerPriority?: Track.Priority;
  bandwidthProfileMode: VideoBandwidthProfileOptions['mode'];
  maxAudioBitrate: string;
  contentPreferencesMode?: 'auto' | 'manual';
  clientTrackSwitchOffControl?: 'auto' | 'manual';
}

type SettingsKeys = keyof Settings;

export interface SettingsAction {
  name: SettingsKeys;
  value: string;
}

export const initialSettings: Settings = {
  // https://www.twilio.com/docs/video/tutorials/developing-high-quality-video-applications
  // https://www.twilio.com/docs/video/tutorials/using-bandwidth-profile-api#specifying-a-bw-profile

  // disabled: never turn off tracks when low bandwidth
  trackSwitchOffMode: 'disabled',
  // high: dominant speaker tracks will be high priority
  dominantSpeakerPriority: 'high',
  // presentation since there is a main speaker
  bandwidthProfileMode: 'presentation',
  maxAudioBitrate: '48000',
  contentPreferencesMode: 'auto',
  // manual: cameras don't turn off when zooming in to level 3 on board-view
  // (auto makes it turn off when zoomed because most of the zoomed video is not visible/rendered)
  clientTrackSwitchOffControl: 'manual',
};

// This inputLabels object is used by ConnectionOptions.tsx. It is used to populate the id, name, and label props
// of the various input elements. Using a typed object like this (instead of strings) eliminates the possibility
// of there being a typo.
export const inputLabels: Record<SettingsKeys, string> = Object.keys(initialSettings).reduce(
  (acc, key) => {
    acc[key as SettingsKeys] = key;
    return acc;
  },
  {} as Record<SettingsKeys, string>
);

export function settingsReducer(state: Settings, action: SettingsAction) {
  return {
    ...state,
    [action.name]: action.value === 'default' ? undefined : action.value,
  };
}
