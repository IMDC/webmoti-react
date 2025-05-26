import { describe, expect, it } from "vitest";
import useVideoContext from './useVideoContext';
import { renderHook } from '@testing-library/react';

describe('the useVideoContext hook', () => {
  it('should throw an error if used outside of the VideoProvider', () => {
    expect(() => renderHook(useVideoContext)).toThrow('useVideoContext must be used within a VideoProvider');
  });
});
