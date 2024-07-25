import { TextField } from '@material-ui/core';
import { shallow } from 'enzyme';

import RoomNameScreen from './RoomNameScreen';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import { useAppState } from '../../../state';

jest.mock('../../../state');
jest.mock('../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext');

const mockUseAppState = useAppState as jest.Mock<any>;

const mockUseWebmotiVideoContext = useWebmotiVideoContext as jest.Mock<any>;
mockUseWebmotiVideoContext.mockImplementation(() => ({}));

describe('the RoomNameScreen component', () => {
  it('should render correctly when there is no logged-in user', () => {
    mockUseAppState.mockImplementationOnce(() => ({ user: undefined }));
    const wrapper = shallow(
      <RoomNameScreen
        name="test"
        roomName="testRoom"
        setName={() => {}}
        setRoomName={() => {}}
        handleSubmit={() => {}}
      />
    );

    expect(wrapper.text()).toContain("Enter your name and the name of a room you'd like to join");
    expect(wrapper.find(TextField).length).toBe(2);
  });

  it('should render correctly when there is a logged-in user', () => {
    mockUseAppState.mockImplementationOnce(() => ({ user: { displayName: 'Test Name' } }));
    const wrapper = shallow(
      <RoomNameScreen
        name="test"
        roomName="testRoom"
        setName={() => {}}
        setRoomName={() => {}}
        handleSubmit={() => {}}
      />
    );

    expect(wrapper.text()).toContain("Enter the name of a room you'd like to join");
    expect(wrapper.find(TextField).length).toBe(1);
  });

  it('should render correctly when there is a logged-in user and "customIdentity=true" query parameter"', () => {
    mockUseAppState.mockImplementationOnce(() => ({ user: { displayName: 'Test Name' } }));

    // @ts-ignore
    delete window.location;

    // @ts-ignore
    window.location = {
      search: 'customIdentity=true',
    };

    const wrapper = shallow(
      <RoomNameScreen
        name="test"
        roomName="testRoom"
        setName={() => {}}
        setRoomName={() => {}}
        handleSubmit={() => {}}
      />
    );

    expect(wrapper.text()).toContain("Enter your name and the name of a room you'd like to join");
    expect(wrapper.find(TextField).length).toBe(2);
  });
});
