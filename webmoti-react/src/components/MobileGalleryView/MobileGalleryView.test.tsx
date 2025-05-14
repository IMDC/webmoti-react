import { useMediaQuery } from '@mui/material';
import { render, screen } from '@testing-library/react';

import { MobileGalleryView } from './MobileGalleryView';
import useParticipantContext from '../../hooks/useParticipantsContext/useParticipantsContext';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { createMockParticipant, createMockRoom } from '../../__mocks__/mockCreator';

jest.mock('swiper/react', () => ({
  Swiper: ({ children }: any) => <div>{children}</div>,
  SwiperSlide: ({ children }: any) => <div>{children}</div>,
}));
jest.mock('swiper', () => ({
  Pagination: jest.fn(),
}));
jest.mock('../../hooks/useVideoContext/useVideoContext');
jest.mock('../../hooks/useParticipantsContext/useParticipantsContext');
// jest.mock('../../state');
jest.mock('@material-ui/core/useMediaQuery');

const mockUseMediaQuery = useMediaQuery as jest.Mock;
const mockUseVideoContext = useVideoContext as jest.Mock;
const mockUseParticipantContext = useParticipantContext as jest.Mock;
// const mockUseAppState = useAppState as jest.Mock;

jest.mock('../../hooks/useWebmotiVideoContext/useWebmotiVideoContext', () => () => ({}));

jest.mock('../../state', () => ({
  __esModule: true,
  useAppState: jest.fn(() => ({
    isGalleryViewActive: true,
    maxGalleryViewParticipants: 9,
  })),
}));

const localParticipant = createMockParticipant('test-local-participant', 0);

const p1 = createMockParticipant('participant-1', 1);
const p2 = createMockParticipant('participant-2', 2);
const p3 = createMockParticipant('participant-3', 3);
const p4 = createMockParticipant('participant-4', 4);

mockUseVideoContext.mockImplementation(() => ({
  room: createMockRoom('mockroom', localParticipant),
}));

// beforeEach(() => {
//   jest.clearAllMocks();
// });

const renderView = () => render(<MobileGalleryView />);

describe('MobileGalleryView', () => {
  describe('portrait orientation', () => {
    beforeEach(() => {
      mockUseMediaQuery.mockImplementation(() => false);
    });

    it('renders one participant', () => {
      mockUseParticipantContext.mockImplementation(() => ({
        mobileGalleryViewParticipants: [],
      }));
      renderView();
      const containers = screen.getAllByTestId('participantContainer');
      expect(containers).toHaveLength(1);
      expect(containers[0]).toHaveStyle('width: 100%');
      expect(containers[0]).toHaveStyle('height: 100%');
    });

    it('renders two participants', () => {
      mockUseParticipantContext.mockImplementation(() => ({
        mobileGalleryViewParticipants: [p1],
      }));
      renderView();
      const containers = screen.getAllByTestId('participantContainer');
      expect(containers).toHaveLength(2);
      expect(containers[0]).toHaveStyle('width: 100%');
      expect(containers[0]).toHaveStyle('height: 50%');
    });

    it('renders three participants', () => {
      mockUseParticipantContext.mockImplementation(() => ({
        mobileGalleryViewParticipants: [p1, p2],
      }));
      renderView();
      const containers = screen.getAllByTestId('participantContainer');
      expect(containers).toHaveLength(3);
      expect(containers[0]).toHaveStyle('width: 100%');
      expect(containers[0]).toHaveStyle('height: 33.33%');
    });

    it('renders four participants', () => {
      mockUseParticipantContext.mockImplementation(() => ({
        mobileGalleryViewParticipants: [p1, p2, p3],
      }));
      renderView();
      const containers = screen.getAllByTestId('participantContainer');
      expect(containers).toHaveLength(4);
      expect(containers[0]).toHaveStyle('width: 50%');
      expect(containers[0]).toHaveStyle('height: 50%');
    });

    it('renders five participants', () => {
      mockUseParticipantContext.mockImplementation(() => ({
        mobileGalleryViewParticipants: [p1, p2, p3, p4],
      }));
      renderView();
      const containers = screen.getAllByTestId('participantContainer');
      expect(containers).toHaveLength(5);
      expect(containers[0]).toHaveStyle('width: 50%');
      expect(containers[0]).toHaveStyle('height: 33.33%');
    });
  });

  describe('landscape orientation', () => {
    beforeEach(() => {
      mockUseMediaQuery.mockImplementation(() => true);
    });

    it('renders one participant', () => {
      mockUseParticipantContext.mockImplementation(() => ({
        mobileGalleryViewParticipants: [],
      }));
      renderView();
      const containers = screen.getAllByTestId('participantContainer');
      expect(containers).toHaveLength(1);
      expect(containers[0]).toHaveStyle('width: 100%');
      expect(containers[0]).toHaveStyle('height: 100%');
    });

    it('renders two participants', () => {
      mockUseParticipantContext.mockImplementation(() => ({
        mobileGalleryViewParticipants: [p1],
      }));
      renderView();
      const containers = screen.getAllByTestId('participantContainer');
      expect(containers).toHaveLength(2);
      expect(containers[0]).toHaveStyle('width: 50%');
      expect(containers[0]).toHaveStyle('height: 100%');
    });

    it('renders three participants', () => {
      mockUseParticipantContext.mockImplementation(() => ({
        mobileGalleryViewParticipants: [p1, p2],
      }));
      renderView();
      const containers = screen.getAllByTestId('participantContainer');
      expect(containers).toHaveLength(3);
      expect(containers[0]).toHaveStyle('width: 33.33%');
      expect(containers[0]).toHaveStyle('height: 100%');
    });

    it('renders four participants', () => {
      mockUseParticipantContext.mockImplementation(() => ({
        mobileGalleryViewParticipants: [p1, p2, p3],
      }));
      renderView();
      const containers = screen.getAllByTestId('participantContainer');
      expect(containers).toHaveLength(4);
      expect(containers[0]).toHaveStyle('width: 50%');
      expect(containers[0]).toHaveStyle('height: 50%');
    });

    it('renders five participants', () => {
      mockUseParticipantContext.mockImplementation(() => ({
        mobileGalleryViewParticipants: [p1, p2, p3, p4],
      }));
      renderView();
      const containers = screen.getAllByTestId('participantContainer');
      expect(containers).toHaveLength(5);
      expect(containers[0]).toHaveStyle('width: 33.33%');
      expect(containers[0]).toHaveStyle('height: 50%');
    });
  });
});
