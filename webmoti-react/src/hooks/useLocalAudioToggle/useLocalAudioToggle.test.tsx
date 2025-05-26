import { describe, expect, it, vi, Mock } from "vitest";
import { renderHook } from '@testing-library/react';
import useLocalAudioToggle from './useLocalAudioToggle';
import useVideoContext from '../useVideoContext/useVideoContext';

vi.mock('../useVideoContext/useVideoContext');
const mockUseVideoContext = useVideoContext as vi.Mock<any>;

vi.mock('../useIsTrackEnabled/useIsTrackEnabled', () => () => true);

describe('the useLocalAudioToggle hook', () => {
  it('should return the value from the useIsTrackEnabled hook', () => {
    const mockLocalTrack = {
      kind: 'audio',
      isEnabled: true,
      enable: vi.fn(),
      disable: vi.fn(),
    };

    mockUseVideoContext.mockImplementation(() => ({
      localTracks: [mockLocalTrack],
    }));

    const { result } = renderHook(useLocalAudioToggle);
    expect(result.current).toEqual([true, expect.any(Function)]);
  });

  describe('toggleAudioEnabled function', () => {
    it('should call track.disable when track is enabled', () => {
      const mockLocalTrack = {
        kind: 'audio',
        isEnabled: true,
        enable: vi.fn(),
        disable: vi.fn(),
      };

      mockUseVideoContext.mockImplementation(() => ({
        localTracks: [mockLocalTrack],
      }));

      const { result } = renderHook(useLocalAudioToggle);
      result.current[1]();
      expect(mockLocalTrack.disable).toHaveBeenCalled();
      expect(mockLocalTrack.enable).not.toHaveBeenCalled();
    });

    it('should call track.enable when track is disabled', () => {
      const mockLocalTrack = {
        kind: 'audio',
        isEnabled: false,
        enable: vi.fn(),
        disable: vi.fn(),
      };

      mockUseVideoContext.mockImplementation(() => ({
        localTracks: [mockLocalTrack],
      }));

      const { result } = renderHook(useLocalAudioToggle);
      result.current[1]();
      expect(mockLocalTrack.disable).not.toHaveBeenCalled();
      expect(mockLocalTrack.enable).toHaveBeenCalled();
    });

    it('should not throw an error if track is undefined', () => {
      mockUseVideoContext.mockImplementation(() => ({
        localTracks: [],
      }));

      const { result } = renderHook(useLocalAudioToggle);
      result.current[1]();
    });
  });
});
