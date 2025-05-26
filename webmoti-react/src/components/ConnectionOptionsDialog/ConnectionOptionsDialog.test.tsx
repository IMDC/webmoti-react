import { render, screen, waitFor } from '@testing-library/react';
import { renderWithUser } from '../../utils/testUtils';

import ConnectionOptionsDialog from './ConnectionOptionsDialog';
import { initialSettings } from '../../state/settings/settingsReducer';
import { useAppState } from '../../state';
import useRoomState from '../../hooks/useRoomState/useRoomState';

jest.mock('../../hooks/useRoomState/useRoomState');
jest.mock('../../state');

const mockUseAppState = useAppState as jest.Mock<any>;
const mockUseRoomState = useRoomState as jest.Mock<any>;

const mockDispatchSetting = jest.fn();
mockUseAppState.mockImplementation(() => ({ settings: initialSettings, dispatchSetting: mockDispatchSetting }));

describe('the ConnectionOptionsDialog component', () => {
  afterEach(jest.clearAllMocks);

  describe('when not connected to a room', () => {
    beforeEach(() => {
      mockUseRoomState.mockImplementation(() => 'disconnected');
    });

    it('should render correctly', () => {
      const { container } = render(<ConnectionOptionsDialog open={true} onClose={() => {}} />);
      expect(container).toMatchSnapshot();
    });

    it('should dispatch settings changes', async () => {
      const { user } = renderWithUser(<ConnectionOptionsDialog open={true} onClose={() => {}} />);

      const selectBox = screen.getByRole('combobox', { name: /dominant speaker priority/i });
      await user.click(selectBox);

      // select a different value than the default
      const newOption = screen.getByRole('option', { name: 'Low' });
      await user.click(newOption);

      await waitFor(() => {
        expect(mockDispatchSetting).toHaveBeenCalledWith({
          name: 'dominantSpeakerPriority',
          value: 'low',
        });
      });
    });

    it('should not dispatch settings changes from a number field when there are non-digits in the value', async () => {
      const { user } = renderWithUser(<ConnectionOptionsDialog open={true} onClose={() => {}} />);

      const input = screen.getByLabelText(/max audio bitrate/i);
      await user.clear(input);
      await user.type(input, '123456a');

      const calls = mockDispatchSetting.mock.calls;
      expect(calls).not.toContainEqual([{ name: 'maxAudioBitrate', value: '123456a' }]);
    });

    it('should dispatch settings changes from a number field when there are only digits in the value', async () => {
      const { user } = renderWithUser(<ConnectionOptionsDialog open={true} onClose={() => {}} />);

      const input = screen.getByLabelText(/max audio bitrate/i);
      await user.clear(input);
      await user.type(input, '123456');

      expect(mockDispatchSetting).toHaveBeenCalledWith({
        name: 'maxAudioBitrate',
        value: '480006',
      });
    });

    describe('when connected to a room', () => {
      mockUseRoomState.mockImplementation(() => 'connected');
      it('should render correctly', () => {
        const { container } = render(<ConnectionOptionsDialog open={true} onClose={() => {}} />);
        expect(container).toMatchSnapshot();
      });
    });
  });
});
