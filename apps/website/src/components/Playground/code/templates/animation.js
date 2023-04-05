import { makeStyles } from '@griffel/core';

export default makeStyles({
  spinInACircle: {
    animationPlayState: 'running',
    animationDelay: '5s',
    animationTimingFunction: 'cubic-bezier(0.1, 0.5, 0.1, 0.5)',
    animationDirection: 'normal',
    animationDuration: '5s',
    animationIterationCount: 'infinite',
    animationName: {
      from: {
        transform: 'rotate(0deg)',
      },
      to: {
        transform: 'rotate(360deg)',
      },
    },
  },
});

export const meta = {
  name: 'Animations',
  position: 12,
};
