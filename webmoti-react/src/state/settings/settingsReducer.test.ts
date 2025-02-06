import { settingsReducer, initialSettings } from './settingsReducer';

describe('the settingsReducer', () => {
  it('should set a setting from the name/value pair provided', () => {
    const result = settingsReducer(initialSettings, { name: 'clientTrackSwitchOffControl', value: 'auto' });
    expect(result).toEqual({
      bandwidthProfileMode: 'presentation',
      dominantSpeakerPriority: 'standard',
      maxAudioBitrate: '48000',
      trackSwitchOffMode: undefined,
      clientTrackSwitchOffControl: 'auto',
      contentPreferencesMode: 'auto',
    });
  });

  it('should set undefined when the value is "default"', () => {
    const result = settingsReducer(initialSettings, { name: 'bandwidthProfileMode', value: 'default' });
    expect(result).toEqual({
      bandwidthProfileMode: undefined,
      dominantSpeakerPriority: 'standard',
      maxAudioBitrate: '48000',
      clientTrackSwitchOffControl: 'manual',
      contentPreferencesMode: 'auto',
      trackSwitchOffMode: undefined,
    });
  });
});
