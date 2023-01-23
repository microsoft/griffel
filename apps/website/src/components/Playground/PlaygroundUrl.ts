import { useActiveCode } from '@codesandbox/sandpack-react';
import * as lz from 'lz-string';
import * as React from 'react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * The component that checks for code modifications in the editor and updates URL to store it code there.
 */
export function PlaygroundUrl({ template }: { template: string }) {
  const { code, updateCode } = useActiveCode();
  const searchParam = useDebounce(code === template ? null : lz.compressToEncodedURIComponent(code), 400);

  React.useEffect(() => {
    const url = new URL(window.location.href);

    if (searchParam) {
      url.searchParams.set('code', searchParam);
    } else {
      url.searchParams.delete('code');
    }

    window.history.replaceState({}, '', url);
  }, [searchParam]);

  React.useLayoutEffect(() => {
    const url = new URL(window.location.href);

    const searchParam = url.searchParams.get('code');
    const code = searchParam && lz.decompressFromEncodedURIComponent(searchParam);

    if (code) {
      updateCode(code);
    }
  }, []);

  return null;
}
