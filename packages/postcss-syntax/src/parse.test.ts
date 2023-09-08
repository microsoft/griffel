import { GRIFFEL_DECLARATOR_RAW, GRIFFEL_SLOT_RAW, GRIFFEL_SRC_RAW } from './constants';
import { parse } from './parse';
import * as prettier from 'prettier';

const format = (css: string) => {
  return prettier.format(css, { parser: 'css' });
};

describe('parse', () => {
  describe('makeStyles', () => {
    it('should return postcss AST of valid CSS', () => {
      const fixture = `
import { makeStyles } from '@griffel/react';

const mixin = () => ({
  marginTop: '4px',
})

export const useStyles = makeStyles({
  root: {
    color: 'red',
    backgroundColor: 'green',
    ...mixin()
  }
})
`;
      const root = parse(fixture, { from: 'fixture.styles.ts' });
      expect(format(root.toString())).toMatchInlineSnapshot(`
              ".fe3e8s9 {
                color: red;
              }
              .fcnqdeg {
                background-color: green;
              }
              .fvjh0tl {
                margin-top: 4px;
              }
              "
          `);
    });

    it('should handle different module source', () => {
      const fixture = `
import { foo} from '@foo/foo';

const mixin = () => ({
  marginTop: '4px',
})

export const useStyles = foo({
  root: {
    color: 'red',
    backgroundColor: 'green',
    ...mixin()
  }
})
`;
      const root = parse(fixture, {
        from: 'fixture.styles.ts',
        modules: [{ moduleSource: '@foo/foo', importName: 'foo' }],
      });
      expect(format(root.toString())).toMatchInlineSnapshot(`
              ".fe3e8s9 {
                color: red;
              }
              .fcnqdeg {
                background-color: green;
              }
              .fvjh0tl {
                margin-top: 4px;
              }
              "
          `);

      root.walk(node => {
        expect(node.raw(GRIFFEL_DECLARATOR_RAW)).toEqual('useStyles');
        expect(node.raw(GRIFFEL_SLOT_RAW)).toEqual('root');

        if (node.source) {
          expect(node.source.start).toEqual({ offset: 0, column: 2, line: 9 });
          expect(node.source.end).toEqual({ offset: 0, column: 3, line: 13 });
        }
      });
    });

    it('should map style locations to slots', () => {
      const fixture = `
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  slot1: {
    color: 'red',
  },

  slot2: {
    color: 'blue',
  }
})
`;
      const root = parse(fixture, { from: 'fixture.styles.ts' });

      root.walk(node => {
        const slot = node.raw(GRIFFEL_SLOT_RAW);
        expect(['slot1', 'slot2']).toContain(slot);

        if (node.source) {
          // This test will depend on the source fixture and its indentation
          if (slot === 'slot1') {
            expect(node.source.start).toEqual({ offset: 0, column: 2, line: 5 });
            expect(node.source.end).toEqual({ offset: 0, column: 3, line: 7 });
          }

          if (slot === 'slot2') {
            expect(node.source.start).toEqual({ offset: 0, column: 2, line: 9 });
            expect(node.source.end).toEqual({ offset: 0, column: 3, line: 11 });
          }
        }
      });
    });

    it('should hold original source in document raw field', () => {
      const fixture = `
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  slot1: {
    color: 'red',
  },

  slot2: {
    color: 'blue',
  }
})
`;
      const root = parse(fixture, { from: 'fixture.styles.ts' });
      expect(root.raw(GRIFFEL_SRC_RAW)).toEqual(fixture);
    });

    it('should handle multiple declarators', () => {
      const fixture = `
import { makeStyles } from '@griffel/react';

export const useStyles1 = makeStyles({
  slot: {
    color: 'red',
  },
})

export const useStyles2 = makeStyles({
  slot: {
    color: 'red',
  },
})
`;
      const root = parse(fixture, { from: 'fixture.styles.ts' });
      root.walk(node => {
        const declarator = node.raw(GRIFFEL_DECLARATOR_RAW);
        expect(['useStyles1', 'useStyles2']).toContain(declarator);

        if (node.source) {
          if (declarator === 'useStyles1') {
            expect(node.source.start).toEqual({ offset: 0, column: 2, line: 5 });
            expect(node.source.end).toEqual({ offset: 0, column: 3, line: 7 });
          }

          if (declarator === 'useStyles2') {
            expect(node.source.start).toEqual({ offset: 0, column: 2, line: 11 });
            expect(node.source.end).toEqual({ offset: 0, column: 3, line: 13 });
          }
        }
      });
    });
  });

  describe('makeResetStyles', () => {
    it('should return postcss AST of valid CSS', () => {
      const fixture = `
import { makeResetStyles } from '@griffel/react';

export const useResetStyles = makeResetStyles({
  color: 'red',
  backgroundColor: 'green',
})
`;
      const root = parse(fixture, { from: 'fixture.styles.ts' });
      expect(format(root.toString())).toMatchInlineSnapshot(`
        ".rbe9p1m {
          color: red;
          background-color: green;
        }
        "
      `);
    });

    it('should handle different module source', () => {
      const fixture = `
import { foo } from '@foo/foo';

export const useResetStyles = foo({
  color: 'red',
  backgroundColor: 'green',
})
`;
      const root = parse(fixture, {
        from: 'fixture.styles.ts',
        modules: [{ moduleSource: '@foo/foo', importName: 'makeStyles', resetImportName: 'foo' }],
      });
      expect(format(root.toString())).toMatchInlineSnapshot(`
        ".rbe9p1m {
          color: red;
          background-color: green;
        }
        "
      `);

      root.walk(node => {
        expect(node.raw(GRIFFEL_DECLARATOR_RAW)).toEqual('useResetStyles');

        if (node.source) {
          expect(node.source.start).toEqual({ offset: 0, column: 34, line: 4 });
          expect(node.source.end).toEqual({ offset: 0, column: 1, line: 7 });
        }
      });
    });

    it('should map style locations to reset styles', () => {
      const fixture = `
import { makeResetStyles } from '@griffel/react';

export const useResetStyles = makeResetStyles({
  color: 'red',
  backgroundColor: 'green',
})
`;
      const root = parse(fixture, { from: 'fixture.styles.ts' });

      root.walk(node => {
        const declarator = node.raw(GRIFFEL_DECLARATOR_RAW);
        expect(declarator).toEqual('useResetStyles');

        if (node.source) {
          // This test will depend on the source fixture and its indentation
          expect(node.source.start).toEqual({ offset: 0, column: 46, line: 4 });
          expect(node.source.end).toEqual({ offset: 0, column: 1, line: 7 });
        }
      });
    });

    it('should hold original source in document raw field', () => {
      const fixture = `
import { makeResetStyles } from '@griffel/react';

export const useResetStyles = makeResetStyles({
  color: 'red',
  backgroundColor: 'green',
})
`;
      const root = parse(fixture, { from: 'fixture.styles.ts' });
      expect(root.raw(GRIFFEL_SRC_RAW)).toEqual(fixture);
    });

    it('should handle multiple declarators', () => {
      const fixture = `
import { makeResetStyles } from '@griffel/react';

export const useResetStyles1 = makeResetStyles({
  color: 'red',
  backgroundColor: 'green',
})

export const useResetStyles2 = makeResetStyles({
  color: 'blue',
  backgroundColor: 'yellow',
})
`;
      const root = parse(fixture, { from: 'fixture.styles.ts' });
      root.walk(node => {
        const declarator = node.raw(GRIFFEL_DECLARATOR_RAW);
        expect(['useResetStyles1', 'useResetStyles2']).toContain(declarator);

        if (node.source) {
          if (declarator === 'useResetStyles1') {
            expect(node.source.start).toEqual({ offset: 0, column: 47, line: 4 });
            expect(node.source.end).toEqual({ offset: 0, column: 1, line: 7 });
          }

          if (declarator === 'useResetStyles2') {
            expect(node.source.start).toEqual({ offset: 0, column: 47, line: 9 });
            expect(node.source.end).toEqual({ offset: 0, column: 1, line: 12 });
          }
        }
      });
    });
  });
});
