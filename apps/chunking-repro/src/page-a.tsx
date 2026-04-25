import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { mergeClasses } from '@griffel/react';
import { usePageAStyles } from './styles/page-a';
import { useSharedStyles } from './styles/shared';

function App() {
  const styles = usePageAStyles();
  const shared = useSharedStyles();
  return (
    <main className={shared.shell}>
      <h1>Page A</h1>
      <button className={mergeClasses(styles.button)} type="button">
        Hover me
      </button>
      <p>Default color: red. Hover: blue. @media (min-width: 800px): orange.</p>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
