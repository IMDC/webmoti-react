import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export function renderWithUser(ui: React.ReactElement) {
  const user = userEvent.setup();
  return {
    user,
    ...render(ui),
  };
}
