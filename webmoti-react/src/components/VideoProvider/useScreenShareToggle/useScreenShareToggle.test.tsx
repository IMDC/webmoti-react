import { EventEmitter } from 'events';

import { renderHook, act, waitFor } from '@testing-library/react';

import useScreenShareToggle from './useScreenShareToggle';
import { ErrorCallback } from '../../../types';

const mockLocalParticipant = new EventEmitter() as any;
mockLocalParticipant.publishTrack = jest.fn(() => Promise.resolve('mockPublication'));
mockLocalParticipant.unpublishTrack = jest.fn();

const mockRoom = {
  localParticipant: mockLocalParticipant,
} as any;

const mockOnError: ErrorCallback = () => {};

const mockTrack: any = { stop: jest.fn() };

beforeAll(() => {
  Object.defineProperty(navigator.mediaDevices, 'getDisplayMedia', {
    configurable: true,
    writable: true,
    value: jest.fn(() =>
      Promise.resolve({
        getTracks: () => [mockTrack],
      })
    ),
  });
});

afterAll(() => {
  Object.defineProperty(navigator.mediaDevices, 'getDisplayMedia', {
    configurable: true,
    writable: true,
    value: jest.fn(),
  });
});

describe('the useScreenShareToggle hook', () => {
  beforeEach(() => {
    delete mockTrack.onended;
    jest.clearAllMocks();
  });

  it('should return a default value of false', () => {
    const { result } = renderHook(() => useScreenShareToggle(mockRoom, mockOnError));
    expect(result.current).toEqual([false, expect.any(Function)]);
  });

  describe('toggle function', () => {
    it('should call localParticipant.publishTrack with the correct arguments when isSharing is false', async () => {
      const { result } = renderHook(() => useScreenShareToggle(mockRoom, mockOnError));
      result.current[1]();
      await waitFor(() => {
        expect(navigator.mediaDevices.getDisplayMedia).toHaveBeenCalled();
        expect(mockLocalParticipant.publishTrack).toHaveBeenCalledWith(mockTrack, { name: 'screen', priority: 'low' });
        expect(result.current[0]).toEqual(true);
      });
    });

    it('should not toggle screen sharing when there is no room', async () => {
      const { result } = renderHook(() => useScreenShareToggle(null, mockOnError));
      result.current[1]();
      expect(navigator.mediaDevices.getDisplayMedia).not.toHaveBeenCalled();
      expect(mockLocalParticipant.publishTrack).not.toHaveBeenCalled();
    });

    it('should correctly stop screen sharing when isSharing is true', async () => {
      const localParticipantSpy = jest.spyOn(mockLocalParticipant, 'emit');
      const { result } = renderHook(() => useScreenShareToggle(mockRoom, mockOnError));
      expect(mockTrack.onended).toBeUndefined();
      result.current[1]();
      await waitFor(() => {
        expect(result.current[0]).toEqual(true);
      });

      act(() => {
        result.current[1]();
      });
      expect(mockLocalParticipant.unpublishTrack).toHaveBeenCalledWith(mockTrack);
      expect(localParticipantSpy).toHaveBeenCalledWith('trackUnpublished', 'mockPublication');
      expect(mockTrack.stop).toHaveBeenCalled();
      expect(result.current[0]).toEqual(false);
    });

    describe('onended function', () => {
      it('should correctly stop screen sharing when called', async () => {
        const localParticipantSpy = jest.spyOn(mockLocalParticipant, 'emit');
        const { result } = renderHook(() => useScreenShareToggle(mockRoom, mockOnError));
        expect(mockTrack.onended).toBeUndefined();
        result.current[1]();
        await waitFor(() => {
          expect(mockTrack.onended).toEqual(expect.any(Function));
        });

        act(() => {
          mockTrack.onended();
        });
        expect(mockLocalParticipant.unpublishTrack).toHaveBeenCalledWith(mockTrack);
        expect(localParticipantSpy).toHaveBeenCalledWith('trackUnpublished', 'mockPublication');
        expect(mockTrack.stop).toHaveBeenCalled();
        expect(result.current[0]).toEqual(false);
      });
    });
  });
});
