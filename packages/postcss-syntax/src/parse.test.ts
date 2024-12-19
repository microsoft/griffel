import {
  GRIFFEL_DECLARATOR_LOCATION_RAW,
  GRIFFEL_DECLARATOR_RAW,
  GRIFFEL_SLOT_LOCATION_RAW,
  GRIFFEL_SLOT_RAW,
  GRIFFEL_SRC_RAW,
} from './constants';
import { parse } from './parse';

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
      expect(root.toString()).toMatchInlineSnapshot(
        `".fe3e8s9{color:red;}.fcnqdeg{background-color:green;}.fvjh0tl{margin-top:4px;}"`,
      );
      root.walk(node => {
        expect(node.raw(GRIFFEL_DECLARATOR_RAW)).toEqual('useStyles');
        expect(node.raw(GRIFFEL_SLOT_RAW)).toEqual('root');
        expect(node.raw(GRIFFEL_SLOT_LOCATION_RAW)).toEqual({
          start: { line: 9, column: 2, index: 134 },
          end: { line: 13, column: 3, index: 208 },
        });
      });
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
      expect(root.toString()).toMatchInlineSnapshot(
        `".fe3e8s9{color:red;}.fcnqdeg{background-color:green;}.fvjh0tl{margin-top:4px;}"`,
      );

      root.walk(node => {
        expect(node.raw(GRIFFEL_DECLARATOR_RAW)).toEqual('useStyles');
        expect(node.raw(GRIFFEL_SLOT_RAW)).toEqual('root');
        expect(node.raw(GRIFFEL_SLOT_LOCATION_RAW)).toEqual({
          start: { line: 9, column: 2, index: 113 },
          end: { line: 13, column: 3, index: 187 },
        });
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

      expect(root.toString()).toMatchInlineSnapshot(`
        ".fe3e8s9{color:red;}
        .f163i14w{color:blue;}"
      `);

      root.walk(node => {
        const slot = node.raw(GRIFFEL_SLOT_RAW);
        expect(['slot1', 'slot2']).toContain(slot);

        if (slot === 'slot1') {
          expect(node.raw(GRIFFEL_SLOT_LOCATION_RAW)).toEqual({
            start: { line: 5, column: 2, index: 87 },
            end: { line: 7, column: 3, index: 117 },
          });
        }
        if (slot === 'slot2') {
          expect(node.raw(GRIFFEL_SLOT_LOCATION_RAW)).toEqual({
            start: { line: 9, column: 2, index: 122 },
            end: { line: 11, column: 3, index: 153 },
          });
        }
      });
    });

    it('should map style locations to slots when styles contains new lines', () => {
      const fixture = `
import { makeStyles } from "@griffel/react";

export const useStyles = makeStyles({
  slot1: {
    background: \`linear-gradient(#e66465, 
      #9198e5)\`,
  },

  slot2: {
    color: "blue",
  },
});
`;
      const root = parse(fixture, { from: 'fixture.styles.ts' });

      expect(root.toString()).toMatchInlineSnapshot(`
        ".f1qmhkic{background:linear-gradient(#e66465,        #9198e5);}
        .f163i14w{color:blue;}"
      `);

      root.walk(node => {
        const slot = node.raw(GRIFFEL_SLOT_RAW);
        expect(['slot1', 'slot2']).toContain(slot);

        if (slot === 'slot1') {
          expect(node.raw(GRIFFEL_SLOT_LOCATION_RAW)).toEqual({
            start: { line: 5, column: 2, index: 87 },
            end: { line: 8, column: 3, index: 159 },
          });
        }
        if (slot === 'slot2') {
          expect(node.raw(GRIFFEL_SLOT_LOCATION_RAW)).toEqual({
            start: { line: 10, column: 2, index: 164 },
            end: { line: 12, column: 3, index: 195 },
          });
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

      expect(root.toString()).toMatchInlineSnapshot(`
        ".fe3e8s9{color:red;}
        .fe3e8s9{color:red;}"
      `);

      root.walk(node => {
        const declarator = node.raw(GRIFFEL_DECLARATOR_RAW);
        expect(['useStyles1', 'useStyles2']).toContain(declarator);

        if (declarator === 'useStyles1') {
          expect(node.raw(GRIFFEL_SLOT_LOCATION_RAW)).toEqual({
            start: { line: 5, column: 2, index: 88 },
            end: { line: 7, column: 3, index: 117 },
          });
        }

        if (declarator === 'useStyles2') {
          expect(node.raw(GRIFFEL_SLOT_LOCATION_RAW)).toEqual({
            start: { line: 11, column: 2, index: 164 },
            end: { line: 13, column: 3, index: 193 },
          });
        }
      });
    });

    it('should transform disable comment directive to stylelint disable', () => {
      const fixture = `
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: {
    color: 'red',
    backgroundColor: 'green',
  },

  // griffel-csslint-disable foo
  // griffel-csslint-disable bar
  slot: {
      color: 'blue',
      backgroundColor: 'red',
  }
})
`;
      const root = parse(fixture, { from: 'fixture.styles.ts' });
      expect(root.toString()).toMatchInlineSnapshot(`
        ".fe3e8s9{color:red;}.fcnqdeg{background-color:green;}
        .f163i14w{color:blue;}.f3xbvq9{background-color:red;} /* stylelint-disable-line foo,bar */"
      `);
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
      expect(root.toString()).toMatchInlineSnapshot(`".rbe9p1m{color:red;background-color:green;}"`);
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
      expect(root.toString()).toMatchInlineSnapshot(`".rbe9p1m{color:red;background-color:green;}"`);
      root.walk(node => {
        expect(node.raw(GRIFFEL_DECLARATOR_RAW)).toEqual('useResetStyles');

        expect(node.raw(GRIFFEL_DECLARATOR_LOCATION_RAW)).toEqual({
          start: { line: 4, column: 34, index: 68 },
          end: { line: 7, column: 1, index: 115 },
        });
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

        expect(node.raw(GRIFFEL_DECLARATOR_LOCATION_RAW)).toEqual({
          start: { line: 4, column: 46, index: 98 },
          end: { line: 7, column: 1, index: 145 },
        });
      });
    });

    it('should map style locations to reset styles when styles contains new lines', () => {
      const fixture = `
import { makeResetStyles } from "@griffel/react";

export const useResetStyles1 = makeResetStyles({
  color: "red",
  background: \`linear-gradient(#e66465, 
    #9198e5)\`,
});
export const useResetStyles2 = makeResetStyles({
  color: "red",
});
`;
      const root = parse(fixture, { from: 'fixture.styles.ts' });

      root.walk(node => {
        const declarator = node.raw(GRIFFEL_DECLARATOR_RAW);
        if (declarator === 'useResetStyles1') {
          expect(node.raw(GRIFFEL_DECLARATOR_LOCATION_RAW)).toEqual({
            start: { line: 4, column: 47, index: 99 },
            end: { line: 8, column: 1, index: 174 },
          });
        }

        if (declarator === 'useResetStyles2') {
          expect(node.raw(GRIFFEL_DECLARATOR_LOCATION_RAW)).toEqual({
            start: { line: 9, column: 47, index: 224 },
            end: { line: 11, column: 1, index: 243 },
          });
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

      expect(root.toString()).toMatchInlineSnapshot(`
        ".rbe9p1m{color:red;background-color:green;}
        .r1j8igii{color:blue;background-color:yellow;}"
      `);

      root.walk(node => {
        const declarator = node.raw(GRIFFEL_DECLARATOR_RAW);
        expect(['useResetStyles1', 'useResetStyles2']).toContain(declarator);

        if (declarator === 'useResetStyles1') {
          expect(node.raw(GRIFFEL_DECLARATOR_LOCATION_RAW)).toEqual({
            start: { line: 4, column: 47, index: 99 },
            end: { line: 7, column: 1, index: 146 },
          });
        }

        if (declarator === 'useResetStyles2') {
          expect(node.raw(GRIFFEL_DECLARATOR_LOCATION_RAW)).toEqual({
            start: { line: 9, column: 47, index: 196 },
            end: { line: 12, column: 1, index: 245 },
          });
        }
      });
    });

    it('should transform disable comment directive to stylelint disable', () => {
      const fixture = `
import { makeResetStyles } from '@griffel/react';

// griffel-csslint-disable foo
// griffel-csslint-disable bar
export const useResetStyles = makeResetStyles({
  color: 'pink',
  backgroundColor: 'magenta',
})
`;
      const root = parse(fixture, { from: 'fixture.styles.ts' });
      expect(root.toString()).toMatchInlineSnapshot(
        `".r70kha3{color:pink;background-color:magenta;} /* stylelint-disable-line foo,bar */"`,
      );
    });
  });
});
