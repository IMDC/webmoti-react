import { render } from '@testing-library/react';

import NetworkQualityLevel from './NetworkQualityLevel';

describe('the NetworkQualityLevel component', () => {
  const mockParticipant = (level: number) => ({ networkQualityLevel: level, on: () => {} }) as any;

  it('should render correctly for level 5', () => {
    const { container } = render(<NetworkQualityLevel participant={mockParticipant(5)} />);
    expect(container).toMatchSnapshot();
  });

  it('should render correctly for level 3', () => {
    const { container } = render(<NetworkQualityLevel participant={mockParticipant(3)} />);
    expect(container).toMatchSnapshot();
  });

  it('should render correctly for level 0', () => {
    const { container } = render(<NetworkQualityLevel participant={mockParticipant(0)} />);
    expect(container).toMatchSnapshot();
  });
});
