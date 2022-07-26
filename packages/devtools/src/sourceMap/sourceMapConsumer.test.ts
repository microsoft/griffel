import type { RawSourceMap } from 'source-map-js';
import { getFilePath, getOriginalPosition, resources } from './sourceMapConsumer';

describe('getOriginalPosition', () => {
  it('returns input location when sourceMapJSon is invalid', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => ({}));

    const sourceMapJSON = {} as RawSourceMap;
    const sourceLoc = { source: '/src', line: 1, column: 10 };
    expect(await getOriginalPosition(sourceMapJSON, sourceLoc)).toBe(sourceLoc);

    expect(consoleSpy).toHaveBeenCalledTimes(2);
    consoleSpy.mockClear();
  });

  it('returns source url presented in chrome resources', async () => {
    const sourceMapJSON: RawSourceMap = {
      version: '3',
      file: './packages/test1/src/App.styles.js.js',
      mappings: ';;;;;AAAA;AACA;AACA;AACA;AACA;AACA;AACA',
      sources: ['webpack://@testscope/root/./packages/test1/src/App.styles.js?42f2'],
      sourcesContent: [
        "import { makeStyles } from '@griffel/react';\\n\\nexport const useStyles = makeStyles({\\n  root: {\\n    display: 'flex',\\n  },\\n});\\n",
      ],
      names: [],
      sourceRoot: '',
    };
    const sourceLoc = { source: 'webpack-internal:///./packages/test1/src/App.styles.js', line: 8, column: 77 };

    expect(await getOriginalPosition(sourceMapJSON, sourceLoc)).toEqual({
      column: 0,
      line: 3,
      name: null,
      // resources is mocked in jest.setup.js
      source: (await resources)[0].url,
    });
  });
});

describe('getFilePath', () => {
  it('returns url path', () => {
    expect(getFilePath('webpack-interal://src/a')).toBe('src/a');
    expect(getFilePath('webpack://src/a')).toBe('src/a');
    expect(getFilePath('/src/a')).toBe('src/a');
  });

  it('returns url path without @ prefix', () => {
    // Webpack uses name in package.json in source map url, which can have '@' prefix.
    // But the url in chrome resources always omit the '@' prefix
    expect(getFilePath('webpack://@test/pkg/src/a')).toBe('test/pkg/src/a');
  });
});
