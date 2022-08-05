import { transition } from './transition';

describe('transition', () => {
  it('for a global value', () => {
    expect(transition('initial')).toEqual<ReturnType<typeof transition>>({
      transitionDelay: 'initial',
      transitionTimingFunction: 'initial',
      transitionProperty: 'initial',
      transitionDuration: 'initial',
    });
  });

  it('for a property name and duration', () => {
    expect(transition('margin', '2s')).toEqual<ReturnType<typeof transition>>({
      transitionProperty: 'margin',
      transitionDuration: '2s',
    });
  });

  it('for a given name, duration and delay', () => {
    expect(transition('margin', '2s', '1s')).toEqual<ReturnType<typeof transition>>({
      transitionProperty: 'margin',
      transitionDuration: '2s',
      transitionDelay: '1s',
    });
  });

  it('for a given name, duration, delay and easing-function', () => {
    expect(transition('margin', '2s', '1s', 'ease-in')).toEqual<ReturnType<typeof transition>>({
      transitionProperty: 'margin',
      transitionDuration: '2s',
      transitionDelay: '1s',
      transitionTimingFunction: 'ease-in',
    });
  });
  it('for multiple properties', () => {
    expect(
      transition([
        ['margin', '2s', '1s', 'ease-in'],
        ['padding', '3s', '2s', 'ease-out'],
      ]),
    ).toEqual<ReturnType<typeof transition>>({
      transitionProperty: 'margin, padding',
      transitionDuration: '2s, 3s',
      transitionDelay: '1s, 2s',
      transitionTimingFunction: 'ease-in, ease-out',
    });
  });
});
