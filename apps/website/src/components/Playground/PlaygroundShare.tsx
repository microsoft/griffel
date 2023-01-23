import * as React from 'react';

export function PlaygroundShare() {
  const [visible, setVisible] = React.useState<boolean>(false);

  const handleClick = () => {
    const url = window.location.href.toString();

    window.navigator.clipboard.writeText(url).then(() => {
      setVisible(true);
    });
  };

  React.useEffect(() => {
    if (visible) {
      const timeoutId = setTimeout(() => {
        setVisible(false);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }

    return () => {};
  }, [visible]);

  return (
    <button className="button button--sm button--secondary" onClick={handleClick}>
      {visible ? '✅ Copied' : 'Share'}
    </button>
  );
}
