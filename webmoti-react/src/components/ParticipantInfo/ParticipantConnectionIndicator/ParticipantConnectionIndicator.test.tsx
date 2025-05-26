import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from '@testing-library/react';
import { renderWithUser } from '../../../utils/testUtils';

import ParticipantConnectionIndicator from './ParticipantConnectionIndicator';
import useParticipantIsReconnecting from '../../../hooks/useParticipantIsReconnecting/useParticipantIsReconnecting';

vi.mock('../../../hooks/useParticipantIsReconnecting/useParticipantIsReconnecting');

const mockUseParticipantIsReconnecting = useParticipantIsReconnecting as vi.Mock<boolean>;

describe('the ParticipantConnectionIndicator component', () => {
  describe('when the participant is reconnecting', () => {
    beforeEach(() => mockUseParticipantIsReconnecting.mockImplementation(() => true));

    it('should render the correct toolip', async () => {
      const { user } = renderWithUser(<ParticipantConnectionIndicator participant={{} as any} />);

      const indicator = screen.getByTestId('connection-indicator');
      await user.hover(indicator);

      expect(await screen.findByText('Participant is reconnecting')).toBeInTheDocument();
    });

    it('should have isReconnecting css class', async () => {
      const { user } = renderWithUser(<ParticipantConnectionIndicator participant={{} as any} />);
      const indicator = screen.getByTestId('connection-indicator');
      await user.hover(indicator);
      expect(indicator.className).toContain('isReconnecting');
    });
  });

  describe('when the participant is not reconnecting', () => {
    beforeEach(() => mockUseParticipantIsReconnecting.mockImplementation(() => false));

    it('should render the correct tooltip', async () => {
      const { user } = renderWithUser(<ParticipantConnectionIndicator participant={{} as any} />);
      const indicator = screen.getByTestId('connection-indicator');
      await user.hover(indicator);
      expect(await screen.findByText('Participant is connected')).toBeInTheDocument();
    });

    it('should not have isReconnecting css class', async () => {
      const { user } = renderWithUser(<ParticipantConnectionIndicator participant={{} as any} />);
      const indicator = screen.getByTestId('connection-indicator');
      await user.hover(indicator);
      expect(indicator.className).not.toContain('isReconnecting');
    });
  });
});
