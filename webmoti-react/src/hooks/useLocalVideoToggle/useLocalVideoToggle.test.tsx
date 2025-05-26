import { describe, expect, it, vi, Mock } from 'vitest';
import { EventEmitter } from 'events';

import { act, renderHook, waitFor } from '@testing-library/react';
import { LocalParticipant } from 'twilio-video';

import useLocalVideoToggle from './useLocalVideoToggle';
import useVideoContext from '../useVideoContext/useVideoContext';

vi.mock('../useVideoContext/useVideoContext');
const mockUseVideoContext = useVideoContext as vi.Mock<any>;

function getMockTrack(kind: string, deviceId?: string) {
  return {
    name: '',
    kind,
    mediaStreamTrack: {
      getSettings: () => ({
        deviceId,
      }),
    },
  };
}

describe('the useLocalVideoToggle hook', () => {
  it('should return true when a localVideoTrack exists', () => {
    mockUseVideoContext.mockImplementation(() => ({
      localTracks: [getMockTrack('video')],
      room: { localParticipant: {} },
    }));

    const { result } = renderHook(useLocalVideoToggle);
    expect(result.current).toEqual([true, expect.any(Function)]);
  });

  it('should return false when a localVideoTrack does not exist', () => {
    mockUseVideoContext.mockImplementation(() => ({
      localTracks: [getMockTrack('audio')],
      room: { localParticipant: {} },
    }));

    const { result } = renderHook(useLocalVideoToggle);
    expect(result.current).toEqual([false, expect.any(Function)]);
  });

  describe('toggleVideoEnabled function', () => {
    it('should call removeLocalVideoTrack when a localVideoTrack exists', () => {
      const mockRemoveLocalVideoTrack = vi.fn();

      mockUseVideoContext.mockImplementation(() => ({
        localTracks: [getMockTrack('video')],
        room: { localParticipant: null },
        removeLocalVideoTrack: mockRemoveLocalVideoTrack,
      }));

      const { result } = renderHook(useLocalVideoToggle);
      result.current[1]();
      expect(mockRemoveLocalVideoTrack).toHaveBeenCalled();
    });

    it('should call localParticipant.unpublishTrack when a localVideoTrack and localParticipant exists', () => {
      const mockLocalTrack = {
        ...getMockTrack('video'),
        stop: vi.fn(),
      };

      const mockLocalParticipant = new EventEmitter() as LocalParticipant;
      mockLocalParticipant.unpublishTrack = vi.fn();

      mockUseVideoContext.mockImplementation(() => ({
        localTracks: [mockLocalTrack],
        room: { localParticipant: mockLocalParticipant },
        removeLocalVideoTrack: () => {},
      }));

      const { result } = renderHook(useLocalVideoToggle);
      result.current[1]();
      expect(mockLocalParticipant.unpublishTrack).toHaveBeenCalledWith(mockLocalTrack);
    });

    it('should call getLocalVideoTrack when a localVideoTrack does not exist', async () => {
      const mockGetLocalVideoTrack = vi.fn(() => Promise.resolve());
      mockUseVideoContext.mockImplementation(() => ({
        localTracks: [],
        getLocalVideoTrack: mockGetLocalVideoTrack,
        room: {},
      }));

      const { result } = renderHook(useLocalVideoToggle);
      act(() => {
        result.current[1]();
      });
      await waitFor(() => {
        expect(mockGetLocalVideoTrack).toHaveBeenCalled();
      });
    });

    it('should call mockLocalParticipant.publishTrack when a localVideoTrack does not exist and localParticipant does exist', async () => {
      const mockGetLocalVideoTrack = vi.fn(() => Promise.resolve('mockTrack'));

      const mockLocalParticipant = new EventEmitter() as LocalParticipant;
      mockLocalParticipant.publishTrack = vi.fn();

      mockUseVideoContext.mockImplementation(() => ({
        localTracks: [],
        getLocalVideoTrack: mockGetLocalVideoTrack,
        room: { localParticipant: mockLocalParticipant },
      }));

      const { result } = renderHook(useLocalVideoToggle);
      act(() => {
        result.current[1]();
      });
      await waitFor(() => {
        expect(mockLocalParticipant.publishTrack).toHaveBeenCalledWith('mockTrack', { priority: 'low' });
      });
    });

    it('should not call mockLocalParticipant.publishTrack when isPublishing is true', async () => {
      const mockGetLocalVideoTrack = vi.fn(() => Promise.resolve('mockTrack'));

      const mockLocalParticipant = new EventEmitter() as LocalParticipant;
      mockLocalParticipant.publishTrack = vi.fn();

      mockUseVideoContext.mockImplementation(() => ({
        localTracks: [],
        getLocalVideoTrack: mockGetLocalVideoTrack,
        room: { localParticipant: mockLocalParticipant },
      }));

      const { result } = renderHook(useLocalVideoToggle);
      act(() => {
        result.current[1]();
      });
      result.current[1](); // Should be ignored because isPublishing is true
      await waitFor(() => {
        expect(mockGetLocalVideoTrack).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onError when publishTrack throws an error', async () => {
      const mockGetLocalVideoTrack = vi.fn(() => Promise.resolve('mockTrack'));
      const mockOnError = vi.fn();

      const mockLocalParticipant = new EventEmitter() as LocalParticipant;
      mockLocalParticipant.publishTrack = vi.fn(() => Promise.reject('mockError'));

      mockUseVideoContext.mockImplementation(() => ({
        localTracks: [],
        getLocalVideoTrack: mockGetLocalVideoTrack,
        room: { localParticipant: mockLocalParticipant },
        onError: mockOnError,
      }));

      const { result } = renderHook(useLocalVideoToggle);
      act(() => {
        result.current[1]();
      });
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('mockError');
      });
    });
  });
});
