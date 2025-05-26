import { beforeEach, describe, expect, it, vi, Mock } from 'vitest';
import { EventEmitter } from 'events';
import { renderHook } from '@testing-library/react';
import useMainParticipant from './useMainParticipant';
import useSelectedParticipant from '../../components/VideoProvider/useSelectedParticipant/useSelectedParticipant';
import useVideoContext from '../useVideoContext/useVideoContext';
import useScreenShareParticipant from '../useScreenShareParticipant/useScreenShareParticipant';

vi.mock('../useVideoContext/useVideoContext');
vi.mock('../../components/VideoProvider/useSelectedParticipant/useSelectedParticipant');
vi.mock('../useScreenShareParticipant/useScreenShareParticipant');
const mockUseVideoContext = useVideoContext as Mock<any>;
const mockSelectedParticipant = useSelectedParticipant as Mock<any>;
const mockUseScreenShareParticipant = useScreenShareParticipant as Mock<any>;

describe('the useMainParticipant hook', () => {
  beforeEach(() => {
    mockSelectedParticipant.mockImplementation(() => [null]);
    mockUseScreenShareParticipant.mockImplementation(() => undefined);
  });

  it('should return the dominant speaker if it exists', () => {
    const mockRoom: any = new EventEmitter();
    mockRoom.dominantSpeaker = 'dominantSpeaker';
    mockRoom.participants = new Map([[0, 'participant']]) as any;
    mockRoom.localParticipant = 'localParticipant';
    mockUseVideoContext.mockImplementation(() => ({ room: mockRoom }));
    const { result } = renderHook(useMainParticipant);
    expect(result.current).toBe('dominantSpeaker');
  });

  it('should return the first remote participant if it exists', () => {
    const mockRoom: any = new EventEmitter();
    mockRoom.dominantSpeaker = null;
    mockRoom.participants = new Map([
      [0, 'participant'],
      [1, 'secondParticipant'],
    ]) as any;
    mockRoom.localParticipant = 'localParticipant';
    mockUseVideoContext.mockImplementation(() => ({ room: mockRoom }));
    const { result } = renderHook(useMainParticipant);
    expect(result.current).toBe('participant');
  });

  it('should return the local participant if it exists', () => {
    const mockRoom: any = new EventEmitter();
    mockRoom.dominantSpeaker = null;
    mockRoom.participants = new Map() as any;
    mockRoom.localParticipant = 'localParticipant';
    mockUseVideoContext.mockImplementation(() => ({ room: mockRoom }));
    const { result } = renderHook(useMainParticipant);
    expect(result.current).toBe('localParticipant');
  });

  it('should return the selected participant if it exists', () => {
    const mockRoom: any = new EventEmitter();
    mockRoom.dominantSpeaker = 'dominantSpeaker';
    mockRoom.participants = new Map([[0, 'participant']]) as any;
    mockRoom.localParticipant = 'localParticipant';
    mockUseVideoContext.mockImplementation(() => ({ room: mockRoom }));
    mockSelectedParticipant.mockImplementation(() => ['mockSelectedParticipant']);
    const { result } = renderHook(useMainParticipant);
    expect(result.current).toBe('mockSelectedParticipant');
  });

  it('should return the screen share participant if it exists', () => {
    mockUseScreenShareParticipant.mockImplementation(() => 'mockScreenShareParticipant');
    const mockRoom: any = new EventEmitter();
    mockRoom.dominantSpeaker = 'dominantSpeaker';
    mockRoom.participants = new Map([[0, 'participant']]) as any;
    mockRoom.localParticipant = 'localParticipant';
    mockUseVideoContext.mockImplementation(() => ({ room: mockRoom }));
    const { result } = renderHook(useMainParticipant);
    expect(result.current).toBe('mockScreenShareParticipant');
  });
});
