import { act, renderHook, waitFor } from '@testing-library/react';
import Video, { LocalTrack } from 'twilio-video';

import useRoom from './useRoom';
import { mockRoom } from '../../../__mocks__/twilio-video';
import * as utils from '../../../utils';

const mockVideoConnect = Video.connect as jest.Mock<any>;

describe('the useRoom hook', () => {
  beforeEach(jest.clearAllMocks);
  afterEach(() => mockRoom.removeAllListeners());

  it('should set isConnecting to true while connecting to the room ', async () => {
    const { result } = renderHook(() => useRoom([], () => {}, {}));
    expect(result.current.isConnecting).toBe(false);
    act(() => {
      result.current.connect('token');
    });
    expect(result.current.isConnecting).toBe(true);

    await waitFor(() => {
      expect(Video.connect).toHaveBeenCalledTimes(1);
      expect(result.current.room!.disconnect).not.toHaveBeenCalled();
      expect(result.current.isConnecting).toBe(false);
    });
  });

  it('should set the priority of video tracks to low', async () => {
    const { result } = renderHook(() => useRoom([{ kind: 'video' } as LocalTrack], () => {}, {}));
    act(() => {
      result.current.connect('token');
    });
    await waitFor(() => {
      expect(mockRoom.localParticipant.videoTracks[0].setPriority).toHaveBeenCalledWith('low');
    });
  });

  it('should return a room after connecting to a room', async () => {
    const { result } = renderHook(() => useRoom([], () => {}, {}));
    act(() => {
      result.current.connect('token');
    });
    await waitFor(() => {
      expect(result.current.room!.state).toEqual('connected');
    });
  });

  it('should add a listener for the "beforeUnload" event when connected to a room', async () => {
    jest.spyOn(window, 'addEventListener');
    const { result } = renderHook(() => useRoom([], () => {}, {}));
    act(() => {
      result.current.connect('token');
    });
    await waitFor(() => {
      expect(window.addEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    });
  });

  it('should remove the listener for the "beforeUnload" event when the room is disconnected', async () => {
    jest.spyOn(window, 'removeEventListener');
    const { result } = renderHook(() => useRoom([], () => {}, {}));
    act(() => {
      result.current.connect('token');
    });
    await waitFor(() => {
      expect(result.current.room).toBeTruthy();
    });

    result.current.room!.emit('disconnected');

    await waitFor(() => {
      expect(window.removeEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    });
  });

  it('should call onError and set isConnecting to false when there is an error', async () => {
    const mockOnError = jest.fn();
    mockVideoConnect.mockImplementationOnce(() => Promise.reject('mockError'));
    const { result } = renderHook(() => useRoom([], mockOnError, {}));
    await act(() => result.current.connect('token'));
    expect(mockOnError).toHaveBeenCalledWith('mockError');
    expect(result.current.isConnecting).toBe(false);
  });

  it('should reset the room object on disconnect', async () => {
    const { result } = renderHook(() => useRoom([], () => {}, {}));
    act(() => {
      result.current.connect('token');
    });
    await waitFor(() => {
      expect(result.current.room!.state).toBe('connected');
    });
    result.current.room!.emit('disconnected');
    await waitFor(() => {
      expect(result.current.room).toBe(null);
    });
  });

  describe('when isMobile is true', () => {
    // @ts-expect-error: read only mock
    utils.isMobile = true;

    it('should add a listener for the "pagehide" event when connected to a room', async () => {
      jest.spyOn(window, 'addEventListener');
      const { result } = renderHook(() => useRoom([], () => {}, {}));
      act(() => {
        result.current.connect('token');
      });
      await waitFor(() => {
        expect(window.addEventListener).toHaveBeenCalledWith('pagehide', expect.any(Function));
      });
    });

    it('should remove the listener for the "pagehide" event when the room is disconnected', async () => {
      jest.spyOn(window, 'removeEventListener');
      const { result } = renderHook(() => useRoom([], () => {}, {}));
      act(() => {
        result.current.connect('token');
      });
      await waitFor(() => {
        expect(result.current.room).toBeTruthy();
      });
      result.current.room!.emit('disconnected');
      await waitFor(() => {
        expect(window.removeEventListener).toHaveBeenCalledWith('pagehide', expect.any(Function));
      });
    });
  });
});
