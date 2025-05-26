import { beforeEach, describe, expect, it, vi } from "vitest";
import AboutDialog from './AboutDialog';
import { render } from '@testing-library/react';
import { useAppState } from '../../state';
import { clientEnv } from '../../clientEnv';

vi.mock('twilio-video', () => ({ version: '1.2', isSupported: true }));
vi.mock('../../state');
vi.mock('../../../package.json', () => ({ version: '1.3' }));

const mockUseAppState = useAppState as vi.Mock<any>;
mockUseAppState.mockImplementation(() => ({ roomType: undefined }));

describe('the AboutDialog component', () => {
  it('should display Video.isSupported', () => {
    const { getByText } = render(<AboutDialog open={true} onClose={() => {}} />);
    expect(getByText('Browser supported: true')).toBeTruthy();
  });

  it('should display the SDK version', () => {
    const { getByText } = render(<AboutDialog open={true} onClose={() => {}} />);
    expect(getByText('SDK Version: 1.2')).toBeTruthy();
  });

  it('should display the package.json version', () => {
    const { getByText } = render(<AboutDialog open={true} onClose={() => {}} />);
    // this is mocked at the top of the file
    expect(getByText('App Version: 1.3')).toBeTruthy();
  });

  it('should not display the room type when it is unknown', () => {
    const { queryByText } = render(<AboutDialog open={true} onClose={() => {}} />);
    expect(queryByText('Room Type:')).not.toBeTruthy();
  });

  it('should display the room type', () => {
    mockUseAppState.mockImplementationOnce(() => ({ roomType: 'group-small' }));
    const { getByText } = render(<AboutDialog open={true} onClose={() => {}} />);
    expect(getByText('Room Type: group-small')).toBeTruthy();
  });

  describe('when running locally', () => {
    beforeEach(() => {
      (clientEnv.GIT_TAG as vi.Mock).mockReturnValue(undefined);
      (clientEnv.GIT_COMMIT as vi.Mock).mockReturnValue(undefined);
    });

    it('should display N/A as the git tag', () => {
      const { getByText } = render(<AboutDialog open={true} onClose={() => {}} />);
      expect(getByText('Deployed Tag: N/A')).toBeTruthy();
    });

    it('should disaply N/A as the commit hash', () => {
      const { getByText } = render(<AboutDialog open={true} onClose={() => {}} />);
      expect(getByText('Deployed Commit Hash: N/A')).toBeTruthy();
    });
  });

  describe('when deployed via CircleCI', () => {
    beforeEach(() => {
      (clientEnv.GIT_TAG as vi.Mock).mockReturnValue('v0.1');
      (clientEnv.GIT_COMMIT as vi.Mock).mockReturnValue('01b2c3');
    });

    it('should display the git tag', () => {
      const { getByText } = render(<AboutDialog open={true} onClose={() => {}} />);
      expect(getByText('Deployed Tag: v0.1')).toBeTruthy();
    });

    it('should display the commit hash', () => {
      const { getByText } = render(<AboutDialog open={true} onClose={() => {}} />);
      expect(getByText('Deployed Commit Hash: 01b2c3')).toBeTruthy();
    });
  });
});
