import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from '@testing-library/react';
import { renderWithUser } from '../../../../utils/testUtils';

import { Media } from '@twilio/conversations';
import MediaMessage, { formatFileSize } from './MediaMessage';

describe('the formatFileSize function', () => {
  [
    { bytes: 789, result: '789 bytes' },
    { bytes: 1000, result: '0.98 KB' },
    { bytes: 1234, result: '1.21 KB' },
    { bytes: 67384, result: '65.8 KB' },
    { bytes: 567123, result: '553.83 KB' },
    { bytes: 1000000, result: '976.56 KB' },
    { bytes: 1647987, result: '1.57 MB' },
    { bytes: 23789647, result: '22.69 MB' },
    { bytes: 798234605, result: '761.26 MB' },
    { bytes: 2458769876, result: '2.29 GB' },
  ].forEach((testCase) => {
    it(`should format ${testCase.bytes} to "${testCase.result}"`, () => {
      expect(formatFileSize(testCase.bytes)).toBe(testCase.result);
    });
  });
});

describe('the MediaMessage component', () => {
  it('should get the file URL and load it in a new tab when clicked', async () => {
    const mockMedia = {
      filename: 'foo.txt',
      size: 123,
      getContentTemporaryUrl: () => Promise.resolve('http://twilio.com/foo.txt'),
    } as Media;

    const { user } = renderWithUser(<MediaMessage media={mockMedia} />);

    // mock anchor needs to be after it renders but before it gets clicked
    const mockAnchorElement = document.createElement('a');
    mockAnchorElement.click = vi.fn();
    document.createElement = vi.fn(() => mockAnchorElement);

    const clickable = screen.getByText(/foo\.txt/i).closest('div');
    await user.click(clickable!);

    await waitFor(() => {
      expect(mockAnchorElement.href).toBe('http://twilio.com/foo.txt');
      expect(mockAnchorElement.target).toBe('_blank');
      expect(mockAnchorElement.rel).toBe('noopener');
      // This extra setTimeout is needed for the iOS workaround
      // setTimeout(() => {
      expect(mockAnchorElement.click).toHaveBeenCalled();
      // });
    });
  });
});
