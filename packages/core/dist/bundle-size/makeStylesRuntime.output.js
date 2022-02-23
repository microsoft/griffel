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
  // CONCATENATED MODULE: ../../node_modules/rtl-css-js/dist/esm/convert-053e536c.js
  /**
   * Takes an array of [keyValue1, keyValue2] pairs and creates an object of {keyValue1: keyValue2, keyValue2: keyValue1}
   * @param {Array} array the array of pairs
   * @return {Object} the {key, value} pair object
   */
  function arrayToObject(array) {
    return array.reduce(function (obj, _ref) {
      var prop1 = _ref[0],
        prop2 = _ref[1];
      return (obj[prop1] = prop2), (obj[prop2] = prop1), obj;
    }, {});
  }
  function isNumber(val) {
    return 'number' == typeof val;
  }
  function includes(inclusive, inclusee) {
    return -1 !== inclusive.indexOf(inclusee);
  }
  /**
   * Flip the sign of a CSS value, possibly with a unit.
   *
   * We can't just negate the value with unary minus due to the units.
   *
   * @private
   * @param {String} value - the original value (for example 77%)
   * @return {String} the result (for example -77%)
   */ function flipTransformSign(match, prefix, offset, suffix) {
    return (
      prefix +
      ((value = offset), 0 === parseFloat(value) ? value : '-' === value[0] ? value.slice(1) : '-' + value) +
      suffix
    );
    var value;
  }
  /**
   * Takes a percentage for background position and inverts it.
   * This was copied and modified from CSSJanus:
   * https://github.com/cssjanus/cssjanus/blob/4245f834365f6cfb0239191a151432fb85abab23/src/cssjanus.js#L152-L175
   * @param {String} value - the original value (for example 77%)
   * @return {String} the result (for example 23%)
   */
  /**
   * This takes a list of CSS values and converts it to an array
   * @param {String} value - something like `1px`, `1px 2em`, or `3pt rgb(150, 230, 550) 40px calc(100% - 5px)`
   * @return {Array} the split values (for example: `['3pt', 'rgb(150, 230, 550)', '40px', 'calc(100% - 5px)']`)
   */
  function getValuesAsList(value) {
    return value
      .replace(/ +/g, ' ')
      .split(' ')
      .map(function (i) {
        return i.trim();
      })
      .filter(Boolean)
      .reduce(
        function (_ref2, item) {
          var list = _ref2.list,
            state = _ref2.state,
            openParansCount = (item.match(/\(/g) || []).length,
            closedParansCount = (item.match(/\)/g) || []).length;
          return (
            state.parensDepth > 0 ? (list[list.length - 1] = list[list.length - 1] + ' ' + item) : list.push(item),
            (state.parensDepth += openParansCount - closedParansCount),
            {
              list: list,
              state: state,
            }
          );
        },
        {
          list: [],
          state: {
            parensDepth: 0,
          },
        },
      ).list;
  }
  /**
   * This is intended for properties that are `top right bottom left` and will switch them to `top left bottom right`
   * @param {String} value - `1px 2px 3px 4px` for example, but also handles cases where there are too few/too many and
   * simply returns the value in those cases (which is the correct behavior)
   * @return {String} the result - `1px 4px 3px 2px` for example.
   */ function handleQuartetValues(value) {
    var splitValues = getValuesAsList(value);
    if (splitValues.length <= 3 || splitValues.length > 4) return value;
    var top = splitValues[0],
      right = splitValues[1],
      bottom = splitValues[2];
    return [top, splitValues[3], bottom, right].join(' ');
  }
  /**
   *
   * @param {String|Number|Object} value css property value to test
   * @returns If the css property value can(should?) have an RTL equivalent
   */ var propertyValueConverters = {
    padding: function (_ref) {
      var value = _ref.value;
      return isNumber(value) ? value : handleQuartetValues(value);
    },
    textShadow: function (_ref2) {
      var flippedShadows =
        /**
         * Splits a shadow style into its separate shadows using the comma delimiter, but creating an exception
         * for comma separated values in parentheses often used for rgba colours.
         * @param {String} value
         * @returns {Array} array of all box shadow values in the string
         */
        (function (value) {
          for (var shadows = [], start = 0, end = 0, rgba = !1; end < value.length; )
            rgba || ',' !== value[end]
              ? '(' === value[end]
                ? ((rgba = !0), end++)
                : ')' === value[end]
                ? ((rgba = !1), end++)
                : end++
              : (shadows.push(value.substring(start, end).trim()), (start = ++end));
          // push the last shadow value if there is one
          // istanbul ignore next
          return start != end && shadows.push(value.substring(start, end + 1)), shadows;
        })(_ref2.value).map(function (shadow) {
          // intentionally leaving off the `g` flag here because we only want to change the first number (which is the offset-x)
          return shadow.replace(/(-*)([.|\d]+)/, function (match, negative, number) {
            return '0' === number ? match : '' + ('' === negative ? '-' : '') + number;
          });
        });
      return flippedShadows.join(',');
    },
    borderColor: function (_ref3) {
      return handleQuartetValues(_ref3.value);
    },
    borderRadius: function (_ref4) {
      var value = _ref4.value;
      if (isNumber(value)) return value;
      if (includes(value, '/')) {
        var _value$split = value.split('/'),
          radius1 = _value$split[0],
          radius2 = _value$split[1];
        return (
          propertyValueConverters.borderRadius({
            value: radius1.trim(),
          }) +
          ' / ' +
          propertyValueConverters.borderRadius({
            value: radius2.trim(),
          })
        );
      }
      var splitValues = getValuesAsList(value);
      switch (splitValues.length) {
        case 2:
          return splitValues.reverse().join(' ');

        case 4:
          var topLeft = splitValues[0],
            topRight = splitValues[1],
            bottomRight = splitValues[2];
          return [topRight, topLeft, splitValues[3], bottomRight].join(' ');

        default:
          return value;
      }
    },
    background: function (_ref5) {
      var value = _ref5.value,
        valuesToConvert = _ref5.valuesToConvert,
        isRtl = _ref5.isRtl,
        bgImgDirectionRegex = _ref5.bgImgDirectionRegex,
        bgPosDirectionRegex = _ref5.bgPosDirectionRegex;
      if (isNumber(value)) return value;
      // Yeah, this is in need of a refactor 🙃...
      // but this property is a tough cookie 🍪
      // get the backgroundPosition out of the string by removing everything that couldn't be the backgroundPosition value
      var backgroundPositionValue = value
        .replace(/(url\(.*?\))|(rgba?\(.*?\))|(hsl\(.*?\))|(#[a-fA-F0-9]+)|((^| )(\D)+( |$))/g, '')
        .trim();
      // replace that backgroundPosition value with the converted version
      // do the backgroundImage value replacing on the whole value (because why not?)
      return (
        (value = value.replace(
          backgroundPositionValue,
          propertyValueConverters.backgroundPosition({
            value: backgroundPositionValue,
            valuesToConvert: valuesToConvert,
            isRtl: isRtl,
            bgPosDirectionRegex: bgPosDirectionRegex,
          }),
        )),
        propertyValueConverters.backgroundImage({
          value: value,
          valuesToConvert: valuesToConvert,
          bgImgDirectionRegex: bgImgDirectionRegex,
        })
      );
    },
    backgroundImage: function (_ref6) {
      var value = _ref6.value,
        valuesToConvert = _ref6.valuesToConvert,
        bgImgDirectionRegex = _ref6.bgImgDirectionRegex;
      return includes(value, 'url(') || includes(value, 'linear-gradient(')
        ? value.replace(bgImgDirectionRegex, function (match, g1, group2) {
            return match.replace(group2, valuesToConvert[group2]);
          })
        : value;
    },
    backgroundPosition: function (_ref7) {
      var value = _ref7.value,
        valuesToConvert = _ref7.valuesToConvert,
        isRtl = _ref7.isRtl,
        bgPosDirectionRegex = _ref7.bgPosDirectionRegex;
      return value
        .replace(isRtl ? /^((-|\d|\.)+%)/ : null, function (match, group) {
          return (function (value) {
            var idx = value.indexOf('.');
            if (-1 === idx) value = 100 - parseFloat(value) + '%';
            else {
              // Two off, one for the "%" at the end, one for the dot itself
              var len = value.length - idx - 2;
              value = (value = 100 - parseFloat(value)).toFixed(len) + '%';
            }
            return value;
          })(group);
        })
        .replace(bgPosDirectionRegex, function (match) {
          return valuesToConvert[match];
        });
    },
    backgroundPositionX: function (_ref8) {
      var value = _ref8.value,
        valuesToConvert = _ref8.valuesToConvert,
        isRtl = _ref8.isRtl,
        bgPosDirectionRegex = _ref8.bgPosDirectionRegex;
      return isNumber(value)
        ? value
        : propertyValueConverters.backgroundPosition({
            value: value,
            valuesToConvert: valuesToConvert,
            isRtl: isRtl,
            bgPosDirectionRegex: bgPosDirectionRegex,
          });
    },
    transition: function (_ref9) {
      var value = _ref9.value,
        propertiesToConvert = _ref9.propertiesToConvert;
      return value
        .split(/,\s*/g)
        .map(function (transition) {
          var values = transition.split(' ');
          // Property is always defined first
          return (values[0] = propertiesToConvert[values[0]] || values[0]), values.join(' ');
        })
        .join(', ');
    },
    transitionProperty: function (_ref10) {
      var value = _ref10.value,
        propertiesToConvert = _ref10.propertiesToConvert;
      return value
        .split(/,\s*/g)
        .map(function (prop) {
          return propertiesToConvert[prop] || prop;
        })
        .join(', ');
    },
    transform: function (_ref11) {
      var value = _ref11.value,
        escapePattern = '(?:(?:(?:\\[0-9a-f]{1,6})(?:\\r\\n|\\s)?)|\\\\[^\\r\\n\\f0-9a-f])',
        signedQuantPattern =
          '((?:-?(?:[0-9]*\\.[0-9]+|[0-9]+)(?:\\s*(?:em|ex|px|cm|mm|in|pt|pc|deg|rad|grad|ms|s|hz|khz|%)|-?(?:[_a-z]|[^\\u0020-\\u007e]|' +
          escapePattern +
          ')(?:[_a-z0-9-]|[^\\u0020-\\u007e]|' +
          escapePattern +
          ')*)?)|(?:inherit|auto))',
        translateXRegExp = new RegExp('(translateX\\s*\\(\\s*)' + signedQuantPattern + '(\\s*\\))', 'gi'),
        translateRegExp = new RegExp(
          '(translate\\s*\\(\\s*)' + signedQuantPattern + '((?:\\s*,\\s*' + signedQuantPattern + '){0,1}\\s*\\))',
          'gi',
        ),
        translate3dRegExp = new RegExp(
          '(translate3d\\s*\\(\\s*)' + signedQuantPattern + '((?:\\s*,\\s*' + signedQuantPattern + '){0,2}\\s*\\))',
          'gi',
        ),
        rotateRegExp = new RegExp('(rotate[ZY]?\\s*\\(\\s*)' + signedQuantPattern + '(\\s*\\))', 'gi');
      // This was copied and modified from CSSJanus:
      // https://github.com/cssjanus/cssjanus/blob/4a40f001b1ba35567112d8b8e1d9d95eda4234c3/src/cssjanus.js#L152-L153
      return value
        .replace(translateXRegExp, flipTransformSign)
        .replace(translateRegExp, flipTransformSign)
        .replace(translate3dRegExp, flipTransformSign)
        .replace(rotateRegExp, flipTransformSign);
    },
  };
  (propertyValueConverters.objectPosition = propertyValueConverters.backgroundPosition),
    (propertyValueConverters.margin = propertyValueConverters.padding),
    (propertyValueConverters.borderWidth = propertyValueConverters.padding),
    (propertyValueConverters.boxShadow = propertyValueConverters.textShadow),
    (propertyValueConverters.webkitBoxShadow = propertyValueConverters.boxShadow),
    (propertyValueConverters.mozBoxShadow = propertyValueConverters.boxShadow),
    (propertyValueConverters.WebkitBoxShadow = propertyValueConverters.boxShadow),
    (propertyValueConverters.MozBoxShadow = propertyValueConverters.boxShadow),
    (propertyValueConverters.borderStyle = propertyValueConverters.borderColor),
    (propertyValueConverters.webkitTransform = propertyValueConverters.transform),
    (propertyValueConverters.mozTransform = propertyValueConverters.transform),
    (propertyValueConverters.WebkitTransform = propertyValueConverters.transform),
    (propertyValueConverters.MozTransform = propertyValueConverters.transform),
    (propertyValueConverters.transformOrigin = propertyValueConverters.backgroundPosition),
    (propertyValueConverters.webkitTransformOrigin = propertyValueConverters.transformOrigin),
    (propertyValueConverters.mozTransformOrigin = propertyValueConverters.transformOrigin),
    (propertyValueConverters.WebkitTransformOrigin = propertyValueConverters.transformOrigin),
    (propertyValueConverters.MozTransformOrigin = propertyValueConverters.transformOrigin),
    (propertyValueConverters.webkitTransition = propertyValueConverters.transition),
    (propertyValueConverters.mozTransition = propertyValueConverters.transition),
    (propertyValueConverters.WebkitTransition = propertyValueConverters.transition),
    (propertyValueConverters.MozTransition = propertyValueConverters.transition),
    (propertyValueConverters.webkitTransitionProperty = propertyValueConverters.transitionProperty),
    (propertyValueConverters.mozTransitionProperty = propertyValueConverters.transitionProperty),
    (propertyValueConverters.WebkitTransitionProperty = propertyValueConverters.transitionProperty),
    (propertyValueConverters.MozTransitionProperty = propertyValueConverters.transitionProperty),
    // kebab-case versions
    (propertyValueConverters['text-shadow'] = propertyValueConverters.textShadow),
    (propertyValueConverters['border-color'] = propertyValueConverters.borderColor),
    (propertyValueConverters['border-radius'] = propertyValueConverters.borderRadius),
    (propertyValueConverters['background-image'] = propertyValueConverters.backgroundImage),
    (propertyValueConverters['background-position'] = propertyValueConverters.backgroundPosition),
    (propertyValueConverters['background-position-x'] = propertyValueConverters.backgroundPositionX),
    (propertyValueConverters['object-position'] = propertyValueConverters.objectPosition),
    (propertyValueConverters['border-width'] = propertyValueConverters.padding),
    (propertyValueConverters['box-shadow'] = propertyValueConverters.textShadow),
    (propertyValueConverters['-webkit-box-shadow'] = propertyValueConverters.textShadow),
    (propertyValueConverters['-moz-box-shadow'] = propertyValueConverters.textShadow),
    (propertyValueConverters['border-style'] = propertyValueConverters.borderColor),
    (propertyValueConverters['-webkit-transform'] = propertyValueConverters.transform),
    (propertyValueConverters['-moz-transform'] = propertyValueConverters.transform),
    (propertyValueConverters['transform-origin'] = propertyValueConverters.transformOrigin),
    (propertyValueConverters['-webkit-transform-origin'] = propertyValueConverters.transformOrigin),
    (propertyValueConverters['-moz-transform-origin'] = propertyValueConverters.transformOrigin),
    (propertyValueConverters['-webkit-transition'] = propertyValueConverters.transition),
    (propertyValueConverters['-moz-transition'] = propertyValueConverters.transition),
    (propertyValueConverters['transition-property'] = propertyValueConverters.transitionProperty),
    (propertyValueConverters['-webkit-transition-property'] = propertyValueConverters.transitionProperty),
    (propertyValueConverters['-moz-transition-property'] = propertyValueConverters.transitionProperty);
  var propertiesToConvert = arrayToObject([
      ['paddingLeft', 'paddingRight'],
      ['marginLeft', 'marginRight'],
      ['left', 'right'],
      ['borderLeft', 'borderRight'],
      ['borderLeftColor', 'borderRightColor'],
      ['borderLeftStyle', 'borderRightStyle'],
      ['borderLeftWidth', 'borderRightWidth'],
      ['borderTopLeftRadius', 'borderTopRightRadius'],
      ['borderBottomLeftRadius', 'borderBottomRightRadius'], // kebab-case versions
      ['padding-left', 'padding-right'],
      ['margin-left', 'margin-right'],
      ['border-left', 'border-right'],
      ['border-left-color', 'border-right-color'],
      ['border-left-style', 'border-right-style'],
      ['border-left-width', 'border-right-width'],
      ['border-top-left-radius', 'border-top-right-radius'],
      ['border-bottom-left-radius', 'border-bottom-right-radius'],
    ]),
    propsToIgnore = ['content'],
    valuesToConvert = arrayToObject([
      ['ltr', 'rtl'],
      ['left', 'right'],
      ['w-resize', 'e-resize'],
      ['sw-resize', 'se-resize'],
      ['nw-resize', 'ne-resize'],
    ]),
    bgImgDirectionRegex = new RegExp('(^|\\W|_)((ltr)|(rtl)|(left)|(right))(\\W|_|$)', 'g'),
    bgPosDirectionRegex = new RegExp('(left)|(right)');
  /**
   * converts properties and values in the CSS in JS object to their corresponding RTL values
   * @param {Object} object the CSS in JS object
   * @return {Object} the RTL converted object
   */
  function convert(object) {
    return Object.keys(object).reduce(
      function (newObj, originalKey) {
        var originalValue = object[originalKey];
        // Some properties should never be transformed
        if (
          ('string' == typeof originalValue &&
            // you're welcome to later code 😺
            (originalValue = originalValue.trim()),
          includes(propsToIgnore, originalKey))
        )
          return (newObj[originalKey] = originalValue), newObj;
        var _convertProperty = convertProperty(originalKey, originalValue),
          key = _convertProperty.key,
          value = _convertProperty.value;
        return (newObj[key] = value), newObj;
      },
      Array.isArray(object) ? [] : {},
    );
  }
  /**
   * Converts a property and its value to the corresponding RTL key and value
   * @param {String} originalKey the original property key
   * @param {Number|String|Object} originalValue the original css property value
   * @return {Object} the new {key, value} pair
   */ function convertProperty(originalKey, originalValue) {
    var property,
      isNoFlip = /\/\*\s?@noflip\s?\*\//.test(originalValue),
      key = isNoFlip ? originalKey : propertiesToConvert[(property = originalKey)] || property,
      value = isNoFlip
        ? originalValue
        : /**
           * This converts the given value to the RTL version of that value based on the key
           * @param {String} key this is the key (note: this should be the RTL version of the originalKey)
           * @param {String|Number|Object} originalValue the original css property value. If it's an object, then we'll convert that as well
           * @return {String|Number|Object} the converted value
           */
          (function (key, originalValue) {
            if (
              !(function (value) {
                return (
                  (val = value),
                  !(
                    'boolean' == typeof val ||
                    (function (val) {
                      return null == val;
                    })(value) ||
                    (function (val) {
                      return 'string' == typeof val && val.match(/var\(.*\)/g);
                    })(value)
                  )
                );
                var val;
              })(originalValue)
            )
              return originalValue;
            if (((val = originalValue), val && 'object' == typeof val)) return convert(originalValue);
            // recurssion 🌀
            var val;
            var newValue,
              isNum = isNumber(originalValue),
              isFunc = (function (val) {
                return 'function' == typeof val;
              })(originalValue),
              importantlessValue = isNum || isFunc ? originalValue : originalValue.replace(/ !important.*?$/, ''),
              isImportant = !isNum && importantlessValue.length !== originalValue.length,
              valueConverter = propertyValueConverters[key];
            newValue = valueConverter
              ? valueConverter({
                  value: importantlessValue,
                  valuesToConvert: valuesToConvert,
                  propertiesToConvert: propertiesToConvert,
                  isRtl: !0,
                  bgImgDirectionRegex: bgImgDirectionRegex,
                  bgPosDirectionRegex: bgPosDirectionRegex,
                })
              : valuesToConvert[importantlessValue] || importantlessValue;
            if (isImportant) return newValue + ' !important';
            return newValue;
          })(key, originalValue);
    return {
      key: key,
      value: value,
    };
  }
  /**
   * This gets the RTL version of the given property if it has a corresponding RTL property
   * @param {String} property the name of the property
   * @return {String} the name of the RTL property
   */ // CONCATENATED MODULE: ../../node_modules/stylis/src/Enum.js
  var MS = '-ms-',
    MOZ = '-moz-',
    WEBKIT = '-webkit-',
    abs = Math.abs,
    /**
     * @param {number}
     * @return {string}
     */ Utility_from = String.fromCharCode,
    /**
     * @param {object}
     * @return {object}
     */ Utility_assign = Object.assign;
  /**
   * @param {string} value
   * @param {number} length
   * @return {number}
   */ /**
   * @param {string} value
   * @return {string}
   */
  function trim(value) {
    return value.trim();
  }
  /**
   * @param {string} value
   * @param {RegExp} pattern
   * @return {string?}
   */
  /**
   * @param {string} value
   * @param {(string|RegExp)} pattern
   * @param {string} replacement
   * @return {string}
   */
  function replace(value, pattern, replacement) {
    return value.replace(pattern, replacement);
  }
  /**
   * @param {string} value
   * @param {string} search
   * @return {number}
   */ function indexof(value, search) {
    return value.indexOf(search);
  }
  /**
   * @param {string} value
   * @param {number} index
   * @return {number}
   */ function Utility_charat(value, index) {
    return 0 | value.charCodeAt(index);
  }
  /**
   * @param {string} value
   * @param {number} begin
   * @param {number} end
   * @return {string}
   */ function Utility_substr(value, begin, end) {
    return value.slice(begin, end);
  }
  /**
   * @param {string} value
   * @return {number}
   */ function Utility_strlen(value) {
    return value.length;
  }
  /**
   * @param {any[]} value
   * @return {number}
   */ function Utility_sizeof(value) {
    return value.length;
  }
  /**
   * @param {any} value
   * @param {any[]} array
   * @return {any}
   */ function Utility_append(value, array) {
    return array.push(value), value;
  }
  /**
   * @param {string[]} array
   * @param {function} callback
   * @return {string}
   */ // CONCATENATED MODULE: ../../node_modules/stylis/src/Serializer.js
  /**
   * @param {object[]} children
   * @param {function} callback
   * @return {string}
   */
  function serialize(children, callback) {
    for (var output = '', length = Utility_sizeof(children), i = 0; i < length; i++)
      output += callback(children[i], i, children, callback) || '';
    return output;
  }
  /**
   * @param {object} element
   * @param {number} index
   * @param {object[]} children
   * @param {function} callback
   * @return {string}
   */ function stringify(element, index, children, callback) {
    switch (element.type) {
      case '@import':
      case 'decl':
        return (element.return = element.return || element.value);

      case 'comm':
        return '';

      case '@keyframes':
        return (element.return = element.value + '{' + serialize(element.children, callback) + '}');

      case 'rule':
        element.value = element.props.join(',');
    }
    return Utility_strlen((children = serialize(element.children, callback)))
      ? (element.return = element.value + '{' + children + '}')
      : '';
  }
  // CONCATENATED MODULE: ../../node_modules/stylis/src/Tokenizer.js
  var line = 1,
    column = 1,
    Tokenizer_length = 0,
    position = 0,
    character = 0,
    characters = '';
  /**
   * @param {string} value
   * @param {object | null} root
   * @param {object | null} parent
   * @param {string} type
   * @param {string[] | string} props
   * @param {object[] | string} children
   * @param {number} length
   */ function node(value, root, parent, type, props, children, length) {
    return {
      value: value,
      root: root,
      parent: parent,
      type: type,
      props: props,
      children: children,
      line: line,
      column: column,
      length: length,
      return: '',
    };
  }
  /**
   * @param {object} root
   * @param {object} props
   * @return {object}
   */ function copy(root, props) {
    return Utility_assign(
      node('', null, null, '', null, null, 0),
      root,
      {
        length: -root.length,
      },
      props,
    );
  }
  /**
   * @return {number}
   */
  /**
   * @return {number}
   */
  function prev() {
    return (
      (character = position > 0 ? Utility_charat(characters, --position) : 0),
      column--,
      10 === character && ((column = 1), line--),
      character
    );
  }
  /**
   * @return {number}
   */ function next() {
    return (
      (character = position < Tokenizer_length ? Utility_charat(characters, position++) : 0),
      column++,
      10 === character && ((column = 1), line++),
      character
    );
  }
  /**
   * @return {number}
   */ function peek() {
    return Utility_charat(characters, position);
  }
  /**
   * @return {number}
   */ function caret() {
    return position;
  }
  /**
   * @param {number} begin
   * @param {number} end
   * @return {string}
   */ function slice(begin, end) {
    return Utility_substr(characters, begin, end);
  }
  /**
   * @param {number} type
   * @return {number}
   */ function token(type) {
    switch (type) {
      // \0 \t \n \r \s whitespace token
      case 0:
      case 9:
      case 10:
      case 13:
      case 32:
        return 5;

      // ! + , / > @ ~ isolate token
      case 33:
      case 43:
      case 44:
      case 47:
      case 62:
      case 64:
      case 126:
      // ; { } breakpoint token
      case 59:
      case 123:
      case 125:
        return 4;

      // : accompanied token
      case 58:
        return 3;

      // " ' ( [ opening delimit token
      case 34:
      case 39:
      case 40:
      case 91:
        return 2;

      // ) ] closing delimit token
      case 41:
      case 93:
        return 1;
    }
    return 0;
  }
  /**
   * @param {string} value
   * @return {any[]}
   */ function alloc(value) {
    return (line = column = 1), (Tokenizer_length = Utility_strlen((characters = value))), (position = 0), [];
  }
  /**
   * @param {any} value
   * @return {any}
   */ function dealloc(value) {
    return (characters = ''), value;
  }
  /**
   * @param {number} type
   * @return {string}
   */ function delimit(type) {
    return trim(slice(position - 1, delimiter(91 === type ? type + 2 : 40 === type ? type + 1 : type)));
  }
  /**
   * @param {string} value
   * @return {string[]}
   */
  /**
   * @param {number} type
   * @return {string}
   */
  function whitespace(type) {
    for (; (character = peek()) && character < 33; ) next();
    return token(type) > 2 || token(character) > 3 ? '' : ' ';
  }
  /**
   * @param {string[]} children
   * @return {string[]}
   */
  /**
   * @param {number} index
   * @param {number} count
   * @return {string}
   */
  function escaping(index, count) {
    for (
      ;
      --count &&
      next() &&
      !(character < 48 || character > 102 || (character > 57 && character < 65) || (character > 70 && character < 97));

    );
    return slice(index, caret() + (count < 6 && 32 == peek() && 32 == next()));
  }
  /**
   * @param {number} type
   * @return {number}
   */ function delimiter(type) {
    for (; next(); )
      switch (character) {
        // ] ) " '
        case type:
          return position;

        // " '
        case 34:
        case 39:
          34 !== type && 39 !== type && delimiter(character);
          break;

        // (
        case 40:
          41 === type && delimiter(type);
          break;

        // \
        case 92:
          next();
      }
    return position;
  }
  /**
   * @param {number} type
   * @param {number} index
   * @return {number}
   */ function commenter(type, index) {
    for (; next() && type + character !== 57 && (type + character !== 84 || 47 !== peek()); );
    return '/*' + slice(index, position - 1) + '*' + Utility_from(47 === type ? type : next());
  }
  /**
   * @param {number} index
   * @return {string}
   */ function identifier(index) {
    for (; !token(peek()); ) next();
    return slice(index, position);
  }
  // CONCATENATED MODULE: ../../node_modules/stylis/src/Parser.js
  /**
   * @param {string} value
   * @return {object[]}
   */
  function compile(value) {
    return dealloc(parse('', null, null, null, [''], (value = alloc(value)), 0, [0], value));
  }
  /**
   * @param {string} value
   * @param {object} root
   * @param {object?} parent
   * @param {string[]} rule
   * @param {string[]} rules
   * @param {string[]} rulesets
   * @param {number[]} pseudo
   * @param {number[]} points
   * @param {string[]} declarations
   * @return {object}
   */ function parse(value, root, parent, rule, rules, rulesets, pseudo, points, declarations) {
    for (
      var index = 0,
        offset = 0,
        length = pseudo,
        atrule = 0,
        property = 0,
        previous = 0,
        variable = 1,
        scanning = 1,
        ampersand = 1,
        character = 0,
        type = '',
        props = rules,
        children = rulesets,
        reference = rule,
        characters = type;
      scanning;

    )
      switch (((previous = character), (character = next()))) {
        // (
        case 40:
          if (108 != previous && 58 == characters.charCodeAt(length - 1)) {
            -1 != indexof((characters += replace(delimit(character), '&', '&\f')), '&\f') && (ampersand = -1);
            break;
          }

        // " ' [
        case 34:
        case 39:
        case 91:
          characters += delimit(character);
          break;

        // \t \n \r \s
        case 9:
        case 10:
        case 13:
        case 32:
          characters += whitespace(previous);
          break;

        // \
        case 92:
          characters += escaping(caret() - 1, 7);
          continue;

        // /
        case 47:
          switch (peek()) {
            case 42:
            case 47:
              Utility_append(comment(commenter(next(), caret()), root, parent), declarations);
              break;

            default:
              characters += '/';
          }
          break;

        // {
        case 123 * variable:
          points[index++] = Utility_strlen(characters) * ampersand;

        // } ; \0
        case 125 * variable:
        case 59:
        case 0:
          switch (character) {
            // \0 }
            case 0:
            case 125:
              scanning = 0;

            // ;
            case 59 + offset:
              property > 0 &&
                Utility_strlen(characters) - length &&
                Utility_append(
                  property > 32
                    ? declaration(characters + ';', rule, parent, length - 1)
                    : declaration(replace(characters, ' ', '') + ';', rule, parent, length - 2),
                  declarations,
                );
              break;

            // @ ;
            case 59:
              characters += ';';

            // { rule/at-rule
            default:
              if (
                (Utility_append(
                  (reference = ruleset(
                    characters,
                    root,
                    parent,
                    index,
                    offset,
                    rules,
                    points,
                    type,
                    (props = []),
                    (children = []),
                    length,
                  )),
                  rulesets,
                ),
                123 === character)
              )
                if (0 === offset)
                  parse(characters, root, reference, reference, props, rulesets, length, points, children);
                else
                  switch (atrule) {
                    // d m s
                    case 100:
                    case 109:
                    case 115:
                      parse(
                        value,
                        reference,
                        reference,
                        rule &&
                          Utility_append(
                            ruleset(
                              value,
                              reference,
                              reference,
                              0,
                              0,
                              rules,
                              points,
                              type,
                              rules,
                              (props = []),
                              length,
                            ),
                            children,
                          ),
                        rules,
                        children,
                        length,
                        points,
                        rule ? props : children,
                      );
                      break;

                    default:
                      parse(characters, reference, reference, reference, [''], children, 0, points, children);
                  }
          }
          (index = offset = property = 0), (variable = ampersand = 1), (type = characters = ''), (length = pseudo);
          break;

        // :
        case 58:
          (length = 1 + Utility_strlen(characters)), (property = previous);

        default:
          if (variable < 1)
            if (123 == character) --variable;
            else if (125 == character && 0 == variable++ && 125 == prev()) continue;
          switch (((characters += Utility_from(character)), character * variable)) {
            // &
            case 38:
              ampersand = offset > 0 ? 1 : ((characters += '\f'), -1);
              break;

            // ,
            case 44:
              (points[index++] = (Utility_strlen(characters) - 1) * ampersand), (ampersand = 1);
              break;

            // @
            case 64:
              // -
              45 === peek() && (characters += delimit(next())),
                (atrule = peek()),
                (offset = length = Utility_strlen((type = characters += identifier(caret())))),
                character++;
              break;

            // -
            case 45:
              45 === previous && 2 == Utility_strlen(characters) && (variable = 0);
          }
      }
    return rulesets;
  }
  /**
   * @param {string} value
   * @param {object} root
   * @param {object?} parent
   * @param {number} index
   * @param {number} offset
   * @param {string[]} rules
   * @param {number[]} points
   * @param {string} type
   * @param {string[]} props
   * @param {string[]} children
   * @param {number} length
   * @return {object}
   */ function ruleset(value, root, parent, index, offset, rules, points, type, props, children, length) {
    for (
      var post = offset - 1, rule = 0 === offset ? rules : [''], size = Utility_sizeof(rule), i = 0, j = 0, k = 0;
      i < index;
      ++i
    )
      for (var x = 0, y = Utility_substr(value, post + 1, (post = abs((j = points[i])))), z = value; x < size; ++x)
        (z = trim(j > 0 ? rule[x] + ' ' + y : replace(y, /&\f/g, rule[x]))) && (props[k++] = z);
    return node(value, root, parent, 0 === offset ? 'rule' : type, props, children, length);
  }
  /**
   * @param {number} value
   * @param {object} root
   * @param {object?} parent
   * @return {object}
   */ function comment(value, root, parent) {
    return node(value, root, parent, 'comm', Utility_from(character), Utility_substr(value, 2, -2), 0);
  }
  /**
   * @param {string} value
   * @param {object} root
   * @param {object?} parent
   * @param {number} length
   * @return {object}
   */ function declaration(value, root, parent, length) {
    return node(
      value,
      root,
      parent,
      'decl',
      Utility_substr(value, 0, length),
      Utility_substr(value, length + 1, -1),
      length,
    );
  }
  // CONCATENATED MODULE: ../../node_modules/stylis/src/Prefixer.js
  /**
   * @param {string} value
   * @param {number} length
   * @return {string}
   */
  function prefix(value, length) {
    switch (
      (function (value, length) {
        return (
          (((((((length << 2) ^ Utility_charat(value, 0)) << 2) ^ Utility_charat(value, 1)) << 2) ^
            Utility_charat(value, 2)) <<
            2) ^
          Utility_charat(value, 3)
        );
      })(value, length)
    ) {
      // color-adjust
      case 5103:
        return WEBKIT + 'print-' + value + value;

      // animation, animation-(delay|direction|duration|fill-mode|iteration-count|name|play-state|timing-function)
      case 5737:
      case 4201:
      case 3177:
      case 3433:
      case 1641:
      case 4457:
      case 2921:
      // text-decoration, filter, clip-path, backface-visibility, column, box-decoration-break
      case 5572:
      case 6356:
      case 5844:
      case 3191:
      case 6645:
      case 3005:
      // mask, mask-image, mask-(mode|clip|size), mask-(repeat|origin), mask-position, mask-composite,
      case 6391:
      case 5879:
      case 5623:
      case 6135:
      case 4599:
      case 4855:
      // background-clip, columns, column-(count|fill|gap|rule|rule-color|rule-style|rule-width|span|width)
      case 4215:
      case 6389:
      case 5109:
      case 5365:
      case 5621:
      case 3829:
        return WEBKIT + value + value;

      // appearance, user-select, transform, hyphens, text-size-adjust
      case 5349:
      case 4246:
      case 4810:
      case 6968:
      case 2756:
        return WEBKIT + value + MOZ + value + MS + value + value;

      // flex, flex-direction
      case 6828:
      case 4268:
        return WEBKIT + value + MS + value + value;

      // order
      case 6165:
        return WEBKIT + value + MS + 'flex-' + value + value;

      // align-items
      case 5187:
        return WEBKIT + value + replace(value, /(\w+).+(:[^]+)/, '-webkit-box-$1$2-ms-flex-$1$2') + value;

      // align-self
      case 5443:
        return WEBKIT + value + MS + 'flex-item-' + replace(value, /flex-|-self/, '') + value;

      // align-content
      case 4675:
        return WEBKIT + value + MS + 'flex-line-pack' + replace(value, /align-content|flex-|-self/, '') + value;

      // flex-shrink
      case 5548:
        return WEBKIT + value + MS + replace(value, 'shrink', 'negative') + value;

      // flex-basis
      case 5292:
        return WEBKIT + value + MS + replace(value, 'basis', 'preferred-size') + value;

      // flex-grow
      case 6060:
        return (
          WEBKIT +
          'box-' +
          replace(value, '-grow', '') +
          WEBKIT +
          value +
          MS +
          replace(value, 'grow', 'positive') +
          value
        );

      // transition
      case 4554:
        return WEBKIT + replace(value, /([^-])(transform)/g, '$1-webkit-$2') + value;

      // cursor
      case 6187:
        return (
          replace(replace(replace(value, /(zoom-|grab)/, WEBKIT + '$1'), /(image-set)/, WEBKIT + '$1'), value, '') +
          value
        );

      // background, background-image
      case 5495:
      case 3959:
        return replace(value, /(image-set\([^]*)/, WEBKIT + '$1$`$1');

      // justify-content
      case 4968:
        return (
          replace(replace(value, /(.+:)(flex-)?(.*)/, '-webkit-box-pack:$3-ms-flex-pack:$3'), /s.+-b[^;]+/, 'justify') +
          WEBKIT +
          value +
          value
        );

      // (margin|padding)-inline-(start|end)
      case 4095:
      case 3583:
      case 4068:
      case 2532:
        return replace(value, /(.+)-inline(.+)/, WEBKIT + '$1$2') + value;

      // (min|max)?(width|height|inline-size|block-size)
      case 8116:
      case 7059:
      case 5753:
      case 5535:
      case 5445:
      case 5701:
      case 4933:
      case 4677:
      case 5533:
      case 5789:
      case 5021:
      case 4765:
        // stretch, max-content, min-content, fill-available
        if (Utility_strlen(value) - 1 - length > 6)
          switch (Utility_charat(value, length + 1)) {
            // (m)ax-content, (m)in-content
            case 109:
              // -
              if (45 !== Utility_charat(value, length + 4)) break;

            // (f)ill-available, (f)it-content
            case 102:
              return (
                replace(
                  value,
                  /(.+:)(.+)-([^]+)/,
                  '$1-webkit-$2-$3$1' + MOZ + (108 == Utility_charat(value, length + 3) ? '$3' : '$2-$3'),
                ) + value
              );

            // (s)tretch
            case 115:
              return ~indexof(value, 'stretch')
                ? prefix(replace(value, 'stretch', 'fill-available'), length) + value
                : value;
          }
        break;

      // position: sticky
      case 4949:
        // (s)ticky?
        if (115 !== Utility_charat(value, length + 1)) break;

      // display: (flex|inline-flex)
      case 6444:
        switch (Utility_charat(value, Utility_strlen(value) - 3 - (~indexof(value, '!important') && 10))) {
          // stic(k)y
          case 107:
            return replace(value, ':', ':' + WEBKIT) + value;

          // (inline-)?fl(e)x
          case 101:
            return (
              replace(
                value,
                /(.+:)([^;!]+)(;|!.+)?/,
                '$1' +
                  WEBKIT +
                  (45 === Utility_charat(value, 14) ? 'inline-' : '') +
                  'box$3$1' +
                  WEBKIT +
                  '$2$3$1' +
                  MS +
                  '$2box$3',
              ) + value
            );
        }
        break;

      // writing-mode
      case 5936:
        switch (Utility_charat(value, length + 11)) {
          // vertical-l(r)
          case 114:
            return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, 'tb') + value;

          // vertical-r(l)
          case 108:
            return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, 'tb-rl') + value;

          // horizontal(-)tb
          case 45:
            return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, 'lr') + value;
        }
        return WEBKIT + value + MS + value + value;
    }
    return value;
  }
  // CONCATENATED MODULE: ../../node_modules/stylis/src/Middleware.js
  /**
   * @param {function[]} collection
   * @return {function}
   */
  function middleware(collection) {
    var length = Utility_sizeof(collection);
    return function (element, index, children, callback) {
      for (var output = '', i = 0; i < length; i++) output += collection[i](element, index, children, callback) || '';
      return output;
    };
  }
  /**
   * @param {function} callback
   * @return {function}
   */ function rulesheet(callback) {
    return function (element) {
      element.root || ((element = element.return) && callback(element));
    };
  }
  /**
   * @param {object} element
   * @param {number} index
   * @param {object[]} children
   * @param {function} callback
   */ function prefixer(element, index, children, callback) {
    if (element.length > -1 && !element.return)
      switch (element.type) {
        case 'decl':
          element.return = prefix(element.value, element.length);
          break;

        case '@keyframes':
          return serialize(
            [
              copy(element, {
                value: replace(element.value, '@', '@' + WEBKIT),
              }),
            ],
            callback,
          );

        case 'rule':
          if (element.length)
            return (function (array, callback) {
              return array.map(callback).join('');
            })(element.props, function (value) {
              switch (
                (function (value, pattern) {
                  return (value = pattern.exec(value)) ? value[0] : value;
                })(value, /(::plac\w+|:read-\w+)/)
              ) {
                // :read-(only|write)
                case ':read-only':
                case ':read-write':
                  return serialize(
                    [
                      copy(element, {
                        props: [replace(value, /:(read-\w+)/, ':-moz-$1')],
                      }),
                    ],
                    callback,
                  );

                // :placeholder
                case '::placeholder':
                  return serialize(
                    [
                      copy(element, {
                        props: [replace(value, /:(plac\w+)/, ':-webkit-input-$1')],
                      }),
                      copy(element, {
                        props: [replace(value, /:(plac\w+)/, ':-moz-$1')],
                      }),
                      copy(element, {
                        props: [replace(value, /:(plac\w+)/, MS + 'input-$1')],
                      }),
                    ],
                    callback,
                  );
              }
              return '';
            });
      }
  }
  /**
   * @param {object} element
   * @param {number} index
   * @param {object[]} children
   */ // CONCATENATED MODULE: ../../dist/packages/core/runtime/utils/hyphenateProperty.esm.js
  const uppercasePattern = /[A-Z]/g,
    msPattern = /^ms-/,
    cache = {};
  function toHyphenLower(match) {
    return '-' + match.toLowerCase();
  }
  function hyphenateProperty(name) {
    if (Object.prototype.hasOwnProperty.call(cache, name)) return cache[name];
    if ('--' === name.substr(0, 2)) return name;
    const hName = name.replace(uppercasePattern, toHyphenLower);
    return (cache[name] = msPattern.test(hName) ? '-' + hName : hName);
  }
  //# sourceMappingURL=hyphenateProperty.esm.js.map
  // CONCATENATED MODULE: ../../dist/packages/core/runtime/utils/normalizeNestedProperty.esm.js
  function normalizeNestedProperty(nestedProperty) {
    return '&' === nestedProperty.charAt(0) ? nestedProperty.slice(1) : nestedProperty;
  }
  //# sourceMappingURL=normalizeNestedProperty.esm.js.map
  // CONCATENATED MODULE: ../../dist/packages/core/runtime/compileCSS.esm.js
  const PSEUDO_SELECTOR_REGEX = /,( *[^ &])/g;
  /**
   * Normalizes pseudo selectors to always contain &, requires to work properly with comma-separated selectors.
   *
   * @example
   *   ":hover" => "&:hover"
   *   " :hover" => "& :hover"
   *   ":hover,:focus" => "&:hover,&:focus"
   *   " :hover, :focus" => "& :hover,& :focus"
   */ function compileCSS(options) {
    const {
        className: className,
        media: media,
        pseudo: pseudo,
        support: support,
        property: property,
        rtlClassName: rtlClassName,
        rtlProperty: rtlProperty,
        rtlValue: rtlValue,
        value: value,
      } = options,
      classNameSelector = `.${className}`,
      cssDeclaration = `{ ${hyphenateProperty(property)}: ${value}; }`;
    let rtlClassNameSelector = null,
      rtlCSSDeclaration = null;
    rtlProperty &&
      rtlClassName &&
      ((rtlClassNameSelector = `.${rtlClassName}`),
      (rtlCSSDeclaration = `{ ${hyphenateProperty(rtlProperty)}: ${rtlValue}; }`));
    let cssRule = '';
    // Should be handled by namespace plugin of Stylis, is buggy now
    // Issues are reported:
    // https://github.com/thysultan/stylis.js/issues/253
    // https://github.com/thysultan/stylis.js/issues/252
    if (0 === pseudo.indexOf(':global(')) {
      // 👇 :global(GROUP_1)GROUP_2
      const GLOBAL_PSEUDO_REGEX = /global\((.+)\)(.+)?/,
        [, globalSelector, restPseudo = ''] = GLOBAL_PSEUDO_REGEX.exec(pseudo),
        normalizedPseudo = normalizeNestedProperty(restPseudo.trim());
      cssRule = `${globalSelector} { ${`${classNameSelector}${normalizedPseudo} ${cssDeclaration}`}; ${
        rtlProperty ? `${rtlClassNameSelector}${normalizedPseudo} ${rtlCSSDeclaration}` : ''
      } }`;
    } else {
      const normalizedPseudo =
        '&' +
        normalizeNestedProperty(
          // Regex there replaces a comma, spaces and an ampersand if it's present with comma and an ampersand.
          // This allows to normalize input, see examples in JSDoc.
          pseudo.replace(PSEUDO_SELECTOR_REGEX, ',&$1'),
        );
      (cssRule = `${classNameSelector}{${normalizedPseudo} ${cssDeclaration}};`),
        rtlProperty && (cssRule = `${cssRule}; ${rtlClassNameSelector}${normalizedPseudo} ${rtlCSSDeclaration};`);
    }
    return (
      media && (cssRule = `@media ${media} { ${cssRule} }`),
      support && (cssRule = `@supports ${support} { ${cssRule} }`),
      (function (cssRules) {
        const rules = [];
        return (
          serialize(
            compile(cssRules),
            middleware([
              prefixer,
              stringify, // 💡 we are using `.insertRule()` API for DOM operations, which does not support
              // insertion of multiple CSS rules in a single call. `rulesheet` plugin extracts
              // individual rules to be used with this API
              rulesheet(rule => rules.push(rule)),
            ]),
          ),
          rules
        );
      })(cssRule)
    );
  }
  //# sourceMappingURL=compileCSS.esm.js.map
  // CONCATENATED MODULE: ../../dist/packages/core/runtime/utils/cssifyObject.esm.js
  function cssifyObject(style) {
    let css = '';
    // eslint-disable-next-line guard-for-in
    for (const property in style) {
      const value = style[property];
      ('string' != typeof value && 'number' != typeof value) ||
        (css += hyphenateProperty(property) + ':' + value + ';');
    }
    return css;
  }
  //# sourceMappingURL=cssifyObject.esm.js.map
  // CONCATENATED MODULE: ../../dist/packages/core/runtime/compileKeyframeCSS.esm.js
  function compileKeyframeRule(keyframeObject) {
    let css = '';
    // eslint-disable-next-line guard-for-in
    for (const percentage in keyframeObject) css += `${percentage}{${cssifyObject(keyframeObject[percentage])}}`;
    return css;
  }
  /**
   * Creates CSS rules for insertion from passed CSS.
   */ function compileKeyframesCSS(keyframeName, keyframeCSS) {
    const rules = [];
    return (
      serialize(
        compile(`@keyframes ${keyframeName} {${keyframeCSS}}`),
        middleware([
          prefixer,
          stringify, // 💡 we are using `.insertRule()` API for DOM operations, which does not support
          // insertion of multiple CSS rules in a single call. `rulesheet` plugin extracts
          // individual rules to be used with this API
          rulesheet(rule => rules.push(rule)),
        ]),
      ),
      rules
    );
  }
  //# sourceMappingURL=compileKeyframeCSS.esm.js.map
  // CONCATENATED MODULE: ../../dist/packages/core/runtime/utils/generateCombinedMediaQuery.esm.js
  function generateCombinedQuery(currentMediaQuery, nestedMediaQuery) {
    return 0 === currentMediaQuery.length ? nestedMediaQuery : `${currentMediaQuery} and ${nestedMediaQuery}`;
  }
  //# sourceMappingURL=generateCombinedMediaQuery.esm.js.map
  // CONCATENATED MODULE: ../../dist/packages/core/runtime/utils/isMediaQuerySelector.esm.js
  function isMediaQuerySelector(property) {
    return '@media' === property.substr(0, 6);
  }
  //# sourceMappingURL=isMediaQuerySelector.esm.js.map
  // CONCATENATED MODULE: ../../dist/packages/core/runtime/utils/isNestedSelector.esm.js
  const regex = /^(:|\[|>|&)/;
  function isNestedSelector(property) {
    return regex.test(property);
  }
  //# sourceMappingURL=isNestedSelector.esm.js.map
  // CONCATENATED MODULE: ../../dist/packages/core/runtime/utils/isSupportQuerySelector.esm.js
  function isSupportQuerySelector(property) {
    return '@supports' === property.substr(0, 9);
  }
  //# sourceMappingURL=isSupportQuerySelector.esm.js.map
  // CONCATENATED MODULE: ../../dist/packages/core/runtime/getStyleBucketName.esm.js
  /**
   * Maps the long pseudo name to the short pseudo name. Pseudos that match here will be ordered, everything else will
   * make their way to default style bucket. We reduce the pseudo name to save bundlesize.
   * Thankfully there aren't any overlaps, see: https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes.
   */
  const pseudosMap = {
    // :focus-within
    'us-w': 'w',
    // :focus-visible
    'us-v': 'i',
    // :link
    nk: 'l',
    // :visited
    si: 'v',
    // :focus
    cu: 'f',
    // :hover
    ve: 'h',
    // :active
    ti: 'a',
  };
  /**
   * Gets the bucket depending on the pseudo.
   *
   * Input:
   *
   * ```
   * ":hover"
   * ":focus:hover"
   * ```
   *
   * Output:
   *
   * ```
   * "h"
   * "f"
   * ```
   */ function getStyleBucketName(pseudo, media, support) {
    // We are grouping all the at-rules like @media, @supports etc under `t` bucket.
    if (media || support) return 't';
    const normalizedPseudo = pseudo.trim();
    return (
      (58 === /* ":" */ normalizedPseudo.charCodeAt(0) &&
        (pseudosMap[normalizedPseudo.slice(4, 8)] ||
          /* allows to avoid collisions between "focus-visible" & "focus" */ pseudosMap[
            normalizedPseudo.slice(3, 5)
          ])) ||
      'd'
    );
    // Return default bucket
  }
  //# sourceMappingURL=getStyleBucketName.esm.js.map
  // CONCATENATED MODULE: ../../dist/packages/core/runtime/utils/hashClassName.esm.js
  function hashClassName({ media: media, property: property, pseudo: pseudo, support: support, value: value }) {
    return 'f' + hash_browser_esm(pseudo + media + support + property + value.trim());
  }
  //# sourceMappingURL=hashClassName.esm.js.map
  // CONCATENATED MODULE: ../../dist/packages/core/runtime/utils/hashPropertyKey.esm.js
  function hashPropertyKey(pseudo, media, support, property) {
    // uniq key based on property & selector, used for merging later
    const hashedKey = hash_browser_esm(pseudo + media + support + property),
      firstCharCode = hashedKey.charCodeAt(0);
    // "key" can be really long as it includes selectors, we use hashes to reduce sizes of keys
    // ".foo :hover" => "abcd"
    return firstCharCode >= 48 && firstCharCode <= 57
      ? String.fromCharCode(firstCharCode + 17) + hashedKey.substr(1)
      : hashedKey;
  }
  //# sourceMappingURL=hashPropertyKey.esm.js.map
  function pushToCSSRules(cssRulesByBucket, styleBucketName, ltrCSS, rtlCSS) {
    (cssRulesByBucket[styleBucketName] = cssRulesByBucket[styleBucketName] || []),
      cssRulesByBucket[styleBucketName].push(ltrCSS),
      rtlCSS && cssRulesByBucket[styleBucketName].push(rtlCSS);
  }
  /**
   * Transforms input styles to classes maps & CSS rules.
   *
   * @internal
   */ function resolveStyleRules(
    styles,
    pseudo = '',
    media = '',
    support = '',
    cssClassesMap = {},
    cssRulesByBucket = {},
    rtlValue,
  ) {
    // eslint-disable-next-line guard-for-in
    for (const property in styles) {
      0;
      const value = styles[property];
      // eslint-disable-next-line eqeqeq
      if (null != value)
        if ('string' == typeof value || 'number' == typeof value) {
          // uniq key based on a hash of property & selector, used for merging later
          const key = hashPropertyKey(pseudo, media, support, property),
            className = hashClassName({
              media: media,
              value: value.toString(),
              support: support,
              pseudo: pseudo,
              property: property,
            }),
            rtlDefinition =
              (rtlValue && {
                key: property,
                value: rtlValue,
              }) ||
              convertProperty(property, value),
            flippedInRtl = rtlDefinition.key !== property || rtlDefinition.value !== value,
            rtlClassName = flippedInRtl
              ? hashClassName({
                  value: rtlDefinition.value.toString(),
                  property: rtlDefinition.key,
                  pseudo: pseudo,
                  media: media,
                  support: support,
                })
              : void 0,
            rtlCompileOptions = flippedInRtl
              ? {
                  rtlClassName: rtlClassName,
                  rtlProperty: rtlDefinition.key,
                  rtlValue: rtlDefinition.value,
                }
              : void 0,
            styleBucketName = getStyleBucketName(pseudo, media, support),
            [ltrCSS, rtlCSS] = compileCSS(
              Object.assign(
                {
                  className: className,
                  media: media,
                  pseudo: pseudo,
                  property: property,
                  support: support,
                  value: value,
                },
                rtlCompileOptions,
              ),
            );
          (ltrClassname = className),
            (rtlClassname = rtlClassName),
            (cssClassesMap[key] = rtlClassname ? [ltrClassname, rtlClassname] : ltrClassname),
            pushToCSSRules(cssRulesByBucket, styleBucketName, ltrCSS, rtlCSS);
        } else if ('animationName' === property) {
          const animationNameValue = Array.isArray(value) ? value : [value],
            animationNames = [],
            rtlAnimationNames = [];
          for (const keyframeObject of animationNameValue) {
            const keyframeCSS = compileKeyframeRule(keyframeObject),
              rtlKeyframeCSS = compileKeyframeRule(convert(keyframeObject)),
              animationName = 'f' + hash_browser_esm(keyframeCSS);
            let rtlAnimationName;
            const keyframeRules = compileKeyframesCSS(animationName, keyframeCSS);
            let rtlKeyframeRules = [];
            keyframeCSS === rtlKeyframeCSS
              ? // If CSS for LTR & RTL are same we will re-use animationName from LTR to avoid duplication of rules in output
                (rtlAnimationName = animationName)
              : ((rtlAnimationName = 'f' + hash_browser_esm(rtlKeyframeCSS)),
                (rtlKeyframeRules = compileKeyframesCSS(rtlAnimationName, rtlKeyframeCSS)));
            for (let i = 0; i < keyframeRules.length; i++)
              pushToCSSRules(
                cssRulesByBucket, // keyframes styles should be inserted into own bucket
                'k',
                keyframeRules[i],
                rtlKeyframeRules[i],
              );
            animationNames.push(animationName), rtlAnimationNames.push(rtlAnimationName);
          }
          resolveStyleRules(
            {
              animationName: animationNames.join(', '),
            },
            pseudo,
            media,
            support,
            cssClassesMap,
            cssRulesByBucket,
            rtlAnimationNames.join(', '),
          );
        } else if (null != (val = value) && 'object' == typeof val && !1 === Array.isArray(val))
          if (isNestedSelector(property))
            resolveStyleRules(
              value,
              pseudo + normalizeNestedProperty(property),
              media,
              support,
              cssClassesMap,
              cssRulesByBucket,
            );
          else if (isMediaQuerySelector(property)) {
            resolveStyleRules(
              value,
              pseudo,
              generateCombinedQuery(media, property.slice(6).trim()),
              support,
              cssClassesMap,
              cssRulesByBucket,
            );
          } else if (isSupportQuerySelector(property)) {
            resolveStyleRules(
              value,
              pseudo,
              media,
              generateCombinedQuery(support, property.slice(9).trim()),
              cssClassesMap,
              cssRulesByBucket,
            );
          } else 0;
    }
    // CONCATENATED MODULE: ../../dist/packages/core/runtime/utils/isObject.esm.js
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var val, ltrClassname, rtlClassname;
    //# sourceMappingURL=isObject.esm.js.map
    return [cssClassesMap, cssRulesByBucket];
  }
  //# sourceMappingURL=resolveStyleRules.esm.js.map
  // CONCATENATED MODULE: ../../dist/packages/core/mergeClasses.esm.js
  const mergeClassesCachedResults = {},
    SEQUENCE_SIZE = '___'.length + 7;
  // CONCATENATED MODULE: ./dist/bundle-size/makeStylesRuntime.fixture.js
  console.log(
    // CONCATENATED MODULE: ../../dist/packages/core/makeStyles.esm.js
    function (stylesBySlots) {
      const insertionCache = {};
      let classesMapBySlot = null,
        cssRules = null,
        ltrClassNamesForSlots = null,
        rtlClassNamesForSlots = null;
      return function (options) {
        const { dir: dir, renderer: renderer } = options;
        null === classesMapBySlot &&
          ([classesMapBySlot, cssRules] = // CONCATENATED MODULE: ../../dist/packages/core/resolveStyleRulesForSlots.esm.js
            /**
             * Calls resolveStyleRules() for each slot, is also used by build time transform.
             *
             * @param stylesBySlots - An object with makeStyles rules where a key is a slot name
             *
             * @return - A tuple with an object classnames mapping where a key is a slot name and an array with CSS rules
             */
            (function (stylesBySlots) {
              const classesMapBySlot = {},
                cssRules = {};
              // eslint-disable-next-line guard-for-in
              for (const slotName in stylesBySlots) {
                const slotStyles = stylesBySlots[slotName],
                  [cssClassMap, cssRulesByBucket] = resolveStyleRules(slotStyles);
                (classesMapBySlot[slotName] = cssClassMap),
                  Object.keys(cssRulesByBucket).forEach(styleBucketName => {
                    cssRules[styleBucketName] = (cssRules[styleBucketName] || []).concat(
                      cssRulesByBucket[styleBucketName],
                    );
                  });
              }
              return [classesMapBySlot, cssRules];
            })(
              //# sourceMappingURL=resolveStyleRulesForSlots.esm.js.map
              stylesBySlots,
            ));
        const isLTR = 'ltr' === dir,
          rendererId = isLTR ? renderer.id : renderer.id + 'r';
        // As RTL classes are different they should have a different cache key for insertion
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
    //# sourceMappingURL=makeStyles.esm.js.map
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
