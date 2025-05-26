import { describe, expect, it, vi } from "vitest";
import { screen, render } from '@testing-library/react';

import AudioOutputList from './AudioOutputList';
import useDevices from '../../../hooks/useDevices/useDevices';
import { useAppState } from '../../../state';

vi.mock('../../../state');
vi.mock('../../../hooks/useDevices/useDevices');

const mockUseAppState = useAppState as vi.Mock<any>;
const mockUseDevices = useDevices as vi.Mock<any>;

mockUseAppState.mockImplementation(() => ({ activeSinkId: '123' }));

const mockDevice = {
  deviceId: '123',
  label: 'mock device',
};

describe('the AudioOutputList component', () => {
  it('should display the name of the active output device if only one is available', () => {
    mockUseDevices.mockImplementation(() => ({ audioOutputDevices: [mockDevice] }));
    render(<AudioOutputList />);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByText('mock device')).toBeInTheDocument();
  });

  it('should display "System Default Audio Output" when no audio output devices are available', () => {
    mockUseDevices.mockImplementation(() => ({ audioOutputDevices: [] }));
    render(<AudioOutputList />);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByText('System Default Audio Output')).toBeInTheDocument();
  });

  it('should display a Select menu when multiple audio output devices are available', () => {
    mockUseDevices.mockImplementation(() => ({ audioOutputDevices: [mockDevice, mockDevice] }));
    render(<AudioOutputList />);
    expect(screen.queryByRole('combobox')).toBeInTheDocument();
  });
});
