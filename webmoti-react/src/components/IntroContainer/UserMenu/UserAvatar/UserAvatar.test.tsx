import { describe, expect, it } from "vitest";
import { render, screen } from '@testing-library/react';

import UserAvatar, { getInitials } from './UserAvatar';

describe('the UserAvatar component', () => {
  it('shows initials when displayName is present', () => {
    render(<UserAvatar user={{ displayName: 'Test User' } as any} />);
    const initials = screen.getByTestId('user-avatar-initials');
    expect(initials).toHaveTextContent('TU');
  });

  it('shows Person icon when displayName and photoURL are missing', () => {
    render(<UserAvatar user={{} as any} />);
    const initials = screen.getByTestId('user-avatar-initials');
    // Since the fallback is an <svg>, we can assert that it exists
    expect(initials.querySelector('svg')).toBeInTheDocument();
  });

  it('shows photo when photoURL is present', () => {
    render(<UserAvatar user={{ photoURL: 'testURL' } as any} />);
    const avatar = screen.getByTestId('user-avatar-photo');
    const img = avatar.querySelector('img');
    expect(img).toHaveAttribute('src', 'testURL');
  });

  describe('getInitials()', () => {
    it('generates correct initials', () => {
      expect(getInitials('test')).toBe('T');
      expect(getInitials('Test User')).toBe('TU');
      expect(getInitials('test User TWO')).toBe('TUT');
    });
  });
});
