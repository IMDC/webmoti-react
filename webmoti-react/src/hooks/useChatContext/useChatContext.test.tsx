import { renderHook } from '@testing-library/react';

import useChatContext from './useChatContext';

describe('the useChatContext hook', () => {
  it('should throw an error if used outside of the ChatProvider', () => {
    expect(() => renderHook(useChatContext)).toThrow('useChatContext must be used within a ChatProvider');
  });
});
