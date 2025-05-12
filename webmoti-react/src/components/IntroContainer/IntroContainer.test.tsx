import { render, screen } from '@testing-library/react';
import { useLocation } from 'react-router-dom';

import IntroContainer from './IntroContainer';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useAppState } from '../../state';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));
jest.mock('../../state');
jest.mock('../../hooks/useVideoContext/useVideoContext');

const mockUseLocation = useLocation as jest.Mock<any>;
const mockUseAppState = useAppState as jest.Mock<any>;
const mockUseVideoContext = useVideoContext as jest.Mock<any>;

mockUseVideoContext.mockImplementation(() => ({
  localTracks: [{ kind: 'audio' }],
}));

describe('IntroContainer', () => {
  beforeEach(() => {
    mockUseLocation.mockReset();
    mockUseAppState.mockReset();
    process.env.REACT_APP_SET_AUTH = 'firebase';
  });

  it('renders UserMenu when user exists and pathname is not /login', () => {
    mockUseLocation.mockImplementation(() => ({ pathname: '/test' }));
    mockUseAppState.mockImplementation(() => ({ user: { displayName: 'Test User' } }));

    render(
      <IntroContainer>
        <span>Test Content</span>
      </IntroContainer>
    );

    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
  });

  it('does not render UserMenu when pathname is /login', () => {
    mockUseLocation.mockImplementation(() => ({ pathname: '/login' }));
    mockUseAppState.mockImplementation(() => ({ user: { displayName: 'Test User' } }));

    render(
      <IntroContainer>
        <span>Test Content</span>
      </IntroContainer>
    );

    expect(screen.queryByTestId('user-menu')).not.toBeInTheDocument();
  });

  it('does not render UserMenu when user is undefined', () => {
    mockUseLocation.mockImplementation(() => ({ pathname: '/test' }));
    mockUseAppState.mockImplementation(() => ({ user: undefined }));

    render(
      <IntroContainer>
        <span>Test Content</span>
      </IntroContainer>
    );

    expect(screen.queryByTestId('user-menu')).not.toBeInTheDocument();
  });

  it('renders children content', () => {
    mockUseLocation.mockImplementation(() => ({ pathname: '/test' }));
    mockUseAppState.mockImplementation(() => ({ user: undefined }));

    render(
      <IntroContainer>
        <span>Test Content</span>
      </IntroContainer>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
