import { prefix } from './prefixerPlugin';

const globalCssValues = ['inherit', 'initial', 'unset', 'revert', 'revert-layer'];

describe('prefix', () => {
  describe('should prefix', () => {
    test('cursor', () => {
      expect(prefix(`cursor:none;`, 6)).toEqual([`cursor:none;`].join(''));
      expect(prefix(`cursor:image-set(url(foo.jpg) 2x), pointer;`, 6)).toEqual(
        [`cursor:-webkit-image-set(url(foo.jpg) 2x), pointer;`, `cursor:image-set(url(foo.jpg) 2x), pointer;`].join(''),
      );
      expect(prefix(`cursor:image-set(url(foo.jpg) 2x), grab;`, 6)).toEqual(
        [`cursor:-webkit-image-set(url(foo.jpg) 2x), grab;`, `cursor:image-set(url(foo.jpg) 2x), grab;`].join(''),
      );
    });

    test('backface-visibility', () => {
      expect(prefix(`backface-visibility:hidden;`, 19)).toEqual(
        [`-webkit-backface-visibility:hidden;`, `backface-visibility:hidden;`].join(''),
      );
    });

    test('background-clip', () => {
      expect(prefix(`background-clip:border-box;`, 15)).toMatchInlineSnapshot(`"background-clip:border-box;"`);
      expect(prefix(`background-clip:padding-box;`, 15)).toMatchInlineSnapshot(`"background-clip:padding-box;"`);
      expect(prefix(`background-clip:content-box;`, 15)).toMatchInlineSnapshot(`"background-clip:content-box;"`);

      // Prefixes only "text" value
      expect(prefix(`background-clip:text;`, 15)).toMatchInlineSnapshot(
        `"-webkit-background-clip:text;background-clip:text;"`,
      );
    });

    test('text', () => {
      expect(prefix(`text-align:left;`, 10)).toEqual([`text-align:left;`].join(''));
      expect(prefix(`text-transform:none;`, 14)).toEqual([`text-transform:none;`].join(''));
      expect(prefix(`text-shadow:none;`, 11)).toEqual([`text-shadow:none;`].join(''));
    });

    test('mask', () => {
      expect(prefix(`mask:none;`, 10)).toEqual([`-webkit-mask:none;`, `mask:none;`].join(''));
      expect(prefix(`mask-image:none;`, 10)).toEqual([`-webkit-mask-image:none;`, `mask-image:none;`].join(''));
      expect(prefix(`mask-image:linear-gradient(#fff);`, 10)).toEqual(
        [`-webkit-mask-image:linear-gradient(#fff);`, `mask-image:linear-gradient(#fff);`].join(''),
      );
      expect(prefix(`mask-mode:none;`, 10)).toEqual([`-webkit-mask-mode:none;`, `mask-mode:none;`].join(''));
      expect(prefix(`mask-clip:none;`, 10)).toEqual([`-webkit-mask-clip:none;`, `mask-clip:none;`].join(''));
      expect(prefix(`mask-size:none;`, 10)).toEqual([`-webkit-mask-size:none;`, `mask-size:none;`].join(''));
      expect(prefix(`mask-repeat:none;`, 10)).toEqual([`-webkit-mask-repeat:none;`, `mask-repeat:none;`].join(''));
      expect(prefix(`mask-origin:none;`, 10)).toEqual([`-webkit-mask-origin:none;`, `mask-origin:none;`].join(''));
      expect(prefix(`mask-position:none;`, 10)).toEqual(
        [`-webkit-mask-position:none;`, `mask-position:none;`].join(''),
      );
      expect(prefix(`mask-composite:none;`, 10)).toEqual(
        [`-webkit-mask-composite:none;`, `mask-composite:none;`].join(''),
      );
    });

    test('position', () => {
      expect(prefix(`position:relative;`, 8)).toEqual([`position:relative;`].join(''));
      expect(prefix(`position:static;`, 8)).toEqual([`position:static;`].join(''));
      expect(prefix(`position:fixed;`, 8)).toEqual([`position:fixed;`].join(''));
      expect(prefix(`position:absolute;`, 8)).toEqual([`position:absolute;`].join(''));
      globalCssValues.forEach(v => expect(prefix(`position:${v};`, 8)).toEqual([`position:${v};`].join()));
    });

    test('color-adjust', () => {
      expect(prefix(`color:none;`, 5)).toEqual([`color:none;`].join(''));
      expect(prefix(`color-adjust:none;`, 12)).toEqual(
        [`-webkit-print-color-adjust:none;`, `color-adjust:none;`].join(''),
      );
    });

    test('box', () => {
      expect(prefix(`box-decoration-break:slice;`, 20)).toEqual(
        [`-webkit-box-decoration-break:slice;`, `box-decoration-break:slice;`].join(''),
      );
      expect(prefix(`box-sizing:border-box;`, 10)).toEqual([`box-sizing:border-box;`].join(''));
    });

    test('size', () => {
      expect(prefix(`width:auto;`, 5)).toEqual([`width:auto;`].join(''));
      expect(prefix(`width:unset;`, 5)).toEqual([`width:unset;`].join(''));
      expect(prefix(`width:initial;`, 5)).toEqual([`width:initial;`].join(''));
      expect(prefix(`width:inherit;`, 5)).toEqual([`width:inherit;`].join(''));
      expect(prefix(`width:10;`, 5)).toEqual([`width:10;`].join(''));
      expect(prefix(`width:min();`, 5)).toEqual([`width:min();`].join(''));
      expect(prefix(`width:var(--foo-content);`, 5)).toEqual([`width:var(--foo-content);`].join(''));
      expect(prefix(`width:var(-content);`, 5)).toEqual([`width:var(-content);`].join(''));
      expect(prefix(`width:var(--max-content);`, 5)).toEqual([`width:var(--max-content);`].join(''));
      expect(prefix(`width:--max-content;`, 5)).toEqual([`width:--max-content;`].join(''));
      expect(prefix(`width:stackWidth;`, 5)).toEqual([`width:stackWidth;`].join(''));
      expect(prefix(`height:fill-available;`, 6)).toEqual(
        [`height:-webkit-fill-available;`, `height:-moz-available;`, `height:fill-available;`].join(''),
      );
      expect(prefix(`width:stretch;`, 5)).toEqual(
        [`width:-webkit-fill-available;`, `width:-moz-available;`, `width:fill-available;`, `width:stretch;`].join(''),
      );
      expect(prefix(`width:stretch !important;`, 5)).toEqual(
        [
          `width:-webkit-fill-available !important;`,
          `width:-moz-available !important;`,
          `width:fill-available !important;`,
          `width:stretch !important;`,
        ].join(''),
      );
      expect(prefix(`width:max(250px, 100px);`, 5)).toEqual([`width:max(250px, 100px);`].join(''));
      expect(prefix(`height:min(150px, 200px);`, 6)).toEqual([`height:min(150px, 200px);`].join(''));
      expect(prefix(`min-width:min(100px, 50px);`, 9)).toEqual([`min-width:min(100px, 50px);`].join(''));
      expect(prefix(`max-width:max(150px, 200px);`, 9)).toEqual([`max-width:max(150px, 200px);`].join(''));
      expect(prefix(`min-height:max(100px, 50px);`, 10)).toEqual([`min-height:max(100px, 50px);`].join(''));
      expect(prefix(`max-height:min(150px, 200px);`, 10)).toEqual([`max-height:min(150px, 200px);`].join(''));
    });

    test('zoom', () => {
      expect(prefix(`min-zoom:0;`, 8)).toEqual([`min-zoom:0;`].join(''));
    });

    test('background', () => {
      expect(prefix(`background:none;`, 10)).toEqual([`background:none;`].join(''));
      expect(prefix(`background:image-set(url(foo.jpg) 2x);`, 10)).toEqual(
        [`background:-webkit-image-set(url(foo.jpg) 2x);`, `background:image-set(url(foo.jpg) 2x);`].join(''),
      );
      expect(prefix(`background-image:image-set(url(foo.jpg) 2x);`, 16)).toEqual(
        [`background-image:-webkit-image-set(url(foo.jpg) 2x);`, `background-image:image-set(url(foo.jpg) 2x);`].join(
          '',
        ),
      );
    });

    test('margin-inline', () => {
      expect(prefix(`margin-inline-start:20px;`, 19)).toEqual(
        [`-webkit-margin-start:20px;`, `margin-inline-start:20px;`].join(''),
      );
      expect(prefix(`margin-inline-end:20px;`, 17)).toEqual(
        [`-webkit-margin-end:20px;`, `margin-inline-end:20px;`].join(''),
      );
    });

    test('user-select', () => {
      expect(prefix(`user-select:none;`, 11)).toEqual(
        [`-webkit-user-select:none;`, `-moz-user-select:none;`, `-ms-user-select:none;`, `user-select:none;`].join(''),
      );
    });

    test('appearance', () => {
      expect(prefix(`appearance:none;`, 10)).toEqual(
        [`-webkit-appearance:none;`, `-moz-appearance:none;`, `-ms-appearance:none;`, `appearance:none;`].join(''),
      );
    });

    test('tab-size', () => {
      expect(prefix(`tab-size:1;`, 8)).toEqual([`-moz-tab-size:1;`, `tab-size:1;`].join(''));
    });

    test('css variables', () => {
      expect(prefix(`--CircularProgress-animation:0.5s linear;`, 28)).toEqual(
        '--CircularProgress-animation:0.5s linear;',
      );
    });
  });

  describe('should not prefix', () => {
    test('flex-box', () => {
      expect(prefix(`display:flex!important;`, 7)).toMatchInlineSnapshot(`"display:flex!important;"`);
      expect(prefix(`display:flex !important;`, 7)).toMatchInlineSnapshot(`"display:flex !important;"`);
      expect(prefix(`display:flex     !important;`, 7)).toMatchInlineSnapshot(`"display:flex     !important;"`);
      expect(prefix(`display:inline-flex;`, 7)).toMatchInlineSnapshot(`"display:inline-flex;"`);
      expect(prefix(`flex:inherit;`, 4)).toMatchInlineSnapshot(`"flex:inherit;"`);
      expect(prefix(`flex-grow:none;`, 9)).toMatchInlineSnapshot(`"flex-grow:none;"`);
      expect(prefix(`flex-shrink:none;`, 11)).toMatchInlineSnapshot(`"flex-shrink:none;"`);
      expect(prefix(`flex-basis:none;`, 10)).toMatchInlineSnapshot(`"flex-basis:none;"`);
      expect(prefix(`align-self:flex-start;`, 10)).toMatchInlineSnapshot(`"align-self:flex-start;"`);
      expect(prefix(`align-self:flex-end;`, 10)).toMatchInlineSnapshot(`"align-self:flex-end;"`);
      expect(prefix(`align-self:baseline;`, 10)).toMatchInlineSnapshot(`"align-self:baseline;"`);
      expect(prefix(`align-self:first baseline;`, 10)).toMatchInlineSnapshot(`"align-self:first baseline;"`);
      expect(prefix(`align-content:value;`, 13)).toMatchInlineSnapshot(`"align-content:value;"`);
      expect(prefix(`align-content:flex-start;`, 13)).toMatchInlineSnapshot(`"align-content:flex-start;"`);
      expect(prefix(`align-content:flex-end;`, 13)).toMatchInlineSnapshot(`"align-content:flex-end;"`);
      expect(prefix(`align-items:value;`, 11)).toMatchInlineSnapshot(`"align-items:value;"`);
      expect(prefix(`justify-content:flex-end;`, 15)).toMatchInlineSnapshot(`"justify-content:flex-end;"`);
      expect(prefix(`justify-content:flex-start;`, 15)).toMatchInlineSnapshot(`"justify-content:flex-start;"`);
      expect(prefix(`justify-content:justify;`, 15)).toMatchInlineSnapshot(`"justify-content:justify;"`);
      expect(prefix(`justify-content:space-between;`, 15)).toMatchInlineSnapshot(`"justify-content:space-between;"`);
      expect(prefix(`justify-items:center;`, 13)).toMatchInlineSnapshot(`"justify-items:center;"`);
      expect(prefix(`order:flex;`, 5)).toMatchInlineSnapshot(`"order:flex;"`);
      expect(prefix(`flex-direction:column;`, 14)).toMatchInlineSnapshot(`"flex-direction:column;"`);
    });
    test('transform', () => {
      expect(prefix(`transform:rotate(30deg);`, 9)).toMatchInlineSnapshot(`"transform:rotate(30deg);"`);
    });
    test('cursor', () => {
      expect(prefix(`cursor:grab;`, 6)).toMatchInlineSnapshot(`"cursor:grab;"`);
    });
    test('transition', () => {
      expect(prefix(`transition:transform 1s,transform all 400ms,text-transform;`, 10)).toMatchInlineSnapshot(
        `"transition:transform 1s,transform all 400ms,text-transform;"`,
      );
    });
    test('writing-mode', () => {
      expect(prefix(`writing-mode:none;`, 12)).toMatchInlineSnapshot(`"writing-mode:none;"`);
      expect(prefix(`writing-mode:vertical-lr;`, 12)).toMatchInlineSnapshot(`"writing-mode:vertical-lr;"`);
      expect(prefix(`writing-mode:vertical-rl;`, 12)).toMatchInlineSnapshot(`"writing-mode:vertical-rl;"`);
      expect(prefix(`writing-mode:horizontal-tb;`, 12)).toMatchInlineSnapshot(`"writing-mode:horizontal-tb;"`);
      expect(prefix(`writing-mode:sideways-rl;`, 12)).toMatchInlineSnapshot(`"writing-mode:sideways-rl;"`);
      expect(prefix(`writing-mode:sideways-lr;`, 12)).toMatchInlineSnapshot(`"writing-mode:sideways-lr;"`);
    });
    test('columns', () => {
      expect(prefix(`columns:auto;`, 7)).toMatchInlineSnapshot(`"columns:auto;"`);
      expect(prefix(`column-count:auto;`, 12)).toMatchInlineSnapshot(`"column-count:auto;"`);
      expect(prefix(`column-fill:auto;`, 11)).toMatchInlineSnapshot(`"column-fill:auto;"`);
      expect(prefix(`column-gap:auto;`, 10)).toMatchInlineSnapshot(`"column-gap:auto;"`);
      expect(prefix(`column-rule:auto;`, 11)).toMatchInlineSnapshot(`"column-rule:auto;"`);
      expect(prefix(`column-rule-color:auto;`, 17)).toMatchInlineSnapshot(`"column-rule-color:auto;"`);
      expect(prefix(`column-rule-style:auto;`, 17)).toMatchInlineSnapshot(`"column-rule-style:auto;"`);
      expect(prefix(`column-rule-width:auto;`, 17)).toMatchInlineSnapshot(`"column-rule-width:auto;"`);
      expect(prefix(`column-span:auto;`, 11)).toMatchInlineSnapshot(`"column-span:auto;"`);
      expect(prefix(`column-width:auto;`, 12)).toMatchInlineSnapshot(`"column-width:auto;"`);
    });

    test('text', () => {
      expect(prefix(`text-align:left;`, 10)).toMatchInlineSnapshot(`"text-align:left;"`);
      expect(prefix(`text-transform:none;`, 14)).toMatchInlineSnapshot(`"text-transform:none;"`);
      expect(prefix(`text-shadow:none;`, 11)).toMatchInlineSnapshot(`"text-shadow:none;"`);
      expect(prefix(`text-size-adjust:none;`, 16)).toMatchInlineSnapshot(`"text-size-adjust:none;"`);
      expect(prefix(`text-decoration:none;`, 15)).toMatchInlineSnapshot(`"text-decoration:none;"`);
    });

    test('filter', () => {
      expect(prefix(`filter:grayscale(100%);`, 6)).toMatchInlineSnapshot(`"filter:grayscale(100%);"`);
      expect(prefix(`fill:red;`, 4)).toMatchInlineSnapshot(`"fill:red;"`);
    });

    test('position', () => {
      expect(prefix(`position:relative;`, 8)).toMatchInlineSnapshot(`"position:relative;"`);
      expect(prefix(`position:static;`, 8)).toMatchInlineSnapshot(`"position:static;"`);
      expect(prefix(`position:fixed;`, 8)).toMatchInlineSnapshot(`"position:fixed;"`);
      expect(prefix(`position:absolute;`, 8)).toMatchInlineSnapshot(`"position:absolute;"`);

      expect(prefix(`position:sticky;`, 8)).toMatchInlineSnapshot(`"position:sticky;"`);
      expect(prefix(`position:sticky!important;`, 8)).toMatchInlineSnapshot(`"position:sticky!important;"`);
      expect(prefix(`position:sticky !important;`, 8)).toMatchInlineSnapshot(`"position:sticky !important;"`);
      expect(prefix(`position:sticky      !important;`, 8)).toMatchInlineSnapshot(`"position:sticky      !important;"`);
    });

    test('size', () => {
      expect(prefix(`width:auto;`, 5)).toMatchInlineSnapshot(`"width:auto;"`);
      expect(prefix(`width:unset;`, 5)).toMatchInlineSnapshot(`"width:unset;"`);
      expect(prefix(`width:initial;`, 5)).toMatchInlineSnapshot(`"width:initial;"`);
      expect(prefix(`width:inherit;`, 5)).toMatchInlineSnapshot(`"width:inherit;"`);
      expect(prefix(`width:10;`, 5)).toMatchInlineSnapshot(`"width:10;"`);
      expect(prefix(`width:min();`, 5)).toMatchInlineSnapshot(`"width:min();"`);
      expect(prefix(`width:var(--foo-content);`, 5)).toMatchInlineSnapshot(`"width:var(--foo-content);"`);
      expect(prefix(`width:var(-content);`, 5)).toMatchInlineSnapshot(`"width:var(-content);"`);
      expect(prefix(`width:var(--max-content);`, 5)).toMatchInlineSnapshot(`"width:var(--max-content);"`);
      expect(prefix(`width:--max-content;`, 5)).toMatchInlineSnapshot(`"width:--max-content;"`);
      expect(prefix(`width:fit-content;`, 5)).toMatchInlineSnapshot(`"width:fit-content;"`);
      expect(prefix(`width:stackWidth;`, 5)).toMatchInlineSnapshot(`"width:stackWidth;"`);
      expect(prefix(`min-width:max-content;`, 9)).toMatchInlineSnapshot(`"min-width:max-content;"`);
      expect(prefix(`max-width:min-content;`, 9)).toMatchInlineSnapshot(`"max-width:min-content;"`);
      expect(prefix(`height:fill-available;`, 6)).toMatchInlineSnapshot(
        `"height:-webkit-fill-available;height:-moz-available;height:fill-available;"`,
      );
      expect(prefix(`min-block-size:max-content;`, 14)).toMatchInlineSnapshot(`"min-block-size:max-content;"`);
      expect(prefix(`min-inline-size:max-content;`, 15)).toMatchInlineSnapshot(`"min-inline-size:max-content;"`);
      expect(prefix(`max-height:fit-content;`, 10)).toMatchInlineSnapshot(`"max-height:fit-content;"`);
      expect(prefix(`width:max(250px, 100px);`, 5)).toMatchInlineSnapshot(`"width:max(250px, 100px);"`);
      expect(prefix(`height:min(150px, 200px);`, 6)).toMatchInlineSnapshot(`"height:min(150px, 200px);"`);
      expect(prefix(`min-width:min(100px, 50px);`, 9)).toMatchInlineSnapshot(`"min-width:min(100px, 50px);"`);
      expect(prefix(`max-width:max(150px, 200px);`, 9)).toMatchInlineSnapshot(`"max-width:max(150px, 200px);"`);
      expect(prefix(`min-height:max(100px, 50px);`, 10)).toMatchInlineSnapshot(`"min-height:max(100px, 50px);"`);
      expect(prefix(`max-height:min(150px, 200px);`, 10)).toMatchInlineSnapshot(`"max-height:min(150px, 200px);"`);
    });

    test('animation', () => {
      expect(prefix(`animation:inherit;`, 9)).toMatchInlineSnapshot(`"animation:inherit;"`);
      expect(prefix(`animation-duration:0.6s;`, 18)).toMatchInlineSnapshot(`"animation-duration:0.6s;"`);
      expect(prefix(`animation-name:slidein;`, 14)).toMatchInlineSnapshot(`"animation-name:slidein;"`);
      expect(prefix(`animation-iteration-count:infinite;`, 25)).toMatchInlineSnapshot(
        `"animation-iteration-count:infinite;"`,
      );
      expect(prefix(`animation-timing-function:cubic-bezier(0.1,0.7,1.0,0.1);`, 25)).toMatchInlineSnapshot(
        `"animation-timing-function:cubic-bezier(0.1,0.7,1.0,0.1);"`,
      );
    });

    test('grid', () => {
      expect(prefix('display:grid;', 7)).toMatchInlineSnapshot(`"display:grid;"`);
      expect(prefix('display:inline-grid;', 7)).toMatchInlineSnapshot(`"display:inline-grid;"`);
      expect(prefix('display:inline-grid!important;', 7)).toMatchInlineSnapshot(`"display:inline-grid!important;"`);
      expect(prefix('display:inline-grid !important;', 7)).toMatchInlineSnapshot(`"display:inline-grid !important;"`);
      expect(prefix(`align-self:value;`, 10)).toMatchInlineSnapshot(`"align-self:value;"`);
      expect(prefix(`align-self:safe center;`, 10)).toMatchInlineSnapshot(`"align-self:safe center;"`);
      expect(prefix('align-self:stretch;', 10)).toMatchInlineSnapshot(`"align-self:stretch;"`);
      expect(prefix('align-self:start;', 10)).toMatchInlineSnapshot(`"align-self:start;"`);
      expect(prefix('align-self:flex-start;', 12)).toMatchInlineSnapshot(`"align-self:flex-start;"`);
      expect(prefix('justify-self:end;', 12)).toMatchInlineSnapshot(`"justify-self:end;"`);
      expect(prefix('justify-self:self-end;', 12)).toMatchInlineSnapshot(`"justify-self:self-end;"`);
      expect(prefix('justify-self:flex-start;', 12)).toMatchInlineSnapshot(`"justify-self:flex-start;"`);
      expect(prefix('justify-self:baseline;', 12)).toMatchInlineSnapshot(`"justify-self:baseline;"`);
      expect(prefix('justify-self:safe center;', 12)).toMatchInlineSnapshot(`"justify-self:safe center;"`);
      expect(prefix('grid-template-columns:1fr auto;', 21)).toMatchInlineSnapshot(`"grid-template-columns:1fr auto;"`);
      expect(prefix('grid-template-columns:1fr [header content] auto;', 21)).toMatchInlineSnapshot(
        `"grid-template-columns:1fr [header content] auto;"`,
      );
      expect(prefix('grid-template-rows:1fr auto;', 18)).toMatchInlineSnapshot(`"grid-template-rows:1fr auto;"`);
      // grid-(column|row) - simple position value
      expect(prefix('grid-column:5;', 11)).toMatchInlineSnapshot(`"grid-column:5;"`);
      expect(prefix('grid-column:20;', 11)).toMatchInlineSnapshot(`"grid-column:20;"`);
      expect(prefix('grid-row:3;', 8)).toMatchInlineSnapshot(`"grid-row:3;"`);
      expect(prefix('grid-row:17;', 8)).toMatchInlineSnapshot(`"grid-row:17;"`);
      // grid-(column|row) - expand short hand
      expect(prefix('grid-column:3 / 5;', 11)).toMatchInlineSnapshot(`"grid-column:3 / 5;"`);
      expect(prefix('grid-column:3 / span 1;', 11)).toMatchInlineSnapshot(`"grid-column:3 / span 1;"`);
      expect(prefix('grid-row:2 / 7;', 8)).toMatchInlineSnapshot(`"grid-row:2 / 7;"`);
      expect(prefix('grid-row:2 / span 3;', 8)).toMatchInlineSnapshot(`"grid-row:2 / span 3;"`);
      expect(prefix('grid-row:2 / span 3!important;', 8)).toMatchInlineSnapshot(`"grid-row:2 / span 3!important;"`);
      // grid-column - ignore non-numeric values (IE11 doesn't support line-names)
      expect(prefix('grid-column:main-start / main-end;', 11)).toMatchInlineSnapshot(
        `"grid-column:main-start / main-end;"`,
      );
      expect(prefix('grid-row:main-start / main-end;', 11)).toMatchInlineSnapshot(`"grid-row:main-start / main-end;"`);
      expect(prefix('grid-row:main-start / main-end!important;', 11)).toMatchInlineSnapshot(
        `"grid-row:main-start / main-end!important;"`,
      );
    });

    test('scroll-snap', () => {
      expect(prefix(`scroll-snap-type:none;`, 16)).toMatchInlineSnapshot(`"scroll-snap-type:none;"`);
      expect(prefix(`scroll-margin:0;`, 13)).toMatchInlineSnapshot(`"scroll-margin:0;"`);
      expect(prefix(`scroll-margin-top:0;`, 17)).toMatchInlineSnapshot(`"scroll-margin-top:0;"`);
      expect(prefix(`scroll-margin-right:0;`, 19)).toMatchInlineSnapshot(`"scroll-margin-right:0;"`);
      expect(prefix(`scroll-margin-bottom:0;`, 20)).toMatchInlineSnapshot(`"scroll-margin-bottom:0;"`);
      expect(prefix(`scroll-margin-left:0;`, 18)).toMatchInlineSnapshot(`"scroll-margin-left:0;"`);
    });
  });
});
