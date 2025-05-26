import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from '@testing-library/react';

import BackgroundThumbnail from './BackgroundThumbnail';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';

vi.mock('../../../hooks/useVideoContext/useVideoContext');
const mockUseVideoContext = useVideoContext as vi.Mock<any>;
const mockSetBackgroundSettings = vi.fn();
mockUseVideoContext.mockImplementation(() => ({
  backgroundSettings: {
    type: 'blur',
    index: 0,
  },
  setBackgroundSettings: mockSetBackgroundSettings,
}));

describe('The BackgroundThumbnail component', () => {
  it('should update the background settings when clicked', () => {
    render(<BackgroundThumbnail thumbnail={'none'} index={5} />);
    fireEvent.click(screen.getByTestId('background-thumbnail'));
    expect(mockSetBackgroundSettings).toHaveBeenCalledWith({ index: 5, type: 'none' });
  });

  // when testing background thumbnail with 'none' or 'icon', use icon-container test id
  // for 'image', use 'image-container'
  it('should not be selected when thumbnail prop and backgroundSettings type are not equivalent (icon)', () => {
    render(<BackgroundThumbnail thumbnail={'none'} />);
    const iconContainer = screen.getByTestId('icon-container');
    expect(iconContainer).not.toHaveClass('selected');
  });

  it('should be selected when thumbnail prop and backgroundSettings type are equivalent (icon)', () => {
    render(<BackgroundThumbnail thumbnail={'blur'} />);
    const iconContainer = screen.getByTestId('icon-container');
    expect(iconContainer).toHaveClass('selected');
  });

  it('should be selected when thumbnail prop and backgroundSettings type are equivalent (image)', () => {
    mockUseVideoContext.mockImplementationOnce(() => ({
      backgroundSettings: {
        type: 'image',
        index: 1,
      },
      setBackgroundSettings: mockSetBackgroundSettings,
    }));

    render(<BackgroundThumbnail thumbnail={'image'} index={1} />);
    const imageContainer = screen.getByTestId('image-container');
    expect(imageContainer).toHaveClass('selected');
  });

  it('should not be selected when thumbnail and backgroundSettings type are not equivlanet (image)', () => {
    mockUseVideoContext.mockImplementationOnce(() => ({
      backgroundSettings: {
        type: 'image',
        index: 1,
      },
      setBackgroundSettings: mockSetBackgroundSettings,
    }));

    render(<BackgroundThumbnail thumbnail={'image'} index={5} />);
    const imageContainer = screen.getByTestId('image-container');
    expect(imageContainer).not.toHaveClass('selected');
  });

  it("should contain the NoneIcon when thumbnail is set to 'none'", () => {
    render(<BackgroundThumbnail thumbnail={'none'} />);
    const noneIcon = screen.getByTestId('none-icon');
    expect(noneIcon).toBeInTheDocument();
  });

  it("should contain the BlurIcon when thumbnail is set to 'blur'", () => {
    render(<BackgroundThumbnail thumbnail={'blur'} />);
    const blurIcon = screen.getByTestId('blur-icon');
    expect(blurIcon).toBeInTheDocument();
  });

  it("should not have any icons when thumbnail is set to 'image'", () => {
    render(<BackgroundThumbnail thumbnail={'image'} />);
    const noneIcon = screen.queryByTestId('none-icon');
    const blurIcon = screen.queryByTestId('blur-icon');
    expect(noneIcon).not.toBeInTheDocument();
    expect(blurIcon).not.toBeInTheDocument();
  });
});
