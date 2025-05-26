import { beforeEach, describe, expect, it, vi, Mock } from 'vitest';
import React from 'react';

import { render, screen, renderHook, act } from '@testing-library/react';

import useChatContext from '../../hooks/useChatContext/useChatContext';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useAppState } from '../../state';
import useParticipantContext from '../../hooks/useParticipantsContext/useParticipantsContext';
import useSelectedParticipant from '../../components/VideoProvider/useSelectedParticipant/useSelectedParticipant';

import Room, { useSetSpeakerViewOnScreenShare } from './Room';
import { createMockParticipant, createMockRoom } from '../../__mocks__/mockCreator';

vi.mock('swiper/react', () => ({
  Swiper: vi.fn(),
  SwiperSlide: vi.fn(),
}));

vi.mock('swiper', () => ({
  Pagination: vi.fn(),
}));

vi.mock('../../hooks/useChatContext/useChatContext');
vi.mock('../../hooks/useVideoContext/useVideoContext');
vi.mock('../../state');
vi.mock('../../hooks/useParticipantsContext/useParticipantsContext');
vi.mock('../../components/VideoProvider/useSelectedParticipant/useSelectedParticipant');

const mockUseChatContext = useChatContext as Mock;
const mockUseVideoContext = useVideoContext as Mock<any>;
const mockUseAppState = useAppState as Mock<any>;
const mockUseParticipantContext = useParticipantContext as Mock;
const mockUseSelectedParticipant = useSelectedParticipant as Mock;

const mockLocalParticipant = createMockParticipant('local-participant', 0);
const mockRemoteParticipant = createMockParticipant('remote-participant', 1);

const mockToggleChatWindow = vi.fn();
const mockOpenBackgroundSelection = vi.fn();
const mockSetIsGalleryViewActive = vi.fn();

vi.mock('../../hooks/useWebmotiVideoContext/useWebmotiVideoContext', () => () => ({}));

vi.mock('react-use-websocket', () => ({
  __esModule: true,
  default: () => ({
    sendMessage: vi.fn(),
    lastJsonMessage: null,
    readyState: 1,
  }),
}));
vi.mock('@fireworks-js/react', () => ({
  Fireworks: vi.fn(() => <div data-testid="mock-fireworks" />),
}));

vi.mock('../GalleryView/GalleryView', () => ({
  GalleryView: React.forwardRef(() => <div data-testid="gallery-view" />),
}));

vi.mock('../MobileGalleryView/MobileGalleryView', () => ({
  MobileGalleryView: React.forwardRef(() => <div data-testid="mobile-gallery-view" />),
}));

vi.mock('../MainParticipant/MainParticipant', () => ({
  __esModule: true,
  default: () => <div data-testid="main-participant" />,
}));

vi.mock('../ParticipantList/ParticipantList', () => ({
  __esModule: true,
  default: () => <div data-testid="participant-list" />,
}));

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver;

beforeEach(() => {
  vi.clearAllMocks();

  mockUseAppState.mockImplementation(() => ({
    isGalleryViewActive: false,
  }));

  mockUseVideoContext.mockImplementation(() => ({
    room: createMockRoom('mockroom', mockLocalParticipant),
    setIsBackgroundSelectionOpen: mockOpenBackgroundSelection,
    backgroundSettings: { index: 0, type: 'image' },
    isBackgroundSelectionOpen: false,
  }));

  mockUseChatContext.mockImplementation(() => ({
    setIsChatWindowOpen: mockToggleChatWindow,
    messages: [],
    isChatWindowOpen: false,
  }));

  mockUseParticipantContext.mockImplementation(() => ({
    galleryViewParticipants: [],
    speakerViewParticipants: [mockRemoteParticipant],
  }));

  mockUseSelectedParticipant.mockImplementation(() => [null, vi.fn()]);
});

describe('the Room component', () => {
  it('should render correctly when the chat window and background selection windows are closed', () => {
    render(<Room />);
    const container = screen.getByTestId('room-container');
    expect(container).not.toHaveClass('rightDrawerOpen');
  });

  it('should render correctly with chat window open', () => {
    mockUseChatContext.mockImplementationOnce(() => ({
      setIsChatWindowOpen: mockToggleChatWindow,
      messages: [],
      isChatWindowOpen: true,
    }));
    render(<Room />);
    const container = screen.getByTestId('room-container');
    expect(container.className).toMatch(/rightDrawerOpen/);
  });

  it('should render correctly with the background selection window open', () => {
    mockUseVideoContext.mockImplementationOnce(() => ({
      room: createMockRoom('mockroom', mockLocalParticipant),
      isBackgroundSelectionOpen: true,
      backgroundSettings: { index: 0, type: 'image' },
      setIsBackgroundSelectionOpen: mockOpenBackgroundSelection,
    }));

    render(<Room />);
    const container = screen.getByTestId('room-container');
    expect(container.className).toMatch(/rightDrawerOpen/);
  });

  it('should render MainParticipant and ParticipantList when gallery view is inactive', () => {
    render(<Room />);
    expect(screen.getByTestId('main-participant')).toBeInTheDocument();
    expect(screen.getByTestId('participant-list')).toBeInTheDocument();
    expect(screen.queryByTestId('gallery-view')).not.toBeInTheDocument();
  });

  it('should render GalleryView when gallery view is active', () => {
    mockUseAppState.mockImplementation(() => ({
      isGalleryViewActive: true,
      galleryViewParticipants: [mockRemoteParticipant],
      speakerViewParticipants: [mockRemoteParticipant],
    }));

    render(<Room />);
    expect(screen.getByTestId('gallery-view')).toBeInTheDocument();
    expect(screen.queryByTestId('main-participant')).not.toBeInTheDocument();
    expect(screen.queryByTestId('participant-list')).not.toBeInTheDocument();
  });
});

describe('the useSetSpeakerViewOnScreenShare hook', () => {
  it('should not deactivate gallery view when there is no screen share participant', () => {
    renderHook(() =>
      useSetSpeakerViewOnScreenShare(undefined, { localParticipant: {} } as any, mockSetIsGalleryViewActive, true)
    );
    expect(mockSetIsGalleryViewActive).not.toBeCalled();
  });

  it('should deactivate gallery view when a remote participant shares their screen', () => {
    const { rerender } = renderHook(
      ({ screenShareParticipant }) =>
        useSetSpeakerViewOnScreenShare(
          screenShareParticipant,
          { localParticipant: {} } as any,
          mockSetIsGalleryViewActive,
          true
        ),
      { initialProps: { screenShareParticipant: undefined } }
    );
    rerender({ screenShareParticipant: {} } as any);
    expect(mockSetIsGalleryViewActive).toBeCalledWith(false);
  });

  it('should reactivate gallery view after screenshare ends if it was active before', () => {
    const { rerender } = renderHook(
      ({ screenShareParticipant }) =>
        useSetSpeakerViewOnScreenShare(
          screenShareParticipant,
          { localParticipant: {} } as any,
          mockSetIsGalleryViewActive,
          true
        ),
      { initialProps: { screenShareParticipant: undefined } }
    );
    rerender({ screenShareParticipant: {} } as any);
    expect(mockSetIsGalleryViewActive).toBeCalledWith(false);
    act(() => {
      rerender({ screenShareParticipant: undefined } as any);
    });
    expect(mockSetIsGalleryViewActive).toBeCalledWith(true);
  });

  it('should not reactivate gallery view if it was not active before screenshare', () => {
    const { rerender } = renderHook(
      ({ screenShareParticipant }) =>
        useSetSpeakerViewOnScreenShare(
          screenShareParticipant,
          { localParticipant: {} } as any,
          mockSetIsGalleryViewActive,
          false
        ),
      { initialProps: { screenShareParticipant: undefined } }
    );
    rerender({ screenShareParticipant: {} } as any);
    expect(mockSetIsGalleryViewActive).toBeCalledWith(false);
    rerender({ screenShareParticipant: undefined } as any);
    expect(mockSetIsGalleryViewActive).toBeCalledTimes(1);
  });

  it('should not change view if local participant is sharing screen', () => {
    const mockLocal = {};
    const { rerender } = renderHook(
      ({ screenShareParticipant }) =>
        useSetSpeakerViewOnScreenShare(
          screenShareParticipant,
          { localParticipant: mockLocal } as any,
          mockSetIsGalleryViewActive,
          true
        ),
      { initialProps: { screenShareParticipant: undefined } }
    );
    rerender({ screenShareParticipant: mockLocal } as any);
    expect(mockSetIsGalleryViewActive).not.toBeCalled();
  });

  // it('should preserve manual view switch during screenshare', () => {
  //   const mockParticipant = {};
  //   const { rerender } = renderHook(
  //     ({ screenShareParticipant, isGalleryViewActive }) =>
  //       useSetSpeakerViewOnScreenShare(
  //         screenShareParticipant,
  //         { localParticipant: {} } as any,
  //         mockSetIsGalleryViewActive,
  //         isGalleryViewActive
  //       ),
  //     { initialProps: { screenShareParticipant: undefined, isGalleryViewActive: false } }
  //   );
  //   rerender({ screenShareParticipant: mockParticipant, isGalleryViewActive: false } as any);
  //   expect(mockSetIsGalleryViewActive).toBeCalledWith(false);

  //   rerender({ screenShareParticipant: mockParticipant, isGalleryViewActive: true } as any);
  //   rerender({ screenShareParticipant: undefined, isGalleryViewActive: true } as any);
  //   expect(mockSetIsGalleryViewActive).toBeCalledTimes(1);
  // });
});
