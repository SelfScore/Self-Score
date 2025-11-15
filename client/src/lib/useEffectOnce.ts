import { useEffect, useRef, EffectCallback } from 'react';

/**
 * Custom hook that ensures useEffect runs only once, even in React Strict Mode (development)
 * In development, React intentionally mounts components twice to detect side effects.
 * This hook prevents duplicate API calls during that double-mount.
 * 
 * @param effect - The effect callback to run
 * @param deps - Optional dependencies array
 */
export function useEffectOnce(effect: EffectCallback, deps?: React.DependencyList) {
  const hasRun = useRef(false);
  const effectRef = useRef(effect);
  
  // Update effect ref if it changes
  useEffect(() => {
    effectRef.current = effect;
  }, [effect]);

  useEffect(() => {
    // Only run once in development mode (React Strict Mode double-mount)
    if (hasRun.current) {
      return;
    }

    hasRun.current = true;
    return effectRef.current();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
