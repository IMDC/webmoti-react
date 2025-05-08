import EventEmitter from 'events';

import { screen, render } from '@testing-library/react';

import ParticipantList from './ParticipantList';
import { WEBMOTI_CAMERA_1, WEBMOTI_CAMERA_2 } from '../../constants';
import useMainParticipant from '../../hooks/useMainParticipant/useMainParticipant';
import useParticipantContext from '../../hooks/useParticipantsContext/useParticipantsContext';
import useScreenShareParticipant from '../../hooks/useScreenShareParticipant/useScreenShareParticipant';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useSelectedParticipant from '../VideoProvider/useSelectedParticipant/useSelectedParticipant';
import { useAppState } from '../../state';
import useWebmotiVideoContext from '../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';

jest.mock('../../hooks/useParticipantsContext/useParticipantsContext');
jest.mock('../../hooks/useVideoContext/useVideoContext');
jest.mock('../VideoProvider/useSelectedParticipant/useSelectedParticipant');
jest.mock('../../hooks/useMainParticipant/useMainParticipant');
jest.mock('../../hooks/useScreenShareParticipant/useScreenShareParticipant');
jest.mock('../../state');
jest.mock('../../hooks/useWebmotiVideoContext/useWebmotiVideoContext');

const mockParticipantContext = useParticipantContext as jest.Mock<any>;
const mockedVideoContext = useVideoContext as jest.Mock<any>;
const mockUseSelectedParticipant = useSelectedParticipant as jest.Mock<any>;
const mockUseMainParticipant = useMainParticipant as jest.Mock<any>;
const mockUseScreenShareParticipant = useScreenShareParticipant as jest.Mock<any>;
const mockUseAppState = useAppState as jest.Mock<any>;
const mockUseWebmotiVideoContext = useWebmotiVideoContext as jest.Mock<any>;

mockUseAppState.mockImplementation(() => ({ activeSinkId: '' }));

mockUseWebmotiVideoContext.mockImplementation(() => ({
  isCameraOneOff: false,
  isCameraTwoOff: false,
}));

function createMockParticipant({
  sid = 'mock-sid',
  identity = 'mock-identity',
  additionalProps = {},
}: {
  sid?: string;
  identity?: string;
  additionalProps?: Record<string, any>;
} = {}) {
  return {
    sid,
    identity,
    on: jest.fn(),
    off: jest.fn(),
    tracks: new Map(),
    ...additionalProps,
  };
}

describe('the ParticipantList component', () => {
  let mockRoom: any;

  beforeEach(() => {
    mockUseSelectedParticipant.mockImplementation(() => [null, () => {}]);
    mockRoom = new EventEmitter();
    mockRoom.localParticipant = 'localParticipant';
    // default mock for mainParticipant to prevent TypeError
    mockUseMainParticipant.mockImplementation(() => createMockParticipant({ sid: 'main', identity: 'other' }));
  });

  it('should correctly render Participant components', () => {
    const mockParticipant = createMockParticipant({ sid: '2', identity: WEBMOTI_CAMERA_1 });
    mockUseSelectedParticipant.mockImplementation(() => [mockParticipant, () => {}]);
    mockedVideoContext.mockImplementation(() => ({ room: mockRoom }));
    mockParticipantContext.mockImplementation(() => ({
      speakerViewParticipants: [
        createMockParticipant({ sid: '0', identity: WEBMOTI_CAMERA_1 }),
        createMockParticipant({ sid: '1', identity: WEBMOTI_CAMERA_2 }),
        mockParticipant,
      ],
    }));

    const { container } = render(<ParticipantList />);
    expect(container).toMatchSnapshot();
  });

  it('should add the isSelected prop to the first remote participant when it is selected', () => {
    const mockParticipant = createMockParticipant({ sid: '0', identity: WEBMOTI_CAMERA_1 });
    mockUseSelectedParticipant.mockImplementation(() => [mockParticipant, () => {}]);
    mockedVideoContext.mockImplementation(() => ({ room: mockRoom }));
    mockParticipantContext.mockImplementation(() => ({
      speakerViewParticipants: [mockParticipant, createMockParticipant({ sid: '1', identity: WEBMOTI_CAMERA_2 })],
    }));

    render(<ParticipantList />);
    const selected = screen.getByTestId(`participant-${WEBMOTI_CAMERA_1}`);
    expect(selected).toHaveAttribute('data-selected', 'true');
  });

  it('should not render anything when there are no remote participants', () => {
    mockedVideoContext.mockImplementation(() => ({ room: mockRoom }));
    mockParticipantContext.mockImplementation(() => ({
      speakerViewParticipants: [],
    }));

    const { container } = render(<ParticipantList />);
    expect(container.firstChild).toBeNull();
  });

  it('should add the hideParticipant prop when the participant is the mainParticipant', () => {
    const mockParticipant = createMockParticipant({ sid: '0', identity: WEBMOTI_CAMERA_1 });
    mockUseMainParticipant.mockImplementation(() => mockParticipant);
    mockedVideoContext.mockImplementation(() => ({ room: mockRoom }));
    mockParticipantContext.mockImplementation(() => ({
      speakerViewParticipants: [mockParticipant, createMockParticipant({ sid: '1', identity: WEBMOTI_CAMERA_2 })],
    }));

    render(<ParticipantList />);
    const main = screen.getByTestId(`participant-${WEBMOTI_CAMERA_1}`);
    const other = screen.getByTestId(`participant-${WEBMOTI_CAMERA_2}`);

    expect(main).toHaveAttribute('data-hidden', 'true');
    expect(other).toHaveAttribute('data-hidden', 'false');
  });

  it('should add the hideParticipant prop when the participant is the mainParticipant even if they are selected', () => {
    const mockParticipant = createMockParticipant({ sid: '0', identity: WEBMOTI_CAMERA_1 });
    mockUseMainParticipant.mockImplementation(() => mockParticipant);
    mockUseSelectedParticipant.mockImplementation(() => [mockParticipant, () => {}]);
    mockedVideoContext.mockImplementation(() => ({ room: mockRoom }));
    mockParticipantContext.mockImplementation(() => ({
      speakerViewParticipants: [mockParticipant, createMockParticipant({ sid: '1', identity: WEBMOTI_CAMERA_2 })],
    }));

    render(<ParticipantList />);
    const main = screen.getByTestId(`participant-${WEBMOTI_CAMERA_1}`);
    expect(main).toHaveAttribute('data-hidden', 'true');
  });

  it('should add the hideParticipant prop when the participant is the mainParticipant even if they are sharing their screen', () => {
    const mockParticipant = createMockParticipant({ sid: '0', identity: WEBMOTI_CAMERA_1 });
    mockUseMainParticipant.mockImplementation(() => mockParticipant);
    mockUseScreenShareParticipant.mockImplementation(() => mockParticipant);
    mockedVideoContext.mockImplementation(() => ({ room: mockRoom }));
    mockParticipantContext.mockImplementation(() => ({
      speakerViewParticipants: [mockParticipant, createMockParticipant({ sid: '1', identity: WEBMOTI_CAMERA_2 })],
    }));

    render(<ParticipantList />);
    const main = screen.getByTestId(`participant-${WEBMOTI_CAMERA_1}`);
    expect(main).toHaveAttribute('data-hidden', 'true');
  });
});
