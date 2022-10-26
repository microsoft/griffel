import * as React from 'react';
import { makeResetStyles, makeStyles, mergeClasses, TextDirectionProvider } from '@griffel/react';
import { render } from '@testing-library/react';

import { print, test } from './index';

expect.addSnapshotSerializer({ print, test });

const useStyles1 = makeStyles({
  root: { color: 'var(--colorNeutralForeground1)' },
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
  const styles = mergeClasses('static-class', styles1.root, styles1.paddingLeft, styles2.paddingRight, styles3.display);

  return <div data-testid={id} className={styles} />;
};

const TestResetComponent: React.FC<{ id?: string }> = ({ id }) => {
  const classes = useStyles1();
  const baseClassName = useBaseStyles();

  const className = mergeClasses('static-class', classes.paddingLeft, baseClassName);

  return <div data-testid={id} className={className} />;
};

const RtlWrapper: React.FC = ({ children }) => <TextDirectionProvider dir="rtl">{children}</TextDirectionProvider>;

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

  it('renders without generated classes', () => {
    expect(render(<TestComponent />).container.firstChild).toMatchInlineSnapshot(`
      <div
        class="static-class"
      />
    `);
    expect(render(<TestResetComponent />).container.firstChild).toMatchInlineSnapshot(`
      <div
        class="static-class"
      />
    `);

    expect(render(<TestComponent />, { wrapper: RtlWrapper }).container.firstChild).toMatchInlineSnapshot(`
      <div
        class="static-class"
      />
    `);
    expect(render(<TestResetComponent />, { wrapper: RtlWrapper }).container.firstChild).toMatchInlineSnapshot(`
      <div
        class="static-class"
      />
    `);
  });
});
