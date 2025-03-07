import EventEmitter from 'events';

import { shallow } from 'enzyme';

import ParticipantList from './ParticipantList';
import { WEBMOTI_CAMERA_1, WEBMOTI_CAMERA_2 } from '../../constants';
import useMainParticipant from '../../hooks/useMainParticipant/useMainParticipant';
import useParticipantContext from '../../hooks/useParticipantsContext/useParticipantsContext';
import useScreenShareParticipant from '../../hooks/useScreenShareParticipant/useScreenShareParticipant';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useSelectedParticipant from '../VideoProvider/useSelectedParticipant/useSelectedParticipant';

jest.mock('../../hooks/useParticipantsContext/useParticipantsContext');
jest.mock('../../hooks/useVideoContext/useVideoContext');
jest.mock('../VideoProvider/useSelectedParticipant/useSelectedParticipant');
jest.mock('../../hooks/useMainParticipant/useMainParticipant');
jest.mock('../../hooks/useScreenShareParticipant/useScreenShareParticipant');

const mockParticipantContext = useParticipantContext as jest.Mock<any>;
const mockedVideoContext = useVideoContext as jest.Mock<any>;
const mockUseSelectedParticipant = useSelectedParticipant as jest.Mock<any>;
const mockUseMainParticipant = useMainParticipant as jest.Mock<any>;
const mockUseScreenShareParticipant = useScreenShareParticipant as jest.Mock<any>;

describe('the ParticipantList component', () => {
  let mockRoom: any;

  beforeEach(() => {
    mockUseSelectedParticipant.mockImplementation(() => [null, () => {}]);
    mockRoom = new EventEmitter();
    mockRoom.localParticipant = 'localParticipant';
    // default mock for mainParticipant to prevent TypeError
    mockUseMainParticipant.mockImplementation(() => ({ sid: 'main', identity: 'other' }));
  });

  it('should correctly render Participant components', () => {
    const mockParticipant = { sid: '2', identity: WEBMOTI_CAMERA_1 };
    mockUseSelectedParticipant.mockImplementation(() => [mockParticipant, () => {}]);
    mockedVideoContext.mockImplementation(() => ({ room: mockRoom }));
    mockParticipantContext.mockImplementation(() => ({
      speakerViewParticipants: [
        { sid: '0', identity: WEBMOTI_CAMERA_1 },
        { sid: '1', identity: WEBMOTI_CAMERA_2 },
        mockParticipant,
      ],
    }));

    const wrapper = shallow(<ParticipantList />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should add the isSelected prop to the first remote participant when it is selected', () => {
    const mockParticipant = { sid: '0', identity: WEBMOTI_CAMERA_1 };
    mockUseSelectedParticipant.mockImplementation(() => [mockParticipant, () => {}]);
    mockedVideoContext.mockImplementation(() => ({ room: mockRoom }));
    mockParticipantContext.mockImplementation(() => ({
      speakerViewParticipants: [mockParticipant, { sid: '1', identity: WEBMOTI_CAMERA_2 }],
    }));

    const wrapper = shallow(<ParticipantList />);
    // index 0 is the first remote participant
    expect(wrapper.find('Memo(Participant)').at(0).prop('isSelected')).toBe(true);
  });

  it('should not render anything when there are no remote participants', () => {
    mockedVideoContext.mockImplementation(() => ({ room: mockRoom }));
    mockParticipantContext.mockImplementation(() => ({
      speakerViewParticipants: [],
    }));

    const wrapper = shallow(<ParticipantList />);
    expect(wrapper.getElement()).toBe(null);
  });

  it('should add the hideParticipant prop when the participant is the mainParticipant', () => {
    const mockParticipant = { sid: '0', identity: WEBMOTI_CAMERA_1 };
    mockUseMainParticipant.mockImplementation(() => mockParticipant);
    mockedVideoContext.mockImplementation(() => ({ room: mockRoom }));
    mockParticipantContext.mockImplementation(() => ({
      speakerViewParticipants: [mockParticipant, { sid: '1', identity: WEBMOTI_CAMERA_2 }],
    }));

    const wrapper = shallow(<ParticipantList />);
    // since mainParticipant.identity is WEBMOTI_CAMERA_1, allowedIdentitiesInFiltered is [WEBMOTI_CAMERA_2]
    // index 0 (mainParticipant) should be hidden, index 1 shouldn't
    expect(wrapper.find('Memo(Participant)').at(0).prop('hideParticipant')).toBe(true);
    expect(wrapper.find('Memo(Participant)').at(1).prop('hideParticipant')).toBe(false);
  });

  it('should add the hideParticipant prop when the participant is the mainParticipant even if they are selected', () => {
    const mockParticipant = { sid: '0', identity: WEBMOTI_CAMERA_1 };
    mockUseMainParticipant.mockImplementation(() => mockParticipant);
    mockUseSelectedParticipant.mockImplementation(() => [mockParticipant, () => {}]);
    mockedVideoContext.mockImplementation(() => ({ room: mockRoom }));
    mockParticipantContext.mockImplementation(() => ({
      speakerViewParticipants: [mockParticipant, { sid: '1', identity: WEBMOTI_CAMERA_2 }],
    }));

    const wrapper = shallow(<ParticipantList />);
    // when showAll is false, hideParticipant is based on identity, not selection
    expect(wrapper.find('Memo(Participant)').at(0).prop('hideParticipant')).toBe(true);
  });

  it('should add the hideParticipant prop when the participant is the mainParticipant even if they are sharing their screen', () => {
    const mockParticipant = { sid: '0', identity: WEBMOTI_CAMERA_1 };
    mockUseMainParticipant.mockImplementation(() => mockParticipant);
    mockUseScreenShareParticipant.mockImplementation(() => mockParticipant);
    mockedVideoContext.mockImplementation(() => ({ room: mockRoom }));
    mockParticipantContext.mockImplementation(() => ({
      speakerViewParticipants: [mockParticipant, { sid: '1', identity: WEBMOTI_CAMERA_2 }],
    }));

    const wrapper = shallow(<ParticipantList />);
    expect(wrapper.find('Memo(Participant)').at(0).prop('hideParticipant')).toBe(true);
  });
});
