import { describe, expect, it, vi, Mock } from "vitest";
import { EventEmitter } from 'events';

import React, { ReactNode } from 'react';

import { renderHook } from '@testing-library/react';
import { Room, TwilioError } from 'twilio-video';

import { VideoProvider } from './index';
import { useAppState } from '../../state';
import useHandleRoomDisconnection from './useHandleRoomDisconnection/useHandleRoomDisconnection';
import useHandleTrackPublicationFailed from './useHandleTrackPublicationFailed/useHandleTrackPublicationFailed';
import useLocalTracks from './useLocalTracks/useLocalTracks';
import useRestartAudioTrackOnDeviceChange from './useRestartAudioTrackOnDeviceChange/useRestartAudioTrackOnDeviceChange';
import useRoom from './useRoom/useRoom';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';

const mockRoom = new EventEmitter() as Room;

vi.mock('./useRoom/useRoom', () => vi.fn(() => ({ room: mockRoom, isConnecting: false, connect: () => {} })));
vi.mock('./useLocalTracks/useLocalTracks', () =>
  vi.fn(() => ({
    localTracks: [{ name: 'mockTrack' }],
    getLocalVideoTrack: () => {},
    getLocalAudioTrack: () => {},
    isAcquiringLocalTracks: true,
    removeLocalAudioTrack: () => {},
    removeLocalVideoTrack: () => {},
  }))
);
vi.mock('../../state');
vi.mock('./useHandleRoomDisconnection/useHandleRoomDisconnection');
vi.mock('./useHandleTrackPublicationFailed/useHandleTrackPublicationFailed');
vi.mock('./useRestartAudioTrackOnDeviceChange/useRestartAudioTrackOnDeviceChange');
vi.mock('@twilio/video-processors', () => {
  return {
    GaussianBlurBackgroundProcessor: vi.fn().mockImplementation(() => {
      return {
        loadModel: vi.fn(),
      };
    }),
  };
});

const mockUseAppState = useAppState as vi.Mock<any>;

mockUseAppState.mockImplementation(() => ({ isGalleryViewActive: false }));

describe('the VideoProvider component', () => {
  it('should correctly return the Video Context object', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <VideoProvider onError={() => {}} options={{ dominantSpeaker: true }}>
        {children}
      </VideoProvider>
    );
    const { result } = renderHook(useVideoContext, { wrapper });
    const expectedSettings = {
      type: 'none',
      index: 0,
    };
    expect(result.current).toMatchObject({
      isConnecting: false,
      localTracks: [{ name: 'mockTrack' }],
      room: mockRoom,
      onError: expect.any(Function),
      connect: expect.any(Function),
      getLocalVideoTrack: expect.any(Function),
      removeLocalVideoTrack: expect.any(Function),
      isAcquiringLocalTracks: true,
      toggleScreenShare: expect.any(Function),
      isBackgroundSelectionOpen: false,
      setIsBackgroundSelectionOpen: expect.any(Function),
      backgroundSettings: expectedSettings,
      setBackgroundSettings: expect.any(Function),
    });
    expect(useRoom).toHaveBeenCalledWith([{ name: 'mockTrack' }], expect.any(Function), {
      dominantSpeaker: true,
    });
    expect(useLocalTracks).toHaveBeenCalled();
    expect(useHandleRoomDisconnection).toHaveBeenCalledWith(
      mockRoom,
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
      false,
      expect.any(Function)
    );
    expect(useHandleTrackPublicationFailed).toHaveBeenCalledWith(mockRoom, expect.any(Function));
    expect(useRestartAudioTrackOnDeviceChange).toHaveBeenCalledWith(result.current.localTracks);
  });

  it('should call the onError function when there is an error', () => {
    const mockOnError = vi.fn();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <VideoProvider onError={mockOnError} options={{ dominantSpeaker: true }}>
        {children}
      </VideoProvider>
    );
    const { result } = renderHook(useVideoContext, { wrapper });
    result.current.onError({} as TwilioError);
    expect(mockOnError).toHaveBeenCalledWith({});
  });
});
