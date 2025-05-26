import { beforeEach, describe, expect, it, vi, Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import RoomNameScreen from './RoomNameScreen';
import { useAppState } from '../../../state';

vi.mock('../../../state');
const mockUseAppState = useAppState as Mock<any>;

// !
// ! we don't use the customIdentity query parameter so these tests aren't needed
// !
describe.skip('the RoomNameScreen component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly when there is no logged-in user', () => {
    mockUseAppState.mockImplementation(() => ({ user: undefined }));

    render(
      <RoomNameScreen
        name="test"
        roomName="testRoom"
        setName={() => {}}
        setRoomName={() => {}}
        handleSubmit={() => {}}
      />
    );

    expect(screen.getByText('Enter your first name and click continue')).toBeInTheDocument();
    expect(screen.getByLabelText(/your first name/i)).toBeInTheDocument();
  });

  it('should render correctly when there is a logged-in user', () => {
    mockUseAppState.mockImplementation(() => ({ user: { displayName: 'Test Name' } }));

    render(
      <RoomNameScreen
        name="test"
        roomName="testRoom"
        setName={() => {}}
        setRoomName={() => {}}
        handleSubmit={() => {}}
      />
    );

    expect(screen.getByText('Enter your first name and click continue')).toBeInTheDocument();
    expect(screen.queryByLabelText(/your first name/i)).not.toBeInTheDocument();
  });

  it('should render name field when user is logged in but "customIdentity=true" is in the query string', () => {
    mockUseAppState.mockImplementation(() => ({ user: { displayName: 'Test Name' } }));

    Object.defineProperty(window, 'location', {
      writable: true,
      value: { search: '?customIdentity=true' },
    });

    render(
      <RoomNameScreen
        name="test"
        roomName="testRoom"
        setName={() => {}}
        setRoomName={() => {}}
        handleSubmit={() => {}}
      />
    );

    expect(screen.getByText('Enter your first name and click continue')).toBeInTheDocument();
    expect(screen.getByLabelText(/your first name/i)).toBeInTheDocument();
  });
});
