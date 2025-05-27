import { forwardRef } from 'react';

import { render, screen, renderHook, act } from '@testing-library/react';

import useChatContext from '../../hooks/useChatContext/useChatContext';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useAppState } from '../../state';
import useParticipantContext from '../../hooks/useParticipantsContext/useParticipantsContext';
import useSelectedParticipant from '../../components/VideoProvider/useSelectedParticipant/useSelectedParticipant';

import Room, { useSetSpeakerViewOnScreenShare } from './Room';
import { createMockParticipant, createMockRoom } from '../../__mocks__/mockCreator';

jest.mock('swiper/react', () => ({
  Swiper: jest.fn(),
  SwiperSlide: jest.fn(),
}));

jest.mock('swiper', () => ({
  Pagination: jest.fn(),
}));

jest.mock('../../hooks/useChatContext/useChatContext');
jest.mock('../../hooks/useVideoContext/useVideoContext');
jest.mock('../../state');
jest.mock('../../hooks/useParticipantsContext/useParticipantsContext');
jest.mock('../../components/VideoProvider/useSelectedParticipant/useSelectedParticipant');

const mockUseChatContext = useChatContext as jest.Mock;
const mockUseVideoContext = useVideoContext as jest.Mock<any>;
const mockUseAppState = useAppState as jest.Mock<any>;
const mockUseParticipantContext = useParticipantContext as jest.Mock;
const mockUseSelectedParticipant = useSelectedParticipant as jest.Mock;

const mockLocalParticipant = createMockParticipant('local-participant', 0);
const mockRemoteParticipant = createMockParticipant('remote-participant', 1);

const mockToggleChatWindow = jest.fn();
const mockOpenBackgroundSelection = jest.fn();
const mockSetIsGalleryViewActive = jest.fn();

jest.mock('../../hooks/useWebmotiVideoContext/useWebmotiVideoContext', () => () => ({}));

jest.mock('react-use-websocket', () => ({
  __esModule: true,
  default: () => ({
    sendMessage: jest.fn(),
    lastJsonMessage: null,
    readyState: 1,
  }),
}));
jest.mock('@fireworks-js/react', () => ({
  Fireworks: jest.fn(() => <div data-testid="mock-fireworks" />),
}));

jest.mock('../GalleryView/GalleryView', () => ({
  GalleryView: forwardRef(() => <div data-testid="gallery-view" />),
}));

jest.mock('../MobileGalleryView/MobileGalleryView', () => ({
  MobileGalleryView: forwardRef(() => <div data-testid="mobile-gallery-view" />),
}));

jest.mock('../MainParticipant/MainParticipant', () => ({
  __esModule: true,
  default: () => <div data-testid="main-participant" />,
}));

jest.mock('../ParticipantList/ParticipantList', () => ({
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
  jest.clearAllMocks();

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

  mockUseSelectedParticipant.mockImplementation(() => [null, jest.fn()]);
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
