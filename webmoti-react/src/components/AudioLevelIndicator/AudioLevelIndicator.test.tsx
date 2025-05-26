import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from '@testing-library/react';

import AudioLevelIndicator from './AudioLevelIndicator';
import useIsTrackEnabled from '../../hooks/useIsTrackEnabled/useIsTrackEnabled';
import useWebmotiVideoContext from '../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';

vi.mock('../../hooks/useIsTrackEnabled/useIsTrackEnabled');
vi.mock('../../hooks/useWebmotiVideoContext/useWebmotiVideoContext');

const mockUseIsTrackEnabled = useIsTrackEnabled as vi.Mock<boolean>;
const mockUseWebmotiVideoContext = useWebmotiVideoContext as vi.Mock<any>;

beforeEach(() => {
  mockUseWebmotiVideoContext.mockReturnValue({ isMuted: () => true });
});

describe('AudioLevelIndicator', () => {
  describe('when the audioTrack is not enabled', () => {
    beforeEach(() => {
      mockUseIsTrackEnabled.mockReturnValue(false);
    });

    it('renders the mute icon', () => {
      render(<AudioLevelIndicator color="#123456" />);
      const muteIcon = screen.getByTestId('audio-mute-icon');
      expect(muteIcon).toBeInTheDocument();

      const fillElement = muteIcon.querySelector('[fill="#123456"]');
      expect(fillElement).toBeInTheDocument();
    });
  });

  describe('when the audioTrack is enabled', () => {
    beforeEach(() => {
      mockUseIsTrackEnabled.mockReturnValue(true);
    });

    it('renders the audio level indicator instead of mute icon', () => {
      render(<AudioLevelIndicator color="#123456" />);
      expect(screen.queryByTestId('audio-mute-icon')).toBeNull();

      const indicator = screen.getByTestId('audio-indicator');
      expect(indicator).toBeInTheDocument();

      const fillElement = indicator.querySelector('[fill="#123456"]');
      expect(fillElement).toBeInTheDocument();
    });
  });
});
