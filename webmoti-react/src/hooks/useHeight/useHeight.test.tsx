import { act, renderHook } from '@testing-library/react';

import useHeight from './useHeight';

describe('the useHeight hook', () => {
  it('should return window.innerHeight', () => {
    window.innerHeight = 100;
    const { result } = renderHook(useHeight);
    expect(result.current).toBe('100px');

    act(() => {
      window.innerHeight = 150;
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe('150px');
  });

  it('should take window.visualViewport.scale into account', () => {
    window.innerHeight = 100;

    //@ts-expect-error: mock browser property
    window.visualViewport = {
      scale: 2,
    };

    const { result } = renderHook(useHeight);
    expect(result.current).toBe('200px');

    act(() => {
      window.innerHeight = 150;
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe('300px');
  });
});
