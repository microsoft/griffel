import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { mergeClasses } from '@griffel/react';
import { usePageBStyles } from './styles/page-b';
import { useSharedStyles } from './styles/shared';

function App() {
  const styles = usePageBStyles();
  const shared = useSharedStyles();
  return (
    <main className={shared.shell}>
      <h1>Page B</h1>
      <button className={mergeClasses(styles.button)} type="button">
        Hover me
      </button>
      <p>Default color: green. border + borderColor. Hover: blue. @media: orange.</p>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
