import { beforeAll, beforeEach, describe, expect, it, vi, Mock } from 'vitest';
import { useMediaQuery } from '@mui/material';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Menu from './SettingsMenu';
import useVideoContext from '../../../../hooks/useVideoContext/useVideoContext';
import { useAppState } from '../../../../state';

vi.mock('../../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext', () => () => ({}));

vi.mock('@mui/material/useMediaQuery');
const mockUseMediaQuery = useMediaQuery as Mock<boolean>;

vi.mock('../../../../state');
const mockUseAppState = useAppState as Mock<any>;

vi.mock('../../../../hooks/useVideoContext/useVideoContext');
const mockUseVideoContext = useVideoContext as Mock<any>;
mockUseVideoContext.mockImplementation(() => ({
  localTracks: [],
  backgroundSettings: {
    type: 'blur',
    index: 0,
  },
  setBackgroundSettings: vi.fn(),
}));

describe('the SettingsMenu component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppState.mockImplementation(() => ({
      roomType: 'group',
      settings: {
        dominantSpeakerPriority: 'standard',
        trackSwitchOffMode: 'predicted',
        bandwidthProfileMode: 'collaboration',
        clientTrackSwitchOffControl: 'auto',
        contentPreferencesMode: 'auto',
        maxAudioBitrate: '',
      },
      dispatchSetting: vi.fn(),
    }));
  });

  describe('on desktop devices', () => {
    beforeAll(() => {
      mockUseMediaQuery.mockImplementation(() => false);
    });

    it('should open the Menu when the Button is clicked', async () => {
      render(<Menu />);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      await userEvent.click(screen.getByTestId('settings-button'));
      expect(screen.getByRole('menu')).toBeVisible();
    });

    it('should open the AboutDialog when the About button is clicked', async () => {
      render(<Menu />);
      await userEvent.click(screen.getByTestId('settings-button'));
      await userEvent.click(screen.getByTestId('about-menuitem'));
      expect(screen.getByRole('dialog', { name: /about/i })).toBeVisible();
    });

    it('should open the DeviceSelectionDialog when the Settings button is clicked', async () => {
      render(<Menu />);
      await userEvent.click(screen.getByTestId('settings-button'));
      await userEvent.click(screen.getByTestId('device-settings-menuitem'));
      await waitFor(() => {
        expect(screen.getByTestId('device-selection-dialog')).toBeInTheDocument();
      });
    });

    it('should open the ConnectionOptionsDialog when the Settings button is clicked', async () => {
      render(<Menu />);
      await userEvent.click(screen.getByTestId('settings-button'));
      await userEvent.click(screen.getByTestId('connection-settings-menuitem'));
      await waitFor(() => {
        expect(screen.getByTestId('connection-options-dialog')).toBeInTheDocument();
      });
    });

    it('should render the correct button', () => {
      render(<Menu />);
      expect(screen.getByTestId('settings-button').textContent).toMatch(/Settings/i);
    });

    it('should render the "Connection Settings" button when the roomType is "group"', async () => {
      render(<Menu />);
      await userEvent.click(screen.getByTestId('settings-button'));
      expect(screen.getByTestId('connection-settings-menuitem')).toBeInTheDocument();
    });
  });

  describe('on mobile devices', () => {
    beforeAll(() => {
      mockUseMediaQuery.mockImplementation(() => true);
    });

    it('should render the correct button text', () => {
      render(<Menu />);
      expect(screen.getByTestId('settings-button').textContent).toMatch(/More/i);
    });
  });
});
