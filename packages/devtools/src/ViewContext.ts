import * as React from 'react';

export type ViewContextType = {
  highlightedClass: string;
  setHighlightedClass: React.Dispatch<React.SetStateAction<string>>;
};

export const ViewContext = React.createContext<ViewContextType>({
  highlightedClass: '',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setHighlightedClass: () => {},
});

export function useViewContext() {
  return React.useContext(ViewContext);
}
