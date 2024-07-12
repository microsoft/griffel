import * as React from 'react';
import { RESET, makeResetStyles, makeStyles, mergeClasses, TextDirectionProvider } from '@griffel/react';
import { render } from '@testing-library/react';

import { print, test } from './index';

expect.addSnapshotSerializer({ print, test });

const useStyles1 = makeStyles({
  root: { color: 'var(--colorNeutralForeground1)', backgroundColor: RESET },
  paddingLeft: { paddingLeft: '10px' },
});

const useStyles2 = makeStyles({
  paddingRight: { paddingRight: '20px' },
});

const useStyles3 = makeStyles({
  display: { display: 'none' },
});

const useBaseStyles = makeResetStyles({
  color: 'red',
  marginLeft: '20px',
});

const TestComponent: React.FC<{ id?: string }> = ({ id }) => {
  const styles1 = useStyles1();
  const styles2 = useStyles2();
  const styles3 = useStyles3();
  const styles = mergeClasses(
    'class-a',
    styles1.root,
    styles1.paddingLeft,
    styles2.paddingRight,
    styles3.display,
    'class-b',
  );

  return <div data-testid={id} className={styles} data-test-attr="true" />;
};

const TestResetComponent: React.FC<{ id?: string; children?: React.ReactNode }> = ({ id, children }) => {
  const classes = useStyles1();
  const baseClassName = useBaseStyles();

  const className = mergeClasses('class-reset-a', baseClassName, classes.paddingLeft, 'class-reset-b');

  return (
    <div data-testid={id} className={className}>
      {children}
    </div>
  );
};

const RtlWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TextDirectionProvider dir="rtl">{children}</TextDirectionProvider>
);

describe('serializer', () => {
  it('should check styles', () => {
    expect(render(<TestComponent id="test" />).getByTestId('test')).toHaveStyle({
      display: 'none',
      paddingLeft: '10px',
      paddingRight: '20px',
    });
    expect(render(<TestResetComponent id="reset-test" />).getByTestId('reset-test')).toHaveStyle({
      color: 'red',
      paddingLeft: '10px',
      marginLeft: '20px',
    });

    expect(render(<TestComponent id="rtl-test" />, { wrapper: RtlWrapper }).getByTestId('rtl-test')).toHaveStyle({
      display: 'none',
      paddingLeft: '20px',
      paddingRight: '10px',
    });
    expect(
      render(<TestResetComponent id="rtl-reset-test" />, { wrapper: RtlWrapper }).getByTestId('rtl-reset-test'),
    ).toHaveStyle({
      color: 'red',
      paddingRight: '10px',
      marginRight: '20px',
    });
  });

  // Note: When HTML element is passed we will get a string with classes, not the whole snippet
  it('handles classes strings', () => {
    expect(render(<TestComponent />).container.firstChild).toMatchInlineSnapshot(`
      <div
        class="class-a class-b"
        data-test-attr="true"
      />
    `);
    expect(render(<TestResetComponent />).container.firstChild).toMatchInlineSnapshot(`
      <div
        class="class-reset-a class-reset-b"
      />
    `);

    expect(render(<TestComponent />, { wrapper: RtlWrapper }).container.firstChild).toMatchInlineSnapshot(`
      <div
        class="class-a class-b"
        data-test-attr="true"
      />
    `);
    expect(render(<TestResetComponent />, { wrapper: RtlWrapper }).container.firstChild).toMatchInlineSnapshot(`
      <div
        class="class-reset-a class-reset-b"
      />
    `);

    expect(render(<div className="foo bar" />).container.firstChild).toMatchInlineSnapshot(`
      <div
        class="foo bar"
      />
    `);
  });

  it('handles HTML strings', () => {
    expect(render(<TestResetComponent />).container.innerHTML).toMatchInlineSnapshot(
      `"<div class="class-reset-a class-reset-b"></div>"`,
    );
    expect(render(<TestComponent />).container.innerHTML).toMatchInlineSnapshot(
      `"<div class="class-a class-b" data-test-attr="true"></div>"`,
    );
  });

  it('handles nested elements', () => {
    expect(
      render(
        <TestResetComponent>
          <TestComponent />
        </TestResetComponent>,
      ).container.firstChild,
    ).toMatchInlineSnapshot(`
      <div
        class="class-reset-a class-reset-b"
      >
        <div
          class="class-a class-b"
          data-test-attr="true"
        />
      </div>
    `);

    expect(
      render(
        <TestResetComponent>
          <TestComponent />
        </TestResetComponent>,
      ).container.innerHTML,
    ).toMatchInlineSnapshot(
      `"<div class="class-reset-a class-reset-b"><div class="class-a class-b" data-test-attr="true"></div></div>"`,
    );
  });

  it('does not assert on non-sequence strings', () => {
    expect({
      toString: () => 'class="foo"',
    }).toMatchInlineSnapshot(`
      Object {
        "toString": [Function],
      }
    `);
  });
});
