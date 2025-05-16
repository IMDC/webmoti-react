import { render } from '@testing-library/react';

import NetworkQualityLevel from './NetworkQualityLevel';
import { createMockParticipant } from '../../__mocks__/mockCreator';

describe('the NetworkQualityLevel component', () => {
  const mockParticipant = (level: number) =>
    createMockParticipant('mockparticipant', 1, { networkQualityLevel: level });

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
