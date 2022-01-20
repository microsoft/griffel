import * as React from 'react';
import { makeStyles, mergeClasses, TextDirectionProvider } from '@griffel/react';
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

const TestComponent: React.FC<{ id?: string }> = ({ id }) => {
  const styles1 = useStyles1();
  const styles2 = useStyles2();
  const styles3 = useStyles3();
  const styles = mergeClasses('static-class', styles1.root, styles1.paddingLeft, styles2.paddingRight, styles3.display);

  return <div data-testid={id} className={styles} />;
};

const RtlWrapper: React.FC = ({ children }) => <TextDirectionProvider dir="rtl">{children}</TextDirectionProvider>;

describe('jest-serializer-make-styles', () => {
  it('should check styles', () => {
    expect(render(<TestComponent id="test" />).getByTestId('test')).toHaveStyle({
      display: 'none',
      paddingLeft: '10px',
      paddingRight: '20px',
    });
    expect(render(<TestComponent id="rtl-test" />, { wrapper: RtlWrapper }).getByTestId('rtl-test')).toHaveStyle({
      display: 'none',
      paddingLeft: '20px',
      paddingRight: '10px',
    });
  });

  it('renders without generated classes', () => {
    expect(render(<TestComponent />).container.firstChild).toMatchInlineSnapshot(`
      <div
        class="static-class"
      />
    `);
    expect(render(<TestComponent />, { wrapper: RtlWrapper }).container.firstChild).toMatchInlineSnapshot(`
      <div
        class="static-class"
      />
    `);
  });
});
