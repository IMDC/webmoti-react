import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from '@testing-library/react';
import { useLocation } from 'react-router-dom';

import IntroContainer from './IntroContainer';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useAppState } from '../../state';
import { clientEnv } from '../../clientEnv';

vi.mock('react-router-dom', () => ({
  useLocation: vi.fn(),
}));
vi.mock('../../state');
vi.mock('../../hooks/useVideoContext/useVideoContext');

const mockUseLocation = useLocation as vi.Mock<any>;
const mockUseAppState = useAppState as vi.Mock<any>;
const mockUseVideoContext = useVideoContext as vi.Mock<any>;

mockUseVideoContext.mockImplementation(() => ({
  localTracks: [{ kind: 'audio' }],
}));

describe('IntroContainer', () => {
  beforeEach(() => {
    mockUseLocation.mockReset();
    mockUseAppState.mockReset();
    (clientEnv.SET_AUTH as vi.Mock).mockReturnValue('firebase');
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
