import { describe, expect, it, vi, Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GalleryView } from './GalleryView';
import useWebmotiVideoContext from '../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';

import { useAppState } from '../../state';
import { usePagination } from './usePagination/usePagination';
import { createMockParticipant, createMockRoom } from '../../__mocks__/mockCreator';

const mockLocalParticipant = createMockParticipant('test-local-participant', 0);
const mockParticipants = [
  createMockParticipant('test-participant-1', 1),
  createMockParticipant('test-participant-2', 2),
  createMockParticipant('test-participant-3', 3),
  createMockParticipant('test-participant-4', 4),
];

vi.mock('@fireworks-js/react', () => ({
  Fireworks: vi.fn(() => <div data-testid="mock-fireworks" />),
}));
vi.mock('../../constants', () => ({
  GALLERY_VIEW_ASPECT_RATIO: 9 / 16,
  GALLERY_VIEW_MARGIN: 3,
  Events: {
    Fireworks: 'fireworks',
  },
}));
vi.mock('../../hooks/useVideoContext/useVideoContext', () => () => ({
  room: createMockRoom('mock room', mockLocalParticipant),
}));
vi.mock('../../hooks/useParticipantsContext/useParticipantsContext', () => () => ({
  galleryViewParticipants: mockParticipants,
}));
vi.mock('../../hooks/useGalleryViewLayout/useGalleryViewLayout', () =>
  vi.fn(() => ({
    participantVideoWidth: 720,
    containerRef: { current: null },
  }))
);
vi.mock('./usePagination/usePagination', () => ({
  usePagination: vi.fn(),
}));
vi.mock('../../state');

const mockUsePagination = usePagination as Mock;
const mockUseAppState = useAppState as Mock;

mockUseAppState.mockImplementation(() => ({ maxGalleryViewParticipants: 9 }));

vi.mock('../../hooks/useWebmotiVideoContext/useWebmotiVideoContext');

const mockUseWebmotiVideoContext = useWebmotiVideoContext as Mock<any>;
mockUseWebmotiVideoContext.mockImplementation(() => ({}));

describe('GalleryView', () => {
  it('renders correctly with pagination controls', () => {
    mockUsePagination.mockImplementation(() => ({
      currentPage: 2,
      totalPages: 4,
      setCurrentPage: vi.fn(),
      paginatedParticipants: [mockLocalParticipant, ...mockParticipants],
    }));

    render(<GalleryView />);
    expect(screen.getByTestId('pagination-prev-button')).toBeInTheDocument();
    expect(screen.getByTestId('pagination-next-button')).toBeInTheDocument();
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
    expect(screen.getByTestId('participant-container')).toBeInTheDocument();
  });

  it('does not show prev button on first page', () => {
    mockUsePagination.mockImplementation(() => ({
      currentPage: 1,
      totalPages: 4,
      setCurrentPage: vi.fn(),
      paginatedParticipants: [mockLocalParticipant, ...mockParticipants],
    }));

    render(<GalleryView />);
    expect(screen.queryByTestId('pagination-prev-button')).not.toBeInTheDocument();
    expect(screen.getByTestId('pagination-next-button')).toBeInTheDocument();
  });

  it('does not show next button on last page', () => {
    mockUsePagination.mockImplementation(() => ({
      currentPage: 4,
      totalPages: 4,
      setCurrentPage: vi.fn(),
      paginatedParticipants: [mockLocalParticipant, ...mockParticipants],
    }));

    render(<GalleryView />);
    expect(screen.getByTestId('pagination-prev-button')).toBeInTheDocument();
    expect(screen.queryByTestId('pagination-next-button')).not.toBeInTheDocument();
  });

  it('does not render pagination if only one page', () => {
    mockUsePagination.mockImplementation(() => ({
      currentPage: 1,
      totalPages: 1,
      setCurrentPage: vi.fn(),
      paginatedParticipants: [mockLocalParticipant, ...mockParticipants],
    }));

    render(<GalleryView />);
    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
  });
});
