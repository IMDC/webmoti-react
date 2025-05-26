import { beforeEach, describe, expect, it, vi, Mock } from "vitest";
import React from 'react';
import { render } from '@testing-library/react';
import AudioTrack from './AudioTrack';
import { useAppState } from '../../state';

const audioEl = document.createElement('audio');
audioEl.setSinkId = vi.fn();

const mockTrack = { attach: vi.fn(() => audioEl), detach: vi.fn(() => [audioEl]) } as any;

vi.mock('../../state');
const mockUseAppState = useAppState as vi.Mock<any>;

mockUseAppState.mockImplementation(() => ({ activeSinkId: '' }));

describe('the AudioTrack component', () => {
  beforeEach(vi.clearAllMocks);

  it('should add an audio element to the DOM when the component mounts', () => {
    render(<AudioTrack track={mockTrack} />);
    expect(mockTrack.attach).toHaveBeenCalled();
    expect(mockTrack.detach).not.toHaveBeenCalled();
    expect(document.querySelector('audio')).toBe(audioEl);
    expect(audioEl.setSinkId).not.toHaveBeenCalledWith('mock-sink-id');
  });

  it('should remove the audio element from the DOM when the component unmounts', () => {
    const { unmount } = render(<AudioTrack track={mockTrack} />);
    unmount();
    expect(mockTrack.detach).toHaveBeenCalled();
    expect(document.querySelector('audio')).toBe(null);
  });

  it('should set the audio elements srcObject to null when the component unmounts', () => {
    const { unmount } = render(<AudioTrack track={mockTrack} />);
    const audioElement = document.querySelector('audio')!;
    unmount();
    expect(audioElement.srcObject).toBe(null);
  });

  describe('with an activeSinkId', () => {
    it('should set the sinkId when the component mounts', () => {
      mockUseAppState.mockImplementationOnce(() => ({ activeSinkId: 'mock-sink-id' }));
      render(<AudioTrack track={mockTrack} />);
      expect(audioEl.setSinkId).toHaveBeenCalledWith('mock-sink-id');
    });
  });
});
