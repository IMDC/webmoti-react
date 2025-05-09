import { render, screen } from '@testing-library/react';
import App from './App';
import useRoomState from './hooks/useRoomState/useRoomState';
import useHeight from './hooks/useHeight/useHeight';

jest.mock('./hooks/useRoomState/useRoomState');
jest.mock('./hooks/useHeight/useHeight');

jest.mock('./components/PreJoinScreens/PreJoinScreens', () => () => <div data-testid="PreJoinScreens" />);
jest.mock('./components/Room/Room', () => () => <div data-testid="Room" />);
jest.mock('./components/MenuBar/MenuBar', () => () => <div data-testid="MenuBar" />);
jest.mock('./components/MobileTopMenuBar/MobileTopMenuBar', () => () => <div />);
jest.mock('./components/ReconnectingNotification/ReconnectingNotification', () => () => <div />);
jest.mock('./components/RecordingNotifications/RecordingNotifications', () => () => <div />);

const mockUseRoomState = useRoomState as jest.Mock;
const mockUseHeight = useHeight as jest.Mock;

mockUseHeight.mockReturnValue('500px');

describe('App component', () => {
  it('renders PreJoinScreens when disconnected', () => {
    mockUseRoomState.mockReturnValue('disconnected');
    const { container } = render(<App />);

    expect(screen.getByTestId('PreJoinScreens')).toBeInTheDocument();
    expect(screen.queryByTestId('Room')).not.toBeInTheDocument();
    expect(screen.queryByTestId('MenuBar')).not.toBeInTheDocument();
    expect(container.firstChild).toHaveStyle('height: 500px');
  });

  it('renders Room and MenuBar when connected', () => {
    mockUseRoomState.mockReturnValue('connected');
    render(<App />);

    expect(screen.getByTestId('Room')).toBeInTheDocument();
    expect(screen.getByTestId('MenuBar')).toBeInTheDocument();
    expect(screen.queryByTestId('PreJoinScreens')).not.toBeInTheDocument();
  });

  it('applies height from useHeight to outer container', () => {
    mockUseRoomState.mockReturnValue('disconnected');
    const { container } = render(<App />);
    expect(container.firstChild).toHaveStyle('height: 500px');
  });
});
