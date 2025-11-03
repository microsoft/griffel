import * as React from 'react';

function getDispatcher() {
  try {
    return (React as any)[''.concat('__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE')].H;
  } catch {
    // React 19+
  }

  try {
    return (React as any)[''.concat('__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED')].ReactCurrentDispatcher
      .current;
  } catch {
    // React 18 and below
  }
}

export function isInsideComponent() {
  // React 18 always logs errors if a dispatcher is not present:
  // https://github.com/facebook/react/blob/42f15b324f50d0fd98322c21646ac3013e30344a/packages/react/src/ReactHooks.js#L26-L36
  try {
    const dispatcher = getDispatcher();

    // Before any React component was rendered "dispatcher" will be "null"
    if (dispatcher === null || dispatcher === undefined) {
      return false;
    }

    // A check with hooks call (i.e. call "React.useContext()" outside a component) will always produce errors, but
    // a call on the dispatcher wont
    dispatcher.useContext({});
    return true;
  } catch (e) {
    return false;
  }
}
