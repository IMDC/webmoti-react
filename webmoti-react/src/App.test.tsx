import { describe, expect, it, vi } from "vitest";
import { render, screen } from '@testing-library/react';
import App from './App';
import useRoomState from './hooks/useRoomState/useRoomState';
import useHeight from './hooks/useHeight/useHeight';

vi.mock('./hooks/useRoomState/useRoomState');
vi.mock('./hooks/useHeight/useHeight');

vi.mock('./components/PreJoinScreens/PreJoinScreens', () => () => <div data-testid="PreJoinScreens" />);
vi.mock('./components/Room/Room', () => () => <div data-testid="Room" />);
vi.mock('./components/MenuBar/MenuBar', () => () => <div data-testid="MenuBar" />);
vi.mock('./components/MobileTopMenuBar/MobileTopMenuBar', () => () => <div />);
vi.mock('./components/ReconnectingNotification/ReconnectingNotification', () => () => <div />);
vi.mock('./components/RecordingNotifications/RecordingNotifications', () => () => <div />);

const mockUseRoomState = useRoomState as vi.Mock;
const mockUseHeight = useHeight as vi.Mock;

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
