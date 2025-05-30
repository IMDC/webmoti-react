import { render, screen } from '@testing-library/react';
import Video from 'twilio-video';

import UnsupportedBrowserWarning from './UnsupportedBrowserWarning';

describe('the UnsupportedBrowserWarning component', () => {
  it('should render the warning when isSupported is false', () => {
    // @ts-expect-error: read only mock
    Video.isSupported = false;

    render(
      <UnsupportedBrowserWarning>
        <span>Is supported</span>
      </UnsupportedBrowserWarning>
    );

    expect(screen.getByRole('heading', { name: /browser or context not supported/i })).toBeInTheDocument();
    expect(screen.getByText(/supported browsers/i)).toBeInTheDocument();
  });

  it('should render children when isSupported is true', () => {
    // @ts-expect-error: read only mock
    Video.isSupported = true;

    render(
      <UnsupportedBrowserWarning>
        <span>Is supported</span>
      </UnsupportedBrowserWarning>
    );

    expect(screen.getByText('Is supported')).toBeInTheDocument();
  });
});
