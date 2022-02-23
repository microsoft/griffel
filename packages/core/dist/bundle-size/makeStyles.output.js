/******/ (() => {
  // webpackBootstrap
  /******/ 'use strict';
  // CONCATENATED MODULE: ../../dist/packages/core/constants.esm.js
  /** @internal */
  const DEFINITION_LOOKUP_TABLE = {};
  /** @internal */
  /* harmony default export */ const hash_browser_esm = // CONCATENATED MODULE: ../../node_modules/@emotion/hash/dist/hash.browser.esm.js
    /* eslint-disable */
    // Inspired by https://github.com/garycourt/murmurhash-js
    // Ported from https://github.com/aappleby/smhasher/blob/61a0530f28277f2e850bfc39600ce61d02b518de/src/MurmurHash2.cpp#L37-L86
    function (str) {
      for (
        // 'm' and 'r' are mixing constants generated offline.
        // They're not really 'magic', they just happen to work well.
        // const m = 0x5bd1e995;
        // const r = 24;
        // Initialize the hash
        var k, h = 0, i = 0, len = str.length; // Mix 4 bytes at a time into the hash
        len >= 4;
        ++i, len -= 4
      )
        (k =
          /* Math.imul(k, m): */
          1540483477 *
            (65535 &
              (k =
                (255 & str.charCodeAt(i)) |
                ((255 & str.charCodeAt(++i)) << 8) |
                ((255 & str.charCodeAt(++i)) << 16) |
                ((255 & str.charCodeAt(++i)) << 24))) +
          ((59797 * (k >>> 16)) << 16)),
          (h =
            /* Math.imul(k, m): */
            (1540483477 *
              (65535 &
                (k ^=
                  /* k >>> r: */
                  k >>> 24)) +
              ((59797 * (k >>> 16)) << 16)) ^
            /* Math.imul(h, m): */
            (1540483477 * (65535 & h) + ((59797 * (h >>> 16)) << 16)));
      // Handle the last few bytes of the input array
      switch (len) {
        case 3:
          h ^= (255 & str.charCodeAt(i + 2)) << 16;

        case 2:
          h ^= (255 & str.charCodeAt(i + 1)) << 8;

        case 1:
          h =
            /* Math.imul(h, m): */
            1540483477 * (65535 & (h ^= 255 & str.charCodeAt(i))) + ((59797 * (h >>> 16)) << 16);
      }
      // Do a few final mixes of the hash to ensure the last few
      // bytes are well-incorporated.
      return (
        ((h =
          /* Math.imul(h, m): */
          1540483477 * (65535 & (h ^= h >>> 13)) + ((59797 * (h >>> 16)) << 16)) ^
          (h >>> 15)) >>>
        0
      ).toString(36);
    };
  function hashSequence(classes, dir) {
    return (
      '___' + // CONCATENATED MODULE: ../../dist/packages/core/runtime/utils/hashSequence.esm.js
      (function (value) {
        const hashLength = value.length;
        if (7 === hashLength) return value;
        for (let i = hashLength; i < 7; i++) value += '0';
        return value;
      })(hash_browser_esm(classes + dir))
    );
  }
  //# sourceMappingURL=hashSequence.esm.js.map
  // CONCATENATED MODULE: ../../dist/packages/core/runtime/reduceToClassNameForSlots.esm.js
  /**
   * Reduces a classname map for slot to a classname string. Uses classnames according to text directions.
   *
   * @private
   */
  function reduceToClassName(classMap, dir) {
    let className = '';
    // eslint-disable-next-line guard-for-in
    for (const propertyHash in classMap) {
      const classNameMapping = classMap[propertyHash];
      if (classNameMapping) {
        const hasRTLClassName = Array.isArray(classNameMapping);
        className +=
          'rtl' === dir
            ? (hasRTLClassName ? classNameMapping[1] : classNameMapping) + ' '
            : (hasRTLClassName ? classNameMapping[0] : classNameMapping) + ' ';
      }
    }
    return className.slice(0, -1);
  }
  /**
   * Reduces classname maps for slots to classname strings. Registers them in a definition cache to be used by
   * `mergeClasses()`.
   *
   * @private
   */ function reduceToClassNameForSlots(classesMapBySlot, dir) {
    const classNamesForSlots = {};
    // eslint-disable-next-line guard-for-in
    for (const slotName in classesMapBySlot) {
      const classnamesForSlot = reduceToClassName(classesMapBySlot[slotName], dir),
        sequenceHash = hashSequence(classnamesForSlot, dir),
        resultSlotClasses = sequenceHash + ' ' + classnamesForSlot;
      (DEFINITION_LOOKUP_TABLE[sequenceHash] = [classesMapBySlot[slotName], dir]),
        (classNamesForSlots[slotName] = resultSlotClasses);
    }
    return classNamesForSlots;
  }
  //# sourceMappingURL=reduceToClassNameForSlots.esm.js.map
  // CONCATENATED MODULE: ../../dist/packages/core/mergeClasses.esm.js
  const mergeClassesCachedResults = {},
    SEQUENCE_SIZE = '___'.length + 7;
  // CONCATENATED MODULE: ./dist/bundle-size/makeStyles.fixture.js
  console.log(
    // CONCATENATED MODULE: ../../dist/packages/core/__styles.esm.js
    /**
     * A version of makeStyles() that accepts build output as an input and skips all runtime transforms.
     *
     * @internal
     */
    function (classesMapBySlot, cssRules) {
      const insertionCache = {};
      let ltrClassNamesForSlots = null,
        rtlClassNamesForSlots = null;
      return function (options) {
        const { dir: dir, renderer: renderer } = options,
          isLTR = 'ltr' === dir,
          rendererId = isLTR ? renderer.id : renderer.id + 'r';
        return (
          isLTR
            ? null === ltrClassNamesForSlots &&
              (ltrClassNamesForSlots = reduceToClassNameForSlots(classesMapBySlot, dir))
            : null === rtlClassNamesForSlots &&
              (rtlClassNamesForSlots = reduceToClassNameForSlots(classesMapBySlot, dir)),
          void 0 === insertionCache[rendererId] &&
            (renderer.insertCSSRules(cssRules), (insertionCache[rendererId] = !0)),
          isLTR ? ltrClassNamesForSlots : rtlClassNamesForSlots
        );
      };
    },
    //# sourceMappingURL=__styles.esm.js.map
    function () {
      // arguments are parsed manually to avoid double loops as TS & Babel transforms rest via an additional loop
      // @see https://babeljs.io/docs/en/babel-plugin-transform-parameters
      /* eslint-disable prefer-rest-params */
      let dir = null,
        resultClassName = '',
        sequenceMatch = '';
      const sequencesIds = new Array(arguments.length);
      for (let i = 0; i < arguments.length; i++) {
        const className = arguments[i];
        if ('string' == typeof className) {
          // All classes generated by `makeStyles()` are prefixed by a sequence hash, this allows to identify class sets
          // without parsing each className in a string
          const sequenceIndex = className.indexOf('___');
          if (-1 === sequenceIndex) resultClassName += className + ' ';
          else {
            const sequenceId = className.substr(sequenceIndex, SEQUENCE_SIZE);
            // Handles a case with mixed classnames, i.e. "ui-button ATOMIC_CLASSES"
            sequenceIndex > 0 && (resultClassName += className.slice(0, sequenceIndex)),
              (sequenceMatch += sequenceId),
              (sequencesIds[i] = sequenceId);
          }
          0;
        }
      }
      // .slice() there allows to avoid trailing space for non-atomic classes
      // "ui-button ui-flex " => "ui-button ui-flex"
      if ('' === sequenceMatch) return resultClassName.slice(0, -1);
      // It's safe to reuse results to avoid continuous merging as results are stable
      // "__seq1 ... __seq2 ..." => "__seq12 ..."
      const mergeClassesResult = mergeClassesCachedResults[sequenceMatch];
      if (void 0 !== mergeClassesResult) return resultClassName + mergeClassesResult;
      const sequenceMappings = [];
      for (let i = 0; i < arguments.length; i++) {
        const sequenceId = sequencesIds[i];
        if (sequenceId) {
          const sequenceMapping = DEFINITION_LOOKUP_TABLE[sequenceId];
          sequenceMapping && (sequenceMappings.push(sequenceMapping[0]), (dir = sequenceMapping[1]));
        }
      }
      // eslint-disable-next-line prefer-spread
      const resultDefinitions = Object.assign.apply(
        Object, // .assign() mutates the first object, we can't mutate mappings as it will produce invalid results later
        [{}].concat(sequenceMappings),
      );
      let atomicClassNames = reduceToClassName(resultDefinitions, dir);
      // Each merge of classes generates a new sequence of atomic classes that needs to be registered
      const newSequenceHash = hashSequence(atomicClassNames, dir);
      return (
        (atomicClassNames = newSequenceHash + ' ' + atomicClassNames),
        (mergeClassesCachedResults[sequenceMatch] = atomicClassNames),
        (DEFINITION_LOOKUP_TABLE[newSequenceHash] = [resultDefinitions, dir]),
        resultClassName + atomicClassNames
      );
    },
    //# sourceMappingURL=mergeClasses.esm.js.map
  );
})();
/******/
