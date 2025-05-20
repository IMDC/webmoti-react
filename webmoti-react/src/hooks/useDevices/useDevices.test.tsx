import { act, renderHook, waitFor } from '@testing-library/react';

import { getDeviceInfo } from '../../utils';
import useDevices from './useDevices';

jest.mock('../../utils', () => ({
  getDeviceInfo: jest.fn(() =>
    Promise.resolve({
      audioInputDevices: [],
      videoInputDevices: [],
      audioOutputDevices: [],
      hasAudioInputDevices: true,
      hasVideoInputDevices: true,
    })
  ),
}));

let mockAddEventListener = jest.fn();
let mockRemoveEventListener = jest.fn();

// @ts-ignore
navigator.mediaDevices = {
  addEventListener: mockAddEventListener,
  removeEventListener: mockRemoveEventListener,
};

describe('the useDevices hook', () => {
  afterEach(jest.clearAllMocks);

  it('should return the correct default values', async () => {
    const { result } = renderHook(useDevices);
    expect(result.current).toEqual({
      audioInputDevices: [],
      audioOutputDevices: [],
      hasAudioInputDevices: false,
      hasVideoInputDevices: false,
      videoInputDevices: [],
    });

    await waitFor(() => {
      expect(result.current.hasAudioInputDevices).toBe(true);
    });
  });

  it('should respond to "devicechange" events', async () => {
    renderHook(useDevices);
    expect(getDeviceInfo).toHaveBeenCalledTimes(1);

    expect(mockAddEventListener).toHaveBeenCalledWith('devicechange', expect.any(Function));
    act(() => {
      mockAddEventListener.mock.calls[0][1]();
    });

    await waitFor(() => {
      expect(getDeviceInfo).toHaveBeenCalledTimes(2);
    });
  });

  it('should remove "devicechange" listener on component unmount', async () => {
    const { unmount, result } = renderHook(useDevices);
    await waitFor(() => {
      expect(result.current.hasAudioInputDevices).toBe(true);
    });
    unmount();
    expect(mockRemoveEventListener).toHaveBeenCalledWith('devicechange', expect.any(Function));
  });
});
