(() => {
  var Rm = Object.create;
  var yo = Object.defineProperty,
    Nm = Object.defineProperties,
    Tm = Object.getOwnPropertyDescriptor,
    Bm = Object.getOwnPropertyDescriptors,
    _m = Object.getOwnPropertyNames,
    ho = Object.getOwnPropertySymbols,
    Im = Object.getPrototypeOf,
    sl = Object.prototype.hasOwnProperty,
    Ia = Object.prototype.propertyIsEnumerable;
  var _a = (e, t, r) => (t in e ? yo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : (e[t] = r)),
    E = (e, t) => {
      for (var r in t || (t = {})) sl.call(t, r) && _a(e, r, t[r]);
      if (ho) for (var r of ho(t)) Ia.call(t, r) && _a(e, r, t[r]);
      return e;
    },
    M = (e, t) => Nm(e, Bm(t));
  var Me = (e, t) => {
    var r = {};
    for (var n in e) sl.call(e, n) && t.indexOf(n) < 0 && (r[n] = e[n]);
    if (e != null && ho) for (var n of ho(e)) t.indexOf(n) < 0 && Ia.call(e, n) && (r[n] = e[n]);
    return r;
  };
  var Pt = (e, t) => () => t || e((t = { exports: {} }).exports, t), t.exports,
    ul = (e, t) => {
      for (var r in t) yo(e, r, { get: t[r], enumerable: !0 });
    },
    bm = (e, t, r, n) => {
      if ((t && typeof t == 'object') || typeof t == 'function')
        for (let o of _m(t))
          !sl.call(e, o) && o !== r && yo(e, o, { get: () => t[o], enumerable: !(n = Tm(t, o)) || n.enumerable });
      return e;
    };
  var q = (e, t, r) => (
    (r = e != null ? Rm(Im(e)) : {}),
    bm(t || !e || !e.__esModule ? yo(r, 'default', { value: e, enumerable: !0 }) : r, e)
  );
  var al = Pt((og, Oa) => {
    'use strict';
    var ba = Object.getOwnPropertySymbols,
      Om = Object.prototype.hasOwnProperty,
      Lm = Object.prototype.propertyIsEnumerable;
    function Mm(e) {
      if (e == null) throw new TypeError('Object.assign cannot be called with null or undefined');
      return Object(e);
    }
    function Dm() {
      try {
        if (!Object.assign) return !1;
        var e = new String('abc');
        if (((e[5] = 'de'), Object.getOwnPropertyNames(e)[0] === '5')) return !1;
        for (var t = {}, r = 0; r < 10; r++) t['_' + String.fromCharCode(r)] = r;
        var n = Object.getOwnPropertyNames(t).map(function (i) {
          return t[i];
        });
        if (n.join('') !== '0123456789') return !1;
        var o = {};
        return (
          'abcdefghijklmnopqrst'.split('').forEach(function (i) {
            o[i] = i;
          }),
          Object.keys(Object.assign({}, o)).join('') === 'abcdefghijklmnopqrst'
        );
      } catch {
        return !1;
      }
    }
    Oa.exports = Dm()
      ? Object.assign
      : function (e, t) {
          for (var r, n = Mm(e), o, i = 1; i < arguments.length; i++) {
            r = Object(arguments[i]);
            for (var l in r) Om.call(r, l) && (n[l] = r[l]);
            if (ba) {
              o = ba(r);
              for (var s = 0; s < o.length; s++) Lm.call(r, o[s]) && (n[o[s]] = r[o[s]]);
            }
          }
          return n;
        };
  });
  var Ka = Pt(I => {
    'use strict';
    var cl = al(),
      Yt = 60103,
      Da = 60106;
    I.Fragment = 60107;
    I.StrictMode = 60108;
    I.Profiler = 60114;
    var ja = 60109,
      za = 60110,
      $a = 60112;
    I.Suspense = 60113;
    var Aa = 60115,
      Fa = 60116;
    typeof Symbol == 'function' &&
      Symbol.for &&
      ((Se = Symbol.for),
      (Yt = Se('react.element')),
      (Da = Se('react.portal')),
      (I.Fragment = Se('react.fragment')),
      (I.StrictMode = Se('react.strict_mode')),
      (I.Profiler = Se('react.profiler')),
      (ja = Se('react.provider')),
      (za = Se('react.context')),
      ($a = Se('react.forward_ref')),
      (I.Suspense = Se('react.suspense')),
      (Aa = Se('react.memo')),
      (Fa = Se('react.lazy')));
    var Se,
      La = typeof Symbol == 'function' && Symbol.iterator;
    function jm(e) {
      return e === null || typeof e != 'object'
        ? null
        : ((e = (La && e[La]) || e['@@iterator']), typeof e == 'function' ? e : null);
    }
    function Qr(e) {
      for (var t = 'https://reactjs.org/docs/error-decoder.html?invariant=' + e, r = 1; r < arguments.length; r++)
        t += '&args[]=' + encodeURIComponent(arguments[r]);
      return (
        'Minified React error #' +
        e +
        '; visit ' +
        t +
        ' for the full message or use the non-minified dev environment for full errors and additional helpful warnings.'
      );
    }
    var Ua = {
        isMounted: function () {
          return !1;
        },
        enqueueForceUpdate: function () {},
        enqueueReplaceState: function () {},
        enqueueSetState: function () {},
      },
      Wa = {};
    function Kt(e, t, r) {
      (this.props = e), (this.context = t), (this.refs = Wa), (this.updater = r || Ua);
    }
    Kt.prototype.isReactComponent = {};
    Kt.prototype.setState = function (e, t) {
      if (typeof e != 'object' && typeof e != 'function' && e != null) throw Error(Qr(85));
      this.updater.enqueueSetState(this, e, t, 'setState');
    };
    Kt.prototype.forceUpdate = function (e) {
      this.updater.enqueueForceUpdate(this, e, 'forceUpdate');
    };
    function Ha() {}
    Ha.prototype = Kt.prototype;
    function dl(e, t, r) {
      (this.props = e), (this.context = t), (this.refs = Wa), (this.updater = r || Ua);
    }
    var pl = (dl.prototype = new Ha());
    pl.constructor = dl;
    cl(pl, Kt.prototype);
    pl.isPureReactComponent = !0;
    var ml = { current: null },
      Va = Object.prototype.hasOwnProperty,
      Ga = { key: !0, ref: !0, __self: !0, __source: !0 };
    function Qa(e, t, r) {
      var n,
        o = {},
        i = null,
        l = null;
      if (t != null)
        for (n in (t.ref !== void 0 && (l = t.ref), t.key !== void 0 && (i = '' + t.key), t))
          Va.call(t, n) && !Ga.hasOwnProperty(n) && (o[n] = t[n]);
      var s = arguments.length - 2;
      if (s === 1) o.children = r;
      else if (1 < s) {
        for (var u = Array(s), a = 0; a < s; a++) u[a] = arguments[a + 2];
        o.children = u;
      }
      if (e && e.defaultProps) for (n in ((s = e.defaultProps), s)) o[n] === void 0 && (o[n] = s[n]);
      return { $$typeof: Yt, type: e, key: i, ref: l, props: o, _owner: ml.current };
    }
    function zm(e, t) {
      return { $$typeof: Yt, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner };
    }
    function hl(e) {
      return typeof e == 'object' && e !== null && e.$$typeof === Yt;
    }
    function $m(e) {
      var t = { '=': '=0', ':': '=2' };
      return (
        '$' +
        e.replace(/[=:]/g, function (r) {
          return t[r];
        })
      );
    }
    var Ma = /\/+/g;
    function fl(e, t) {
      return typeof e == 'object' && e !== null && e.key != null ? $m('' + e.key) : t.toString(36);
    }
    function So(e, t, r, n, o) {
      var i = typeof e;
      (i === 'undefined' || i === 'boolean') && (e = null);
      var l = !1;
      if (e === null) l = !0;
      else
        switch (i) {
          case 'string':
          case 'number':
            l = !0;
            break;
          case 'object':
            switch (e.$$typeof) {
              case Yt:
              case Da:
                l = !0;
            }
        }
      if (l)
        return (
          (l = e),
          (o = o(l)),
          (e = n === '' ? '.' + fl(l, 0) : n),
          Array.isArray(o)
            ? ((r = ''),
              e != null && (r = e.replace(Ma, '$&/') + '/'),
              So(o, t, r, '', function (a) {
                return a;
              }))
            : o != null &&
              (hl(o) &&
                (o = zm(o, r + (!o.key || (l && l.key === o.key) ? '' : ('' + o.key).replace(Ma, '$&/') + '/') + e)),
              t.push(o)),
          1
        );
      if (((l = 0), (n = n === '' ? '.' : n + ':'), Array.isArray(e)))
        for (var s = 0; s < e.length; s++) {
          i = e[s];
          var u = n + fl(i, s);
          l += So(i, t, r, u, o);
        }
      else if (((u = jm(e)), typeof u == 'function'))
        for (e = u.call(e), s = 0; !(i = e.next()).done; )
          (i = i.value), (u = n + fl(i, s++)), (l += So(i, t, r, u, o));
      else if (i === 'object')
        throw (
          ((t = '' + e),
          Error(Qr(31, t === '[object Object]' ? 'object with keys {' + Object.keys(e).join(', ') + '}' : t)))
        );
      return l;
    }
    function go(e, t, r) {
      if (e == null) return e;
      var n = [],
        o = 0;
      return (
        So(e, n, '', '', function (i) {
          return t.call(r, i, o++);
        }),
        n
      );
    }
    function Am(e) {
      if (e._status === -1) {
        var t = e._result;
        (t = t()),
          (e._status = 0),
          (e._result = t),
          t.then(
            function (r) {
              e._status === 0 && ((r = r.default), (e._status = 1), (e._result = r));
            },
            function (r) {
              e._status === 0 && ((e._status = 2), (e._result = r));
            },
          );
      }
      if (e._status === 1) return e._result;
      throw e._result;
    }
    var Ya = { current: null };
    function Ge() {
      var e = Ya.current;
      if (e === null) throw Error(Qr(321));
      return e;
    }
    var Fm = {
      ReactCurrentDispatcher: Ya,
      ReactCurrentBatchConfig: { transition: 0 },
      ReactCurrentOwner: ml,
      IsSomeRendererActing: { current: !1 },
      assign: cl,
    };
    I.Children = {
      map: go,
      forEach: function (e, t, r) {
        go(
          e,
          function () {
            t.apply(this, arguments);
          },
          r,
        );
      },
      count: function (e) {
        var t = 0;
        return (
          go(e, function () {
            t++;
          }),
          t
        );
      },
      toArray: function (e) {
        return (
          go(e, function (t) {
            return t;
          }) || []
        );
      },
      only: function (e) {
        if (!hl(e)) throw Error(Qr(143));
        return e;
      },
    };
    I.Component = Kt;
    I.PureComponent = dl;
    I.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Fm;
    I.cloneElement = function (e, t, r) {
      if (e == null) throw Error(Qr(267, e));
      var n = cl({}, e.props),
        o = e.key,
        i = e.ref,
        l = e._owner;
      if (t != null) {
        if (
          (t.ref !== void 0 && ((i = t.ref), (l = ml.current)),
          t.key !== void 0 && (o = '' + t.key),
          e.type && e.type.defaultProps)
        )
          var s = e.type.defaultProps;
        for (u in t) Va.call(t, u) && !Ga.hasOwnProperty(u) && (n[u] = t[u] === void 0 && s !== void 0 ? s[u] : t[u]);
      }
      var u = arguments.length - 2;
      if (u === 1) n.children = r;
      else if (1 < u) {
        s = Array(u);
        for (var a = 0; a < u; a++) s[a] = arguments[a + 2];
        n.children = s;
      }
      return { $$typeof: Yt, type: e.type, key: o, ref: i, props: n, _owner: l };
    };
    I.createContext = function (e, t) {
      return (
        t === void 0 && (t = null),
        (e = {
          $$typeof: za,
          _calculateChangedBits: t,
          _currentValue: e,
          _currentValue2: e,
          _threadCount: 0,
          Provider: null,
          Consumer: null,
        }),
        (e.Provider = { $$typeof: ja, _context: e }),
        (e.Consumer = e)
      );
    };
    I.createElement = Qa;
    I.createFactory = function (e) {
      var t = Qa.bind(null, e);
      return (t.type = e), t;
    };
    I.createRef = function () {
      return { current: null };
    };
    I.forwardRef = function (e) {
      return { $$typeof: $a, render: e };
    };
    I.isValidElement = hl;
    I.lazy = function (e) {
      return { $$typeof: Fa, _payload: { _status: -1, _result: e }, _init: Am };
    };
    I.memo = function (e, t) {
      return { $$typeof: Aa, type: e, compare: t === void 0 ? null : t };
    };
    I.useCallback = function (e, t) {
      return Ge().useCallback(e, t);
    };
    I.useContext = function (e, t) {
      return Ge().useContext(e, t);
    };
    I.useDebugValue = function () {};
    I.useEffect = function (e, t) {
      return Ge().useEffect(e, t);
    };
    I.useImperativeHandle = function (e, t, r) {
      return Ge().useImperativeHandle(e, t, r);
    };
    I.useLayoutEffect = function (e, t) {
      return Ge().useLayoutEffect(e, t);
    };
    I.useMemo = function (e, t) {
      return Ge().useMemo(e, t);
    };
    I.useReducer = function (e, t, r) {
      return Ge().useReducer(e, t, r);
    };
    I.useRef = function (e) {
      return Ge().useRef(e);
    };
    I.useState = function (e) {
      return Ge().useState(e);
    };
    I.version = '17.0.2';
  });
  var Q = Pt((lg, Xa) => {
    'use strict';
    Xa.exports = Ka();
  });
  var rf = Pt(L => {
    'use strict';
    var qt, Xr, Co, Cl;
    typeof performance == 'object' && typeof performance.now == 'function'
      ? ((qa = performance),
        (L.unstable_now = function () {
          return qa.now();
        }))
      : ((yl = Date),
        (Za = yl.now()),
        (L.unstable_now = function () {
          return yl.now() - Za;
        }));
    var qa, yl, Za;
    typeof window > 'u' || typeof MessageChannel != 'function'
      ? ((Xt = null),
        (gl = null),
        (Sl = function () {
          if (Xt !== null)
            try {
              var e = L.unstable_now();
              Xt(!0, e), (Xt = null);
            } catch (t) {
              throw (setTimeout(Sl, 0), t);
            }
        }),
        (qt = function (e) {
          Xt !== null ? setTimeout(qt, 0, e) : ((Xt = e), setTimeout(Sl, 0));
        }),
        (Xr = function (e, t) {
          gl = setTimeout(e, t);
        }),
        (Co = function () {
          clearTimeout(gl);
        }),
        (L.unstable_shouldYield = function () {
          return !1;
        }),
        (Cl = L.unstable_forceFrameRate = function () {}))
      : ((Ja = window.setTimeout),
        (ef = window.clearTimeout),
        typeof console < 'u' &&
          ((tf = window.cancelAnimationFrame),
          typeof window.requestAnimationFrame != 'function' &&
            console.error(
              "This browser doesn't support requestAnimationFrame. Make sure that you load a polyfill in older browsers. https://reactjs.org/link/react-polyfills",
            ),
          typeof tf != 'function' &&
            console.error(
              "This browser doesn't support cancelAnimationFrame. Make sure that you load a polyfill in older browsers. https://reactjs.org/link/react-polyfills",
            )),
        (Yr = !1),
        (Kr = null),
        (vo = -1),
        (vl = 5),
        (xl = 0),
        (L.unstable_shouldYield = function () {
          return L.unstable_now() >= xl;
        }),
        (Cl = function () {}),
        (L.unstable_forceFrameRate = function (e) {
          0 > e || 125 < e
            ? console.error(
                'forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported',
              )
            : (vl = 0 < e ? Math.floor(1e3 / e) : 5);
        }),
        (wl = new MessageChannel()),
        (xo = wl.port2),
        (wl.port1.onmessage = function () {
          if (Kr !== null) {
            var e = L.unstable_now();
            xl = e + vl;
            try {
              Kr(!0, e) ? xo.postMessage(null) : ((Yr = !1), (Kr = null));
            } catch (t) {
              throw (xo.postMessage(null), t);
            }
          } else Yr = !1;
        }),
        (qt = function (e) {
          (Kr = e), Yr || ((Yr = !0), xo.postMessage(null));
        }),
        (Xr = function (e, t) {
          vo = Ja(function () {
            e(L.unstable_now());
          }, t);
        }),
        (Co = function () {
          ef(vo), (vo = -1);
        }));
    var Xt, gl, Sl, Ja, ef, tf, Yr, Kr, vo, vl, xl, wl, xo;
    function kl(e, t) {
      var r = e.length;
      e.push(t);
      e: for (;;) {
        var n = (r - 1) >>> 1,
          o = e[n];
        if (o !== void 0 && 0 < wo(o, t)) (e[n] = t), (e[r] = o), (r = n);
        else break e;
      }
    }
    function Te(e) {
      return (e = e[0]), e === void 0 ? null : e;
    }
    function ko(e) {
      var t = e[0];
      if (t !== void 0) {
        var r = e.pop();
        if (r !== t) {
          e[0] = r;
          e: for (var n = 0, o = e.length; n < o; ) {
            var i = 2 * (n + 1) - 1,
              l = e[i],
              s = i + 1,
              u = e[s];
            if (l !== void 0 && 0 > wo(l, r))
              u !== void 0 && 0 > wo(u, l) ? ((e[n] = u), (e[s] = r), (n = s)) : ((e[n] = l), (e[i] = r), (n = i));
            else if (u !== void 0 && 0 > wo(u, r)) (e[n] = u), (e[s] = r), (n = s);
            else break e;
          }
        }
        return t;
      }
      return null;
    }
    function wo(e, t) {
      var r = e.sortIndex - t.sortIndex;
      return r !== 0 ? r : e.id - t.id;
    }
    var De = [],
      tt = [],
      Um = 1,
      ve = null,
      re = 3,
      Eo = !1,
      Rt = !1,
      qr = !1;
    function El(e) {
      for (var t = Te(tt); t !== null; ) {
        if (t.callback === null) ko(tt);
        else if (t.startTime <= e) ko(tt), (t.sortIndex = t.expirationTime), kl(De, t);
        else break;
        t = Te(tt);
      }
    }
    function Pl(e) {
      if (((qr = !1), El(e), !Rt))
        if (Te(De) !== null) (Rt = !0), qt(Rl);
        else {
          var t = Te(tt);
          t !== null && Xr(Pl, t.startTime - e);
        }
    }
    function Rl(e, t) {
      (Rt = !1), qr && ((qr = !1), Co()), (Eo = !0);
      var r = re;
      try {
        for (El(t), ve = Te(De); ve !== null && (!(ve.expirationTime > t) || (e && !L.unstable_shouldYield())); ) {
          var n = ve.callback;
          if (typeof n == 'function') {
            (ve.callback = null), (re = ve.priorityLevel);
            var o = n(ve.expirationTime <= t);
            (t = L.unstable_now()), typeof o == 'function' ? (ve.callback = o) : ve === Te(De) && ko(De), El(t);
          } else ko(De);
          ve = Te(De);
        }
        if (ve !== null) var i = !0;
        else {
          var l = Te(tt);
          l !== null && Xr(Pl, l.startTime - t), (i = !1);
        }
        return i;
      } finally {
        (ve = null), (re = r), (Eo = !1);
      }
    }
    var Wm = Cl;
    L.unstable_IdlePriority = 5;
    L.unstable_ImmediatePriority = 1;
    L.unstable_LowPriority = 4;
    L.unstable_NormalPriority = 3;
    L.unstable_Profiling = null;
    L.unstable_UserBlockingPriority = 2;
    L.unstable_cancelCallback = function (e) {
      e.callback = null;
    };
    L.unstable_continueExecution = function () {
      Rt || Eo || ((Rt = !0), qt(Rl));
    };
    L.unstable_getCurrentPriorityLevel = function () {
      return re;
    };
    L.unstable_getFirstCallbackNode = function () {
      return Te(De);
    };
    L.unstable_next = function (e) {
      switch (re) {
        case 1:
        case 2:
        case 3:
          var t = 3;
          break;
        default:
          t = re;
      }
      var r = re;
      re = t;
      try {
        return e();
      } finally {
        re = r;
      }
    };
    L.unstable_pauseExecution = function () {};
    L.unstable_requestPaint = Wm;
    L.unstable_runWithPriority = function (e, t) {
      switch (e) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          e = 3;
      }
      var r = re;
      re = e;
      try {
        return t();
      } finally {
        re = r;
      }
    };
    L.unstable_scheduleCallback = function (e, t, r) {
      var n = L.unstable_now();
      switch (
        (typeof r == 'object' && r !== null
          ? ((r = r.delay), (r = typeof r == 'number' && 0 < r ? n + r : n))
          : (r = n),
        e)
      ) {
        case 1:
          var o = -1;
          break;
        case 2:
          o = 250;
          break;
        case 5:
          o = 1073741823;
          break;
        case 4:
          o = 1e4;
          break;
        default:
          o = 5e3;
      }
      return (
        (o = r + o),
        (e = { id: Um++, callback: t, priorityLevel: e, startTime: r, expirationTime: o, sortIndex: -1 }),
        r > n
          ? ((e.sortIndex = r), kl(tt, e), Te(De) === null && e === Te(tt) && (qr ? Co() : (qr = !0), Xr(Pl, r - n)))
          : ((e.sortIndex = o), kl(De, e), Rt || Eo || ((Rt = !0), qt(Rl))),
        e
      );
    };
    L.unstable_wrapCallback = function (e) {
      var t = re;
      return function () {
        var r = re;
        re = t;
        try {
          return e.apply(this, arguments);
        } finally {
          re = r;
        }
      };
    };
  });
  var of = Pt((ug, nf) => {
    'use strict';
    nf.exports = rf();
  });
  var Vd = Pt(Pe => {
    'use strict';
    var gi = Q(),
      $ = al(),
      Y = of();
    function v(e) {
      for (var t = 'https://reactjs.org/docs/error-decoder.html?invariant=' + e, r = 1; r < arguments.length; r++)
        t += '&args[]=' + encodeURIComponent(arguments[r]);
      return (
        'Minified React error #' +
        e +
        '; visit ' +
        t +
        ' for the full message or use the non-minified dev environment for full errors and additional helpful warnings.'
      );
    }
    if (!gi) throw Error(v(227));
    var Sc = new Set(),
      Tn = {};
    function jt(e, t) {
      Sr(e, t), Sr(e + 'Capture', t);
    }
    function Sr(e, t) {
      for (Tn[e] = t, e = 0; e < t.length; e++) Sc.add(t[e]);
    }
    var Ze = !(typeof window > 'u' || typeof window.document > 'u' || typeof window.document.createElement > 'u'),
      Hm =
        /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
      lf = Object.prototype.hasOwnProperty,
      sf = {},
      uf = {};
    function Vm(e) {
      return lf.call(uf, e) ? !0 : lf.call(sf, e) ? !1 : Hm.test(e) ? (uf[e] = !0) : ((sf[e] = !0), !1);
    }
    function Gm(e, t, r, n) {
      if (r !== null && r.type === 0) return !1;
      switch (typeof t) {
        case 'function':
        case 'symbol':
          return !0;
        case 'boolean':
          return n
            ? !1
            : r !== null
            ? !r.acceptsBooleans
            : ((e = e.toLowerCase().slice(0, 5)), e !== 'data-' && e !== 'aria-');
        default:
          return !1;
      }
    }
    function Qm(e, t, r, n) {
      if (t === null || typeof t > 'u' || Gm(e, t, r, n)) return !0;
      if (n) return !1;
      if (r !== null)
        switch (r.type) {
          case 3:
            return !t;
          case 4:
            return t === !1;
          case 5:
            return isNaN(t);
          case 6:
            return isNaN(t) || 1 > t;
        }
      return !1;
    }
    function ue(e, t, r, n, o, i, l) {
      (this.acceptsBooleans = t === 2 || t === 3 || t === 4),
        (this.attributeName = n),
        (this.attributeNamespace = o),
        (this.mustUseProperty = r),
        (this.propertyName = e),
        (this.type = t),
        (this.sanitizeURL = i),
        (this.removeEmptyString = l);
    }
    var ee = {};
    'children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style'
      .split(' ')
      .forEach(function (e) {
        ee[e] = new ue(e, 0, !1, e, null, !1, !1);
      });
    [
      ['acceptCharset', 'accept-charset'],
      ['className', 'class'],
      ['htmlFor', 'for'],
      ['httpEquiv', 'http-equiv'],
    ].forEach(function (e) {
      var t = e[0];
      ee[t] = new ue(t, 1, !1, e[1], null, !1, !1);
    });
    ['contentEditable', 'draggable', 'spellCheck', 'value'].forEach(function (e) {
      ee[e] = new ue(e, 2, !1, e.toLowerCase(), null, !1, !1);
    });
    ['autoReverse', 'externalResourcesRequired', 'focusable', 'preserveAlpha'].forEach(function (e) {
      ee[e] = new ue(e, 2, !1, e, null, !1, !1);
    });
    'allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope'
      .split(' ')
      .forEach(function (e) {
        ee[e] = new ue(e, 3, !1, e.toLowerCase(), null, !1, !1);
      });
    ['checked', 'multiple', 'muted', 'selected'].forEach(function (e) {
      ee[e] = new ue(e, 3, !0, e, null, !1, !1);
    });
    ['capture', 'download'].forEach(function (e) {
      ee[e] = new ue(e, 4, !1, e, null, !1, !1);
    });
    ['cols', 'rows', 'size', 'span'].forEach(function (e) {
      ee[e] = new ue(e, 6, !1, e, null, !1, !1);
    });
    ['rowSpan', 'start'].forEach(function (e) {
      ee[e] = new ue(e, 5, !1, e.toLowerCase(), null, !1, !1);
    });
    var Ms = /[\-:]([a-z])/g;
    function Ds(e) {
      return e[1].toUpperCase();
    }
    'accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height'
      .split(' ')
      .forEach(function (e) {
        var t = e.replace(Ms, Ds);
        ee[t] = new ue(t, 1, !1, e, null, !1, !1);
      });
    'xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type'.split(' ').forEach(function (e) {
      var t = e.replace(Ms, Ds);
      ee[t] = new ue(t, 1, !1, e, 'http://www.w3.org/1999/xlink', !1, !1);
    });
    ['xml:base', 'xml:lang', 'xml:space'].forEach(function (e) {
      var t = e.replace(Ms, Ds);
      ee[t] = new ue(t, 1, !1, e, 'http://www.w3.org/XML/1998/namespace', !1, !1);
    });
    ['tabIndex', 'crossOrigin'].forEach(function (e) {
      ee[e] = new ue(e, 1, !1, e.toLowerCase(), null, !1, !1);
    });
    ee.xlinkHref = new ue('xlinkHref', 1, !1, 'xlink:href', 'http://www.w3.org/1999/xlink', !0, !1);
    ['src', 'href', 'action', 'formAction'].forEach(function (e) {
      ee[e] = new ue(e, 1, !1, e.toLowerCase(), null, !0, !0);
    });
    function js(e, t, r, n) {
      var o = ee.hasOwnProperty(t) ? ee[t] : null,
        i =
          o !== null
            ? o.type === 0
            : n
            ? !1
            : !(!(2 < t.length) || (t[0] !== 'o' && t[0] !== 'O') || (t[1] !== 'n' && t[1] !== 'N'));
      i ||
        (Qm(t, r, o, n) && (r = null),
        n || o === null
          ? Vm(t) && (r === null ? e.removeAttribute(t) : e.setAttribute(t, '' + r))
          : o.mustUseProperty
          ? (e[o.propertyName] = r === null ? (o.type === 3 ? !1 : '') : r)
          : ((t = o.attributeName),
            (n = o.attributeNamespace),
            r === null
              ? e.removeAttribute(t)
              : ((o = o.type),
                (r = o === 3 || (o === 4 && r === !0) ? '' : '' + r),
                n ? e.setAttributeNS(n, t, r) : e.setAttribute(t, r))));
    }
    var zt = gi.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
      cn = 60103,
      Tt = 60106,
      nt = 60107,
      zs = 60108,
      yn = 60114,
      $s = 60109,
      As = 60110,
      Si = 60112,
      gn = 60113,
      Yo = 60120,
      vi = 60115,
      Fs = 60116,
      Us = 60121,
      Ws = 60128,
      vc = 60129,
      Hs = 60130,
      Kl = 60131;
    typeof Symbol == 'function' &&
      Symbol.for &&
      ((V = Symbol.for),
      (cn = V('react.element')),
      (Tt = V('react.portal')),
      (nt = V('react.fragment')),
      (zs = V('react.strict_mode')),
      (yn = V('react.profiler')),
      ($s = V('react.provider')),
      (As = V('react.context')),
      (Si = V('react.forward_ref')),
      (gn = V('react.suspense')),
      (Yo = V('react.suspense_list')),
      (vi = V('react.memo')),
      (Fs = V('react.lazy')),
      (Us = V('react.block')),
      V('react.scope'),
      (Ws = V('react.opaque.id')),
      (vc = V('react.debug_trace_mode')),
      (Hs = V('react.offscreen')),
      (Kl = V('react.legacy_hidden')));
    var V,
      af = typeof Symbol == 'function' && Symbol.iterator;
    function Zr(e) {
      return e === null || typeof e != 'object'
        ? null
        : ((e = (af && e[af]) || e['@@iterator']), typeof e == 'function' ? e : null);
    }
    var Nl;
    function dn(e) {
      if (Nl === void 0)
        try {
          throw Error();
        } catch (r) {
          var t = r.stack.trim().match(/\n( *(at )?)/);
          Nl = (t && t[1]) || '';
        }
      return (
        `
` +
        Nl +
        e
      );
    }
    var Tl = !1;
    function Po(e, t) {
      if (!e || Tl) return '';
      Tl = !0;
      var r = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      try {
        if (t)
          if (
            ((t = function () {
              throw Error();
            }),
            Object.defineProperty(t.prototype, 'props', {
              set: function () {
                throw Error();
              },
            }),
            typeof Reflect == 'object' && Reflect.construct)
          ) {
            try {
              Reflect.construct(t, []);
            } catch (u) {
              var n = u;
            }
            Reflect.construct(e, [], t);
          } else {
            try {
              t.call();
            } catch (u) {
              n = u;
            }
            e.call(t.prototype);
          }
        else {
          try {
            throw Error();
          } catch (u) {
            n = u;
          }
          e();
        }
      } catch (u) {
        if (u && n && typeof u.stack == 'string') {
          for (
            var o = u.stack.split(`
`),
              i = n.stack.split(`
`),
              l = o.length - 1,
              s = i.length - 1;
            1 <= l && 0 <= s && o[l] !== i[s];

          )
            s--;
          for (; 1 <= l && 0 <= s; l--, s--)
            if (o[l] !== i[s]) {
              if (l !== 1 || s !== 1)
                do
                  if ((l--, s--, 0 > s || o[l] !== i[s]))
                    return (
                      `
` + o[l].replace(' at new ', ' at ')
                    );
                while (1 <= l && 0 <= s);
              break;
            }
        }
      } finally {
        (Tl = !1), (Error.prepareStackTrace = r);
      }
      return (e = e ? e.displayName || e.name : '') ? dn(e) : '';
    }
    function Ym(e) {
      switch (e.tag) {
        case 5:
          return dn(e.type);
        case 16:
          return dn('Lazy');
        case 13:
          return dn('Suspense');
        case 19:
          return dn('SuspenseList');
        case 0:
        case 2:
        case 15:
          return (e = Po(e.type, !1)), e;
        case 11:
          return (e = Po(e.type.render, !1)), e;
        case 22:
          return (e = Po(e.type._render, !1)), e;
        case 1:
          return (e = Po(e.type, !0)), e;
        default:
          return '';
      }
    }
    function ur(e) {
      if (e == null) return null;
      if (typeof e == 'function') return e.displayName || e.name || null;
      if (typeof e == 'string') return e;
      switch (e) {
        case nt:
          return 'Fragment';
        case Tt:
          return 'Portal';
        case yn:
          return 'Profiler';
        case zs:
          return 'StrictMode';
        case gn:
          return 'Suspense';
        case Yo:
          return 'SuspenseList';
      }
      if (typeof e == 'object')
        switch (e.$$typeof) {
          case As:
            return (e.displayName || 'Context') + '.Consumer';
          case $s:
            return (e._context.displayName || 'Context') + '.Provider';
          case Si:
            var t = e.render;
            return (
              (t = t.displayName || t.name || ''), e.displayName || (t !== '' ? 'ForwardRef(' + t + ')' : 'ForwardRef')
            );
          case vi:
            return ur(e.type);
          case Us:
            return ur(e._render);
          case Fs:
            (t = e._payload), (e = e._init);
            try {
              return ur(e(t));
            } catch {}
        }
      return null;
    }
    function ht(e) {
      switch (typeof e) {
        case 'boolean':
        case 'number':
        case 'object':
        case 'string':
        case 'undefined':
          return e;
        default:
          return '';
      }
    }
    function xc(e) {
      var t = e.type;
      return (e = e.nodeName) && e.toLowerCase() === 'input' && (t === 'checkbox' || t === 'radio');
    }
    function Km(e) {
      var t = xc(e) ? 'checked' : 'value',
        r = Object.getOwnPropertyDescriptor(e.constructor.prototype, t),
        n = '' + e[t];
      if (!e.hasOwnProperty(t) && typeof r < 'u' && typeof r.get == 'function' && typeof r.set == 'function') {
        var o = r.get,
          i = r.set;
        return (
          Object.defineProperty(e, t, {
            configurable: !0,
            get: function () {
              return o.call(this);
            },
            set: function (l) {
              (n = '' + l), i.call(this, l);
            },
          }),
          Object.defineProperty(e, t, { enumerable: r.enumerable }),
          {
            getValue: function () {
              return n;
            },
            setValue: function (l) {
              n = '' + l;
            },
            stopTracking: function () {
              (e._valueTracker = null), delete e[t];
            },
          }
        );
      }
    }
    function Ro(e) {
      e._valueTracker || (e._valueTracker = Km(e));
    }
    function wc(e) {
      if (!e) return !1;
      var t = e._valueTracker;
      if (!t) return !0;
      var r = t.getValue(),
        n = '';
      return e && (n = xc(e) ? (e.checked ? 'true' : 'false') : e.value), (e = n), e !== r ? (t.setValue(e), !0) : !1;
    }
    function Ko(e) {
      if (((e = e || (typeof document < 'u' ? document : void 0)), typeof e > 'u')) return null;
      try {
        return e.activeElement || e.body;
      } catch {
        return e.body;
      }
    }
    function Xl(e, t) {
      var r = t.checked;
      return $({}, t, {
        defaultChecked: void 0,
        defaultValue: void 0,
        value: void 0,
        checked: r ?? e._wrapperState.initialChecked,
      });
    }
    function ff(e, t) {
      var r = t.defaultValue == null ? '' : t.defaultValue,
        n = t.checked != null ? t.checked : t.defaultChecked;
      (r = ht(t.value != null ? t.value : r)),
        (e._wrapperState = {
          initialChecked: n,
          initialValue: r,
          controlled: t.type === 'checkbox' || t.type === 'radio' ? t.checked != null : t.value != null,
        });
    }
    function Cc(e, t) {
      (t = t.checked), t != null && js(e, 'checked', t, !1);
    }
    function ql(e, t) {
      Cc(e, t);
      var r = ht(t.value),
        n = t.type;
      if (r != null)
        n === 'number'
          ? ((r === 0 && e.value === '') || e.value != r) && (e.value = '' + r)
          : e.value !== '' + r && (e.value = '' + r);
      else if (n === 'submit' || n === 'reset') {
        e.removeAttribute('value');
        return;
      }
      t.hasOwnProperty('value')
        ? Zl(e, t.type, r)
        : t.hasOwnProperty('defaultValue') && Zl(e, t.type, ht(t.defaultValue)),
        t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked);
    }
    function cf(e, t, r) {
      if (t.hasOwnProperty('value') || t.hasOwnProperty('defaultValue')) {
        var n = t.type;
        if (!((n !== 'submit' && n !== 'reset') || (t.value !== void 0 && t.value !== null))) return;
        (t = '' + e._wrapperState.initialValue), r || t === e.value || (e.value = t), (e.defaultValue = t);
      }
      (r = e.name),
        r !== '' && (e.name = ''),
        (e.defaultChecked = !!e._wrapperState.initialChecked),
        r !== '' && (e.name = r);
    }
    function Zl(e, t, r) {
      (t !== 'number' || Ko(e.ownerDocument) !== e) &&
        (r == null
          ? (e.defaultValue = '' + e._wrapperState.initialValue)
          : e.defaultValue !== '' + r && (e.defaultValue = '' + r));
    }
    function Xm(e) {
      var t = '';
      return (
        gi.Children.forEach(e, function (r) {
          r != null && (t += r);
        }),
        t
      );
    }
    function Jl(e, t) {
      return (e = $({ children: void 0 }, t)), (t = Xm(t.children)) && (e.children = t), e;
    }
    function ar(e, t, r, n) {
      if (((e = e.options), t)) {
        t = {};
        for (var o = 0; o < r.length; o++) t['$' + r[o]] = !0;
        for (r = 0; r < e.length; r++)
          (o = t.hasOwnProperty('$' + e[r].value)),
            e[r].selected !== o && (e[r].selected = o),
            o && n && (e[r].defaultSelected = !0);
      } else {
        for (r = '' + ht(r), t = null, o = 0; o < e.length; o++) {
          if (e[o].value === r) {
            (e[o].selected = !0), n && (e[o].defaultSelected = !0);
            return;
          }
          t !== null || e[o].disabled || (t = e[o]);
        }
        t !== null && (t.selected = !0);
      }
    }
    function es(e, t) {
      if (t.dangerouslySetInnerHTML != null) throw Error(v(91));
      return $({}, t, { value: void 0, defaultValue: void 0, children: '' + e._wrapperState.initialValue });
    }
    function df(e, t) {
      var r = t.value;
      if (r == null) {
        if (((r = t.children), (t = t.defaultValue), r != null)) {
          if (t != null) throw Error(v(92));
          if (Array.isArray(r)) {
            if (!(1 >= r.length)) throw Error(v(93));
            r = r[0];
          }
          t = r;
        }
        t == null && (t = ''), (r = t);
      }
      e._wrapperState = { initialValue: ht(r) };
    }
    function kc(e, t) {
      var r = ht(t.value),
        n = ht(t.defaultValue);
      r != null &&
        ((r = '' + r),
        r !== e.value && (e.value = r),
        t.defaultValue == null && e.defaultValue !== r && (e.defaultValue = r)),
        n != null && (e.defaultValue = '' + n);
    }
    function pf(e) {
      var t = e.textContent;
      t === e._wrapperState.initialValue && t !== '' && t !== null && (e.value = t);
    }
    var ts = {
      html: 'http://www.w3.org/1999/xhtml',
      mathml: 'http://www.w3.org/1998/Math/MathML',
      svg: 'http://www.w3.org/2000/svg',
    };
    function Ec(e) {
      switch (e) {
        case 'svg':
          return 'http://www.w3.org/2000/svg';
        case 'math':
          return 'http://www.w3.org/1998/Math/MathML';
        default:
          return 'http://www.w3.org/1999/xhtml';
      }
    }
    function rs(e, t) {
      return e == null || e === 'http://www.w3.org/1999/xhtml'
        ? Ec(t)
        : e === 'http://www.w3.org/2000/svg' && t === 'foreignObject'
        ? 'http://www.w3.org/1999/xhtml'
        : e;
    }
    var No,
      Pc = (function (e) {
        return typeof MSApp < 'u' && MSApp.execUnsafeLocalFunction
          ? function (t, r, n, o) {
              MSApp.execUnsafeLocalFunction(function () {
                return e(t, r, n, o);
              });
            }
          : e;
      })(function (e, t) {
        if (e.namespaceURI !== ts.svg || 'innerHTML' in e) e.innerHTML = t;
        else {
          for (
            No = No || document.createElement('div'),
              No.innerHTML = '<svg>' + t.valueOf().toString() + '</svg>',
              t = No.firstChild;
            e.firstChild;

          )
            e.removeChild(e.firstChild);
          for (; t.firstChild; ) e.appendChild(t.firstChild);
        }
      });
    function Bn(e, t) {
      if (t) {
        var r = e.firstChild;
        if (r && r === e.lastChild && r.nodeType === 3) {
          r.nodeValue = t;
          return;
        }
      }
      e.textContent = t;
    }
    var Sn = {
        animationIterationCount: !0,
        borderImageOutset: !0,
        borderImageSlice: !0,
        borderImageWidth: !0,
        boxFlex: !0,
        boxFlexGroup: !0,
        boxOrdinalGroup: !0,
        columnCount: !0,
        columns: !0,
        flex: !0,
        flexGrow: !0,
        flexPositive: !0,
        flexShrink: !0,
        flexNegative: !0,
        flexOrder: !0,
        gridArea: !0,
        gridRow: !0,
        gridRowEnd: !0,
        gridRowSpan: !0,
        gridRowStart: !0,
        gridColumn: !0,
        gridColumnEnd: !0,
        gridColumnSpan: !0,
        gridColumnStart: !0,
        fontWeight: !0,
        lineClamp: !0,
        lineHeight: !0,
        opacity: !0,
        order: !0,
        orphans: !0,
        tabSize: !0,
        widows: !0,
        zIndex: !0,
        zoom: !0,
        fillOpacity: !0,
        floodOpacity: !0,
        stopOpacity: !0,
        strokeDasharray: !0,
        strokeDashoffset: !0,
        strokeMiterlimit: !0,
        strokeOpacity: !0,
        strokeWidth: !0,
      },
      qm = ['Webkit', 'ms', 'Moz', 'O'];
    Object.keys(Sn).forEach(function (e) {
      qm.forEach(function (t) {
        (t = t + e.charAt(0).toUpperCase() + e.substring(1)), (Sn[t] = Sn[e]);
      });
    });
    function Rc(e, t, r) {
      return t == null || typeof t == 'boolean' || t === ''
        ? ''
        : r || typeof t != 'number' || t === 0 || (Sn.hasOwnProperty(e) && Sn[e])
        ? ('' + t).trim()
        : t + 'px';
    }
    function Nc(e, t) {
      e = e.style;
      for (var r in t)
        if (t.hasOwnProperty(r)) {
          var n = r.indexOf('--') === 0,
            o = Rc(r, t[r], n);
          r === 'float' && (r = 'cssFloat'), n ? e.setProperty(r, o) : (e[r] = o);
        }
    }
    var Zm = $(
      { menuitem: !0 },
      {
        area: !0,
        base: !0,
        br: !0,
        col: !0,
        embed: !0,
        hr: !0,
        img: !0,
        input: !0,
        keygen: !0,
        link: !0,
        meta: !0,
        param: !0,
        source: !0,
        track: !0,
        wbr: !0,
      },
    );
    function ns(e, t) {
      if (t) {
        if (Zm[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(v(137, e));
        if (t.dangerouslySetInnerHTML != null) {
          if (t.children != null) throw Error(v(60));
          if (!(typeof t.dangerouslySetInnerHTML == 'object' && '__html' in t.dangerouslySetInnerHTML))
            throw Error(v(61));
        }
        if (t.style != null && typeof t.style != 'object') throw Error(v(62));
      }
    }
    function os(e, t) {
      if (e.indexOf('-') === -1) return typeof t.is == 'string';
      switch (e) {
        case 'annotation-xml':
        case 'color-profile':
        case 'font-face':
        case 'font-face-src':
        case 'font-face-uri':
        case 'font-face-format':
        case 'font-face-name':
        case 'missing-glyph':
          return !1;
        default:
          return !0;
      }
    }
    function Vs(e) {
      return (
        (e = e.target || e.srcElement || window),
        e.correspondingUseElement && (e = e.correspondingUseElement),
        e.nodeType === 3 ? e.parentNode : e
      );
    }
    var is = null,
      fr = null,
      cr = null;
    function mf(e) {
      if ((e = Wn(e))) {
        if (typeof is != 'function') throw Error(v(280));
        var t = e.stateNode;
        t && ((t = Pi(t)), is(e.stateNode, e.type, t));
      }
    }
    function Tc(e) {
      fr ? (cr ? cr.push(e) : (cr = [e])) : (fr = e);
    }
    function Bc() {
      if (fr) {
        var e = fr,
          t = cr;
        if (((cr = fr = null), mf(e), t)) for (e = 0; e < t.length; e++) mf(t[e]);
      }
    }
    function Gs(e, t) {
      return e(t);
    }
    function _c(e, t, r, n, o) {
      return e(t, r, n, o);
    }
    function Qs() {}
    var Ic = Gs,
      Bt = !1,
      Bl = !1;
    function Ys() {
      (fr !== null || cr !== null) && (Qs(), Bc());
    }
    function Jm(e, t, r) {
      if (Bl) return e(t, r);
      Bl = !0;
      try {
        return Ic(e, t, r);
      } finally {
        (Bl = !1), Ys();
      }
    }
    function _n(e, t) {
      var r = e.stateNode;
      if (r === null) return null;
      var n = Pi(r);
      if (n === null) return null;
      r = n[t];
      e: switch (t) {
        case 'onClick':
        case 'onClickCapture':
        case 'onDoubleClick':
        case 'onDoubleClickCapture':
        case 'onMouseDown':
        case 'onMouseDownCapture':
        case 'onMouseMove':
        case 'onMouseMoveCapture':
        case 'onMouseUp':
        case 'onMouseUpCapture':
        case 'onMouseEnter':
          (n = !n.disabled) ||
            ((e = e.type), (n = !(e === 'button' || e === 'input' || e === 'select' || e === 'textarea'))),
            (e = !n);
          break e;
        default:
          e = !1;
      }
      if (e) return null;
      if (r && typeof r != 'function') throw Error(v(231, t, typeof r));
      return r;
    }
    var ls = !1;
    if (Ze)
      try {
        (Zt = {}),
          Object.defineProperty(Zt, 'passive', {
            get: function () {
              ls = !0;
            },
          }),
          window.addEventListener('test', Zt, Zt),
          window.removeEventListener('test', Zt, Zt);
      } catch {
        ls = !1;
      }
    var Zt;
    function eh(e, t, r, n, o, i, l, s, u) {
      var a = Array.prototype.slice.call(arguments, 3);
      try {
        t.apply(r, a);
      } catch (y) {
        this.onError(y);
      }
    }
    var vn = !1,
      Xo = null,
      qo = !1,
      ss = null,
      th = {
        onError: function (e) {
          (vn = !0), (Xo = e);
        },
      };
    function rh(e, t, r, n, o, i, l, s, u) {
      (vn = !1), (Xo = null), eh.apply(th, arguments);
    }
    function nh(e, t, r, n, o, i, l, s, u) {
      if ((rh.apply(this, arguments), vn)) {
        if (vn) {
          var a = Xo;
          (vn = !1), (Xo = null);
        } else throw Error(v(198));
        qo || ((qo = !0), (ss = a));
      }
    }
    function $t(e) {
      var t = e,
        r = e;
      if (e.alternate) for (; t.return; ) t = t.return;
      else {
        e = t;
        do (t = e), (t.flags & 1026) !== 0 && (r = t.return), (e = t.return);
        while (e);
      }
      return t.tag === 3 ? r : null;
    }
    function bc(e) {
      if (e.tag === 13) {
        var t = e.memoizedState;
        if ((t === null && ((e = e.alternate), e !== null && (t = e.memoizedState)), t !== null)) return t.dehydrated;
      }
      return null;
    }
    function hf(e) {
      if ($t(e) !== e) throw Error(v(188));
    }
    function oh(e) {
      var t = e.alternate;
      if (!t) {
        if (((t = $t(e)), t === null)) throw Error(v(188));
        return t !== e ? null : e;
      }
      for (var r = e, n = t; ; ) {
        var o = r.return;
        if (o === null) break;
        var i = o.alternate;
        if (i === null) {
          if (((n = o.return), n !== null)) {
            r = n;
            continue;
          }
          break;
        }
        if (o.child === i.child) {
          for (i = o.child; i; ) {
            if (i === r) return hf(o), e;
            if (i === n) return hf(o), t;
            i = i.sibling;
          }
          throw Error(v(188));
        }
        if (r.return !== n.return) (r = o), (n = i);
        else {
          for (var l = !1, s = o.child; s; ) {
            if (s === r) {
              (l = !0), (r = o), (n = i);
              break;
            }
            if (s === n) {
              (l = !0), (n = o), (r = i);
              break;
            }
            s = s.sibling;
          }
          if (!l) {
            for (s = i.child; s; ) {
              if (s === r) {
                (l = !0), (r = i), (n = o);
                break;
              }
              if (s === n) {
                (l = !0), (n = i), (r = o);
                break;
              }
              s = s.sibling;
            }
            if (!l) throw Error(v(189));
          }
        }
        if (r.alternate !== n) throw Error(v(190));
      }
      if (r.tag !== 3) throw Error(v(188));
      return r.stateNode.current === r ? e : t;
    }
    function Oc(e) {
      if (((e = oh(e)), !e)) return null;
      for (var t = e; ; ) {
        if (t.tag === 5 || t.tag === 6) return t;
        if (t.child) (t.child.return = t), (t = t.child);
        else {
          if (t === e) break;
          for (; !t.sibling; ) {
            if (!t.return || t.return === e) return null;
            t = t.return;
          }
          (t.sibling.return = t.return), (t = t.sibling);
        }
      }
      return null;
    }
    function yf(e, t) {
      for (var r = e.alternate; t !== null; ) {
        if (t === e || t === r) return !0;
        t = t.return;
      }
      return !1;
    }
    var Lc,
      Ks,
      Mc,
      Dc,
      us = !1,
      je = [],
      st = null,
      ut = null,
      at = null,
      In = new Map(),
      bn = new Map(),
      Jr = [],
      gf =
        'mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit'.split(
          ' ',
        );
    function as(e, t, r, n, o) {
      return { blockedOn: e, domEventName: t, eventSystemFlags: r | 16, nativeEvent: o, targetContainers: [n] };
    }
    function Sf(e, t) {
      switch (e) {
        case 'focusin':
        case 'focusout':
          st = null;
          break;
        case 'dragenter':
        case 'dragleave':
          ut = null;
          break;
        case 'mouseover':
        case 'mouseout':
          at = null;
          break;
        case 'pointerover':
        case 'pointerout':
          In.delete(t.pointerId);
          break;
        case 'gotpointercapture':
        case 'lostpointercapture':
          bn.delete(t.pointerId);
      }
    }
    function en(e, t, r, n, o, i) {
      return e === null || e.nativeEvent !== i
        ? ((e = as(t, r, n, o, i)), t !== null && ((t = Wn(t)), t !== null && Ks(t)), e)
        : ((e.eventSystemFlags |= n), (t = e.targetContainers), o !== null && t.indexOf(o) === -1 && t.push(o), e);
    }
    function ih(e, t, r, n, o) {
      switch (t) {
        case 'focusin':
          return (st = en(st, e, t, r, n, o)), !0;
        case 'dragenter':
          return (ut = en(ut, e, t, r, n, o)), !0;
        case 'mouseover':
          return (at = en(at, e, t, r, n, o)), !0;
        case 'pointerover':
          var i = o.pointerId;
          return In.set(i, en(In.get(i) || null, e, t, r, n, o)), !0;
        case 'gotpointercapture':
          return (i = o.pointerId), bn.set(i, en(bn.get(i) || null, e, t, r, n, o)), !0;
      }
      return !1;
    }
    function lh(e) {
      var t = _t(e.target);
      if (t !== null) {
        var r = $t(t);
        if (r !== null) {
          if (((t = r.tag), t === 13)) {
            if (((t = bc(r)), t !== null)) {
              (e.blockedOn = t),
                Dc(e.lanePriority, function () {
                  Y.unstable_runWithPriority(e.priority, function () {
                    Mc(r);
                  });
                });
              return;
            }
          } else if (t === 3 && r.stateNode.hydrate) {
            e.blockedOn = r.tag === 3 ? r.stateNode.containerInfo : null;
            return;
          }
        }
      }
      e.blockedOn = null;
    }
    function zo(e) {
      if (e.blockedOn !== null) return !1;
      for (var t = e.targetContainers; 0 < t.length; ) {
        var r = Js(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
        if (r !== null) return (t = Wn(r)), t !== null && Ks(t), (e.blockedOn = r), !1;
        t.shift();
      }
      return !0;
    }
    function vf(e, t, r) {
      zo(e) && r.delete(t);
    }
    function sh() {
      for (us = !1; 0 < je.length; ) {
        var e = je[0];
        if (e.blockedOn !== null) {
          (e = Wn(e.blockedOn)), e !== null && Lc(e);
          break;
        }
        for (var t = e.targetContainers; 0 < t.length; ) {
          var r = Js(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
          if (r !== null) {
            e.blockedOn = r;
            break;
          }
          t.shift();
        }
        e.blockedOn === null && je.shift();
      }
      st !== null && zo(st) && (st = null),
        ut !== null && zo(ut) && (ut = null),
        at !== null && zo(at) && (at = null),
        In.forEach(vf),
        bn.forEach(vf);
    }
    function tn(e, t) {
      e.blockedOn === t &&
        ((e.blockedOn = null), us || ((us = !0), Y.unstable_scheduleCallback(Y.unstable_NormalPriority, sh)));
    }
    function jc(e) {
      function t(o) {
        return tn(o, e);
      }
      if (0 < je.length) {
        tn(je[0], e);
        for (var r = 1; r < je.length; r++) {
          var n = je[r];
          n.blockedOn === e && (n.blockedOn = null);
        }
      }
      for (
        st !== null && tn(st, e),
          ut !== null && tn(ut, e),
          at !== null && tn(at, e),
          In.forEach(t),
          bn.forEach(t),
          r = 0;
        r < Jr.length;
        r++
      )
        (n = Jr[r]), n.blockedOn === e && (n.blockedOn = null);
      for (; 0 < Jr.length && ((r = Jr[0]), r.blockedOn === null); ) lh(r), r.blockedOn === null && Jr.shift();
    }
    function To(e, t) {
      var r = {};
      return (r[e.toLowerCase()] = t.toLowerCase()), (r['Webkit' + e] = 'webkit' + t), (r['Moz' + e] = 'moz' + t), r;
    }
    var rr = {
        animationend: To('Animation', 'AnimationEnd'),
        animationiteration: To('Animation', 'AnimationIteration'),
        animationstart: To('Animation', 'AnimationStart'),
        transitionend: To('Transition', 'TransitionEnd'),
      },
      _l = {},
      zc = {};
    Ze &&
      ((zc = document.createElement('div').style),
      'AnimationEvent' in window ||
        (delete rr.animationend.animation, delete rr.animationiteration.animation, delete rr.animationstart.animation),
      'TransitionEvent' in window || delete rr.transitionend.transition);
    function xi(e) {
      if (_l[e]) return _l[e];
      if (!rr[e]) return e;
      var t = rr[e],
        r;
      for (r in t) if (t.hasOwnProperty(r) && r in zc) return (_l[e] = t[r]);
      return e;
    }
    var $c = xi('animationend'),
      Ac = xi('animationiteration'),
      Fc = xi('animationstart'),
      Uc = xi('transitionend'),
      Wc = new Map(),
      Xs = new Map(),
      uh = [
        'abort',
        'abort',
        $c,
        'animationEnd',
        Ac,
        'animationIteration',
        Fc,
        'animationStart',
        'canplay',
        'canPlay',
        'canplaythrough',
        'canPlayThrough',
        'durationchange',
        'durationChange',
        'emptied',
        'emptied',
        'encrypted',
        'encrypted',
        'ended',
        'ended',
        'error',
        'error',
        'gotpointercapture',
        'gotPointerCapture',
        'load',
        'load',
        'loadeddata',
        'loadedData',
        'loadedmetadata',
        'loadedMetadata',
        'loadstart',
        'loadStart',
        'lostpointercapture',
        'lostPointerCapture',
        'playing',
        'playing',
        'progress',
        'progress',
        'seeking',
        'seeking',
        'stalled',
        'stalled',
        'suspend',
        'suspend',
        'timeupdate',
        'timeUpdate',
        Uc,
        'transitionEnd',
        'waiting',
        'waiting',
      ];
    function qs(e, t) {
      for (var r = 0; r < e.length; r += 2) {
        var n = e[r],
          o = e[r + 1];
        (o = 'on' + (o[0].toUpperCase() + o.slice(1))), Xs.set(n, t), Wc.set(n, o), jt(o, [n]);
      }
    }
    var ah = Y.unstable_now;
    ah();
    var D = 8;
    function er(e) {
      if ((1 & e) !== 0) return (D = 15), 1;
      if ((2 & e) !== 0) return (D = 14), 2;
      if ((4 & e) !== 0) return (D = 13), 4;
      var t = 24 & e;
      return t !== 0
        ? ((D = 12), t)
        : (e & 32) !== 0
        ? ((D = 11), 32)
        : ((t = 192 & e),
          t !== 0
            ? ((D = 10), t)
            : (e & 256) !== 0
            ? ((D = 9), 256)
            : ((t = 3584 & e),
              t !== 0
                ? ((D = 8), t)
                : (e & 4096) !== 0
                ? ((D = 7), 4096)
                : ((t = 4186112 & e),
                  t !== 0
                    ? ((D = 6), t)
                    : ((t = 62914560 & e),
                      t !== 0
                        ? ((D = 5), t)
                        : e & 67108864
                        ? ((D = 4), 67108864)
                        : (e & 134217728) !== 0
                        ? ((D = 3), 134217728)
                        : ((t = 805306368 & e),
                          t !== 0 ? ((D = 2), t) : (1073741824 & e) !== 0 ? ((D = 1), 1073741824) : ((D = 8), e))))));
    }
    function fh(e) {
      switch (e) {
        case 99:
          return 15;
        case 98:
          return 10;
        case 97:
        case 96:
          return 8;
        case 95:
          return 2;
        default:
          return 0;
      }
    }
    function ch(e) {
      switch (e) {
        case 15:
        case 14:
          return 99;
        case 13:
        case 12:
        case 11:
        case 10:
          return 98;
        case 9:
        case 8:
        case 7:
        case 6:
        case 4:
        case 5:
          return 97;
        case 3:
        case 2:
        case 1:
          return 95;
        case 0:
          return 90;
        default:
          throw Error(v(358, e));
      }
    }
    function On(e, t) {
      var r = e.pendingLanes;
      if (r === 0) return (D = 0);
      var n = 0,
        o = 0,
        i = e.expiredLanes,
        l = e.suspendedLanes,
        s = e.pingedLanes;
      if (i !== 0) (n = i), (o = D = 15);
      else if (((i = r & 134217727), i !== 0)) {
        var u = i & ~l;
        u !== 0 ? ((n = er(u)), (o = D)) : ((s &= i), s !== 0 && ((n = er(s)), (o = D)));
      } else (i = r & ~l), i !== 0 ? ((n = er(i)), (o = D)) : s !== 0 && ((n = er(s)), (o = D));
      if (n === 0) return 0;
      if (((n = 31 - yt(n)), (n = r & (((0 > n ? 0 : 1 << n) << 1) - 1)), t !== 0 && t !== n && (t & l) === 0)) {
        if ((er(t), o <= D)) return t;
        D = o;
      }
      if (((t = e.entangledLanes), t !== 0))
        for (e = e.entanglements, t &= n; 0 < t; ) (r = 31 - yt(t)), (o = 1 << r), (n |= e[r]), (t &= ~o);
      return n;
    }
    function Hc(e) {
      return (e = e.pendingLanes & -1073741825), e !== 0 ? e : e & 1073741824 ? 1073741824 : 0;
    }
    function Zo(e, t) {
      switch (e) {
        case 15:
          return 1;
        case 14:
          return 2;
        case 12:
          return (e = tr(24 & ~t)), e === 0 ? Zo(10, t) : e;
        case 10:
          return (e = tr(192 & ~t)), e === 0 ? Zo(8, t) : e;
        case 8:
          return (e = tr(3584 & ~t)), e === 0 && ((e = tr(4186112 & ~t)), e === 0 && (e = 512)), e;
        case 2:
          return (t = tr(805306368 & ~t)), t === 0 && (t = 268435456), t;
      }
      throw Error(v(358, e));
    }
    function tr(e) {
      return e & -e;
    }
    function Il(e) {
      for (var t = [], r = 0; 31 > r; r++) t.push(e);
      return t;
    }
    function wi(e, t, r) {
      e.pendingLanes |= t;
      var n = t - 1;
      (e.suspendedLanes &= n), (e.pingedLanes &= n), (e = e.eventTimes), (t = 31 - yt(t)), (e[t] = r);
    }
    var yt = Math.clz32 ? Math.clz32 : mh,
      dh = Math.log,
      ph = Math.LN2;
    function mh(e) {
      return e === 0 ? 32 : (31 - ((dh(e) / ph) | 0)) | 0;
    }
    var hh = Y.unstable_UserBlockingPriority,
      yh = Y.unstable_runWithPriority,
      $o = !0;
    function gh(e, t, r, n) {
      Bt || Qs();
      var o = Zs,
        i = Bt;
      Bt = !0;
      try {
        _c(o, e, t, r, n);
      } finally {
        (Bt = i) || Ys();
      }
    }
    function Sh(e, t, r, n) {
      yh(hh, Zs.bind(null, e, t, r, n));
    }
    function Zs(e, t, r, n) {
      if ($o) {
        var o;
        if ((o = (t & 4) === 0) && 0 < je.length && -1 < gf.indexOf(e)) (e = as(null, e, t, r, n)), je.push(e);
        else {
          var i = Js(e, t, r, n);
          if (i === null) o && Sf(e, n);
          else {
            if (o) {
              if (-1 < gf.indexOf(e)) {
                (e = as(i, e, t, r, n)), je.push(e);
                return;
              }
              if (ih(i, e, t, r, n)) return;
              Sf(e, n);
            }
            nd(e, t, n, null, r);
          }
        }
      }
    }
    function Js(e, t, r, n) {
      var o = Vs(n);
      if (((o = _t(o)), o !== null)) {
        var i = $t(o);
        if (i === null) o = null;
        else {
          var l = i.tag;
          if (l === 13) {
            if (((o = bc(i)), o !== null)) return o;
            o = null;
          } else if (l === 3) {
            if (i.stateNode.hydrate) return i.tag === 3 ? i.stateNode.containerInfo : null;
            o = null;
          } else i !== o && (o = null);
        }
      }
      return nd(e, t, n, o, r), null;
    }
    var ot = null,
      eu = null,
      Ao = null;
    function Vc() {
      if (Ao) return Ao;
      var e,
        t = eu,
        r = t.length,
        n,
        o = 'value' in ot ? ot.value : ot.textContent,
        i = o.length;
      for (e = 0; e < r && t[e] === o[e]; e++);
      var l = r - e;
      for (n = 1; n <= l && t[r - n] === o[i - n]; n++);
      return (Ao = o.slice(e, 1 < n ? 1 - n : void 0));
    }
    function Fo(e) {
      var t = e.keyCode;
      return (
        'charCode' in e ? ((e = e.charCode), e === 0 && t === 13 && (e = 13)) : (e = t),
        e === 10 && (e = 13),
        32 <= e || e === 13 ? e : 0
      );
    }
    function Bo() {
      return !0;
    }
    function xf() {
      return !1;
    }
    function ye(e) {
      function t(r, n, o, i, l) {
        (this._reactName = r),
          (this._targetInst = o),
          (this.type = n),
          (this.nativeEvent = i),
          (this.target = l),
          (this.currentTarget = null);
        for (var s in e) e.hasOwnProperty(s) && ((r = e[s]), (this[s] = r ? r(i) : i[s]));
        return (
          (this.isDefaultPrevented = (i.defaultPrevented != null ? i.defaultPrevented : i.returnValue === !1)
            ? Bo
            : xf),
          (this.isPropagationStopped = xf),
          this
        );
      }
      return (
        $(t.prototype, {
          preventDefault: function () {
            this.defaultPrevented = !0;
            var r = this.nativeEvent;
            r &&
              (r.preventDefault ? r.preventDefault() : typeof r.returnValue != 'unknown' && (r.returnValue = !1),
              (this.isDefaultPrevented = Bo));
          },
          stopPropagation: function () {
            var r = this.nativeEvent;
            r &&
              (r.stopPropagation ? r.stopPropagation() : typeof r.cancelBubble != 'unknown' && (r.cancelBubble = !0),
              (this.isPropagationStopped = Bo));
          },
          persist: function () {},
          isPersistent: Bo,
        }),
        t
      );
    }
    var Cr = {
        eventPhase: 0,
        bubbles: 0,
        cancelable: 0,
        timeStamp: function (e) {
          return e.timeStamp || Date.now();
        },
        defaultPrevented: 0,
        isTrusted: 0,
      },
      tu = ye(Cr),
      Un = $({}, Cr, { view: 0, detail: 0 }),
      vh = ye(Un),
      bl,
      Ol,
      rn,
      Ci = $({}, Un, {
        screenX: 0,
        screenY: 0,
        clientX: 0,
        clientY: 0,
        pageX: 0,
        pageY: 0,
        ctrlKey: 0,
        shiftKey: 0,
        altKey: 0,
        metaKey: 0,
        getModifierState: ru,
        button: 0,
        buttons: 0,
        relatedTarget: function (e) {
          return e.relatedTarget === void 0
            ? e.fromElement === e.srcElement
              ? e.toElement
              : e.fromElement
            : e.relatedTarget;
        },
        movementX: function (e) {
          return 'movementX' in e
            ? e.movementX
            : (e !== rn &&
                (rn && e.type === 'mousemove'
                  ? ((bl = e.screenX - rn.screenX), (Ol = e.screenY - rn.screenY))
                  : (Ol = bl = 0),
                (rn = e)),
              bl);
        },
        movementY: function (e) {
          return 'movementY' in e ? e.movementY : Ol;
        },
      }),
      wf = ye(Ci),
      xh = $({}, Ci, { dataTransfer: 0 }),
      wh = ye(xh),
      Ch = $({}, Un, { relatedTarget: 0 }),
      Ll = ye(Ch),
      kh = $({}, Cr, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
      Eh = ye(kh),
      Ph = $({}, Cr, {
        clipboardData: function (e) {
          return 'clipboardData' in e ? e.clipboardData : window.clipboardData;
        },
      }),
      Rh = ye(Ph),
      Nh = $({}, Cr, { data: 0 }),
      Cf = ye(Nh),
      Th = {
        Esc: 'Escape',
        Spacebar: ' ',
        Left: 'ArrowLeft',
        Up: 'ArrowUp',
        Right: 'ArrowRight',
        Down: 'ArrowDown',
        Del: 'Delete',
        Win: 'OS',
        Menu: 'ContextMenu',
        Apps: 'ContextMenu',
        Scroll: 'ScrollLock',
        MozPrintableKey: 'Unidentified',
      },
      Bh = {
        8: 'Backspace',
        9: 'Tab',
        12: 'Clear',
        13: 'Enter',
        16: 'Shift',
        17: 'Control',
        18: 'Alt',
        19: 'Pause',
        20: 'CapsLock',
        27: 'Escape',
        32: ' ',
        33: 'PageUp',
        34: 'PageDown',
        35: 'End',
        36: 'Home',
        37: 'ArrowLeft',
        38: 'ArrowUp',
        39: 'ArrowRight',
        40: 'ArrowDown',
        45: 'Insert',
        46: 'Delete',
        112: 'F1',
        113: 'F2',
        114: 'F3',
        115: 'F4',
        116: 'F5',
        117: 'F6',
        118: 'F7',
        119: 'F8',
        120: 'F9',
        121: 'F10',
        122: 'F11',
        123: 'F12',
        144: 'NumLock',
        145: 'ScrollLock',
        224: 'Meta',
      },
      _h = { Alt: 'altKey', Control: 'ctrlKey', Meta: 'metaKey', Shift: 'shiftKey' };
    function Ih(e) {
      var t = this.nativeEvent;
      return t.getModifierState ? t.getModifierState(e) : (e = _h[e]) ? !!t[e] : !1;
    }
    function ru() {
      return Ih;
    }
    var bh = $({}, Un, {
        key: function (e) {
          if (e.key) {
            var t = Th[e.key] || e.key;
            if (t !== 'Unidentified') return t;
          }
          return e.type === 'keypress'
            ? ((e = Fo(e)), e === 13 ? 'Enter' : String.fromCharCode(e))
            : e.type === 'keydown' || e.type === 'keyup'
            ? Bh[e.keyCode] || 'Unidentified'
            : '';
        },
        code: 0,
        location: 0,
        ctrlKey: 0,
        shiftKey: 0,
        altKey: 0,
        metaKey: 0,
        repeat: 0,
        locale: 0,
        getModifierState: ru,
        charCode: function (e) {
          return e.type === 'keypress' ? Fo(e) : 0;
        },
        keyCode: function (e) {
          return e.type === 'keydown' || e.type === 'keyup' ? e.keyCode : 0;
        },
        which: function (e) {
          return e.type === 'keypress' ? Fo(e) : e.type === 'keydown' || e.type === 'keyup' ? e.keyCode : 0;
        },
      }),
      Oh = ye(bh),
      Lh = $({}, Ci, {
        pointerId: 0,
        width: 0,
        height: 0,
        pressure: 0,
        tangentialPressure: 0,
        tiltX: 0,
        tiltY: 0,
        twist: 0,
        pointerType: 0,
        isPrimary: 0,
      }),
      kf = ye(Lh),
      Mh = $({}, Un, {
        touches: 0,
        targetTouches: 0,
        changedTouches: 0,
        altKey: 0,
        metaKey: 0,
        ctrlKey: 0,
        shiftKey: 0,
        getModifierState: ru,
      }),
      Dh = ye(Mh),
      jh = $({}, Cr, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
      zh = ye(jh),
      $h = $({}, Ci, {
        deltaX: function (e) {
          return 'deltaX' in e ? e.deltaX : 'wheelDeltaX' in e ? -e.wheelDeltaX : 0;
        },
        deltaY: function (e) {
          return 'deltaY' in e ? e.deltaY : 'wheelDeltaY' in e ? -e.wheelDeltaY : 'wheelDelta' in e ? -e.wheelDelta : 0;
        },
        deltaZ: 0,
        deltaMode: 0,
      }),
      Ah = ye($h),
      Fh = [9, 13, 27, 32],
      nu = Ze && 'CompositionEvent' in window,
      xn = null;
    Ze && 'documentMode' in document && (xn = document.documentMode);
    var Uh = Ze && 'TextEvent' in window && !xn,
      Gc = Ze && (!nu || (xn && 8 < xn && 11 >= xn)),
      Ef = String.fromCharCode(32),
      Pf = !1;
    function Qc(e, t) {
      switch (e) {
        case 'keyup':
          return Fh.indexOf(t.keyCode) !== -1;
        case 'keydown':
          return t.keyCode !== 229;
        case 'keypress':
        case 'mousedown':
        case 'focusout':
          return !0;
        default:
          return !1;
      }
    }
    function Yc(e) {
      return (e = e.detail), typeof e == 'object' && 'data' in e ? e.data : null;
    }
    var nr = !1;
    function Wh(e, t) {
      switch (e) {
        case 'compositionend':
          return Yc(t);
        case 'keypress':
          return t.which !== 32 ? null : ((Pf = !0), Ef);
        case 'textInput':
          return (e = t.data), e === Ef && Pf ? null : e;
        default:
          return null;
      }
    }
    function Hh(e, t) {
      if (nr)
        return e === 'compositionend' || (!nu && Qc(e, t)) ? ((e = Vc()), (Ao = eu = ot = null), (nr = !1), e) : null;
      switch (e) {
        case 'paste':
          return null;
        case 'keypress':
          if (!(t.ctrlKey || t.altKey || t.metaKey) || (t.ctrlKey && t.altKey)) {
            if (t.char && 1 < t.char.length) return t.char;
            if (t.which) return String.fromCharCode(t.which);
          }
          return null;
        case 'compositionend':
          return Gc && t.locale !== 'ko' ? null : t.data;
        default:
          return null;
      }
    }
    var Vh = {
      color: !0,
      date: !0,
      datetime: !0,
      'datetime-local': !0,
      email: !0,
      month: !0,
      number: !0,
      password: !0,
      range: !0,
      search: !0,
      tel: !0,
      text: !0,
      time: !0,
      url: !0,
      week: !0,
    };
    function Rf(e) {
      var t = e && e.nodeName && e.nodeName.toLowerCase();
      return t === 'input' ? !!Vh[e.type] : t === 'textarea';
    }
    function Kc(e, t, r, n) {
      Tc(n),
        (t = Jo(t, 'onChange')),
        0 < t.length && ((r = new tu('onChange', 'change', null, r, n)), e.push({ event: r, listeners: t }));
    }
    var wn = null,
      Ln = null;
    function Gh(e) {
      ed(e, 0);
    }
    function ki(e) {
      var t = ir(e);
      if (wc(t)) return e;
    }
    function Qh(e, t) {
      if (e === 'change') return t;
    }
    var Xc = !1;
    Ze &&
      (Ze
        ? ((Io = 'oninput' in document),
          Io ||
            ((Ml = document.createElement('div')),
            Ml.setAttribute('oninput', 'return;'),
            (Io = typeof Ml.oninput == 'function')),
          (_o = Io))
        : (_o = !1),
      (Xc = _o && (!document.documentMode || 9 < document.documentMode)));
    var _o, Io, Ml;
    function Nf() {
      wn && (wn.detachEvent('onpropertychange', qc), (Ln = wn = null));
    }
    function qc(e) {
      if (e.propertyName === 'value' && ki(Ln)) {
        var t = [];
        if ((Kc(t, Ln, e, Vs(e)), (e = Gh), Bt)) e(t);
        else {
          Bt = !0;
          try {
            Gs(e, t);
          } finally {
            (Bt = !1), Ys();
          }
        }
      }
    }
    function Yh(e, t, r) {
      e === 'focusin' ? (Nf(), (wn = t), (Ln = r), wn.attachEvent('onpropertychange', qc)) : e === 'focusout' && Nf();
    }
    function Kh(e) {
      if (e === 'selectionchange' || e === 'keyup' || e === 'keydown') return ki(Ln);
    }
    function Xh(e, t) {
      if (e === 'click') return ki(t);
    }
    function qh(e, t) {
      if (e === 'input' || e === 'change') return ki(t);
    }
    function Zh(e, t) {
      return (e === t && (e !== 0 || 1 / e === 1 / t)) || (e !== e && t !== t);
    }
    var xe = typeof Object.is == 'function' ? Object.is : Zh,
      Jh = Object.prototype.hasOwnProperty;
    function Mn(e, t) {
      if (xe(e, t)) return !0;
      if (typeof e != 'object' || e === null || typeof t != 'object' || t === null) return !1;
      var r = Object.keys(e),
        n = Object.keys(t);
      if (r.length !== n.length) return !1;
      for (n = 0; n < r.length; n++) if (!Jh.call(t, r[n]) || !xe(e[r[n]], t[r[n]])) return !1;
      return !0;
    }
    function Tf(e) {
      for (; e && e.firstChild; ) e = e.firstChild;
      return e;
    }
    function Bf(e, t) {
      var r = Tf(e);
      e = 0;
      for (var n; r; ) {
        if (r.nodeType === 3) {
          if (((n = e + r.textContent.length), e <= t && n >= t)) return { node: r, offset: t - e };
          e = n;
        }
        e: {
          for (; r; ) {
            if (r.nextSibling) {
              r = r.nextSibling;
              break e;
            }
            r = r.parentNode;
          }
          r = void 0;
        }
        r = Tf(r);
      }
    }
    function Zc(e, t) {
      return e && t
        ? e === t
          ? !0
          : e && e.nodeType === 3
          ? !1
          : t && t.nodeType === 3
          ? Zc(e, t.parentNode)
          : 'contains' in e
          ? e.contains(t)
          : e.compareDocumentPosition
          ? !!(e.compareDocumentPosition(t) & 16)
          : !1
        : !1;
    }
    function _f() {
      for (var e = window, t = Ko(); t instanceof e.HTMLIFrameElement; ) {
        try {
          var r = typeof t.contentWindow.location.href == 'string';
        } catch {
          r = !1;
        }
        if (r) e = t.contentWindow;
        else break;
        t = Ko(e.document);
      }
      return t;
    }
    function fs(e) {
      var t = e && e.nodeName && e.nodeName.toLowerCase();
      return (
        t &&
        ((t === 'input' &&
          (e.type === 'text' ||
            e.type === 'search' ||
            e.type === 'tel' ||
            e.type === 'url' ||
            e.type === 'password')) ||
          t === 'textarea' ||
          e.contentEditable === 'true')
      );
    }
    var ey = Ze && 'documentMode' in document && 11 >= document.documentMode,
      or = null,
      cs = null,
      Cn = null,
      ds = !1;
    function If(e, t, r) {
      var n = r.window === r ? r.document : r.nodeType === 9 ? r : r.ownerDocument;
      ds ||
        or == null ||
        or !== Ko(n) ||
        ((n = or),
        'selectionStart' in n && fs(n)
          ? (n = { start: n.selectionStart, end: n.selectionEnd })
          : ((n = ((n.ownerDocument && n.ownerDocument.defaultView) || window).getSelection()),
            (n = {
              anchorNode: n.anchorNode,
              anchorOffset: n.anchorOffset,
              focusNode: n.focusNode,
              focusOffset: n.focusOffset,
            })),
        (Cn && Mn(Cn, n)) ||
          ((Cn = n),
          (n = Jo(cs, 'onSelect')),
          0 < n.length &&
            ((t = new tu('onSelect', 'select', null, t, r)), e.push({ event: t, listeners: n }), (t.target = or))));
    }
    qs(
      'cancel cancel click click close close contextmenu contextMenu copy copy cut cut auxclick auxClick dblclick doubleClick dragend dragEnd dragstart dragStart drop drop focusin focus focusout blur input input invalid invalid keydown keyDown keypress keyPress keyup keyUp mousedown mouseDown mouseup mouseUp paste paste pause pause play play pointercancel pointerCancel pointerdown pointerDown pointerup pointerUp ratechange rateChange reset reset seeked seeked submit submit touchcancel touchCancel touchend touchEnd touchstart touchStart volumechange volumeChange'.split(
        ' ',
      ),
      0,
    );
    qs(
      'drag drag dragenter dragEnter dragexit dragExit dragleave dragLeave dragover dragOver mousemove mouseMove mouseout mouseOut mouseover mouseOver pointermove pointerMove pointerout pointerOut pointerover pointerOver scroll scroll toggle toggle touchmove touchMove wheel wheel'.split(
        ' ',
      ),
      1,
    );
    qs(uh, 2);
    for (
      Dl = 'change selectionchange textInput compositionstart compositionend compositionupdate'.split(' '), bo = 0;
      bo < Dl.length;
      bo++
    )
      Xs.set(Dl[bo], 0);
    var Dl, bo;
    Sr('onMouseEnter', ['mouseout', 'mouseover']);
    Sr('onMouseLeave', ['mouseout', 'mouseover']);
    Sr('onPointerEnter', ['pointerout', 'pointerover']);
    Sr('onPointerLeave', ['pointerout', 'pointerover']);
    jt('onChange', 'change click focusin focusout input keydown keyup selectionchange'.split(' '));
    jt('onSelect', 'focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange'.split(' '));
    jt('onBeforeInput', ['compositionend', 'keypress', 'textInput', 'paste']);
    jt('onCompositionEnd', 'compositionend focusout keydown keypress keyup mousedown'.split(' '));
    jt('onCompositionStart', 'compositionstart focusout keydown keypress keyup mousedown'.split(' '));
    jt('onCompositionUpdate', 'compositionupdate focusout keydown keypress keyup mousedown'.split(' '));
    var pn =
        'abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange seeked seeking stalled suspend timeupdate volumechange waiting'.split(
          ' ',
        ),
      Jc = new Set('cancel close invalid load scroll toggle'.split(' ').concat(pn));
    function bf(e, t, r) {
      var n = e.type || 'unknown-event';
      (e.currentTarget = r), nh(n, t, void 0, e), (e.currentTarget = null);
    }
    function ed(e, t) {
      t = (t & 4) !== 0;
      for (var r = 0; r < e.length; r++) {
        var n = e[r],
          o = n.event;
        n = n.listeners;
        e: {
          var i = void 0;
          if (t)
            for (var l = n.length - 1; 0 <= l; l--) {
              var s = n[l],
                u = s.instance,
                a = s.currentTarget;
              if (((s = s.listener), u !== i && o.isPropagationStopped())) break e;
              bf(o, s, a), (i = u);
            }
          else
            for (l = 0; l < n.length; l++) {
              if (
                ((s = n[l]),
                (u = s.instance),
                (a = s.currentTarget),
                (s = s.listener),
                u !== i && o.isPropagationStopped())
              )
                break e;
              bf(o, s, a), (i = u);
            }
        }
      }
      if (qo) throw ((e = ss), (qo = !1), (ss = null), e);
    }
    function j(e, t) {
      var r = id(t),
        n = e + '__bubble';
      r.has(n) || (rd(t, e, 2, !1), r.add(n));
    }
    var Of = '_reactListening' + Math.random().toString(36).slice(2);
    function td(e) {
      e[Of] ||
        ((e[Of] = !0),
        Sc.forEach(function (t) {
          Jc.has(t) || Lf(t, !1, e, null), Lf(t, !0, e, null);
        }));
    }
    function Lf(e, t, r, n) {
      var o = 4 < arguments.length && arguments[4] !== void 0 ? arguments[4] : 0,
        i = r;
      if ((e === 'selectionchange' && r.nodeType !== 9 && (i = r.ownerDocument), n !== null && !t && Jc.has(e))) {
        if (e !== 'scroll') return;
        (o |= 2), (i = n);
      }
      var l = id(i),
        s = e + '__' + (t ? 'capture' : 'bubble');
      l.has(s) || (t && (o |= 4), rd(i, e, o, t), l.add(s));
    }
    function rd(e, t, r, n) {
      var o = Xs.get(t);
      switch (o === void 0 ? 2 : o) {
        case 0:
          o = gh;
          break;
        case 1:
          o = Sh;
          break;
        default:
          o = Zs;
      }
      (r = o.bind(null, t, r, e)),
        (o = void 0),
        !ls || (t !== 'touchstart' && t !== 'touchmove' && t !== 'wheel') || (o = !0),
        n
          ? o !== void 0
            ? e.addEventListener(t, r, { capture: !0, passive: o })
            : e.addEventListener(t, r, !0)
          : o !== void 0
          ? e.addEventListener(t, r, { passive: o })
          : e.addEventListener(t, r, !1);
    }
    function nd(e, t, r, n, o) {
      var i = n;
      if ((t & 1) === 0 && (t & 2) === 0 && n !== null)
        e: for (;;) {
          if (n === null) return;
          var l = n.tag;
          if (l === 3 || l === 4) {
            var s = n.stateNode.containerInfo;
            if (s === o || (s.nodeType === 8 && s.parentNode === o)) break;
            if (l === 4)
              for (l = n.return; l !== null; ) {
                var u = l.tag;
                if (
                  (u === 3 || u === 4) &&
                  ((u = l.stateNode.containerInfo), u === o || (u.nodeType === 8 && u.parentNode === o))
                )
                  return;
                l = l.return;
              }
            for (; s !== null; ) {
              if (((l = _t(s)), l === null)) return;
              if (((u = l.tag), u === 5 || u === 6)) {
                n = i = l;
                continue e;
              }
              s = s.parentNode;
            }
          }
          n = n.return;
        }
      Jm(function () {
        var a = i,
          y = Vs(r),
          S = [];
        e: {
          var m = Wc.get(e);
          if (m !== void 0) {
            var w = tu,
              k = e;
            switch (e) {
              case 'keypress':
                if (Fo(r) === 0) break e;
              case 'keydown':
              case 'keyup':
                w = Oh;
                break;
              case 'focusin':
                (k = 'focus'), (w = Ll);
                break;
              case 'focusout':
                (k = 'blur'), (w = Ll);
                break;
              case 'beforeblur':
              case 'afterblur':
                w = Ll;
                break;
              case 'click':
                if (r.button === 2) break e;
              case 'auxclick':
              case 'dblclick':
              case 'mousedown':
              case 'mousemove':
              case 'mouseup':
              case 'mouseout':
              case 'mouseover':
              case 'contextmenu':
                w = wf;
                break;
              case 'drag':
              case 'dragend':
              case 'dragenter':
              case 'dragexit':
              case 'dragleave':
              case 'dragover':
              case 'dragstart':
              case 'drop':
                w = wh;
                break;
              case 'touchcancel':
              case 'touchend':
              case 'touchmove':
              case 'touchstart':
                w = Dh;
                break;
              case $c:
              case Ac:
              case Fc:
                w = Eh;
                break;
              case Uc:
                w = zh;
                break;
              case 'scroll':
                w = vh;
                break;
              case 'wheel':
                w = Ah;
                break;
              case 'copy':
              case 'cut':
              case 'paste':
                w = Rh;
                break;
              case 'gotpointercapture':
              case 'lostpointercapture':
              case 'pointercancel':
              case 'pointerdown':
              case 'pointermove':
              case 'pointerout':
              case 'pointerover':
              case 'pointerup':
                w = kf;
            }
            var x = (t & 4) !== 0,
              d = !x && e === 'scroll',
              f = x ? (m !== null ? m + 'Capture' : null) : m;
            x = [];
            for (var c = a, h; c !== null; ) {
              h = c;
              var p = h.stateNode;
              if (
                (h.tag === 5 &&
                  p !== null &&
                  ((h = p), f !== null && ((p = _n(c, f)), p != null && x.push(Dn(c, p, h)))),
                d)
              )
                break;
              c = c.return;
            }
            0 < x.length && ((m = new w(m, k, null, r, y)), S.push({ event: m, listeners: x }));
          }
        }
        if ((t & 7) === 0) {
          e: {
            if (
              ((m = e === 'mouseover' || e === 'pointerover'),
              (w = e === 'mouseout' || e === 'pointerout'),
              m && (t & 16) === 0 && (k = r.relatedTarget || r.fromElement) && (_t(k) || k[kr]))
            )
              break e;
            if (
              (w || m) &&
              ((m = y.window === y ? y : (m = y.ownerDocument) ? m.defaultView || m.parentWindow : window),
              w
                ? ((k = r.relatedTarget || r.toElement),
                  (w = a),
                  (k = k ? _t(k) : null),
                  k !== null && ((d = $t(k)), k !== d || (k.tag !== 5 && k.tag !== 6)) && (k = null))
                : ((w = null), (k = a)),
              w !== k)
            ) {
              if (
                ((x = wf),
                (p = 'onMouseLeave'),
                (f = 'onMouseEnter'),
                (c = 'mouse'),
                (e === 'pointerout' || e === 'pointerover') &&
                  ((x = kf), (p = 'onPointerLeave'), (f = 'onPointerEnter'), (c = 'pointer')),
                (d = w == null ? m : ir(w)),
                (h = k == null ? m : ir(k)),
                (m = new x(p, c + 'leave', w, r, y)),
                (m.target = d),
                (m.relatedTarget = h),
                (p = null),
                _t(y) === a && ((x = new x(f, c + 'enter', k, r, y)), (x.target = h), (x.relatedTarget = d), (p = x)),
                (d = p),
                w && k)
              )
                t: {
                  for (x = w, f = k, c = 0, h = x; h; h = Jt(h)) c++;
                  for (h = 0, p = f; p; p = Jt(p)) h++;
                  for (; 0 < c - h; ) (x = Jt(x)), c--;
                  for (; 0 < h - c; ) (f = Jt(f)), h--;
                  for (; c--; ) {
                    if (x === f || (f !== null && x === f.alternate)) break t;
                    (x = Jt(x)), (f = Jt(f));
                  }
                  x = null;
                }
              else x = null;
              w !== null && Mf(S, m, w, x, !1), k !== null && d !== null && Mf(S, d, k, x, !0);
            }
          }
          e: {
            if (
              ((m = a ? ir(a) : window),
              (w = m.nodeName && m.nodeName.toLowerCase()),
              w === 'select' || (w === 'input' && m.type === 'file'))
            )
              var N = Qh;
            else if (Rf(m))
              if (Xc) N = qh;
              else {
                N = Kh;
                var C = Yh;
              }
            else
              (w = m.nodeName) &&
                w.toLowerCase() === 'input' &&
                (m.type === 'checkbox' || m.type === 'radio') &&
                (N = Xh);
            if (N && (N = N(e, a))) {
              Kc(S, N, r, y);
              break e;
            }
            C && C(e, m, a),
              e === 'focusout' &&
                (C = m._wrapperState) &&
                C.controlled &&
                m.type === 'number' &&
                Zl(m, 'number', m.value);
          }
          switch (((C = a ? ir(a) : window), e)) {
            case 'focusin':
              (Rf(C) || C.contentEditable === 'true') && ((or = C), (cs = a), (Cn = null));
              break;
            case 'focusout':
              Cn = cs = or = null;
              break;
            case 'mousedown':
              ds = !0;
              break;
            case 'contextmenu':
            case 'mouseup':
            case 'dragend':
              (ds = !1), If(S, r, y);
              break;
            case 'selectionchange':
              if (ey) break;
            case 'keydown':
            case 'keyup':
              If(S, r, y);
          }
          var P;
          if (nu)
            e: {
              switch (e) {
                case 'compositionstart':
                  var _ = 'onCompositionStart';
                  break e;
                case 'compositionend':
                  _ = 'onCompositionEnd';
                  break e;
                case 'compositionupdate':
                  _ = 'onCompositionUpdate';
                  break e;
              }
              _ = void 0;
            }
          else
            nr
              ? Qc(e, r) && (_ = 'onCompositionEnd')
              : e === 'keydown' && r.keyCode === 229 && (_ = 'onCompositionStart');
          _ &&
            (Gc &&
              r.locale !== 'ko' &&
              (nr || _ !== 'onCompositionStart'
                ? _ === 'onCompositionEnd' && nr && (P = Vc())
                : ((ot = y), (eu = 'value' in ot ? ot.value : ot.textContent), (nr = !0))),
            (C = Jo(a, _)),
            0 < C.length &&
              ((_ = new Cf(_, e, null, r, y)),
              S.push({ event: _, listeners: C }),
              P ? (_.data = P) : ((P = Yc(r)), P !== null && (_.data = P)))),
            (P = Uh ? Wh(e, r) : Hh(e, r)) &&
              ((a = Jo(a, 'onBeforeInput')),
              0 < a.length &&
                ((y = new Cf('onBeforeInput', 'beforeinput', null, r, y)),
                S.push({ event: y, listeners: a }),
                (y.data = P)));
        }
        ed(S, t);
      });
    }
    function Dn(e, t, r) {
      return { instance: e, listener: t, currentTarget: r };
    }
    function Jo(e, t) {
      for (var r = t + 'Capture', n = []; e !== null; ) {
        var o = e,
          i = o.stateNode;
        o.tag === 5 &&
          i !== null &&
          ((o = i),
          (i = _n(e, r)),
          i != null && n.unshift(Dn(e, i, o)),
          (i = _n(e, t)),
          i != null && n.push(Dn(e, i, o))),
          (e = e.return);
      }
      return n;
    }
    function Jt(e) {
      if (e === null) return null;
      do e = e.return;
      while (e && e.tag !== 5);
      return e || null;
    }
    function Mf(e, t, r, n, o) {
      for (var i = t._reactName, l = []; r !== null && r !== n; ) {
        var s = r,
          u = s.alternate,
          a = s.stateNode;
        if (u !== null && u === n) break;
        s.tag === 5 &&
          a !== null &&
          ((s = a),
          o
            ? ((u = _n(r, i)), u != null && l.unshift(Dn(r, u, s)))
            : o || ((u = _n(r, i)), u != null && l.push(Dn(r, u, s)))),
          (r = r.return);
      }
      l.length !== 0 && e.push({ event: t, listeners: l });
    }
    function ei() {}
    var jl = null,
      zl = null;
    function od(e, t) {
      switch (e) {
        case 'button':
        case 'input':
        case 'select':
        case 'textarea':
          return !!t.autoFocus;
      }
      return !1;
    }
    function ps(e, t) {
      return (
        e === 'textarea' ||
        e === 'option' ||
        e === 'noscript' ||
        typeof t.children == 'string' ||
        typeof t.children == 'number' ||
        (typeof t.dangerouslySetInnerHTML == 'object' &&
          t.dangerouslySetInnerHTML !== null &&
          t.dangerouslySetInnerHTML.__html != null)
      );
    }
    var Df = typeof setTimeout == 'function' ? setTimeout : void 0,
      ty = typeof clearTimeout == 'function' ? clearTimeout : void 0;
    function ou(e) {
      e.nodeType === 1 ? (e.textContent = '') : e.nodeType === 9 && ((e = e.body), e != null && (e.textContent = ''));
    }
    function dr(e) {
      for (; e != null; e = e.nextSibling) {
        var t = e.nodeType;
        if (t === 1 || t === 3) break;
      }
      return e;
    }
    function jf(e) {
      e = e.previousSibling;
      for (var t = 0; e; ) {
        if (e.nodeType === 8) {
          var r = e.data;
          if (r === '$' || r === '$!' || r === '$?') {
            if (t === 0) return e;
            t--;
          } else r === '/$' && t++;
        }
        e = e.previousSibling;
      }
      return null;
    }
    var $l = 0;
    function ry(e) {
      return { $$typeof: Ws, toString: e, valueOf: e };
    }
    var Ei = Math.random().toString(36).slice(2),
      it = '__reactFiber$' + Ei,
      ti = '__reactProps$' + Ei,
      kr = '__reactContainer$' + Ei,
      zf = '__reactEvents$' + Ei;
    function _t(e) {
      var t = e[it];
      if (t) return t;
      for (var r = e.parentNode; r; ) {
        if ((t = r[kr] || r[it])) {
          if (((r = t.alternate), t.child !== null || (r !== null && r.child !== null)))
            for (e = jf(e); e !== null; ) {
              if ((r = e[it])) return r;
              e = jf(e);
            }
          return t;
        }
        (e = r), (r = e.parentNode);
      }
      return null;
    }
    function Wn(e) {
      return (e = e[it] || e[kr]), !e || (e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3) ? null : e;
    }
    function ir(e) {
      if (e.tag === 5 || e.tag === 6) return e.stateNode;
      throw Error(v(33));
    }
    function Pi(e) {
      return e[ti] || null;
    }
    function id(e) {
      var t = e[zf];
      return t === void 0 && (t = e[zf] = new Set()), t;
    }
    var ms = [],
      lr = -1;
    function xt(e) {
      return { current: e };
    }
    function z(e) {
      0 > lr || ((e.current = ms[lr]), (ms[lr] = null), lr--);
    }
    function F(e, t) {
      lr++, (ms[lr] = e.current), (e.current = t);
    }
    var gt = {},
      le = xt(gt),
      de = xt(!1),
      Lt = gt;
    function vr(e, t) {
      var r = e.type.contextTypes;
      if (!r) return gt;
      var n = e.stateNode;
      if (n && n.__reactInternalMemoizedUnmaskedChildContext === t) return n.__reactInternalMemoizedMaskedChildContext;
      var o = {},
        i;
      for (i in r) o[i] = t[i];
      return (
        n &&
          ((e = e.stateNode),
          (e.__reactInternalMemoizedUnmaskedChildContext = t),
          (e.__reactInternalMemoizedMaskedChildContext = o)),
        o
      );
    }
    function pe(e) {
      return (e = e.childContextTypes), e != null;
    }
    function ri() {
      z(de), z(le);
    }
    function $f(e, t, r) {
      if (le.current !== gt) throw Error(v(168));
      F(le, t), F(de, r);
    }
    function ld(e, t, r) {
      var n = e.stateNode;
      if (((e = t.childContextTypes), typeof n.getChildContext != 'function')) return r;
      n = n.getChildContext();
      for (var o in n) if (!(o in e)) throw Error(v(108, ur(t) || 'Unknown', o));
      return $({}, r, n);
    }
    function Uo(e) {
      return (
        (e = ((e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext) || gt),
        (Lt = le.current),
        F(le, e),
        F(de, de.current),
        !0
      );
    }
    function Af(e, t, r) {
      var n = e.stateNode;
      if (!n) throw Error(v(169));
      r ? ((e = ld(e, t, Lt)), (n.__reactInternalMemoizedMergedChildContext = e), z(de), z(le), F(le, e)) : z(de),
        F(de, r);
    }
    var iu = null,
      Ot = null,
      ny = Y.unstable_runWithPriority,
      lu = Y.unstable_scheduleCallback,
      hs = Y.unstable_cancelCallback,
      oy = Y.unstable_shouldYield,
      Ff = Y.unstable_requestPaint,
      ys = Y.unstable_now,
      iy = Y.unstable_getCurrentPriorityLevel,
      Ri = Y.unstable_ImmediatePriority,
      sd = Y.unstable_UserBlockingPriority,
      ud = Y.unstable_NormalPriority,
      ad = Y.unstable_LowPriority,
      fd = Y.unstable_IdlePriority,
      Al = {},
      ly = Ff !== void 0 ? Ff : function () {},
      Qe = null,
      Wo = null,
      Fl = !1,
      Uf = ys(),
      oe =
        1e4 > Uf
          ? ys
          : function () {
              return ys() - Uf;
            };
    function xr() {
      switch (iy()) {
        case Ri:
          return 99;
        case sd:
          return 98;
        case ud:
          return 97;
        case ad:
          return 96;
        case fd:
          return 95;
        default:
          throw Error(v(332));
      }
    }
    function cd(e) {
      switch (e) {
        case 99:
          return Ri;
        case 98:
          return sd;
        case 97:
          return ud;
        case 96:
          return ad;
        case 95:
          return fd;
        default:
          throw Error(v(332));
      }
    }
    function Mt(e, t) {
      return (e = cd(e)), ny(e, t);
    }
    function jn(e, t, r) {
      return (e = cd(e)), lu(e, t, r);
    }
    function Ue() {
      if (Wo !== null) {
        var e = Wo;
        (Wo = null), hs(e);
      }
      dd();
    }
    function dd() {
      if (!Fl && Qe !== null) {
        Fl = !0;
        var e = 0;
        try {
          var t = Qe;
          Mt(99, function () {
            for (; e < t.length; e++) {
              var r = t[e];
              do r = r(!0);
              while (r !== null);
            }
          }),
            (Qe = null);
        } catch (r) {
          throw (Qe !== null && (Qe = Qe.slice(e + 1)), lu(Ri, Ue), r);
        } finally {
          Fl = !1;
        }
      }
    }
    var sy = zt.ReactCurrentBatchConfig;
    function Be(e, t) {
      if (e && e.defaultProps) {
        (t = $({}, t)), (e = e.defaultProps);
        for (var r in e) t[r] === void 0 && (t[r] = e[r]);
        return t;
      }
      return t;
    }
    var ni = xt(null),
      oi = null,
      sr = null,
      ii = null;
    function su() {
      ii = sr = oi = null;
    }
    function uu(e) {
      var t = ni.current;
      z(ni), (e.type._context._currentValue = t);
    }
    function pd(e, t) {
      for (; e !== null; ) {
        var r = e.alternate;
        if ((e.childLanes & t) === t) {
          if (r === null || (r.childLanes & t) === t) break;
          r.childLanes |= t;
        } else (e.childLanes |= t), r !== null && (r.childLanes |= t);
        e = e.return;
      }
    }
    function pr(e, t) {
      (oi = e),
        (ii = sr = null),
        (e = e.dependencies),
        e !== null && e.firstContext !== null && ((e.lanes & t) !== 0 && (_e = !0), (e.firstContext = null));
    }
    function ke(e, t) {
      if (ii !== e && t !== !1 && t !== 0)
        if (
          ((typeof t != 'number' || t === 1073741823) && ((ii = e), (t = 1073741823)),
          (t = { context: e, observedBits: t, next: null }),
          sr === null)
        ) {
          if (oi === null) throw Error(v(308));
          (sr = t), (oi.dependencies = { lanes: 0, firstContext: t, responders: null });
        } else sr = sr.next = t;
      return e._currentValue;
    }
    var rt = !1;
    function au(e) {
      e.updateQueue = {
        baseState: e.memoizedState,
        firstBaseUpdate: null,
        lastBaseUpdate: null,
        shared: { pending: null },
        effects: null,
      };
    }
    function md(e, t) {
      (e = e.updateQueue),
        t.updateQueue === e &&
          (t.updateQueue = {
            baseState: e.baseState,
            firstBaseUpdate: e.firstBaseUpdate,
            lastBaseUpdate: e.lastBaseUpdate,
            shared: e.shared,
            effects: e.effects,
          });
    }
    function ft(e, t) {
      return { eventTime: e, lane: t, tag: 0, payload: null, callback: null, next: null };
    }
    function ct(e, t) {
      if (((e = e.updateQueue), e !== null)) {
        e = e.shared;
        var r = e.pending;
        r === null ? (t.next = t) : ((t.next = r.next), (r.next = t)), (e.pending = t);
      }
    }
    function Wf(e, t) {
      var r = e.updateQueue,
        n = e.alternate;
      if (n !== null && ((n = n.updateQueue), r === n)) {
        var o = null,
          i = null;
        if (((r = r.firstBaseUpdate), r !== null)) {
          do {
            var l = {
              eventTime: r.eventTime,
              lane: r.lane,
              tag: r.tag,
              payload: r.payload,
              callback: r.callback,
              next: null,
            };
            i === null ? (o = i = l) : (i = i.next = l), (r = r.next);
          } while (r !== null);
          i === null ? (o = i = t) : (i = i.next = t);
        } else o = i = t;
        (r = { baseState: n.baseState, firstBaseUpdate: o, lastBaseUpdate: i, shared: n.shared, effects: n.effects }),
          (e.updateQueue = r);
        return;
      }
      (e = r.lastBaseUpdate), e === null ? (r.firstBaseUpdate = t) : (e.next = t), (r.lastBaseUpdate = t);
    }
    function zn(e, t, r, n) {
      var o = e.updateQueue;
      rt = !1;
      var i = o.firstBaseUpdate,
        l = o.lastBaseUpdate,
        s = o.shared.pending;
      if (s !== null) {
        o.shared.pending = null;
        var u = s,
          a = u.next;
        (u.next = null), l === null ? (i = a) : (l.next = a), (l = u);
        var y = e.alternate;
        if (y !== null) {
          y = y.updateQueue;
          var S = y.lastBaseUpdate;
          S !== l && (S === null ? (y.firstBaseUpdate = a) : (S.next = a), (y.lastBaseUpdate = u));
        }
      }
      if (i !== null) {
        (S = o.baseState), (l = 0), (y = a = u = null);
        do {
          s = i.lane;
          var m = i.eventTime;
          if ((n & s) === s) {
            y !== null &&
              (y = y.next =
                { eventTime: m, lane: 0, tag: i.tag, payload: i.payload, callback: i.callback, next: null });
            e: {
              var w = e,
                k = i;
              switch (((s = t), (m = r), k.tag)) {
                case 1:
                  if (((w = k.payload), typeof w == 'function')) {
                    S = w.call(m, S, s);
                    break e;
                  }
                  S = w;
                  break e;
                case 3:
                  w.flags = (w.flags & -4097) | 64;
                case 0:
                  if (((w = k.payload), (s = typeof w == 'function' ? w.call(m, S, s) : w), s == null)) break e;
                  S = $({}, S, s);
                  break e;
                case 2:
                  rt = !0;
              }
            }
            i.callback !== null && ((e.flags |= 32), (s = o.effects), s === null ? (o.effects = [i]) : s.push(i));
          } else
            (m = { eventTime: m, lane: s, tag: i.tag, payload: i.payload, callback: i.callback, next: null }),
              y === null ? ((a = y = m), (u = S)) : (y = y.next = m),
              (l |= s);
          if (((i = i.next), i === null)) {
            if (((s = o.shared.pending), s === null)) break;
            (i = s.next), (s.next = null), (o.lastBaseUpdate = s), (o.shared.pending = null);
          }
        } while (1);
        y === null && (u = S),
          (o.baseState = u),
          (o.firstBaseUpdate = a),
          (o.lastBaseUpdate = y),
          (Vn |= l),
          (e.lanes = l),
          (e.memoizedState = S);
      }
    }
    function Hf(e, t, r) {
      if (((e = t.effects), (t.effects = null), e !== null))
        for (t = 0; t < e.length; t++) {
          var n = e[t],
            o = n.callback;
          if (o !== null) {
            if (((n.callback = null), (n = r), typeof o != 'function')) throw Error(v(191, o));
            o.call(n);
          }
        }
    }
    var hd = new gi.Component().refs;
    function li(e, t, r, n) {
      (t = e.memoizedState),
        (r = r(n, t)),
        (r = r == null ? t : $({}, t, r)),
        (e.memoizedState = r),
        e.lanes === 0 && (e.updateQueue.baseState = r);
    }
    var Ni = {
      isMounted: function (e) {
        return (e = e._reactInternals) ? $t(e) === e : !1;
      },
      enqueueSetState: function (e, t, r) {
        e = e._reactInternals;
        var n = he(),
          o = dt(e),
          i = ft(n, o);
        (i.payload = t), r != null && (i.callback = r), ct(e, i), pt(e, o, n);
      },
      enqueueReplaceState: function (e, t, r) {
        e = e._reactInternals;
        var n = he(),
          o = dt(e),
          i = ft(n, o);
        (i.tag = 1), (i.payload = t), r != null && (i.callback = r), ct(e, i), pt(e, o, n);
      },
      enqueueForceUpdate: function (e, t) {
        e = e._reactInternals;
        var r = he(),
          n = dt(e),
          o = ft(r, n);
        (o.tag = 2), t != null && (o.callback = t), ct(e, o), pt(e, n, r);
      },
    };
    function Vf(e, t, r, n, o, i, l) {
      return (
        (e = e.stateNode),
        typeof e.shouldComponentUpdate == 'function'
          ? e.shouldComponentUpdate(n, i, l)
          : t.prototype && t.prototype.isPureReactComponent
          ? !Mn(r, n) || !Mn(o, i)
          : !0
      );
    }
    function yd(e, t, r) {
      var n = !1,
        o = gt,
        i = t.contextType;
      return (
        typeof i == 'object' && i !== null
          ? (i = ke(i))
          : ((o = pe(t) ? Lt : le.current), (n = t.contextTypes), (i = (n = n != null) ? vr(e, o) : gt)),
        (t = new t(r, i)),
        (e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null),
        (t.updater = Ni),
        (e.stateNode = t),
        (t._reactInternals = e),
        n &&
          ((e = e.stateNode),
          (e.__reactInternalMemoizedUnmaskedChildContext = o),
          (e.__reactInternalMemoizedMaskedChildContext = i)),
        t
      );
    }
    function Gf(e, t, r, n) {
      (e = t.state),
        typeof t.componentWillReceiveProps == 'function' && t.componentWillReceiveProps(r, n),
        typeof t.UNSAFE_componentWillReceiveProps == 'function' && t.UNSAFE_componentWillReceiveProps(r, n),
        t.state !== e && Ni.enqueueReplaceState(t, t.state, null);
    }
    function gs(e, t, r, n) {
      var o = e.stateNode;
      (o.props = r), (o.state = e.memoizedState), (o.refs = hd), au(e);
      var i = t.contextType;
      typeof i == 'object' && i !== null
        ? (o.context = ke(i))
        : ((i = pe(t) ? Lt : le.current), (o.context = vr(e, i))),
        zn(e, r, o, n),
        (o.state = e.memoizedState),
        (i = t.getDerivedStateFromProps),
        typeof i == 'function' && (li(e, t, i, r), (o.state = e.memoizedState)),
        typeof t.getDerivedStateFromProps == 'function' ||
          typeof o.getSnapshotBeforeUpdate == 'function' ||
          (typeof o.UNSAFE_componentWillMount != 'function' && typeof o.componentWillMount != 'function') ||
          ((t = o.state),
          typeof o.componentWillMount == 'function' && o.componentWillMount(),
          typeof o.UNSAFE_componentWillMount == 'function' && o.UNSAFE_componentWillMount(),
          t !== o.state && Ni.enqueueReplaceState(o, o.state, null),
          zn(e, r, o, n),
          (o.state = e.memoizedState)),
        typeof o.componentDidMount == 'function' && (e.flags |= 4);
    }
    var Oo = Array.isArray;
    function nn(e, t, r) {
      if (((e = r.ref), e !== null && typeof e != 'function' && typeof e != 'object')) {
        if (r._owner) {
          if (((r = r._owner), r)) {
            if (r.tag !== 1) throw Error(v(309));
            var n = r.stateNode;
          }
          if (!n) throw Error(v(147, e));
          var o = '' + e;
          return t !== null && t.ref !== null && typeof t.ref == 'function' && t.ref._stringRef === o
            ? t.ref
            : ((t = function (i) {
                var l = n.refs;
                l === hd && (l = n.refs = {}), i === null ? delete l[o] : (l[o] = i);
              }),
              (t._stringRef = o),
              t);
        }
        if (typeof e != 'string') throw Error(v(284));
        if (!r._owner) throw Error(v(290, e));
      }
      return e;
    }
    function Lo(e, t) {
      if (e.type !== 'textarea')
        throw Error(
          v(
            31,
            Object.prototype.toString.call(t) === '[object Object]'
              ? 'object with keys {' + Object.keys(t).join(', ') + '}'
              : t,
          ),
        );
    }
    function gd(e) {
      function t(d, f) {
        if (e) {
          var c = d.lastEffect;
          c !== null ? ((c.nextEffect = f), (d.lastEffect = f)) : (d.firstEffect = d.lastEffect = f),
            (f.nextEffect = null),
            (f.flags = 8);
        }
      }
      function r(d, f) {
        if (!e) return null;
        for (; f !== null; ) t(d, f), (f = f.sibling);
        return null;
      }
      function n(d, f) {
        for (d = new Map(); f !== null; ) f.key !== null ? d.set(f.key, f) : d.set(f.index, f), (f = f.sibling);
        return d;
      }
      function o(d, f) {
        return (d = vt(d, f)), (d.index = 0), (d.sibling = null), d;
      }
      function i(d, f, c) {
        return (
          (d.index = c),
          e ? ((c = d.alternate), c !== null ? ((c = c.index), c < f ? ((d.flags = 2), f) : c) : ((d.flags = 2), f)) : f
        );
      }
      function l(d) {
        return e && d.alternate === null && (d.flags = 2), d;
      }
      function s(d, f, c, h) {
        return f === null || f.tag !== 6
          ? ((f = Gl(c, d.mode, h)), (f.return = d), f)
          : ((f = o(f, c)), (f.return = d), f);
      }
      function u(d, f, c, h) {
        return f !== null && f.elementType === c.type
          ? ((h = o(f, c.props)), (h.ref = nn(d, f, c)), (h.return = d), h)
          : ((h = Qo(c.type, c.key, c.props, null, d.mode, h)), (h.ref = nn(d, f, c)), (h.return = d), h);
      }
      function a(d, f, c, h) {
        return f === null ||
          f.tag !== 4 ||
          f.stateNode.containerInfo !== c.containerInfo ||
          f.stateNode.implementation !== c.implementation
          ? ((f = Ql(c, d.mode, h)), (f.return = d), f)
          : ((f = o(f, c.children || [])), (f.return = d), f);
      }
      function y(d, f, c, h, p) {
        return f === null || f.tag !== 7
          ? ((f = gr(c, d.mode, h, p)), (f.return = d), f)
          : ((f = o(f, c)), (f.return = d), f);
      }
      function S(d, f, c) {
        if (typeof f == 'string' || typeof f == 'number') return (f = Gl('' + f, d.mode, c)), (f.return = d), f;
        if (typeof f == 'object' && f !== null) {
          switch (f.$$typeof) {
            case cn:
              return (c = Qo(f.type, f.key, f.props, null, d.mode, c)), (c.ref = nn(d, null, f)), (c.return = d), c;
            case Tt:
              return (f = Ql(f, d.mode, c)), (f.return = d), f;
          }
          if (Oo(f) || Zr(f)) return (f = gr(f, d.mode, c, null)), (f.return = d), f;
          Lo(d, f);
        }
        return null;
      }
      function m(d, f, c, h) {
        var p = f !== null ? f.key : null;
        if (typeof c == 'string' || typeof c == 'number') return p !== null ? null : s(d, f, '' + c, h);
        if (typeof c == 'object' && c !== null) {
          switch (c.$$typeof) {
            case cn:
              return c.key === p ? (c.type === nt ? y(d, f, c.props.children, h, p) : u(d, f, c, h)) : null;
            case Tt:
              return c.key === p ? a(d, f, c, h) : null;
          }
          if (Oo(c) || Zr(c)) return p !== null ? null : y(d, f, c, h, null);
          Lo(d, c);
        }
        return null;
      }
      function w(d, f, c, h, p) {
        if (typeof h == 'string' || typeof h == 'number') return (d = d.get(c) || null), s(f, d, '' + h, p);
        if (typeof h == 'object' && h !== null) {
          switch (h.$$typeof) {
            case cn:
              return (
                (d = d.get(h.key === null ? c : h.key) || null),
                h.type === nt ? y(f, d, h.props.children, p, h.key) : u(f, d, h, p)
              );
            case Tt:
              return (d = d.get(h.key === null ? c : h.key) || null), a(f, d, h, p);
          }
          if (Oo(h) || Zr(h)) return (d = d.get(c) || null), y(f, d, h, p, null);
          Lo(f, h);
        }
        return null;
      }
      function k(d, f, c, h) {
        for (var p = null, N = null, C = f, P = (f = 0), _ = null; C !== null && P < c.length; P++) {
          C.index > P ? ((_ = C), (C = null)) : (_ = C.sibling);
          var B = m(d, C, c[P], h);
          if (B === null) {
            C === null && (C = _);
            break;
          }
          e && C && B.alternate === null && t(d, C),
            (f = i(B, f, P)),
            N === null ? (p = B) : (N.sibling = B),
            (N = B),
            (C = _);
        }
        if (P === c.length) return r(d, C), p;
        if (C === null) {
          for (; P < c.length; P++)
            (C = S(d, c[P], h)), C !== null && ((f = i(C, f, P)), N === null ? (p = C) : (N.sibling = C), (N = C));
          return p;
        }
        for (C = n(d, C); P < c.length; P++)
          (_ = w(C, d, P, c[P], h)),
            _ !== null &&
              (e && _.alternate !== null && C.delete(_.key === null ? P : _.key),
              (f = i(_, f, P)),
              N === null ? (p = _) : (N.sibling = _),
              (N = _));
        return (
          e &&
            C.forEach(function (et) {
              return t(d, et);
            }),
          p
        );
      }
      function x(d, f, c, h) {
        var p = Zr(c);
        if (typeof p != 'function') throw Error(v(150));
        if (((c = p.call(c)), c == null)) throw Error(v(151));
        for (var N = (p = null), C = f, P = (f = 0), _ = null, B = c.next(); C !== null && !B.done; P++, B = c.next()) {
          C.index > P ? ((_ = C), (C = null)) : (_ = C.sibling);
          var et = m(d, C, B.value, h);
          if (et === null) {
            C === null && (C = _);
            break;
          }
          e && C && et.alternate === null && t(d, C),
            (f = i(et, f, P)),
            N === null ? (p = et) : (N.sibling = et),
            (N = et),
            (C = _);
        }
        if (B.done) return r(d, C), p;
        if (C === null) {
          for (; !B.done; P++, B = c.next())
            (B = S(d, B.value, h)), B !== null && ((f = i(B, f, P)), N === null ? (p = B) : (N.sibling = B), (N = B));
          return p;
        }
        for (C = n(d, C); !B.done; P++, B = c.next())
          (B = w(C, d, P, B.value, h)),
            B !== null &&
              (e && B.alternate !== null && C.delete(B.key === null ? P : B.key),
              (f = i(B, f, P)),
              N === null ? (p = B) : (N.sibling = B),
              (N = B));
        return (
          e &&
            C.forEach(function (Pm) {
              return t(d, Pm);
            }),
          p
        );
      }
      return function (d, f, c, h) {
        var p = typeof c == 'object' && c !== null && c.type === nt && c.key === null;
        p && (c = c.props.children);
        var N = typeof c == 'object' && c !== null;
        if (N)
          switch (c.$$typeof) {
            case cn:
              e: {
                for (N = c.key, p = f; p !== null; ) {
                  if (p.key === N) {
                    switch (p.tag) {
                      case 7:
                        if (c.type === nt) {
                          r(d, p.sibling), (f = o(p, c.props.children)), (f.return = d), (d = f);
                          break e;
                        }
                        break;
                      default:
                        if (p.elementType === c.type) {
                          r(d, p.sibling), (f = o(p, c.props)), (f.ref = nn(d, p, c)), (f.return = d), (d = f);
                          break e;
                        }
                    }
                    r(d, p);
                    break;
                  } else t(d, p);
                  p = p.sibling;
                }
                c.type === nt
                  ? ((f = gr(c.props.children, d.mode, h, c.key)), (f.return = d), (d = f))
                  : ((h = Qo(c.type, c.key, c.props, null, d.mode, h)), (h.ref = nn(d, f, c)), (h.return = d), (d = h));
              }
              return l(d);
            case Tt:
              e: {
                for (p = c.key; f !== null; ) {
                  if (f.key === p)
                    if (
                      f.tag === 4 &&
                      f.stateNode.containerInfo === c.containerInfo &&
                      f.stateNode.implementation === c.implementation
                    ) {
                      r(d, f.sibling), (f = o(f, c.children || [])), (f.return = d), (d = f);
                      break e;
                    } else {
                      r(d, f);
                      break;
                    }
                  else t(d, f);
                  f = f.sibling;
                }
                (f = Ql(c, d.mode, h)), (f.return = d), (d = f);
              }
              return l(d);
          }
        if (typeof c == 'string' || typeof c == 'number')
          return (
            (c = '' + c),
            f !== null && f.tag === 6
              ? (r(d, f.sibling), (f = o(f, c)), (f.return = d), (d = f))
              : (r(d, f), (f = Gl(c, d.mode, h)), (f.return = d), (d = f)),
            l(d)
          );
        if (Oo(c)) return k(d, f, c, h);
        if (Zr(c)) return x(d, f, c, h);
        if ((N && Lo(d, c), typeof c > 'u' && !p))
          switch (d.tag) {
            case 1:
            case 22:
            case 0:
            case 11:
            case 15:
              throw Error(v(152, ur(d.type) || 'Component'));
          }
        return r(d, f);
      };
    }
    var si = gd(!0),
      Sd = gd(!1),
      Hn = {},
      Ae = xt(Hn),
      $n = xt(Hn),
      An = xt(Hn);
    function It(e) {
      if (e === Hn) throw Error(v(174));
      return e;
    }
    function Ss(e, t) {
      switch ((F(An, t), F($n, e), F(Ae, Hn), (e = t.nodeType), e)) {
        case 9:
        case 11:
          t = (t = t.documentElement) ? t.namespaceURI : rs(null, '');
          break;
        default:
          (e = e === 8 ? t.parentNode : t), (t = e.namespaceURI || null), (e = e.tagName), (t = rs(t, e));
      }
      z(Ae), F(Ae, t);
    }
    function wr() {
      z(Ae), z($n), z(An);
    }
    function Qf(e) {
      It(An.current);
      var t = It(Ae.current),
        r = rs(t, e.type);
      t !== r && (F($n, e), F(Ae, r));
    }
    function fu(e) {
      $n.current === e && (z(Ae), z($n));
    }
    var A = xt(0);
    function ui(e) {
      for (var t = e; t !== null; ) {
        if (t.tag === 13) {
          var r = t.memoizedState;
          if (r !== null && ((r = r.dehydrated), r === null || r.data === '$?' || r.data === '$!')) return t;
        } else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
          if ((t.flags & 64) !== 0) return t;
        } else if (t.child !== null) {
          (t.child.return = t), (t = t.child);
          continue;
        }
        if (t === e) break;
        for (; t.sibling === null; ) {
          if (t.return === null || t.return === e) return null;
          t = t.return;
        }
        (t.sibling.return = t.return), (t = t.sibling);
      }
      return null;
    }
    var Ke = null,
      lt = null,
      Fe = !1;
    function vd(e, t) {
      var r = we(5, null, null, 0);
      (r.elementType = 'DELETED'),
        (r.type = 'DELETED'),
        (r.stateNode = t),
        (r.return = e),
        (r.flags = 8),
        e.lastEffect !== null
          ? ((e.lastEffect.nextEffect = r), (e.lastEffect = r))
          : (e.firstEffect = e.lastEffect = r);
    }
    function Yf(e, t) {
      switch (e.tag) {
        case 5:
          var r = e.type;
          return (
            (t = t.nodeType !== 1 || r.toLowerCase() !== t.nodeName.toLowerCase() ? null : t),
            t !== null ? ((e.stateNode = t), !0) : !1
          );
        case 6:
          return (t = e.pendingProps === '' || t.nodeType !== 3 ? null : t), t !== null ? ((e.stateNode = t), !0) : !1;
        case 13:
          return !1;
        default:
          return !1;
      }
    }
    function vs(e) {
      if (Fe) {
        var t = lt;
        if (t) {
          var r = t;
          if (!Yf(e, t)) {
            if (((t = dr(r.nextSibling)), !t || !Yf(e, t))) {
              (e.flags = (e.flags & -1025) | 2), (Fe = !1), (Ke = e);
              return;
            }
            vd(Ke, r);
          }
          (Ke = e), (lt = dr(t.firstChild));
        } else (e.flags = (e.flags & -1025) | 2), (Fe = !1), (Ke = e);
      }
    }
    function Kf(e) {
      for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return;
      Ke = e;
    }
    function Mo(e) {
      if (e !== Ke) return !1;
      if (!Fe) return Kf(e), (Fe = !0), !1;
      var t = e.type;
      if (e.tag !== 5 || (t !== 'head' && t !== 'body' && !ps(t, e.memoizedProps)))
        for (t = lt; t; ) vd(e, t), (t = dr(t.nextSibling));
      if ((Kf(e), e.tag === 13)) {
        if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e)) throw Error(v(317));
        e: {
          for (e = e.nextSibling, t = 0; e; ) {
            if (e.nodeType === 8) {
              var r = e.data;
              if (r === '/$') {
                if (t === 0) {
                  lt = dr(e.nextSibling);
                  break e;
                }
                t--;
              } else (r !== '$' && r !== '$!' && r !== '$?') || t++;
            }
            e = e.nextSibling;
          }
          lt = null;
        }
      } else lt = Ke ? dr(e.stateNode.nextSibling) : null;
      return !0;
    }
    function Ul() {
      (lt = Ke = null), (Fe = !1);
    }
    var mr = [];
    function cu() {
      for (var e = 0; e < mr.length; e++) mr[e]._workInProgressVersionPrimary = null;
      mr.length = 0;
    }
    var kn = zt.ReactCurrentDispatcher,
      Ce = zt.ReactCurrentBatchConfig,
      Fn = 0,
      W = null,
      ne = null,
      Z = null,
      ai = !1,
      En = !1;
    function fe() {
      throw Error(v(321));
    }
    function du(e, t) {
      if (t === null) return !1;
      for (var r = 0; r < t.length && r < e.length; r++) if (!xe(e[r], t[r])) return !1;
      return !0;
    }
    function pu(e, t, r, n, o, i) {
      if (
        ((Fn = i),
        (W = t),
        (t.memoizedState = null),
        (t.updateQueue = null),
        (t.lanes = 0),
        (kn.current = e === null || e.memoizedState === null ? ay : fy),
        (e = r(n, o)),
        En)
      ) {
        i = 0;
        do {
          if (((En = !1), !(25 > i))) throw Error(v(301));
          (i += 1), (Z = ne = null), (t.updateQueue = null), (kn.current = cy), (e = r(n, o));
        } while (En);
      }
      if (((kn.current = pi), (t = ne !== null && ne.next !== null), (Fn = 0), (Z = ne = W = null), (ai = !1), t))
        throw Error(v(300));
      return e;
    }
    function bt() {
      var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
      return Z === null ? (W.memoizedState = Z = e) : (Z = Z.next = e), Z;
    }
    function At() {
      if (ne === null) {
        var e = W.alternate;
        e = e !== null ? e.memoizedState : null;
      } else e = ne.next;
      var t = Z === null ? W.memoizedState : Z.next;
      if (t !== null) (Z = t), (ne = e);
      else {
        if (e === null) throw Error(v(310));
        (ne = e),
          (e = {
            memoizedState: ne.memoizedState,
            baseState: ne.baseState,
            baseQueue: ne.baseQueue,
            queue: ne.queue,
            next: null,
          }),
          Z === null ? (W.memoizedState = Z = e) : (Z = Z.next = e);
      }
      return Z;
    }
    function ze(e, t) {
      return typeof t == 'function' ? t(e) : t;
    }
    function on(e) {
      var t = At(),
        r = t.queue;
      if (r === null) throw Error(v(311));
      r.lastRenderedReducer = e;
      var n = ne,
        o = n.baseQueue,
        i = r.pending;
      if (i !== null) {
        if (o !== null) {
          var l = o.next;
          (o.next = i.next), (i.next = l);
        }
        (n.baseQueue = o = i), (r.pending = null);
      }
      if (o !== null) {
        (o = o.next), (n = n.baseState);
        var s = (l = i = null),
          u = o;
        do {
          var a = u.lane;
          if ((Fn & a) === a)
            s !== null &&
              (s = s.next =
                { lane: 0, action: u.action, eagerReducer: u.eagerReducer, eagerState: u.eagerState, next: null }),
              (n = u.eagerReducer === e ? u.eagerState : e(n, u.action));
          else {
            var y = { lane: a, action: u.action, eagerReducer: u.eagerReducer, eagerState: u.eagerState, next: null };
            s === null ? ((l = s = y), (i = n)) : (s = s.next = y), (W.lanes |= a), (Vn |= a);
          }
          u = u.next;
        } while (u !== null && u !== o);
        s === null ? (i = n) : (s.next = l),
          xe(n, t.memoizedState) || (_e = !0),
          (t.memoizedState = n),
          (t.baseState = i),
          (t.baseQueue = s),
          (r.lastRenderedState = n);
      }
      return [t.memoizedState, r.dispatch];
    }
    function ln(e) {
      var t = At(),
        r = t.queue;
      if (r === null) throw Error(v(311));
      r.lastRenderedReducer = e;
      var n = r.dispatch,
        o = r.pending,
        i = t.memoizedState;
      if (o !== null) {
        r.pending = null;
        var l = (o = o.next);
        do (i = e(i, l.action)), (l = l.next);
        while (l !== o);
        xe(i, t.memoizedState) || (_e = !0),
          (t.memoizedState = i),
          t.baseQueue === null && (t.baseState = i),
          (r.lastRenderedState = i);
      }
      return [i, n];
    }
    function Xf(e, t, r) {
      var n = t._getVersion;
      n = n(t._source);
      var o = t._workInProgressVersionPrimary;
      if (
        (o !== null
          ? (e = o === n)
          : ((e = e.mutableReadLanes), (e = (Fn & e) === e) && ((t._workInProgressVersionPrimary = n), mr.push(t))),
        e)
      )
        return r(t._source);
      throw (mr.push(t), Error(v(350)));
    }
    function xd(e, t, r, n) {
      var o = se;
      if (o === null) throw Error(v(349));
      var i = t._getVersion,
        l = i(t._source),
        s = kn.current,
        u = s.useState(function () {
          return Xf(o, t, r);
        }),
        a = u[1],
        y = u[0];
      u = Z;
      var S = e.memoizedState,
        m = S.refs,
        w = m.getSnapshot,
        k = S.source;
      S = S.subscribe;
      var x = W;
      return (
        (e.memoizedState = { refs: m, source: t, subscribe: n }),
        s.useEffect(
          function () {
            (m.getSnapshot = r), (m.setSnapshot = a);
            var d = i(t._source);
            if (!xe(l, d)) {
              (d = r(t._source)),
                xe(y, d) || (a(d), (d = dt(x)), (o.mutableReadLanes |= d & o.pendingLanes)),
                (d = o.mutableReadLanes),
                (o.entangledLanes |= d);
              for (var f = o.entanglements, c = d; 0 < c; ) {
                var h = 31 - yt(c),
                  p = 1 << h;
                (f[h] |= d), (c &= ~p);
              }
            }
          },
          [r, t, n],
        ),
        s.useEffect(
          function () {
            return n(t._source, function () {
              var d = m.getSnapshot,
                f = m.setSnapshot;
              try {
                f(d(t._source));
                var c = dt(x);
                o.mutableReadLanes |= c & o.pendingLanes;
              } catch (h) {
                f(function () {
                  throw h;
                });
              }
            });
          },
          [t, n],
        ),
        (xe(w, r) && xe(k, t) && xe(S, n)) ||
          ((e = { pending: null, dispatch: null, lastRenderedReducer: ze, lastRenderedState: y }),
          (e.dispatch = a = yu.bind(null, W, e)),
          (u.queue = e),
          (u.baseQueue = null),
          (y = Xf(o, t, r)),
          (u.memoizedState = u.baseState = y)),
        y
      );
    }
    function wd(e, t, r) {
      var n = At();
      return xd(n, e, t, r);
    }
    function sn(e) {
      var t = bt();
      return (
        typeof e == 'function' && (e = e()),
        (t.memoizedState = t.baseState = e),
        (e = t.queue = { pending: null, dispatch: null, lastRenderedReducer: ze, lastRenderedState: e }),
        (e = e.dispatch = yu.bind(null, W, e)),
        [t.memoizedState, e]
      );
    }
    function fi(e, t, r, n) {
      return (
        (e = { tag: e, create: t, destroy: r, deps: n, next: null }),
        (t = W.updateQueue),
        t === null
          ? ((t = { lastEffect: null }), (W.updateQueue = t), (t.lastEffect = e.next = e))
          : ((r = t.lastEffect),
            r === null ? (t.lastEffect = e.next = e) : ((n = r.next), (r.next = e), (e.next = n), (t.lastEffect = e))),
        e
      );
    }
    function qf(e) {
      var t = bt();
      return (e = { current: e }), (t.memoizedState = e);
    }
    function ci() {
      return At().memoizedState;
    }
    function xs(e, t, r, n) {
      var o = bt();
      (W.flags |= e), (o.memoizedState = fi(1 | t, r, void 0, n === void 0 ? null : n));
    }
    function mu(e, t, r, n) {
      var o = At();
      n = n === void 0 ? null : n;
      var i = void 0;
      if (ne !== null) {
        var l = ne.memoizedState;
        if (((i = l.destroy), n !== null && du(n, l.deps))) {
          fi(t, r, i, n);
          return;
        }
      }
      (W.flags |= e), (o.memoizedState = fi(1 | t, r, i, n));
    }
    function Zf(e, t) {
      return xs(516, 4, e, t);
    }
    function di(e, t) {
      return mu(516, 4, e, t);
    }
    function Cd(e, t) {
      return mu(4, 2, e, t);
    }
    function kd(e, t) {
      if (typeof t == 'function')
        return (
          (e = e()),
          t(e),
          function () {
            t(null);
          }
        );
      if (t != null)
        return (
          (e = e()),
          (t.current = e),
          function () {
            t.current = null;
          }
        );
    }
    function Ed(e, t, r) {
      return (r = r != null ? r.concat([e]) : null), mu(4, 2, kd.bind(null, t, e), r);
    }
    function hu() {}
    function Pd(e, t) {
      var r = At();
      t = t === void 0 ? null : t;
      var n = r.memoizedState;
      return n !== null && t !== null && du(t, n[1]) ? n[0] : ((r.memoizedState = [e, t]), e);
    }
    function Rd(e, t) {
      var r = At();
      t = t === void 0 ? null : t;
      var n = r.memoizedState;
      return n !== null && t !== null && du(t, n[1]) ? n[0] : ((e = e()), (r.memoizedState = [e, t]), e);
    }
    function uy(e, t) {
      var r = xr();
      Mt(98 > r ? 98 : r, function () {
        e(!0);
      }),
        Mt(97 < r ? 97 : r, function () {
          var n = Ce.transition;
          Ce.transition = 1;
          try {
            e(!1), t();
          } finally {
            Ce.transition = n;
          }
        });
    }
    function yu(e, t, r) {
      var n = he(),
        o = dt(e),
        i = { lane: o, action: r, eagerReducer: null, eagerState: null, next: null },
        l = t.pending;
      if (
        (l === null ? (i.next = i) : ((i.next = l.next), (l.next = i)),
        (t.pending = i),
        (l = e.alternate),
        e === W || (l !== null && l === W))
      )
        En = ai = !0;
      else {
        if (e.lanes === 0 && (l === null || l.lanes === 0) && ((l = t.lastRenderedReducer), l !== null))
          try {
            var s = t.lastRenderedState,
              u = l(s, r);
            if (((i.eagerReducer = l), (i.eagerState = u), xe(u, s))) return;
          } catch {
          } finally {
          }
        pt(e, o, n);
      }
    }
    var pi = {
        readContext: ke,
        useCallback: fe,
        useContext: fe,
        useEffect: fe,
        useImperativeHandle: fe,
        useLayoutEffect: fe,
        useMemo: fe,
        useReducer: fe,
        useRef: fe,
        useState: fe,
        useDebugValue: fe,
        useDeferredValue: fe,
        useTransition: fe,
        useMutableSource: fe,
        useOpaqueIdentifier: fe,
        unstable_isNewReconciler: !1,
      },
      ay = {
        readContext: ke,
        useCallback: function (e, t) {
          return (bt().memoizedState = [e, t === void 0 ? null : t]), e;
        },
        useContext: ke,
        useEffect: Zf,
        useImperativeHandle: function (e, t, r) {
          return (r = r != null ? r.concat([e]) : null), xs(4, 2, kd.bind(null, t, e), r);
        },
        useLayoutEffect: function (e, t) {
          return xs(4, 2, e, t);
        },
        useMemo: function (e, t) {
          var r = bt();
          return (t = t === void 0 ? null : t), (e = e()), (r.memoizedState = [e, t]), e;
        },
        useReducer: function (e, t, r) {
          var n = bt();
          return (
            (t = r !== void 0 ? r(t) : t),
            (n.memoizedState = n.baseState = t),
            (e = n.queue = { pending: null, dispatch: null, lastRenderedReducer: e, lastRenderedState: t }),
            (e = e.dispatch = yu.bind(null, W, e)),
            [n.memoizedState, e]
          );
        },
        useRef: qf,
        useState: sn,
        useDebugValue: hu,
        useDeferredValue: function (e) {
          var t = sn(e),
            r = t[0],
            n = t[1];
          return (
            Zf(
              function () {
                var o = Ce.transition;
                Ce.transition = 1;
                try {
                  n(e);
                } finally {
                  Ce.transition = o;
                }
              },
              [e],
            ),
            r
          );
        },
        useTransition: function () {
          var e = sn(!1),
            t = e[0];
          return (e = uy.bind(null, e[1])), qf(e), [e, t];
        },
        useMutableSource: function (e, t, r) {
          var n = bt();
          return (
            (n.memoizedState = { refs: { getSnapshot: t, setSnapshot: null }, source: e, subscribe: r }), xd(n, e, t, r)
          );
        },
        useOpaqueIdentifier: function () {
          if (Fe) {
            var e = !1,
              t = ry(function () {
                throw (e || ((e = !0), r('r:' + ($l++).toString(36))), Error(v(355)));
              }),
              r = sn(t)[1];
            return (
              (W.mode & 2) === 0 &&
                ((W.flags |= 516),
                fi(
                  5,
                  function () {
                    r('r:' + ($l++).toString(36));
                  },
                  void 0,
                  null,
                )),
              t
            );
          }
          return (t = 'r:' + ($l++).toString(36)), sn(t), t;
        },
        unstable_isNewReconciler: !1,
      },
      fy = {
        readContext: ke,
        useCallback: Pd,
        useContext: ke,
        useEffect: di,
        useImperativeHandle: Ed,
        useLayoutEffect: Cd,
        useMemo: Rd,
        useReducer: on,
        useRef: ci,
        useState: function () {
          return on(ze);
        },
        useDebugValue: hu,
        useDeferredValue: function (e) {
          var t = on(ze),
            r = t[0],
            n = t[1];
          return (
            di(
              function () {
                var o = Ce.transition;
                Ce.transition = 1;
                try {
                  n(e);
                } finally {
                  Ce.transition = o;
                }
              },
              [e],
            ),
            r
          );
        },
        useTransition: function () {
          var e = on(ze)[0];
          return [ci().current, e];
        },
        useMutableSource: wd,
        useOpaqueIdentifier: function () {
          return on(ze)[0];
        },
        unstable_isNewReconciler: !1,
      },
      cy = {
        readContext: ke,
        useCallback: Pd,
        useContext: ke,
        useEffect: di,
        useImperativeHandle: Ed,
        useLayoutEffect: Cd,
        useMemo: Rd,
        useReducer: ln,
        useRef: ci,
        useState: function () {
          return ln(ze);
        },
        useDebugValue: hu,
        useDeferredValue: function (e) {
          var t = ln(ze),
            r = t[0],
            n = t[1];
          return (
            di(
              function () {
                var o = Ce.transition;
                Ce.transition = 1;
                try {
                  n(e);
                } finally {
                  Ce.transition = o;
                }
              },
              [e],
            ),
            r
          );
        },
        useTransition: function () {
          var e = ln(ze)[0];
          return [ci().current, e];
        },
        useMutableSource: wd,
        useOpaqueIdentifier: function () {
          return ln(ze)[0];
        },
        unstable_isNewReconciler: !1,
      },
      dy = zt.ReactCurrentOwner,
      _e = !1;
    function ce(e, t, r, n) {
      t.child = e === null ? Sd(t, null, r, n) : si(t, e.child, r, n);
    }
    function Jf(e, t, r, n, o) {
      r = r.render;
      var i = t.ref;
      return (
        pr(t, o),
        (n = pu(e, t, r, n, i, o)),
        e !== null && !_e
          ? ((t.updateQueue = e.updateQueue), (t.flags &= -517), (e.lanes &= ~o), Xe(e, t, o))
          : ((t.flags |= 1), ce(e, t, n, o), t.child)
      );
    }
    function ec(e, t, r, n, o, i) {
      if (e === null) {
        var l = r.type;
        return typeof l == 'function' &&
          !Cu(l) &&
          l.defaultProps === void 0 &&
          r.compare === null &&
          r.defaultProps === void 0
          ? ((t.tag = 15), (t.type = l), Nd(e, t, l, n, o, i))
          : ((e = Qo(r.type, null, n, t, t.mode, i)), (e.ref = t.ref), (e.return = t), (t.child = e));
      }
      return (
        (l = e.child),
        (o & i) === 0 && ((o = l.memoizedProps), (r = r.compare), (r = r !== null ? r : Mn), r(o, n) && e.ref === t.ref)
          ? Xe(e, t, i)
          : ((t.flags |= 1), (e = vt(l, n)), (e.ref = t.ref), (e.return = t), (t.child = e))
      );
    }
    function Nd(e, t, r, n, o, i) {
      if (e !== null && Mn(e.memoizedProps, n) && e.ref === t.ref)
        if (((_e = !1), (i & o) !== 0)) (e.flags & 16384) !== 0 && (_e = !0);
        else return (t.lanes = e.lanes), Xe(e, t, i);
      return ws(e, t, r, n, i);
    }
    function Wl(e, t, r) {
      var n = t.pendingProps,
        o = n.children,
        i = e !== null ? e.memoizedState : null;
      if (n.mode === 'hidden' || n.mode === 'unstable-defer-without-hiding')
        if ((t.mode & 4) === 0) (t.memoizedState = { baseLanes: 0 }), jo(t, r);
        else if ((r & 1073741824) !== 0) (t.memoizedState = { baseLanes: 0 }), jo(t, i !== null ? i.baseLanes : r);
        else
          return (
            (e = i !== null ? i.baseLanes | r : r),
            (t.lanes = t.childLanes = 1073741824),
            (t.memoizedState = { baseLanes: e }),
            jo(t, e),
            null
          );
      else i !== null ? ((n = i.baseLanes | r), (t.memoizedState = null)) : (n = r), jo(t, n);
      return ce(e, t, o, r), t.child;
    }
    function Td(e, t) {
      var r = t.ref;
      ((e === null && r !== null) || (e !== null && e.ref !== r)) && (t.flags |= 128);
    }
    function ws(e, t, r, n, o) {
      var i = pe(r) ? Lt : le.current;
      return (
        (i = vr(t, i)),
        pr(t, o),
        (r = pu(e, t, r, n, i, o)),
        e !== null && !_e
          ? ((t.updateQueue = e.updateQueue), (t.flags &= -517), (e.lanes &= ~o), Xe(e, t, o))
          : ((t.flags |= 1), ce(e, t, r, o), t.child)
      );
    }
    function tc(e, t, r, n, o) {
      if (pe(r)) {
        var i = !0;
        Uo(t);
      } else i = !1;
      if ((pr(t, o), t.stateNode === null))
        e !== null && ((e.alternate = null), (t.alternate = null), (t.flags |= 2)),
          yd(t, r, n),
          gs(t, r, n, o),
          (n = !0);
      else if (e === null) {
        var l = t.stateNode,
          s = t.memoizedProps;
        l.props = s;
        var u = l.context,
          a = r.contextType;
        typeof a == 'object' && a !== null ? (a = ke(a)) : ((a = pe(r) ? Lt : le.current), (a = vr(t, a)));
        var y = r.getDerivedStateFromProps,
          S = typeof y == 'function' || typeof l.getSnapshotBeforeUpdate == 'function';
        S ||
          (typeof l.UNSAFE_componentWillReceiveProps != 'function' &&
            typeof l.componentWillReceiveProps != 'function') ||
          ((s !== n || u !== a) && Gf(t, l, n, a)),
          (rt = !1);
        var m = t.memoizedState;
        (l.state = m),
          zn(t, n, l, o),
          (u = t.memoizedState),
          s !== n || m !== u || de.current || rt
            ? (typeof y == 'function' && (li(t, r, y, n), (u = t.memoizedState)),
              (s = rt || Vf(t, r, s, n, m, u, a))
                ? (S ||
                    (typeof l.UNSAFE_componentWillMount != 'function' && typeof l.componentWillMount != 'function') ||
                    (typeof l.componentWillMount == 'function' && l.componentWillMount(),
                    typeof l.UNSAFE_componentWillMount == 'function' && l.UNSAFE_componentWillMount()),
                  typeof l.componentDidMount == 'function' && (t.flags |= 4))
                : (typeof l.componentDidMount == 'function' && (t.flags |= 4),
                  (t.memoizedProps = n),
                  (t.memoizedState = u)),
              (l.props = n),
              (l.state = u),
              (l.context = a),
              (n = s))
            : (typeof l.componentDidMount == 'function' && (t.flags |= 4), (n = !1));
      } else {
        (l = t.stateNode),
          md(e, t),
          (s = t.memoizedProps),
          (a = t.type === t.elementType ? s : Be(t.type, s)),
          (l.props = a),
          (S = t.pendingProps),
          (m = l.context),
          (u = r.contextType),
          typeof u == 'object' && u !== null ? (u = ke(u)) : ((u = pe(r) ? Lt : le.current), (u = vr(t, u)));
        var w = r.getDerivedStateFromProps;
        (y = typeof w == 'function' || typeof l.getSnapshotBeforeUpdate == 'function') ||
          (typeof l.UNSAFE_componentWillReceiveProps != 'function' &&
            typeof l.componentWillReceiveProps != 'function') ||
          ((s !== S || m !== u) && Gf(t, l, n, u)),
          (rt = !1),
          (m = t.memoizedState),
          (l.state = m),
          zn(t, n, l, o);
        var k = t.memoizedState;
        s !== S || m !== k || de.current || rt
          ? (typeof w == 'function' && (li(t, r, w, n), (k = t.memoizedState)),
            (a = rt || Vf(t, r, a, n, m, k, u))
              ? (y ||
                  (typeof l.UNSAFE_componentWillUpdate != 'function' && typeof l.componentWillUpdate != 'function') ||
                  (typeof l.componentWillUpdate == 'function' && l.componentWillUpdate(n, k, u),
                  typeof l.UNSAFE_componentWillUpdate == 'function' && l.UNSAFE_componentWillUpdate(n, k, u)),
                typeof l.componentDidUpdate == 'function' && (t.flags |= 4),
                typeof l.getSnapshotBeforeUpdate == 'function' && (t.flags |= 256))
              : (typeof l.componentDidUpdate != 'function' ||
                  (s === e.memoizedProps && m === e.memoizedState) ||
                  (t.flags |= 4),
                typeof l.getSnapshotBeforeUpdate != 'function' ||
                  (s === e.memoizedProps && m === e.memoizedState) ||
                  (t.flags |= 256),
                (t.memoizedProps = n),
                (t.memoizedState = k)),
            (l.props = n),
            (l.state = k),
            (l.context = u),
            (n = a))
          : (typeof l.componentDidUpdate != 'function' ||
              (s === e.memoizedProps && m === e.memoizedState) ||
              (t.flags |= 4),
            typeof l.getSnapshotBeforeUpdate != 'function' ||
              (s === e.memoizedProps && m === e.memoizedState) ||
              (t.flags |= 256),
            (n = !1));
      }
      return Cs(e, t, r, n, i, o);
    }
    function Cs(e, t, r, n, o, i) {
      Td(e, t);
      var l = (t.flags & 64) !== 0;
      if (!n && !l) return o && Af(t, r, !1), Xe(e, t, i);
      (n = t.stateNode), (dy.current = t);
      var s = l && typeof r.getDerivedStateFromError != 'function' ? null : n.render();
      return (
        (t.flags |= 1),
        e !== null && l ? ((t.child = si(t, e.child, null, i)), (t.child = si(t, null, s, i))) : ce(e, t, s, i),
        (t.memoizedState = n.state),
        o && Af(t, r, !0),
        t.child
      );
    }
    function rc(e) {
      var t = e.stateNode;
      t.pendingContext ? $f(e, t.pendingContext, t.pendingContext !== t.context) : t.context && $f(e, t.context, !1),
        Ss(e, t.containerInfo);
    }
    var Do = { dehydrated: null, retryLane: 0 };
    function nc(e, t, r) {
      var n = t.pendingProps,
        o = A.current,
        i = !1,
        l;
      return (
        (l = (t.flags & 64) !== 0) || (l = e !== null && e.memoizedState === null ? !1 : (o & 2) !== 0),
        l
          ? ((i = !0), (t.flags &= -65))
          : (e !== null && e.memoizedState === null) ||
            n.fallback === void 0 ||
            n.unstable_avoidThisFallback === !0 ||
            (o |= 1),
        F(A, o & 1),
        e === null
          ? (n.fallback !== void 0 && vs(t),
            (e = n.children),
            (o = n.fallback),
            i
              ? ((e = oc(t, e, o, r)), (t.child.memoizedState = { baseLanes: r }), (t.memoizedState = Do), e)
              : typeof n.unstable_expectedLoadTime == 'number'
              ? ((e = oc(t, e, o, r)),
                (t.child.memoizedState = { baseLanes: r }),
                (t.memoizedState = Do),
                (t.lanes = 33554432),
                e)
              : ((r = ku({ mode: 'visible', children: e }, t.mode, r, null)), (r.return = t), (t.child = r)))
          : e.memoizedState !== null
          ? i
            ? ((n = lc(e, t, n.children, n.fallback, r)),
              (i = t.child),
              (o = e.child.memoizedState),
              (i.memoizedState = o === null ? { baseLanes: r } : { baseLanes: o.baseLanes | r }),
              (i.childLanes = e.childLanes & ~r),
              (t.memoizedState = Do),
              n)
            : ((r = ic(e, t, n.children, r)), (t.memoizedState = null), r)
          : i
          ? ((n = lc(e, t, n.children, n.fallback, r)),
            (i = t.child),
            (o = e.child.memoizedState),
            (i.memoizedState = o === null ? { baseLanes: r } : { baseLanes: o.baseLanes | r }),
            (i.childLanes = e.childLanes & ~r),
            (t.memoizedState = Do),
            n)
          : ((r = ic(e, t, n.children, r)), (t.memoizedState = null), r)
      );
    }
    function oc(e, t, r, n) {
      var o = e.mode,
        i = e.child;
      return (
        (t = { mode: 'hidden', children: t }),
        (o & 2) === 0 && i !== null ? ((i.childLanes = 0), (i.pendingProps = t)) : (i = ku(t, o, 0, null)),
        (r = gr(r, o, n, null)),
        (i.return = e),
        (r.return = e),
        (i.sibling = r),
        (e.child = i),
        r
      );
    }
    function ic(e, t, r, n) {
      var o = e.child;
      return (
        (e = o.sibling),
        (r = vt(o, { mode: 'visible', children: r })),
        (t.mode & 2) === 0 && (r.lanes = n),
        (r.return = t),
        (r.sibling = null),
        e !== null && ((e.nextEffect = null), (e.flags = 8), (t.firstEffect = t.lastEffect = e)),
        (t.child = r)
      );
    }
    function lc(e, t, r, n, o) {
      var i = t.mode,
        l = e.child;
      e = l.sibling;
      var s = { mode: 'hidden', children: r };
      return (
        (i & 2) === 0 && t.child !== l
          ? ((r = t.child),
            (r.childLanes = 0),
            (r.pendingProps = s),
            (l = r.lastEffect),
            l !== null
              ? ((t.firstEffect = r.firstEffect), (t.lastEffect = l), (l.nextEffect = null))
              : (t.firstEffect = t.lastEffect = null))
          : (r = vt(l, s)),
        e !== null ? (n = vt(e, n)) : ((n = gr(n, i, o, null)), (n.flags |= 2)),
        (n.return = t),
        (r.return = t),
        (r.sibling = n),
        (t.child = r),
        n
      );
    }
    function sc(e, t) {
      e.lanes |= t;
      var r = e.alternate;
      r !== null && (r.lanes |= t), pd(e.return, t);
    }
    function Hl(e, t, r, n, o, i) {
      var l = e.memoizedState;
      l === null
        ? (e.memoizedState = {
            isBackwards: t,
            rendering: null,
            renderingStartTime: 0,
            last: n,
            tail: r,
            tailMode: o,
            lastEffect: i,
          })
        : ((l.isBackwards = t),
          (l.rendering = null),
          (l.renderingStartTime = 0),
          (l.last = n),
          (l.tail = r),
          (l.tailMode = o),
          (l.lastEffect = i));
    }
    function uc(e, t, r) {
      var n = t.pendingProps,
        o = n.revealOrder,
        i = n.tail;
      if ((ce(e, t, n.children, r), (n = A.current), (n & 2) !== 0)) (n = (n & 1) | 2), (t.flags |= 64);
      else {
        if (e !== null && (e.flags & 64) !== 0)
          e: for (e = t.child; e !== null; ) {
            if (e.tag === 13) e.memoizedState !== null && sc(e, r);
            else if (e.tag === 19) sc(e, r);
            else if (e.child !== null) {
              (e.child.return = e), (e = e.child);
              continue;
            }
            if (e === t) break e;
            for (; e.sibling === null; ) {
              if (e.return === null || e.return === t) break e;
              e = e.return;
            }
            (e.sibling.return = e.return), (e = e.sibling);
          }
        n &= 1;
      }
      if ((F(A, n), (t.mode & 2) === 0)) t.memoizedState = null;
      else
        switch (o) {
          case 'forwards':
            for (r = t.child, o = null; r !== null; )
              (e = r.alternate), e !== null && ui(e) === null && (o = r), (r = r.sibling);
            (r = o),
              r === null ? ((o = t.child), (t.child = null)) : ((o = r.sibling), (r.sibling = null)),
              Hl(t, !1, o, r, i, t.lastEffect);
            break;
          case 'backwards':
            for (r = null, o = t.child, t.child = null; o !== null; ) {
              if (((e = o.alternate), e !== null && ui(e) === null)) {
                t.child = o;
                break;
              }
              (e = o.sibling), (o.sibling = r), (r = o), (o = e);
            }
            Hl(t, !0, r, null, i, t.lastEffect);
            break;
          case 'together':
            Hl(t, !1, null, null, void 0, t.lastEffect);
            break;
          default:
            t.memoizedState = null;
        }
      return t.child;
    }
    function Xe(e, t, r) {
      if ((e !== null && (t.dependencies = e.dependencies), (Vn |= t.lanes), (r & t.childLanes) !== 0)) {
        if (e !== null && t.child !== e.child) throw Error(v(153));
        if (t.child !== null) {
          for (e = t.child, r = vt(e, e.pendingProps), t.child = r, r.return = t; e.sibling !== null; )
            (e = e.sibling), (r = r.sibling = vt(e, e.pendingProps)), (r.return = t);
          r.sibling = null;
        }
        return t.child;
      }
      return null;
    }
    var Bd, ks, _d, Id;
    Bd = function (e, t) {
      for (var r = t.child; r !== null; ) {
        if (r.tag === 5 || r.tag === 6) e.appendChild(r.stateNode);
        else if (r.tag !== 4 && r.child !== null) {
          (r.child.return = r), (r = r.child);
          continue;
        }
        if (r === t) break;
        for (; r.sibling === null; ) {
          if (r.return === null || r.return === t) return;
          r = r.return;
        }
        (r.sibling.return = r.return), (r = r.sibling);
      }
    };
    ks = function () {};
    _d = function (e, t, r, n) {
      var o = e.memoizedProps;
      if (o !== n) {
        (e = t.stateNode), It(Ae.current);
        var i = null;
        switch (r) {
          case 'input':
            (o = Xl(e, o)), (n = Xl(e, n)), (i = []);
            break;
          case 'option':
            (o = Jl(e, o)), (n = Jl(e, n)), (i = []);
            break;
          case 'select':
            (o = $({}, o, { value: void 0 })), (n = $({}, n, { value: void 0 })), (i = []);
            break;
          case 'textarea':
            (o = es(e, o)), (n = es(e, n)), (i = []);
            break;
          default:
            typeof o.onClick != 'function' && typeof n.onClick == 'function' && (e.onclick = ei);
        }
        ns(r, n);
        var l;
        r = null;
        for (a in o)
          if (!n.hasOwnProperty(a) && o.hasOwnProperty(a) && o[a] != null)
            if (a === 'style') {
              var s = o[a];
              for (l in s) s.hasOwnProperty(l) && (r || (r = {}), (r[l] = ''));
            } else
              a !== 'dangerouslySetInnerHTML' &&
                a !== 'children' &&
                a !== 'suppressContentEditableWarning' &&
                a !== 'suppressHydrationWarning' &&
                a !== 'autoFocus' &&
                (Tn.hasOwnProperty(a) ? i || (i = []) : (i = i || []).push(a, null));
        for (a in n) {
          var u = n[a];
          if (((s = o?.[a]), n.hasOwnProperty(a) && u !== s && (u != null || s != null)))
            if (a === 'style')
              if (s) {
                for (l in s) !s.hasOwnProperty(l) || (u && u.hasOwnProperty(l)) || (r || (r = {}), (r[l] = ''));
                for (l in u) u.hasOwnProperty(l) && s[l] !== u[l] && (r || (r = {}), (r[l] = u[l]));
              } else r || (i || (i = []), i.push(a, r)), (r = u);
            else
              a === 'dangerouslySetInnerHTML'
                ? ((u = u ? u.__html : void 0),
                  (s = s ? s.__html : void 0),
                  u != null && s !== u && (i = i || []).push(a, u))
                : a === 'children'
                ? (typeof u != 'string' && typeof u != 'number') || (i = i || []).push(a, '' + u)
                : a !== 'suppressContentEditableWarning' &&
                  a !== 'suppressHydrationWarning' &&
                  (Tn.hasOwnProperty(a)
                    ? (u != null && a === 'onScroll' && j('scroll', e), i || s === u || (i = []))
                    : typeof u == 'object' && u !== null && u.$$typeof === Ws
                    ? u.toString()
                    : (i = i || []).push(a, u));
        }
        r && (i = i || []).push('style', r);
        var a = i;
        (t.updateQueue = a) && (t.flags |= 4);
      }
    };
    Id = function (e, t, r, n) {
      r !== n && (t.flags |= 4);
    };
    function un(e, t) {
      if (!Fe)
        switch (e.tailMode) {
          case 'hidden':
            t = e.tail;
            for (var r = null; t !== null; ) t.alternate !== null && (r = t), (t = t.sibling);
            r === null ? (e.tail = null) : (r.sibling = null);
            break;
          case 'collapsed':
            r = e.tail;
            for (var n = null; r !== null; ) r.alternate !== null && (n = r), (r = r.sibling);
            n === null ? (t || e.tail === null ? (e.tail = null) : (e.tail.sibling = null)) : (n.sibling = null);
        }
    }
    function py(e, t, r) {
      var n = t.pendingProps;
      switch (t.tag) {
        case 2:
        case 16:
        case 15:
        case 0:
        case 11:
        case 7:
        case 8:
        case 12:
        case 9:
        case 14:
          return null;
        case 1:
          return pe(t.type) && ri(), null;
        case 3:
          return (
            wr(),
            z(de),
            z(le),
            cu(),
            (n = t.stateNode),
            n.pendingContext && ((n.context = n.pendingContext), (n.pendingContext = null)),
            (e === null || e.child === null) && (Mo(t) ? (t.flags |= 4) : n.hydrate || (t.flags |= 256)),
            ks(t),
            null
          );
        case 5:
          fu(t);
          var o = It(An.current);
          if (((r = t.type), e !== null && t.stateNode != null)) _d(e, t, r, n, o), e.ref !== t.ref && (t.flags |= 128);
          else {
            if (!n) {
              if (t.stateNode === null) throw Error(v(166));
              return null;
            }
            if (((e = It(Ae.current)), Mo(t))) {
              (n = t.stateNode), (r = t.type);
              var i = t.memoizedProps;
              switch (((n[it] = t), (n[ti] = i), r)) {
                case 'dialog':
                  j('cancel', n), j('close', n);
                  break;
                case 'iframe':
                case 'object':
                case 'embed':
                  j('load', n);
                  break;
                case 'video':
                case 'audio':
                  for (e = 0; e < pn.length; e++) j(pn[e], n);
                  break;
                case 'source':
                  j('error', n);
                  break;
                case 'img':
                case 'image':
                case 'link':
                  j('error', n), j('load', n);
                  break;
                case 'details':
                  j('toggle', n);
                  break;
                case 'input':
                  ff(n, i), j('invalid', n);
                  break;
                case 'select':
                  (n._wrapperState = { wasMultiple: !!i.multiple }), j('invalid', n);
                  break;
                case 'textarea':
                  df(n, i), j('invalid', n);
              }
              ns(r, i), (e = null);
              for (var l in i)
                i.hasOwnProperty(l) &&
                  ((o = i[l]),
                  l === 'children'
                    ? typeof o == 'string'
                      ? n.textContent !== o && (e = ['children', o])
                      : typeof o == 'number' && n.textContent !== '' + o && (e = ['children', '' + o])
                    : Tn.hasOwnProperty(l) && o != null && l === 'onScroll' && j('scroll', n));
              switch (r) {
                case 'input':
                  Ro(n), cf(n, i, !0);
                  break;
                case 'textarea':
                  Ro(n), pf(n);
                  break;
                case 'select':
                case 'option':
                  break;
                default:
                  typeof i.onClick == 'function' && (n.onclick = ei);
              }
              (n = e), (t.updateQueue = n), n !== null && (t.flags |= 4);
            } else {
              switch (
                ((l = o.nodeType === 9 ? o : o.ownerDocument),
                e === ts.html && (e = Ec(r)),
                e === ts.html
                  ? r === 'script'
                    ? ((e = l.createElement('div')),
                      (e.innerHTML = '<script></script>'),
                      (e = e.removeChild(e.firstChild)))
                    : typeof n.is == 'string'
                    ? (e = l.createElement(r, { is: n.is }))
                    : ((e = l.createElement(r)),
                      r === 'select' && ((l = e), n.multiple ? (l.multiple = !0) : n.size && (l.size = n.size)))
                  : (e = l.createElementNS(e, r)),
                (e[it] = t),
                (e[ti] = n),
                Bd(e, t, !1, !1),
                (t.stateNode = e),
                (l = os(r, n)),
                r)
              ) {
                case 'dialog':
                  j('cancel', e), j('close', e), (o = n);
                  break;
                case 'iframe':
                case 'object':
                case 'embed':
                  j('load', e), (o = n);
                  break;
                case 'video':
                case 'audio':
                  for (o = 0; o < pn.length; o++) j(pn[o], e);
                  o = n;
                  break;
                case 'source':
                  j('error', e), (o = n);
                  break;
                case 'img':
                case 'image':
                case 'link':
                  j('error', e), j('load', e), (o = n);
                  break;
                case 'details':
                  j('toggle', e), (o = n);
                  break;
                case 'input':
                  ff(e, n), (o = Xl(e, n)), j('invalid', e);
                  break;
                case 'option':
                  o = Jl(e, n);
                  break;
                case 'select':
                  (e._wrapperState = { wasMultiple: !!n.multiple }), (o = $({}, n, { value: void 0 })), j('invalid', e);
                  break;
                case 'textarea':
                  df(e, n), (o = es(e, n)), j('invalid', e);
                  break;
                default:
                  o = n;
              }
              ns(r, o);
              var s = o;
              for (i in s)
                if (s.hasOwnProperty(i)) {
                  var u = s[i];
                  i === 'style'
                    ? Nc(e, u)
                    : i === 'dangerouslySetInnerHTML'
                    ? ((u = u ? u.__html : void 0), u != null && Pc(e, u))
                    : i === 'children'
                    ? typeof u == 'string'
                      ? (r !== 'textarea' || u !== '') && Bn(e, u)
                      : typeof u == 'number' && Bn(e, '' + u)
                    : i !== 'suppressContentEditableWarning' &&
                      i !== 'suppressHydrationWarning' &&
                      i !== 'autoFocus' &&
                      (Tn.hasOwnProperty(i)
                        ? u != null && i === 'onScroll' && j('scroll', e)
                        : u != null && js(e, i, u, l));
                }
              switch (r) {
                case 'input':
                  Ro(e), cf(e, n, !1);
                  break;
                case 'textarea':
                  Ro(e), pf(e);
                  break;
                case 'option':
                  n.value != null && e.setAttribute('value', '' + ht(n.value));
                  break;
                case 'select':
                  (e.multiple = !!n.multiple),
                    (i = n.value),
                    i != null
                      ? ar(e, !!n.multiple, i, !1)
                      : n.defaultValue != null && ar(e, !!n.multiple, n.defaultValue, !0);
                  break;
                default:
                  typeof o.onClick == 'function' && (e.onclick = ei);
              }
              od(r, n) && (t.flags |= 4);
            }
            t.ref !== null && (t.flags |= 128);
          }
          return null;
        case 6:
          if (e && t.stateNode != null) Id(e, t, e.memoizedProps, n);
          else {
            if (typeof n != 'string' && t.stateNode === null) throw Error(v(166));
            (r = It(An.current)),
              It(Ae.current),
              Mo(t)
                ? ((n = t.stateNode), (r = t.memoizedProps), (n[it] = t), n.nodeValue !== r && (t.flags |= 4))
                : ((n = (r.nodeType === 9 ? r : r.ownerDocument).createTextNode(n)), (n[it] = t), (t.stateNode = n));
          }
          return null;
        case 13:
          return (
            z(A),
            (n = t.memoizedState),
            (t.flags & 64) !== 0
              ? ((t.lanes = r), t)
              : ((n = n !== null),
                (r = !1),
                e === null ? t.memoizedProps.fallback !== void 0 && Mo(t) : (r = e.memoizedState !== null),
                n &&
                  !r &&
                  (t.mode & 2) !== 0 &&
                  ((e === null && t.memoizedProps.unstable_avoidThisFallback !== !0) || (A.current & 1) !== 0
                    ? J === 0 && (J = 3)
                    : ((J === 0 || J === 3) && (J = 4),
                      se === null || ((Vn & 134217727) === 0 && (Pr & 134217727) === 0) || hr(se, ie))),
                (n || r) && (t.flags |= 4),
                null)
          );
        case 4:
          return wr(), ks(t), e === null && td(t.stateNode.containerInfo), null;
        case 10:
          return uu(t), null;
        case 17:
          return pe(t.type) && ri(), null;
        case 19:
          if ((z(A), (n = t.memoizedState), n === null)) return null;
          if (((i = (t.flags & 64) !== 0), (l = n.rendering), l === null))
            if (i) un(n, !1);
            else {
              if (J !== 0 || (e !== null && (e.flags & 64) !== 0))
                for (e = t.child; e !== null; ) {
                  if (((l = ui(e)), l !== null)) {
                    for (
                      t.flags |= 64,
                        un(n, !1),
                        i = l.updateQueue,
                        i !== null && ((t.updateQueue = i), (t.flags |= 4)),
                        n.lastEffect === null && (t.firstEffect = null),
                        t.lastEffect = n.lastEffect,
                        n = r,
                        r = t.child;
                      r !== null;

                    )
                      (i = r),
                        (e = n),
                        (i.flags &= 2),
                        (i.nextEffect = null),
                        (i.firstEffect = null),
                        (i.lastEffect = null),
                        (l = i.alternate),
                        l === null
                          ? ((i.childLanes = 0),
                            (i.lanes = e),
                            (i.child = null),
                            (i.memoizedProps = null),
                            (i.memoizedState = null),
                            (i.updateQueue = null),
                            (i.dependencies = null),
                            (i.stateNode = null))
                          : ((i.childLanes = l.childLanes),
                            (i.lanes = l.lanes),
                            (i.child = l.child),
                            (i.memoizedProps = l.memoizedProps),
                            (i.memoizedState = l.memoizedState),
                            (i.updateQueue = l.updateQueue),
                            (i.type = l.type),
                            (e = l.dependencies),
                            (i.dependencies = e === null ? null : { lanes: e.lanes, firstContext: e.firstContext })),
                        (r = r.sibling);
                    return F(A, (A.current & 1) | 2), t.child;
                  }
                  e = e.sibling;
                }
              n.tail !== null && oe() > Bs && ((t.flags |= 64), (i = !0), un(n, !1), (t.lanes = 33554432));
            }
          else {
            if (!i)
              if (((e = ui(l)), e !== null)) {
                if (
                  ((t.flags |= 64),
                  (i = !0),
                  (r = e.updateQueue),
                  r !== null && ((t.updateQueue = r), (t.flags |= 4)),
                  un(n, !0),
                  n.tail === null && n.tailMode === 'hidden' && !l.alternate && !Fe)
                )
                  return (t = t.lastEffect = n.lastEffect), t !== null && (t.nextEffect = null), null;
              } else
                2 * oe() - n.renderingStartTime > Bs &&
                  r !== 1073741824 &&
                  ((t.flags |= 64), (i = !0), un(n, !1), (t.lanes = 33554432));
            n.isBackwards
              ? ((l.sibling = t.child), (t.child = l))
              : ((r = n.last), r !== null ? (r.sibling = l) : (t.child = l), (n.last = l));
          }
          return n.tail !== null
            ? ((r = n.tail),
              (n.rendering = r),
              (n.tail = r.sibling),
              (n.lastEffect = t.lastEffect),
              (n.renderingStartTime = oe()),
              (r.sibling = null),
              (t = A.current),
              F(A, i ? (t & 1) | 2 : t & 1),
              r)
            : null;
        case 23:
        case 24:
          return (
            wu(),
            e !== null &&
              (e.memoizedState !== null) != (t.memoizedState !== null) &&
              n.mode !== 'unstable-defer-without-hiding' &&
              (t.flags |= 4),
            null
          );
      }
      throw Error(v(156, t.tag));
    }
    function my(e) {
      switch (e.tag) {
        case 1:
          pe(e.type) && ri();
          var t = e.flags;
          return t & 4096 ? ((e.flags = (t & -4097) | 64), e) : null;
        case 3:
          if ((wr(), z(de), z(le), cu(), (t = e.flags), (t & 64) !== 0)) throw Error(v(285));
          return (e.flags = (t & -4097) | 64), e;
        case 5:
          return fu(e), null;
        case 13:
          return z(A), (t = e.flags), t & 4096 ? ((e.flags = (t & -4097) | 64), e) : null;
        case 19:
          return z(A), null;
        case 4:
          return wr(), null;
        case 10:
          return uu(e), null;
        case 23:
        case 24:
          return wu(), null;
        default:
          return null;
      }
    }
    function gu(e, t) {
      try {
        var r = '',
          n = t;
        do (r += Ym(n)), (n = n.return);
        while (n);
        var o = r;
      } catch (i) {
        o =
          `
Error generating stack: ` +
          i.message +
          `
` +
          i.stack;
      }
      return { value: e, source: t, stack: o };
    }
    function Es(e, t) {
      try {
        console.error(t.value);
      } catch (r) {
        setTimeout(function () {
          throw r;
        });
      }
    }
    var hy = typeof WeakMap == 'function' ? WeakMap : Map;
    function bd(e, t, r) {
      (r = ft(-1, r)), (r.tag = 3), (r.payload = { element: null });
      var n = t.value;
      return (
        (r.callback = function () {
          hi || ((hi = !0), (_s = n)), Es(e, t);
        }),
        r
      );
    }
    function Od(e, t, r) {
      (r = ft(-1, r)), (r.tag = 3);
      var n = e.type.getDerivedStateFromError;
      if (typeof n == 'function') {
        var o = t.value;
        r.payload = function () {
          return Es(e, t), n(o);
        };
      }
      var i = e.stateNode;
      return (
        i !== null &&
          typeof i.componentDidCatch == 'function' &&
          (r.callback = function () {
            typeof n != 'function' && ($e === null ? ($e = new Set([this])) : $e.add(this), Es(e, t));
            var l = t.stack;
            this.componentDidCatch(t.value, { componentStack: l !== null ? l : '' });
          }),
        r
      );
    }
    var yy = typeof WeakSet == 'function' ? WeakSet : Set;
    function ac(e) {
      var t = e.ref;
      if (t !== null)
        if (typeof t == 'function')
          try {
            t(null);
          } catch (r) {
            mt(e, r);
          }
        else t.current = null;
    }
    function gy(e, t) {
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
        case 22:
          return;
        case 1:
          if (t.flags & 256 && e !== null) {
            var r = e.memoizedProps,
              n = e.memoizedState;
            (e = t.stateNode),
              (t = e.getSnapshotBeforeUpdate(t.elementType === t.type ? r : Be(t.type, r), n)),
              (e.__reactInternalSnapshotBeforeUpdate = t);
          }
          return;
        case 3:
          t.flags & 256 && ou(t.stateNode.containerInfo);
          return;
        case 5:
        case 6:
        case 4:
        case 17:
          return;
      }
      throw Error(v(163));
    }
    function Sy(e, t, r) {
      switch (r.tag) {
        case 0:
        case 11:
        case 15:
        case 22:
          if (((t = r.updateQueue), (t = t !== null ? t.lastEffect : null), t !== null)) {
            e = t = t.next;
            do {
              if ((e.tag & 3) === 3) {
                var n = e.create;
                e.destroy = n();
              }
              e = e.next;
            } while (e !== t);
          }
          if (((t = r.updateQueue), (t = t !== null ? t.lastEffect : null), t !== null)) {
            e = t = t.next;
            do {
              var o = e;
              (n = o.next), (o = o.tag), (o & 4) !== 0 && (o & 1) !== 0 && (Ud(r, e), Ry(r, e)), (e = n);
            } while (e !== t);
          }
          return;
        case 1:
          (e = r.stateNode),
            r.flags & 4 &&
              (t === null
                ? e.componentDidMount()
                : ((n = r.elementType === r.type ? t.memoizedProps : Be(r.type, t.memoizedProps)),
                  e.componentDidUpdate(n, t.memoizedState, e.__reactInternalSnapshotBeforeUpdate))),
            (t = r.updateQueue),
            t !== null && Hf(r, t, e);
          return;
        case 3:
          if (((t = r.updateQueue), t !== null)) {
            if (((e = null), r.child !== null))
              switch (r.child.tag) {
                case 5:
                  e = r.child.stateNode;
                  break;
                case 1:
                  e = r.child.stateNode;
              }
            Hf(r, t, e);
          }
          return;
        case 5:
          (e = r.stateNode), t === null && r.flags & 4 && od(r.type, r.memoizedProps) && e.focus();
          return;
        case 6:
          return;
        case 4:
          return;
        case 12:
          return;
        case 13:
          r.memoizedState === null &&
            ((r = r.alternate),
            r !== null && ((r = r.memoizedState), r !== null && ((r = r.dehydrated), r !== null && jc(r))));
          return;
        case 19:
        case 17:
        case 20:
        case 21:
        case 23:
        case 24:
          return;
      }
      throw Error(v(163));
    }
    function fc(e, t) {
      for (var r = e; ; ) {
        if (r.tag === 5) {
          var n = r.stateNode;
          if (t)
            (n = n.style),
              typeof n.setProperty == 'function' ? n.setProperty('display', 'none', 'important') : (n.display = 'none');
          else {
            n = r.stateNode;
            var o = r.memoizedProps.style;
            (o = o != null && o.hasOwnProperty('display') ? o.display : null), (n.style.display = Rc('display', o));
          }
        } else if (r.tag === 6) r.stateNode.nodeValue = t ? '' : r.memoizedProps;
        else if (((r.tag !== 23 && r.tag !== 24) || r.memoizedState === null || r === e) && r.child !== null) {
          (r.child.return = r), (r = r.child);
          continue;
        }
        if (r === e) break;
        for (; r.sibling === null; ) {
          if (r.return === null || r.return === e) return;
          r = r.return;
        }
        (r.sibling.return = r.return), (r = r.sibling);
      }
    }
    function cc(e, t) {
      if (Ot && typeof Ot.onCommitFiberUnmount == 'function')
        try {
          Ot.onCommitFiberUnmount(iu, t);
        } catch {}
      switch (t.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
        case 22:
          if (((e = t.updateQueue), e !== null && ((e = e.lastEffect), e !== null))) {
            var r = (e = e.next);
            do {
              var n = r,
                o = n.destroy;
              if (((n = n.tag), o !== void 0))
                if ((n & 4) !== 0) Ud(t, r);
                else {
                  n = t;
                  try {
                    o();
                  } catch (i) {
                    mt(n, i);
                  }
                }
              r = r.next;
            } while (r !== e);
          }
          break;
        case 1:
          if ((ac(t), (e = t.stateNode), typeof e.componentWillUnmount == 'function'))
            try {
              (e.props = t.memoizedProps), (e.state = t.memoizedState), e.componentWillUnmount();
            } catch (i) {
              mt(t, i);
            }
          break;
        case 5:
          ac(t);
          break;
        case 4:
          Ld(e, t);
      }
    }
    function dc(e) {
      (e.alternate = null),
        (e.child = null),
        (e.dependencies = null),
        (e.firstEffect = null),
        (e.lastEffect = null),
        (e.memoizedProps = null),
        (e.memoizedState = null),
        (e.pendingProps = null),
        (e.return = null),
        (e.updateQueue = null);
    }
    function pc(e) {
      return e.tag === 5 || e.tag === 3 || e.tag === 4;
    }
    function mc(e) {
      e: {
        for (var t = e.return; t !== null; ) {
          if (pc(t)) break e;
          t = t.return;
        }
        throw Error(v(160));
      }
      var r = t;
      switch (((t = r.stateNode), r.tag)) {
        case 5:
          var n = !1;
          break;
        case 3:
          (t = t.containerInfo), (n = !0);
          break;
        case 4:
          (t = t.containerInfo), (n = !0);
          break;
        default:
          throw Error(v(161));
      }
      r.flags & 16 && (Bn(t, ''), (r.flags &= -17));
      e: t: for (r = e; ; ) {
        for (; r.sibling === null; ) {
          if (r.return === null || pc(r.return)) {
            r = null;
            break e;
          }
          r = r.return;
        }
        for (r.sibling.return = r.return, r = r.sibling; r.tag !== 5 && r.tag !== 6 && r.tag !== 18; ) {
          if (r.flags & 2 || r.child === null || r.tag === 4) continue t;
          (r.child.return = r), (r = r.child);
        }
        if (!(r.flags & 2)) {
          r = r.stateNode;
          break e;
        }
      }
      n ? Ps(e, r, t) : Rs(e, r, t);
    }
    function Ps(e, t, r) {
      var n = e.tag,
        o = n === 5 || n === 6;
      if (o)
        (e = o ? e.stateNode : e.stateNode.instance),
          t
            ? r.nodeType === 8
              ? r.parentNode.insertBefore(e, t)
              : r.insertBefore(e, t)
            : (r.nodeType === 8 ? ((t = r.parentNode), t.insertBefore(e, r)) : ((t = r), t.appendChild(e)),
              (r = r._reactRootContainer),
              r != null || t.onclick !== null || (t.onclick = ei));
      else if (n !== 4 && ((e = e.child), e !== null))
        for (Ps(e, t, r), e = e.sibling; e !== null; ) Ps(e, t, r), (e = e.sibling);
    }
    function Rs(e, t, r) {
      var n = e.tag,
        o = n === 5 || n === 6;
      if (o) (e = o ? e.stateNode : e.stateNode.instance), t ? r.insertBefore(e, t) : r.appendChild(e);
      else if (n !== 4 && ((e = e.child), e !== null))
        for (Rs(e, t, r), e = e.sibling; e !== null; ) Rs(e, t, r), (e = e.sibling);
    }
    function Ld(e, t) {
      for (var r = t, n = !1, o, i; ; ) {
        if (!n) {
          n = r.return;
          e: for (;;) {
            if (n === null) throw Error(v(160));
            switch (((o = n.stateNode), n.tag)) {
              case 5:
                i = !1;
                break e;
              case 3:
                (o = o.containerInfo), (i = !0);
                break e;
              case 4:
                (o = o.containerInfo), (i = !0);
                break e;
            }
            n = n.return;
          }
          n = !0;
        }
        if (r.tag === 5 || r.tag === 6) {
          e: for (var l = e, s = r, u = s; ; )
            if ((cc(l, u), u.child !== null && u.tag !== 4)) (u.child.return = u), (u = u.child);
            else {
              if (u === s) break e;
              for (; u.sibling === null; ) {
                if (u.return === null || u.return === s) break e;
                u = u.return;
              }
              (u.sibling.return = u.return), (u = u.sibling);
            }
          i
            ? ((l = o), (s = r.stateNode), l.nodeType === 8 ? l.parentNode.removeChild(s) : l.removeChild(s))
            : o.removeChild(r.stateNode);
        } else if (r.tag === 4) {
          if (r.child !== null) {
            (o = r.stateNode.containerInfo), (i = !0), (r.child.return = r), (r = r.child);
            continue;
          }
        } else if ((cc(e, r), r.child !== null)) {
          (r.child.return = r), (r = r.child);
          continue;
        }
        if (r === t) break;
        for (; r.sibling === null; ) {
          if (r.return === null || r.return === t) return;
          (r = r.return), r.tag === 4 && (n = !1);
        }
        (r.sibling.return = r.return), (r = r.sibling);
      }
    }
    function Vl(e, t) {
      switch (t.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
        case 22:
          var r = t.updateQueue;
          if (((r = r !== null ? r.lastEffect : null), r !== null)) {
            var n = (r = r.next);
            do (n.tag & 3) === 3 && ((e = n.destroy), (n.destroy = void 0), e !== void 0 && e()), (n = n.next);
            while (n !== r);
          }
          return;
        case 1:
          return;
        case 5:
          if (((r = t.stateNode), r != null)) {
            n = t.memoizedProps;
            var o = e !== null ? e.memoizedProps : n;
            e = t.type;
            var i = t.updateQueue;
            if (((t.updateQueue = null), i !== null)) {
              for (
                r[ti] = n,
                  e === 'input' && n.type === 'radio' && n.name != null && Cc(r, n),
                  os(e, o),
                  t = os(e, n),
                  o = 0;
                o < i.length;
                o += 2
              ) {
                var l = i[o],
                  s = i[o + 1];
                l === 'style'
                  ? Nc(r, s)
                  : l === 'dangerouslySetInnerHTML'
                  ? Pc(r, s)
                  : l === 'children'
                  ? Bn(r, s)
                  : js(r, l, s, t);
              }
              switch (e) {
                case 'input':
                  ql(r, n);
                  break;
                case 'textarea':
                  kc(r, n);
                  break;
                case 'select':
                  (e = r._wrapperState.wasMultiple),
                    (r._wrapperState.wasMultiple = !!n.multiple),
                    (i = n.value),
                    i != null
                      ? ar(r, !!n.multiple, i, !1)
                      : e !== !!n.multiple &&
                        (n.defaultValue != null
                          ? ar(r, !!n.multiple, n.defaultValue, !0)
                          : ar(r, !!n.multiple, n.multiple ? [] : '', !1));
              }
            }
          }
          return;
        case 6:
          if (t.stateNode === null) throw Error(v(162));
          t.stateNode.nodeValue = t.memoizedProps;
          return;
        case 3:
          (r = t.stateNode), r.hydrate && ((r.hydrate = !1), jc(r.containerInfo));
          return;
        case 12:
          return;
        case 13:
          t.memoizedState !== null && ((xu = oe()), fc(t.child, !0)), hc(t);
          return;
        case 19:
          hc(t);
          return;
        case 17:
          return;
        case 23:
        case 24:
          fc(t, t.memoizedState !== null);
          return;
      }
      throw Error(v(163));
    }
    function hc(e) {
      var t = e.updateQueue;
      if (t !== null) {
        e.updateQueue = null;
        var r = e.stateNode;
        r === null && (r = e.stateNode = new yy()),
          t.forEach(function (n) {
            var o = By.bind(null, e, n);
            r.has(n) || (r.add(n), n.then(o, o));
          });
      }
    }
    function vy(e, t) {
      return e !== null && ((e = e.memoizedState), e === null || e.dehydrated !== null)
        ? ((t = t.memoizedState), t !== null && t.dehydrated === null)
        : !1;
    }
    var xy = Math.ceil,
      mi = zt.ReactCurrentDispatcher,
      Su = zt.ReactCurrentOwner,
      T = 0,
      se = null,
      G = null,
      ie = 0,
      Dt = 0,
      Ns = xt(0),
      J = 0,
      Ti = null,
      Er = 0,
      Vn = 0,
      Pr = 0,
      vu = 0,
      Ts = null,
      xu = 0,
      Bs = 1 / 0;
    function Rr() {
      Bs = oe() + 500;
    }
    var R = null,
      hi = !1,
      _s = null,
      $e = null,
      St = !1,
      Pn = null,
      mn = 90,
      Is = [],
      bs = [],
      qe = null,
      Rn = 0,
      Os = null,
      Ho = -1,
      Ye = 0,
      Vo = 0,
      Nn = null,
      Go = !1;
    function he() {
      return (T & 48) !== 0 ? oe() : Ho !== -1 ? Ho : (Ho = oe());
    }
    function dt(e) {
      if (((e = e.mode), (e & 2) === 0)) return 1;
      if ((e & 4) === 0) return xr() === 99 ? 1 : 2;
      if ((Ye === 0 && (Ye = Er), sy.transition !== 0)) {
        Vo !== 0 && (Vo = Ts !== null ? Ts.pendingLanes : 0), (e = Ye);
        var t = 4186112 & ~Vo;
        return (t &= -t), t === 0 && ((e = 4186112 & ~e), (t = e & -e), t === 0 && (t = 8192)), t;
      }
      return (e = xr()), (T & 4) !== 0 && e === 98 ? (e = Zo(12, Ye)) : ((e = fh(e)), (e = Zo(e, Ye))), e;
    }
    function pt(e, t, r) {
      if (50 < Rn) throw ((Rn = 0), (Os = null), Error(v(185)));
      if (((e = Bi(e, t)), e === null)) return null;
      wi(e, t, r), e === se && ((Pr |= t), J === 4 && hr(e, ie));
      var n = xr();
      t === 1
        ? (T & 8) !== 0 && (T & 48) === 0
          ? Ls(e)
          : (Ee(e, r), T === 0 && (Rr(), Ue()))
        : ((T & 4) === 0 || (n !== 98 && n !== 99) || (qe === null ? (qe = new Set([e])) : qe.add(e)), Ee(e, r)),
        (Ts = e);
    }
    function Bi(e, t) {
      e.lanes |= t;
      var r = e.alternate;
      for (r !== null && (r.lanes |= t), r = e, e = e.return; e !== null; )
        (e.childLanes |= t), (r = e.alternate), r !== null && (r.childLanes |= t), (r = e), (e = e.return);
      return r.tag === 3 ? r.stateNode : null;
    }
    function Ee(e, t) {
      for (
        var r = e.callbackNode, n = e.suspendedLanes, o = e.pingedLanes, i = e.expirationTimes, l = e.pendingLanes;
        0 < l;

      ) {
        var s = 31 - yt(l),
          u = 1 << s,
          a = i[s];
        if (a === -1) {
          if ((u & n) === 0 || (u & o) !== 0) {
            (a = t), er(u);
            var y = D;
            i[s] = 10 <= y ? a + 250 : 6 <= y ? a + 5e3 : -1;
          }
        } else a <= t && (e.expiredLanes |= u);
        l &= ~u;
      }
      if (((n = On(e, e === se ? ie : 0)), (t = D), n === 0))
        r !== null && (r !== Al && hs(r), (e.callbackNode = null), (e.callbackPriority = 0));
      else {
        if (r !== null) {
          if (e.callbackPriority === t) return;
          r !== Al && hs(r);
        }
        t === 15
          ? ((r = Ls.bind(null, e)), Qe === null ? ((Qe = [r]), (Wo = lu(Ri, dd))) : Qe.push(r), (r = Al))
          : t === 14
          ? (r = jn(99, Ls.bind(null, e)))
          : ((r = ch(t)), (r = jn(r, Md.bind(null, e)))),
          (e.callbackPriority = t),
          (e.callbackNode = r);
      }
    }
    function Md(e) {
      if (((Ho = -1), (Vo = Ye = 0), (T & 48) !== 0)) throw Error(v(327));
      var t = e.callbackNode;
      if (wt() && e.callbackNode !== t) return null;
      var r = On(e, e === se ? ie : 0);
      if (r === 0) return null;
      var n = r,
        o = T;
      T |= 16;
      var i = $d();
      (se !== e || ie !== n) && (Rr(), yr(e, n));
      do
        try {
          ky();
          break;
        } catch (s) {
          zd(e, s);
        }
      while (1);
      if ((su(), (mi.current = i), (T = o), G !== null ? (n = 0) : ((se = null), (ie = 0), (n = J)), (Er & Pr) !== 0))
        yr(e, 0);
      else if (n !== 0) {
        if (
          (n === 2 &&
            ((T |= 64), e.hydrate && ((e.hydrate = !1), ou(e.containerInfo)), (r = Hc(e)), r !== 0 && (n = hn(e, r))),
          n === 1)
        )
          throw ((t = Ti), yr(e, 0), hr(e, r), Ee(e, oe()), t);
        switch (((e.finishedWork = e.current.alternate), (e.finishedLanes = r), n)) {
          case 0:
          case 1:
            throw Error(v(345));
          case 2:
            Nt(e);
            break;
          case 3:
            if ((hr(e, r), (r & 62914560) === r && ((n = xu + 500 - oe()), 10 < n))) {
              if (On(e, 0) !== 0) break;
              if (((o = e.suspendedLanes), (o & r) !== r)) {
                he(), (e.pingedLanes |= e.suspendedLanes & o);
                break;
              }
              e.timeoutHandle = Df(Nt.bind(null, e), n);
              break;
            }
            Nt(e);
            break;
          case 4:
            if ((hr(e, r), (r & 4186112) === r)) break;
            for (n = e.eventTimes, o = -1; 0 < r; ) {
              var l = 31 - yt(r);
              (i = 1 << l), (l = n[l]), l > o && (o = l), (r &= ~i);
            }
            if (
              ((r = o),
              (r = oe() - r),
              (r =
                (120 > r
                  ? 120
                  : 480 > r
                  ? 480
                  : 1080 > r
                  ? 1080
                  : 1920 > r
                  ? 1920
                  : 3e3 > r
                  ? 3e3
                  : 4320 > r
                  ? 4320
                  : 1960 * xy(r / 1960)) - r),
              10 < r)
            ) {
              e.timeoutHandle = Df(Nt.bind(null, e), r);
              break;
            }
            Nt(e);
            break;
          case 5:
            Nt(e);
            break;
          default:
            throw Error(v(329));
        }
      }
      return Ee(e, oe()), e.callbackNode === t ? Md.bind(null, e) : null;
    }
    function hr(e, t) {
      for (t &= ~vu, t &= ~Pr, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes; 0 < t; ) {
        var r = 31 - yt(t),
          n = 1 << r;
        (e[r] = -1), (t &= ~n);
      }
    }
    function Ls(e) {
      if ((T & 48) !== 0) throw Error(v(327));
      if ((wt(), e === se && (e.expiredLanes & ie) !== 0)) {
        var t = ie,
          r = hn(e, t);
        (Er & Pr) !== 0 && ((t = On(e, t)), (r = hn(e, t)));
      } else (t = On(e, 0)), (r = hn(e, t));
      if (
        (e.tag !== 0 &&
          r === 2 &&
          ((T |= 64), e.hydrate && ((e.hydrate = !1), ou(e.containerInfo)), (t = Hc(e)), t !== 0 && (r = hn(e, t))),
        r === 1)
      )
        throw ((r = Ti), yr(e, 0), hr(e, t), Ee(e, oe()), r);
      return (e.finishedWork = e.current.alternate), (e.finishedLanes = t), Nt(e), Ee(e, oe()), null;
    }
    function wy() {
      if (qe !== null) {
        var e = qe;
        (qe = null),
          e.forEach(function (t) {
            (t.expiredLanes |= 24 & t.pendingLanes), Ee(t, oe());
          });
      }
      Ue();
    }
    function Dd(e, t) {
      var r = T;
      T |= 1;
      try {
        return e(t);
      } finally {
        (T = r), T === 0 && (Rr(), Ue());
      }
    }
    function jd(e, t) {
      var r = T;
      (T &= -2), (T |= 8);
      try {
        return e(t);
      } finally {
        (T = r), T === 0 && (Rr(), Ue());
      }
    }
    function jo(e, t) {
      F(Ns, Dt), (Dt |= t), (Er |= t);
    }
    function wu() {
      (Dt = Ns.current), z(Ns);
    }
    function yr(e, t) {
      (e.finishedWork = null), (e.finishedLanes = 0);
      var r = e.timeoutHandle;
      if ((r !== -1 && ((e.timeoutHandle = -1), ty(r)), G !== null))
        for (r = G.return; r !== null; ) {
          var n = r;
          switch (n.tag) {
            case 1:
              (n = n.type.childContextTypes), n != null && ri();
              break;
            case 3:
              wr(), z(de), z(le), cu();
              break;
            case 5:
              fu(n);
              break;
            case 4:
              wr();
              break;
            case 13:
              z(A);
              break;
            case 19:
              z(A);
              break;
            case 10:
              uu(n);
              break;
            case 23:
            case 24:
              wu();
          }
          r = r.return;
        }
      (se = e), (G = vt(e.current, null)), (ie = Dt = Er = t), (J = 0), (Ti = null), (vu = Pr = Vn = 0);
    }
    function zd(e, t) {
      do {
        var r = G;
        try {
          if ((su(), (kn.current = pi), ai)) {
            for (var n = W.memoizedState; n !== null; ) {
              var o = n.queue;
              o !== null && (o.pending = null), (n = n.next);
            }
            ai = !1;
          }
          if (((Fn = 0), (Z = ne = W = null), (En = !1), (Su.current = null), r === null || r.return === null)) {
            (J = 1), (Ti = t), (G = null);
            break;
          }
          e: {
            var i = e,
              l = r.return,
              s = r,
              u = t;
            if (
              ((t = ie),
              (s.flags |= 2048),
              (s.firstEffect = s.lastEffect = null),
              u !== null && typeof u == 'object' && typeof u.then == 'function')
            ) {
              var a = u;
              if ((s.mode & 2) === 0) {
                var y = s.alternate;
                y
                  ? ((s.updateQueue = y.updateQueue), (s.memoizedState = y.memoizedState), (s.lanes = y.lanes))
                  : ((s.updateQueue = null), (s.memoizedState = null));
              }
              var S = (A.current & 1) !== 0,
                m = l;
              do {
                var w;
                if ((w = m.tag === 13)) {
                  var k = m.memoizedState;
                  if (k !== null) w = k.dehydrated !== null;
                  else {
                    var x = m.memoizedProps;
                    w = x.fallback === void 0 ? !1 : x.unstable_avoidThisFallback !== !0 ? !0 : !S;
                  }
                }
                if (w) {
                  var d = m.updateQueue;
                  if (d === null) {
                    var f = new Set();
                    f.add(a), (m.updateQueue = f);
                  } else d.add(a);
                  if ((m.mode & 2) === 0) {
                    if (((m.flags |= 64), (s.flags |= 16384), (s.flags &= -2981), s.tag === 1))
                      if (s.alternate === null) s.tag = 17;
                      else {
                        var c = ft(-1, 1);
                        (c.tag = 2), ct(s, c);
                      }
                    s.lanes |= 1;
                    break e;
                  }
                  (u = void 0), (s = t);
                  var h = i.pingCache;
                  if (
                    (h === null
                      ? ((h = i.pingCache = new hy()), (u = new Set()), h.set(a, u))
                      : ((u = h.get(a)), u === void 0 && ((u = new Set()), h.set(a, u))),
                    !u.has(s))
                  ) {
                    u.add(s);
                    var p = Ty.bind(null, i, a, s);
                    a.then(p, p);
                  }
                  (m.flags |= 4096), (m.lanes = t);
                  break e;
                }
                m = m.return;
              } while (m !== null);
              u = Error(
                (ur(s.type) || 'A React component') +
                  ` suspended while rendering, but no fallback UI was specified.

Add a <Suspense fallback=...> component higher in the tree to provide a loading indicator or placeholder to display.`,
              );
            }
            J !== 5 && (J = 2), (u = gu(u, s)), (m = l);
            do {
              switch (m.tag) {
                case 3:
                  (i = u), (m.flags |= 4096), (t &= -t), (m.lanes |= t);
                  var N = bd(m, i, t);
                  Wf(m, N);
                  break e;
                case 1:
                  i = u;
                  var C = m.type,
                    P = m.stateNode;
                  if (
                    (m.flags & 64) === 0 &&
                    (typeof C.getDerivedStateFromError == 'function' ||
                      (P !== null && typeof P.componentDidCatch == 'function' && ($e === null || !$e.has(P))))
                  ) {
                    (m.flags |= 4096), (t &= -t), (m.lanes |= t);
                    var _ = Od(m, i, t);
                    Wf(m, _);
                    break e;
                  }
              }
              m = m.return;
            } while (m !== null);
          }
          Fd(r);
        } catch (B) {
          (t = B), G === r && r !== null && (G = r = r.return);
          continue;
        }
        break;
      } while (1);
    }
    function $d() {
      var e = mi.current;
      return (mi.current = pi), e === null ? pi : e;
    }
    function hn(e, t) {
      var r = T;
      T |= 16;
      var n = $d();
      (se === e && ie === t) || yr(e, t);
      do
        try {
          Cy();
          break;
        } catch (o) {
          zd(e, o);
        }
      while (1);
      if ((su(), (T = r), (mi.current = n), G !== null)) throw Error(v(261));
      return (se = null), (ie = 0), J;
    }
    function Cy() {
      for (; G !== null; ) Ad(G);
    }
    function ky() {
      for (; G !== null && !oy(); ) Ad(G);
    }
    function Ad(e) {
      var t = Wd(e.alternate, e, Dt);
      (e.memoizedProps = e.pendingProps), t === null ? Fd(e) : (G = t), (Su.current = null);
    }
    function Fd(e) {
      var t = e;
      do {
        var r = t.alternate;
        if (((e = t.return), (t.flags & 2048) === 0)) {
          if (((r = py(r, t, Dt)), r !== null)) {
            G = r;
            return;
          }
          if (
            ((r = t),
            (r.tag !== 24 && r.tag !== 23) || r.memoizedState === null || (Dt & 1073741824) !== 0 || (r.mode & 4) === 0)
          ) {
            for (var n = 0, o = r.child; o !== null; ) (n |= o.lanes | o.childLanes), (o = o.sibling);
            r.childLanes = n;
          }
          e !== null &&
            (e.flags & 2048) === 0 &&
            (e.firstEffect === null && (e.firstEffect = t.firstEffect),
            t.lastEffect !== null &&
              (e.lastEffect !== null && (e.lastEffect.nextEffect = t.firstEffect), (e.lastEffect = t.lastEffect)),
            1 < t.flags &&
              (e.lastEffect !== null ? (e.lastEffect.nextEffect = t) : (e.firstEffect = t), (e.lastEffect = t)));
        } else {
          if (((r = my(t)), r !== null)) {
            (r.flags &= 2047), (G = r);
            return;
          }
          e !== null && ((e.firstEffect = e.lastEffect = null), (e.flags |= 2048));
        }
        if (((t = t.sibling), t !== null)) {
          G = t;
          return;
        }
        G = t = e;
      } while (t !== null);
      J === 0 && (J = 5);
    }
    function Nt(e) {
      var t = xr();
      return Mt(99, Ey.bind(null, e, t)), null;
    }
    function Ey(e, t) {
      do wt();
      while (Pn !== null);
      if ((T & 48) !== 0) throw Error(v(327));
      var r = e.finishedWork;
      if (r === null) return null;
      if (((e.finishedWork = null), (e.finishedLanes = 0), r === e.current)) throw Error(v(177));
      e.callbackNode = null;
      var n = r.lanes | r.childLanes,
        o = n,
        i = e.pendingLanes & ~o;
      (e.pendingLanes = o),
        (e.suspendedLanes = 0),
        (e.pingedLanes = 0),
        (e.expiredLanes &= o),
        (e.mutableReadLanes &= o),
        (e.entangledLanes &= o),
        (o = e.entanglements);
      for (var l = e.eventTimes, s = e.expirationTimes; 0 < i; ) {
        var u = 31 - yt(i),
          a = 1 << u;
        (o[u] = 0), (l[u] = -1), (s[u] = -1), (i &= ~a);
      }
      if (
        (qe !== null && (n & 24) === 0 && qe.has(e) && qe.delete(e),
        e === se && ((G = se = null), (ie = 0)),
        1 < r.flags
          ? r.lastEffect !== null
            ? ((r.lastEffect.nextEffect = r), (n = r.firstEffect))
            : (n = r)
          : (n = r.firstEffect),
        n !== null)
      ) {
        if (((o = T), (T |= 32), (Su.current = null), (jl = $o), (l = _f()), fs(l))) {
          if ('selectionStart' in l) s = { start: l.selectionStart, end: l.selectionEnd };
          else
            e: if (
              ((s = ((s = l.ownerDocument) && s.defaultView) || window),
              (a = s.getSelection && s.getSelection()) && a.rangeCount !== 0)
            ) {
              (s = a.anchorNode), (i = a.anchorOffset), (u = a.focusNode), (a = a.focusOffset);
              try {
                s.nodeType, u.nodeType;
              } catch {
                s = null;
                break e;
              }
              var y = 0,
                S = -1,
                m = -1,
                w = 0,
                k = 0,
                x = l,
                d = null;
              t: for (;;) {
                for (
                  var f;
                  x !== s || (i !== 0 && x.nodeType !== 3) || (S = y + i),
                    x !== u || (a !== 0 && x.nodeType !== 3) || (m = y + a),
                    x.nodeType === 3 && (y += x.nodeValue.length),
                    (f = x.firstChild) !== null;

                )
                  (d = x), (x = f);
                for (;;) {
                  if (x === l) break t;
                  if ((d === s && ++w === i && (S = y), d === u && ++k === a && (m = y), (f = x.nextSibling) !== null))
                    break;
                  (x = d), (d = x.parentNode);
                }
                x = f;
              }
              s = S === -1 || m === -1 ? null : { start: S, end: m };
            } else s = null;
          s = s || { start: 0, end: 0 };
        } else s = null;
        (zl = { focusedElem: l, selectionRange: s }), ($o = !1), (Nn = null), (Go = !1), (R = n);
        do
          try {
            Py();
          } catch (B) {
            if (R === null) throw Error(v(330));
            mt(R, B), (R = R.nextEffect);
          }
        while (R !== null);
        (Nn = null), (R = n);
        do
          try {
            for (l = e; R !== null; ) {
              var c = R.flags;
              if ((c & 16 && Bn(R.stateNode, ''), c & 128)) {
                var h = R.alternate;
                if (h !== null) {
                  var p = h.ref;
                  p !== null && (typeof p == 'function' ? p(null) : (p.current = null));
                }
              }
              switch (c & 1038) {
                case 2:
                  mc(R), (R.flags &= -3);
                  break;
                case 6:
                  mc(R), (R.flags &= -3), Vl(R.alternate, R);
                  break;
                case 1024:
                  R.flags &= -1025;
                  break;
                case 1028:
                  (R.flags &= -1025), Vl(R.alternate, R);
                  break;
                case 4:
                  Vl(R.alternate, R);
                  break;
                case 8:
                  (s = R), Ld(l, s);
                  var N = s.alternate;
                  dc(s), N !== null && dc(N);
              }
              R = R.nextEffect;
            }
          } catch (B) {
            if (R === null) throw Error(v(330));
            mt(R, B), (R = R.nextEffect);
          }
        while (R !== null);
        if (
          ((p = zl),
          (h = _f()),
          (c = p.focusedElem),
          (l = p.selectionRange),
          h !== c && c && c.ownerDocument && Zc(c.ownerDocument.documentElement, c))
        ) {
          for (
            l !== null &&
              fs(c) &&
              ((h = l.start),
              (p = l.end),
              p === void 0 && (p = h),
              ('selectionStart' in c)
                ? ((c.selectionStart = h), (c.selectionEnd = Math.min(p, c.value.length)))
                : ((p = ((h = c.ownerDocument || document) && h.defaultView) || window),
                  p.getSelection &&
                    ((p = p.getSelection()),
                    (s = c.textContent.length),
                    (N = Math.min(l.start, s)),
                    (l = l.end === void 0 ? N : Math.min(l.end, s)),
                    !p.extend && N > l && ((s = l), (l = N), (N = s)),
                    (s = Bf(c, N)),
                    (i = Bf(c, l)),
                    s &&
                      i &&
                      (p.rangeCount !== 1 ||
                        p.anchorNode !== s.node ||
                        p.anchorOffset !== s.offset ||
                        p.focusNode !== i.node ||
                        p.focusOffset !== i.offset) &&
                      ((h = h.createRange()),
                      h.setStart(s.node, s.offset),
                      p.removeAllRanges(),
                      N > l
                        ? (p.addRange(h), p.extend(i.node, i.offset))
                        : (h.setEnd(i.node, i.offset), p.addRange(h)))))),
              h = [],
              p = c;
            (p = p.parentNode);

          )
            p.nodeType === 1 && h.push({ element: p, left: p.scrollLeft, top: p.scrollTop });
          for (typeof c.focus == 'function' && c.focus(), c = 0; c < h.length; c++)
            (p = h[c]), (p.element.scrollLeft = p.left), (p.element.scrollTop = p.top);
        }
        ($o = !!jl), (zl = jl = null), (e.current = r), (R = n);
        do
          try {
            for (c = e; R !== null; ) {
              var C = R.flags;
              if ((C & 36 && Sy(c, R.alternate, R), C & 128)) {
                h = void 0;
                var P = R.ref;
                if (P !== null) {
                  var _ = R.stateNode;
                  switch (R.tag) {
                    case 5:
                      h = _;
                      break;
                    default:
                      h = _;
                  }
                  typeof P == 'function' ? P(h) : (P.current = h);
                }
              }
              R = R.nextEffect;
            }
          } catch (B) {
            if (R === null) throw Error(v(330));
            mt(R, B), (R = R.nextEffect);
          }
        while (R !== null);
        (R = null), ly(), (T = o);
      } else e.current = r;
      if (St) (St = !1), (Pn = e), (mn = t);
      else
        for (R = n; R !== null; )
          (t = R.nextEffect),
            (R.nextEffect = null),
            R.flags & 8 && ((C = R), (C.sibling = null), (C.stateNode = null)),
            (R = t);
      if (
        ((n = e.pendingLanes),
        n === 0 && ($e = null),
        n === 1 ? (e === Os ? Rn++ : ((Rn = 0), (Os = e))) : (Rn = 0),
        (r = r.stateNode),
        Ot && typeof Ot.onCommitFiberRoot == 'function')
      )
        try {
          Ot.onCommitFiberRoot(iu, r, void 0, (r.current.flags & 64) === 64);
        } catch {}
      if ((Ee(e, oe()), hi)) throw ((hi = !1), (e = _s), (_s = null), e);
      return (T & 8) !== 0 || Ue(), null;
    }
    function Py() {
      for (; R !== null; ) {
        var e = R.alternate;
        Go ||
          Nn === null ||
          ((R.flags & 8) !== 0 ? yf(R, Nn) && (Go = !0) : R.tag === 13 && vy(e, R) && yf(R, Nn) && (Go = !0));
        var t = R.flags;
        (t & 256) !== 0 && gy(e, R),
          (t & 512) === 0 ||
            St ||
            ((St = !0),
            jn(97, function () {
              return wt(), null;
            })),
          (R = R.nextEffect);
      }
    }
    function wt() {
      if (mn !== 90) {
        var e = 97 < mn ? 97 : mn;
        return (mn = 90), Mt(e, Ny);
      }
      return !1;
    }
    function Ry(e, t) {
      Is.push(t, e),
        St ||
          ((St = !0),
          jn(97, function () {
            return wt(), null;
          }));
    }
    function Ud(e, t) {
      bs.push(t, e),
        St ||
          ((St = !0),
          jn(97, function () {
            return wt(), null;
          }));
    }
    function Ny() {
      if (Pn === null) return !1;
      var e = Pn;
      if (((Pn = null), (T & 48) !== 0)) throw Error(v(331));
      var t = T;
      T |= 32;
      var r = bs;
      bs = [];
      for (var n = 0; n < r.length; n += 2) {
        var o = r[n],
          i = r[n + 1],
          l = o.destroy;
        if (((o.destroy = void 0), typeof l == 'function'))
          try {
            l();
          } catch (u) {
            if (i === null) throw Error(v(330));
            mt(i, u);
          }
      }
      for (r = Is, Is = [], n = 0; n < r.length; n += 2) {
        (o = r[n]), (i = r[n + 1]);
        try {
          var s = o.create;
          o.destroy = s();
        } catch (u) {
          if (i === null) throw Error(v(330));
          mt(i, u);
        }
      }
      for (s = e.current.firstEffect; s !== null; )
        (e = s.nextEffect), (s.nextEffect = null), s.flags & 8 && ((s.sibling = null), (s.stateNode = null)), (s = e);
      return (T = t), Ue(), !0;
    }
    function yc(e, t, r) {
      (t = gu(r, t)), (t = bd(e, t, 1)), ct(e, t), (t = he()), (e = Bi(e, 1)), e !== null && (wi(e, 1, t), Ee(e, t));
    }
    function mt(e, t) {
      if (e.tag === 3) yc(e, e, t);
      else
        for (var r = e.return; r !== null; ) {
          if (r.tag === 3) {
            yc(r, e, t);
            break;
          } else if (r.tag === 1) {
            var n = r.stateNode;
            if (
              typeof r.type.getDerivedStateFromError == 'function' ||
              (typeof n.componentDidCatch == 'function' && ($e === null || !$e.has(n)))
            ) {
              e = gu(t, e);
              var o = Od(r, e, 1);
              if ((ct(r, o), (o = he()), (r = Bi(r, 1)), r !== null)) wi(r, 1, o), Ee(r, o);
              else if (typeof n.componentDidCatch == 'function' && ($e === null || !$e.has(n)))
                try {
                  n.componentDidCatch(t, e);
                } catch {}
              break;
            }
          }
          r = r.return;
        }
    }
    function Ty(e, t, r) {
      var n = e.pingCache;
      n !== null && n.delete(t),
        (t = he()),
        (e.pingedLanes |= e.suspendedLanes & r),
        se === e &&
          (ie & r) === r &&
          (J === 4 || (J === 3 && (ie & 62914560) === ie && 500 > oe() - xu) ? yr(e, 0) : (vu |= r)),
        Ee(e, t);
    }
    function By(e, t) {
      var r = e.stateNode;
      r !== null && r.delete(t),
        (t = 0),
        t === 0 &&
          ((t = e.mode),
          (t & 2) === 0
            ? (t = 1)
            : (t & 4) === 0
            ? (t = xr() === 99 ? 1 : 2)
            : (Ye === 0 && (Ye = Er), (t = tr(62914560 & ~Ye)), t === 0 && (t = 4194304))),
        (r = he()),
        (e = Bi(e, t)),
        e !== null && (wi(e, t, r), Ee(e, r));
    }
    var Wd;
    Wd = function (e, t, r) {
      var n = t.lanes;
      if (e !== null)
        if (e.memoizedProps !== t.pendingProps || de.current) _e = !0;
        else if ((r & n) !== 0) _e = (e.flags & 16384) !== 0;
        else {
          switch (((_e = !1), t.tag)) {
            case 3:
              rc(t), Ul();
              break;
            case 5:
              Qf(t);
              break;
            case 1:
              pe(t.type) && Uo(t);
              break;
            case 4:
              Ss(t, t.stateNode.containerInfo);
              break;
            case 10:
              n = t.memoizedProps.value;
              var o = t.type._context;
              F(ni, o._currentValue), (o._currentValue = n);
              break;
            case 13:
              if (t.memoizedState !== null)
                return (r & t.child.childLanes) !== 0
                  ? nc(e, t, r)
                  : (F(A, A.current & 1), (t = Xe(e, t, r)), t !== null ? t.sibling : null);
              F(A, A.current & 1);
              break;
            case 19:
              if (((n = (r & t.childLanes) !== 0), (e.flags & 64) !== 0)) {
                if (n) return uc(e, t, r);
                t.flags |= 64;
              }
              if (
                ((o = t.memoizedState),
                o !== null && ((o.rendering = null), (o.tail = null), (o.lastEffect = null)),
                F(A, A.current),
                n)
              )
                break;
              return null;
            case 23:
            case 24:
              return (t.lanes = 0), Wl(e, t, r);
          }
          return Xe(e, t, r);
        }
      else _e = !1;
      switch (((t.lanes = 0), t.tag)) {
        case 2:
          if (
            ((n = t.type),
            e !== null && ((e.alternate = null), (t.alternate = null), (t.flags |= 2)),
            (e = t.pendingProps),
            (o = vr(t, le.current)),
            pr(t, r),
            (o = pu(null, t, n, e, o, r)),
            (t.flags |= 1),
            typeof o == 'object' && o !== null && typeof o.render == 'function' && o.$$typeof === void 0)
          ) {
            if (((t.tag = 1), (t.memoizedState = null), (t.updateQueue = null), pe(n))) {
              var i = !0;
              Uo(t);
            } else i = !1;
            (t.memoizedState = o.state !== null && o.state !== void 0 ? o.state : null), au(t);
            var l = n.getDerivedStateFromProps;
            typeof l == 'function' && li(t, n, l, e),
              (o.updater = Ni),
              (t.stateNode = o),
              (o._reactInternals = t),
              gs(t, n, e, r),
              (t = Cs(null, t, n, !0, i, r));
          } else (t.tag = 0), ce(null, t, o, r), (t = t.child);
          return t;
        case 16:
          o = t.elementType;
          e: {
            switch (
              (e !== null && ((e.alternate = null), (t.alternate = null), (t.flags |= 2)),
              (e = t.pendingProps),
              (i = o._init),
              (o = i(o._payload)),
              (t.type = o),
              (i = t.tag = Iy(o)),
              (e = Be(o, e)),
              i)
            ) {
              case 0:
                t = ws(null, t, o, e, r);
                break e;
              case 1:
                t = tc(null, t, o, e, r);
                break e;
              case 11:
                t = Jf(null, t, o, e, r);
                break e;
              case 14:
                t = ec(null, t, o, Be(o.type, e), n, r);
                break e;
            }
            throw Error(v(306, o, ''));
          }
          return t;
        case 0:
          return (n = t.type), (o = t.pendingProps), (o = t.elementType === n ? o : Be(n, o)), ws(e, t, n, o, r);
        case 1:
          return (n = t.type), (o = t.pendingProps), (o = t.elementType === n ? o : Be(n, o)), tc(e, t, n, o, r);
        case 3:
          if ((rc(t), (n = t.updateQueue), e === null || n === null)) throw Error(v(282));
          if (
            ((n = t.pendingProps),
            (o = t.memoizedState),
            (o = o !== null ? o.element : null),
            md(e, t),
            zn(t, n, null, r),
            (n = t.memoizedState.element),
            n === o)
          )
            Ul(), (t = Xe(e, t, r));
          else {
            if (
              ((o = t.stateNode),
              (i = o.hydrate) && ((lt = dr(t.stateNode.containerInfo.firstChild)), (Ke = t), (i = Fe = !0)),
              i)
            ) {
              if (((e = o.mutableSourceEagerHydrationData), e != null))
                for (o = 0; o < e.length; o += 2) (i = e[o]), (i._workInProgressVersionPrimary = e[o + 1]), mr.push(i);
              for (r = Sd(t, null, n, r), t.child = r; r; ) (r.flags = (r.flags & -3) | 1024), (r = r.sibling);
            } else ce(e, t, n, r), Ul();
            t = t.child;
          }
          return t;
        case 5:
          return (
            Qf(t),
            e === null && vs(t),
            (n = t.type),
            (o = t.pendingProps),
            (i = e !== null ? e.memoizedProps : null),
            (l = o.children),
            ps(n, o) ? (l = null) : i !== null && ps(n, i) && (t.flags |= 16),
            Td(e, t),
            ce(e, t, l, r),
            t.child
          );
        case 6:
          return e === null && vs(t), null;
        case 13:
          return nc(e, t, r);
        case 4:
          return (
            Ss(t, t.stateNode.containerInfo),
            (n = t.pendingProps),
            e === null ? (t.child = si(t, null, n, r)) : ce(e, t, n, r),
            t.child
          );
        case 11:
          return (n = t.type), (o = t.pendingProps), (o = t.elementType === n ? o : Be(n, o)), Jf(e, t, n, o, r);
        case 7:
          return ce(e, t, t.pendingProps, r), t.child;
        case 8:
          return ce(e, t, t.pendingProps.children, r), t.child;
        case 12:
          return ce(e, t, t.pendingProps.children, r), t.child;
        case 10:
          e: {
            (n = t.type._context), (o = t.pendingProps), (l = t.memoizedProps), (i = o.value);
            var s = t.type._context;
            if ((F(ni, s._currentValue), (s._currentValue = i), l !== null))
              if (
                ((s = l.value),
                (i = xe(s, i)
                  ? 0
                  : (typeof n._calculateChangedBits == 'function' ? n._calculateChangedBits(s, i) : 1073741823) | 0),
                i === 0)
              ) {
                if (l.children === o.children && !de.current) {
                  t = Xe(e, t, r);
                  break e;
                }
              } else
                for (s = t.child, s !== null && (s.return = t); s !== null; ) {
                  var u = s.dependencies;
                  if (u !== null) {
                    l = s.child;
                    for (var a = u.firstContext; a !== null; ) {
                      if (a.context === n && (a.observedBits & i) !== 0) {
                        s.tag === 1 && ((a = ft(-1, r & -r)), (a.tag = 2), ct(s, a)),
                          (s.lanes |= r),
                          (a = s.alternate),
                          a !== null && (a.lanes |= r),
                          pd(s.return, r),
                          (u.lanes |= r);
                        break;
                      }
                      a = a.next;
                    }
                  } else l = s.tag === 10 && s.type === t.type ? null : s.child;
                  if (l !== null) l.return = s;
                  else
                    for (l = s; l !== null; ) {
                      if (l === t) {
                        l = null;
                        break;
                      }
                      if (((s = l.sibling), s !== null)) {
                        (s.return = l.return), (l = s);
                        break;
                      }
                      l = l.return;
                    }
                  s = l;
                }
            ce(e, t, o.children, r), (t = t.child);
          }
          return t;
        case 9:
          return (
            (o = t.type),
            (i = t.pendingProps),
            (n = i.children),
            pr(t, r),
            (o = ke(o, i.unstable_observedBits)),
            (n = n(o)),
            (t.flags |= 1),
            ce(e, t, n, r),
            t.child
          );
        case 14:
          return (o = t.type), (i = Be(o, t.pendingProps)), (i = Be(o.type, i)), ec(e, t, o, i, n, r);
        case 15:
          return Nd(e, t, t.type, t.pendingProps, n, r);
        case 17:
          return (
            (n = t.type),
            (o = t.pendingProps),
            (o = t.elementType === n ? o : Be(n, o)),
            e !== null && ((e.alternate = null), (t.alternate = null), (t.flags |= 2)),
            (t.tag = 1),
            pe(n) ? ((e = !0), Uo(t)) : (e = !1),
            pr(t, r),
            yd(t, n, o),
            gs(t, n, o, r),
            Cs(null, t, n, !0, e, r)
          );
        case 19:
          return uc(e, t, r);
        case 23:
          return Wl(e, t, r);
        case 24:
          return Wl(e, t, r);
      }
      throw Error(v(156, t.tag));
    };
    function _y(e, t, r, n) {
      (this.tag = e),
        (this.key = r),
        (this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null),
        (this.index = 0),
        (this.ref = null),
        (this.pendingProps = t),
        (this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null),
        (this.mode = n),
        (this.flags = 0),
        (this.lastEffect = this.firstEffect = this.nextEffect = null),
        (this.childLanes = this.lanes = 0),
        (this.alternate = null);
    }
    function we(e, t, r, n) {
      return new _y(e, t, r, n);
    }
    function Cu(e) {
      return (e = e.prototype), !(!e || !e.isReactComponent);
    }
    function Iy(e) {
      if (typeof e == 'function') return Cu(e) ? 1 : 0;
      if (e != null) {
        if (((e = e.$$typeof), e === Si)) return 11;
        if (e === vi) return 14;
      }
      return 2;
    }
    function vt(e, t) {
      var r = e.alternate;
      return (
        r === null
          ? ((r = we(e.tag, t, e.key, e.mode)),
            (r.elementType = e.elementType),
            (r.type = e.type),
            (r.stateNode = e.stateNode),
            (r.alternate = e),
            (e.alternate = r))
          : ((r.pendingProps = t),
            (r.type = e.type),
            (r.flags = 0),
            (r.nextEffect = null),
            (r.firstEffect = null),
            (r.lastEffect = null)),
        (r.childLanes = e.childLanes),
        (r.lanes = e.lanes),
        (r.child = e.child),
        (r.memoizedProps = e.memoizedProps),
        (r.memoizedState = e.memoizedState),
        (r.updateQueue = e.updateQueue),
        (t = e.dependencies),
        (r.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }),
        (r.sibling = e.sibling),
        (r.index = e.index),
        (r.ref = e.ref),
        r
      );
    }
    function Qo(e, t, r, n, o, i) {
      var l = 2;
      if (((n = e), typeof e == 'function')) Cu(e) && (l = 1);
      else if (typeof e == 'string') l = 5;
      else
        e: switch (e) {
          case nt:
            return gr(r.children, o, i, t);
          case vc:
            (l = 8), (o |= 16);
            break;
          case zs:
            (l = 8), (o |= 1);
            break;
          case yn:
            return (e = we(12, r, t, o | 8)), (e.elementType = yn), (e.type = yn), (e.lanes = i), e;
          case gn:
            return (e = we(13, r, t, o)), (e.type = gn), (e.elementType = gn), (e.lanes = i), e;
          case Yo:
            return (e = we(19, r, t, o)), (e.elementType = Yo), (e.lanes = i), e;
          case Hs:
            return ku(r, o, i, t);
          case Kl:
            return (e = we(24, r, t, o)), (e.elementType = Kl), (e.lanes = i), e;
          default:
            if (typeof e == 'object' && e !== null)
              switch (e.$$typeof) {
                case $s:
                  l = 10;
                  break e;
                case As:
                  l = 9;
                  break e;
                case Si:
                  l = 11;
                  break e;
                case vi:
                  l = 14;
                  break e;
                case Fs:
                  (l = 16), (n = null);
                  break e;
                case Us:
                  l = 22;
                  break e;
              }
            throw Error(v(130, e == null ? e : typeof e, ''));
        }
      return (t = we(l, r, t, o)), (t.elementType = e), (t.type = n), (t.lanes = i), t;
    }
    function gr(e, t, r, n) {
      return (e = we(7, e, n, t)), (e.lanes = r), e;
    }
    function ku(e, t, r, n) {
      return (e = we(23, e, n, t)), (e.elementType = Hs), (e.lanes = r), e;
    }
    function Gl(e, t, r) {
      return (e = we(6, e, null, t)), (e.lanes = r), e;
    }
    function Ql(e, t, r) {
      return (
        (t = we(4, e.children !== null ? e.children : [], e.key, t)),
        (t.lanes = r),
        (t.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }),
        t
      );
    }
    function by(e, t, r) {
      (this.tag = t),
        (this.containerInfo = e),
        (this.finishedWork = this.pingCache = this.current = this.pendingChildren = null),
        (this.timeoutHandle = -1),
        (this.pendingContext = this.context = null),
        (this.hydrate = r),
        (this.callbackNode = null),
        (this.callbackPriority = 0),
        (this.eventTimes = Il(0)),
        (this.expirationTimes = Il(-1)),
        (this.entangledLanes =
          this.finishedLanes =
          this.mutableReadLanes =
          this.expiredLanes =
          this.pingedLanes =
          this.suspendedLanes =
          this.pendingLanes =
            0),
        (this.entanglements = Il(0)),
        (this.mutableSourceEagerHydrationData = null);
    }
    function Oy(e, t, r) {
      var n = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
      return { $$typeof: Tt, key: n == null ? null : '' + n, children: e, containerInfo: t, implementation: r };
    }
    function yi(e, t, r, n) {
      var o = t.current,
        i = he(),
        l = dt(o);
      e: if (r) {
        r = r._reactInternals;
        t: {
          if ($t(r) !== r || r.tag !== 1) throw Error(v(170));
          var s = r;
          do {
            switch (s.tag) {
              case 3:
                s = s.stateNode.context;
                break t;
              case 1:
                if (pe(s.type)) {
                  s = s.stateNode.__reactInternalMemoizedMergedChildContext;
                  break t;
                }
            }
            s = s.return;
          } while (s !== null);
          throw Error(v(171));
        }
        if (r.tag === 1) {
          var u = r.type;
          if (pe(u)) {
            r = ld(r, u, s);
            break e;
          }
        }
        r = s;
      } else r = gt;
      return (
        t.context === null ? (t.context = r) : (t.pendingContext = r),
        (t = ft(i, l)),
        (t.payload = { element: e }),
        (n = n === void 0 ? null : n),
        n !== null && (t.callback = n),
        ct(o, t),
        pt(o, l, i),
        l
      );
    }
    function Yl(e) {
      if (((e = e.current), !e.child)) return null;
      switch (e.child.tag) {
        case 5:
          return e.child.stateNode;
        default:
          return e.child.stateNode;
      }
    }
    function gc(e, t) {
      if (((e = e.memoizedState), e !== null && e.dehydrated !== null)) {
        var r = e.retryLane;
        e.retryLane = r !== 0 && r < t ? r : t;
      }
    }
    function Eu(e, t) {
      gc(e, t), (e = e.alternate) && gc(e, t);
    }
    function Ly() {
      return null;
    }
    function Pu(e, t, r) {
      var n = (r != null && r.hydrationOptions != null && r.hydrationOptions.mutableSources) || null;
      if (
        ((r = new by(e, t, r != null && r.hydrate === !0)),
        (t = we(3, null, null, t === 2 ? 7 : t === 1 ? 3 : 0)),
        (r.current = t),
        (t.stateNode = r),
        au(t),
        (e[kr] = r.current),
        td(e.nodeType === 8 ? e.parentNode : e),
        n)
      )
        for (e = 0; e < n.length; e++) {
          t = n[e];
          var o = t._getVersion;
          (o = o(t._source)),
            r.mutableSourceEagerHydrationData == null
              ? (r.mutableSourceEagerHydrationData = [t, o])
              : r.mutableSourceEagerHydrationData.push(t, o);
        }
      this._internalRoot = r;
    }
    Pu.prototype.render = function (e) {
      yi(e, this._internalRoot, null, null);
    };
    Pu.prototype.unmount = function () {
      var e = this._internalRoot,
        t = e.containerInfo;
      yi(null, e, null, function () {
        t[kr] = null;
      });
    };
    function Gn(e) {
      return !(
        !e ||
        (e.nodeType !== 1 &&
          e.nodeType !== 9 &&
          e.nodeType !== 11 &&
          (e.nodeType !== 8 || e.nodeValue !== ' react-mount-point-unstable '))
      );
    }
    function My(e, t) {
      if (
        (t ||
          ((t = e ? (e.nodeType === 9 ? e.documentElement : e.firstChild) : null),
          (t = !(!t || t.nodeType !== 1 || !t.hasAttribute('data-reactroot')))),
        !t)
      )
        for (var r; (r = e.lastChild); ) e.removeChild(r);
      return new Pu(e, 0, t ? { hydrate: !0 } : void 0);
    }
    function _i(e, t, r, n, o) {
      var i = r._reactRootContainer;
      if (i) {
        var l = i._internalRoot;
        if (typeof o == 'function') {
          var s = o;
          o = function () {
            var a = Yl(l);
            s.call(a);
          };
        }
        yi(t, l, e, o);
      } else {
        if (((i = r._reactRootContainer = My(r, n)), (l = i._internalRoot), typeof o == 'function')) {
          var u = o;
          o = function () {
            var a = Yl(l);
            u.call(a);
          };
        }
        jd(function () {
          yi(t, l, e, o);
        });
      }
      return Yl(l);
    }
    Lc = function (e) {
      if (e.tag === 13) {
        var t = he();
        pt(e, 4, t), Eu(e, 4);
      }
    };
    Ks = function (e) {
      if (e.tag === 13) {
        var t = he();
        pt(e, 67108864, t), Eu(e, 67108864);
      }
    };
    Mc = function (e) {
      if (e.tag === 13) {
        var t = he(),
          r = dt(e);
        pt(e, r, t), Eu(e, r);
      }
    };
    Dc = function (e, t) {
      return t();
    };
    is = function (e, t, r) {
      switch (t) {
        case 'input':
          if ((ql(e, r), (t = r.name), r.type === 'radio' && t != null)) {
            for (r = e; r.parentNode; ) r = r.parentNode;
            for (
              r = r.querySelectorAll('input[name=' + JSON.stringify('' + t) + '][type="radio"]'), t = 0;
              t < r.length;
              t++
            ) {
              var n = r[t];
              if (n !== e && n.form === e.form) {
                var o = Pi(n);
                if (!o) throw Error(v(90));
                wc(n), ql(n, o);
              }
            }
          }
          break;
        case 'textarea':
          kc(e, r);
          break;
        case 'select':
          (t = r.value), t != null && ar(e, !!r.multiple, t, !1);
      }
    };
    Gs = Dd;
    _c = function (e, t, r, n, o) {
      var i = T;
      T |= 4;
      try {
        return Mt(98, e.bind(null, t, r, n, o));
      } finally {
        (T = i), T === 0 && (Rr(), Ue());
      }
    };
    Qs = function () {
      (T & 49) === 0 && (wy(), wt());
    };
    Ic = function (e, t) {
      var r = T;
      T |= 2;
      try {
        return e(t);
      } finally {
        (T = r), T === 0 && (Rr(), Ue());
      }
    };
    function Hd(e, t) {
      var r = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
      if (!Gn(t)) throw Error(v(200));
      return Oy(e, t, null, r);
    }
    var Dy = { Events: [Wn, ir, Pi, Tc, Bc, wt, { current: !1 }] },
      an = { findFiberByHostInstance: _t, bundleType: 0, version: '17.0.2', rendererPackageName: 'react-dom' },
      jy = {
        bundleType: an.bundleType,
        version: an.version,
        rendererPackageName: an.rendererPackageName,
        rendererConfig: an.rendererConfig,
        overrideHookState: null,
        overrideHookStateDeletePath: null,
        overrideHookStateRenamePath: null,
        overrideProps: null,
        overridePropsDeletePath: null,
        overridePropsRenamePath: null,
        setSuspenseHandler: null,
        scheduleUpdate: null,
        currentDispatcherRef: zt.ReactCurrentDispatcher,
        findHostInstanceByFiber: function (e) {
          return (e = Oc(e)), e === null ? null : e.stateNode;
        },
        findFiberByHostInstance: an.findFiberByHostInstance || Ly,
        findHostInstancesForRefresh: null,
        scheduleRefresh: null,
        scheduleRoot: null,
        setRefreshHandler: null,
        getCurrentFiber: null,
      };
    if (
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < 'u' &&
      ((fn = __REACT_DEVTOOLS_GLOBAL_HOOK__), !fn.isDisabled && fn.supportsFiber)
    )
      try {
        (iu = fn.inject(jy)), (Ot = fn);
      } catch {}
    var fn;
    Pe.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Dy;
    Pe.createPortal = Hd;
    Pe.findDOMNode = function (e) {
      if (e == null) return null;
      if (e.nodeType === 1) return e;
      var t = e._reactInternals;
      if (t === void 0) throw typeof e.render == 'function' ? Error(v(188)) : Error(v(268, Object.keys(e)));
      return (e = Oc(t)), (e = e === null ? null : e.stateNode), e;
    };
    Pe.flushSync = function (e, t) {
      var r = T;
      if ((r & 48) !== 0) return e(t);
      T |= 1;
      try {
        if (e) return Mt(99, e.bind(null, t));
      } finally {
        (T = r), Ue();
      }
    };
    Pe.hydrate = function (e, t, r) {
      if (!Gn(t)) throw Error(v(200));
      return _i(null, e, t, !0, r);
    };
    Pe.render = function (e, t, r) {
      if (!Gn(t)) throw Error(v(200));
      return _i(null, e, t, !1, r);
    };
    Pe.unmountComponentAtNode = function (e) {
      if (!Gn(e)) throw Error(v(40));
      return e._reactRootContainer
        ? (jd(function () {
            _i(null, null, e, !1, function () {
              (e._reactRootContainer = null), (e[kr] = null);
            });
          }),
          !0)
        : !1;
    };
    Pe.unstable_batchedUpdates = Dd;
    Pe.unstable_createPortal = function (e, t) {
      return Hd(e, t, 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null);
    };
    Pe.unstable_renderSubtreeIntoContainer = function (e, t, r, n) {
      if (!Gn(r)) throw Error(v(200));
      if (e == null || e._reactInternals === void 0) throw Error(v(38));
      return _i(e, t, r, !1, n);
    };
    Pe.version = '17.0.2';
  });
  var Yd = Pt((fg, Qd) => {
    'use strict';
    function Gd() {
      if (
        !(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > 'u' || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != 'function')
      )
        try {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Gd);
        } catch (e) {
          console.error(e);
        }
    }
    Gd(), (Qd.exports = Vd());
  });
  var Ba = q(Q()),
    Em = q(Yd());
  var zy = ['Top', 'Right', 'Bottom', 'Left'];
  function We(e, t, ...r) {
    let [n, o = n, i = n, l = o] = r,
      s = [n, o, i, l],
      u = {};
    for (let a = 0; a < s.length; a += 1)
      if (s[a] || s[a] === 0) {
        let y = e + zy[a] + t;
        u[y] = s[a];
      }
    return u;
  }
  function Qn(...e) {
    return We('border', 'Width', ...e);
  }
  function Yn(...e) {
    return We('border', 'Style', ...e);
  }
  function Kn(...e) {
    return We('border', 'Color', ...e);
  }
  function Ru(...e) {
    return E(E(E({}, Qn(e[0])), e[1] && Yn(e[1])), e[2] && Kn(e[2]));
  }
  function Nu(...e) {
    return E(E({ borderLeftWidth: e[0] }, e[1] && { borderLeftStyle: e[1] }), e[2] && { borderLeftColor: e[2] });
  }
  function Tu(...e) {
    return E(E({ borderBottomWidth: e[0] }, e[1] && { borderBottomStyle: e[1] }), e[2] && { borderBottomColor: e[2] });
  }
  function Bu(...e) {
    return E(E({ borderRightWidth: e[0] }, e[1] && { borderRightStyle: e[1] }), e[2] && { borderRightColor: e[2] });
  }
  function _u(...e) {
    return E(E({ borderTopWidth: e[0] }, e[1] && { borderTopStyle: e[1] }), e[2] && { borderTopColor: e[2] });
  }
  function Iu(e, t = e, r = e, n = t) {
    return { borderBottomRightRadius: r, borderBottomLeftRadius: n, borderTopRightRadius: t, borderTopLeftRadius: e };
  }
  var $y = e => typeof e == 'string' && /(\d+(\w+|%))/.test(e),
    Ii = e => typeof e == 'number' && !Number.isNaN(e),
    Ay = e => e === 'initial',
    Kd = e => e === 'auto',
    Fy = e => e === 'none',
    Uy = ['content', 'fit-content', 'max-content', 'min-content'],
    bu = e => Uy.some(t => e === t) || $y(e);
  function Ou(...e) {
    let t = e.length === 1,
      r = e.length === 2,
      n = e.length === 3;
    if (t) {
      let [o] = e;
      if (Ay(o)) return { flexGrow: 0, flexShrink: 1, flexBasis: 'auto' };
      if (Kd(o)) return { flexGrow: 1, flexShrink: 1, flexBasis: 'auto' };
      if (Fy(o)) return { flexGrow: 0, flexShrink: 0, flexBasis: 'auto' };
      if (Ii(o)) return { flexGrow: o, flexShrink: 1, flexBasis: 0 };
      if (bu(o)) return { flexGrow: 1, flexShrink: 1, flexBasis: o };
    }
    if (r) {
      let [o, i] = e;
      if (Ii(i)) return { flexGrow: o, flexShrink: i, flexBasis: 0 };
      if (bu(i)) return { flexGrow: o, flexShrink: 1, flexBasis: i };
    }
    if (n) {
      let [o, i, l] = e;
      if (Ii(o) && Ii(i) && (Kd(l) || bu(l))) return { flexGrow: o, flexShrink: i, flexBasis: l };
    }
    return {};
  }
  function Lu(e, t = e) {
    return { columnGap: e, rowGap: t };
  }
  function Mu(...e) {
    return We('margin', '', ...e);
  }
  function Du(...e) {
    return We('padding', '', ...e);
  }
  function ju(e, t = e) {
    return { overflowX: e, overflowY: t };
  }
  function zu(...e) {
    let [t, r = t, n = t, o = r] = e;
    return { top: t, right: r, bottom: n, left: o };
  }
  function $u(e, t, r) {
    return E(E({ outlineWidth: e }, t && { outlineStyle: t }), r && { outlineColor: r });
  }
  var Xn = 'f',
    bi = 7,
    Nr = '___',
    Xd = '_',
    qd = Nr.length + bi,
    qn = {},
    Zd = 0,
    Jd = 1,
    ep = {
      all: 1,
      animation: 1,
      background: 1,
      backgroundPosition: 1,
      border: 1,
      borderBlock: 1,
      borderBlockEnd: 1,
      borderBlockStart: 1,
      borderBottom: 1,
      borderColor: 1,
      borderImage: 1,
      borderInline: 1,
      borderInlineEnd: 1,
      borderInlineStart: 1,
      borderLeft: 1,
      borderRadius: 1,
      borderRight: 1,
      borderStyle: 1,
      borderTop: 1,
      borderWidth: 1,
      columns: 1,
      columnRule: 1,
      flex: 1,
      flexFlow: 1,
      font: 1,
      gap: 1,
      grid: 1,
      gridArea: 1,
      gridColumn: 1,
      gridRow: 1,
      gridTemplate: 1,
      lineClamp: 1,
      listStyle: 1,
      margin: 1,
      mask: 1,
      maskBorder: 1,
      motion: 1,
      offset: 1,
      outline: 1,
      overflow: 1,
      overscrollBehavior: 1,
      padding: 1,
      placeItems: 1,
      placeSelf: 1,
      textDecoration: 1,
      textEmphasis: 1,
      transition: 1,
    };
  function Wy(e) {
    for (var t = 0, r, n = 0, o = e.length; o >= 4; ++n, o -= 4)
      (r =
        (e.charCodeAt(n) & 255) |
        ((e.charCodeAt(++n) & 255) << 8) |
        ((e.charCodeAt(++n) & 255) << 16) |
        ((e.charCodeAt(++n) & 255) << 24)),
        (r = (r & 65535) * 1540483477 + (((r >>> 16) * 59797) << 16)),
        (r ^= r >>> 24),
        (t =
          ((r & 65535) * 1540483477 + (((r >>> 16) * 59797) << 16)) ^
          ((t & 65535) * 1540483477 + (((t >>> 16) * 59797) << 16)));
    switch (o) {
      case 3:
        t ^= (e.charCodeAt(n + 2) & 255) << 16;
      case 2:
        t ^= (e.charCodeAt(n + 1) & 255) << 8;
      case 1:
        (t ^= e.charCodeAt(n) & 255), (t = (t & 65535) * 1540483477 + (((t >>> 16) * 59797) << 16));
    }
    return (
      (t ^= t >>> 13),
      (t = (t & 65535) * 1540483477 + (((t >>> 16) * 59797) << 16)),
      ((t ^ (t >>> 15)) >>> 0).toString(36)
    );
  }
  var Ie = Wy;
  function Au(e) {
    let t = e.length;
    if (t === bi) return e;
    for (let r = t; r < bi; r++) e += '0';
    return e;
  }
  function Oi(e, t, r = []) {
    return Nr + Au(Ie(e + t));
  }
  function Fu(e, t) {
    let r = '';
    for (let n in e) {
      let o = e[n];
      if (o) {
        let i = Array.isArray(o);
        t === 'rtl' ? (r += (i ? o[1] : o) + ' ') : (r += (i ? o[0] : o) + ' ');
      }
    }
    return r.slice(0, -1);
  }
  function Uu(e, t) {
    let r = {};
    for (let n in e) {
      let o = Fu(e[n], t),
        i = Oi(o, t),
        l = i + ' ' + o;
      (qn[i] = [e[n], t]), (r[n] = l);
    }
    return r;
  }
  var tp = {};
  function Tr() {
    let e = null,
      t = '',
      r = '',
      n = new Array(arguments.length);
    for (let a = 0; a < arguments.length; a++) {
      let y = arguments[a];
      if (typeof y == 'string') {
        let S = y.indexOf(Nr);
        if (S === -1) t += y + ' ';
        else {
          let m = y.substr(S, qd);
          S > 0 && (t += y.slice(0, S)), (r += m), (n[a] = m);
        }
      }
    }
    if (r === '') return t.slice(0, -1);
    let o = tp[r];
    if (o !== void 0) return t + o;
    let i = [];
    for (let a = 0; a < arguments.length; a++) {
      let y = n[a];
      if (y) {
        let S = qn[y];
        S && (i.push(S[Zd]), (e = S[Jd]));
      }
    }
    let l = Object.assign.apply(Object, [{}].concat(i)),
      s = Fu(l, e),
      u = Oi(s, e, n);
    return (s = u + ' ' + s), (tp[r] = s), (qn[u] = [l, e]), t + s;
  }
  var Wu = ['d', 'l', 'v', 'w', 'f', 'i', 'h', 'a', 'k', 't'];
  function rp(e, t, r, n = {}) {
    if (!r.styleElements[e]) {
      let o = Wu.indexOf(e) + 1,
        i = null;
      for (; o < Wu.length; o++) {
        let s = r.styleElements[Wu[o]];
        if (s) {
          i = s;
          break;
        }
      }
      let l = t.createElement('style');
      l.dataset.makeStylesBucket = e;
      for (let s in n) l.setAttribute(s, n[s]);
      (r.styleElements[e] = l), t.head.insertBefore(l, i);
    }
    return r.styleElements[e].sheet;
  }
  var Hy = 0;
  function Br(e = typeof document == 'undefined' ? void 0 : document, t = {}) {
    let { unstable_filterCSSRule: r } = t,
      n = {
        insertionCache: {},
        styleElements: {},
        id: `d${Hy++}`,
        insertCSSRules(o) {
          for (let i in o) {
            let l = o[i],
              s = e && rp(i, e, n, t.styleElementAttributes);
            for (let u = 0, a = l.length; u < a; u++) {
              let y = l[u];
              if (!n.insertionCache[y] && ((n.insertionCache[y] = i), s))
                try {
                  r ? r(y) && s.insertRule(y, s.cssRules.length) : s.insertRule(y, s.cssRules.length);
                } catch (S) {}
            }
          }
        },
      };
    return n;
  }
  var Vy = [
      '-moz-placeholder',
      '-moz-focus-inner',
      '-moz-focusring',
      '-ms-input-placeholder',
      '-moz-read-write',
      '-moz-read-only',
    ].join('|'),
    pS = new RegExp(`:(${Vy})`);
  var Gy = /@(-webkit-)?keyframes ([^{]+){((?:(?:from|to|(?:\d+\.?\d*%))\{(?:[^}])*})*)}/g,
    Qy = /@(media|supports|layer)[^{]+\{([\s\S]+?})\s*}/g,
    Yy = /\.([^{:]+)(:[^{]+)?{(?:[^}]*;)?([^}]*?)}/g,
    Ky = { k: Gy, t: Qy };
  function Hu(e, t = typeof document == 'undefined' ? void 0 : document) {
    t &&
      t.querySelectorAll('[data-make-styles-bucket]').forEach(n => {
        let o = n.dataset.makeStylesBucket,
          i = Ky[o] || Yy;
        e.styleElements[o] || (e.styleElements[o] = n);
        let l;
        for (; (l = i.exec(n.textContent)); ) {
          let [s] = l;
          e.insertionCache[s] = o;
        }
      });
  }
  var K = '-ms-',
    _r = '-moz-',
    b = '-webkit-',
    Li = 'comm',
    Ir = 'rule',
    br = 'decl';
  var np = '@import';
  var Mi = '@keyframes';
  var op = Math.abs,
    Zn = String.fromCharCode,
    ip = Object.assign;
  function lp(e, t) {
    return (((((((t << 2) ^ te(e, 0)) << 2) ^ te(e, 1)) << 2) ^ te(e, 2)) << 2) ^ te(e, 3);
  }
  function Di(e) {
    return e.trim();
  }
  function sp(e, t) {
    return (e = t.exec(e)) ? e[0] : e;
  }
  function O(e, t, r) {
    return e.replace(t, r);
  }
  function Jn(e, t) {
    return e.indexOf(t);
  }
  function te(e, t) {
    return e.charCodeAt(t) | 0;
  }
  function Ct(e, t, r) {
    return e.slice(t, r);
  }
  function ae(e) {
    return e.length;
  }
  function Or(e) {
    return e.length;
  }
  function Lr(e, t) {
    return t.push(e), e;
  }
  function up(e, t) {
    return e.map(t).join('');
  }
  var ji = 1,
    Mr = 1,
    ap = 0,
    Re = 0,
    H = 0,
    Dr = '';
  function eo(e, t, r, n, o, i, l) {
    return {
      value: e,
      root: t,
      parent: r,
      type: n,
      props: o,
      children: i,
      line: ji,
      column: Mr,
      length: l,
      return: '',
    };
  }
  function jr(e, t) {
    return ip(eo('', null, null, '', null, null, 0), e, { length: -e.length }, t);
  }
  function fp() {
    return H;
  }
  function cp() {
    return (H = Re > 0 ? te(Dr, --Re) : 0), Mr--, H === 10 && ((Mr = 1), ji--), H;
  }
  function Ne() {
    return (H = Re < ap ? te(Dr, Re++) : 0), Mr++, H === 10 && ((Mr = 1), ji++), H;
  }
  function kt() {
    return te(Dr, Re);
  }
  function to() {
    return Re;
  }
  function zi(e, t) {
    return Ct(Dr, e, t);
  }
  function Vu(e) {
    switch (e) {
      case 0:
      case 9:
      case 10:
      case 13:
      case 32:
        return 5;
      case 33:
      case 43:
      case 44:
      case 47:
      case 62:
      case 64:
      case 126:
      case 59:
      case 123:
      case 125:
        return 4;
      case 58:
        return 3;
      case 34:
      case 39:
      case 40:
      case 91:
        return 2;
      case 41:
      case 93:
        return 1;
    }
    return 0;
  }
  function dp(e) {
    return (ji = Mr = 1), (ap = ae((Dr = e))), (Re = 0), [];
  }
  function pp(e) {
    return (Dr = ''), e;
  }
  function $i(e) {
    return Di(zi(Re - 1, Gu(e === 91 ? e + 2 : e === 40 ? e + 1 : e)));
  }
  function mp(e) {
    for (; (H = kt()) && H < 33; ) Ne();
    return Vu(e) > 2 || Vu(H) > 3 ? '' : ' ';
  }
  function hp(e, t) {
    for (; --t && Ne() && !(H < 48 || H > 102 || (H > 57 && H < 65) || (H > 70 && H < 97)); );
    return zi(e, to() + (t < 6 && kt() == 32 && Ne() == 32));
  }
  function Gu(e) {
    for (; Ne(); )
      switch (H) {
        case e:
          return Re;
        case 34:
        case 39:
          e !== 34 && e !== 39 && Gu(H);
          break;
        case 40:
          e === 41 && Gu(e);
          break;
        case 92:
          Ne();
          break;
      }
    return Re;
  }
  function yp(e, t) {
    for (; Ne() && e + H !== 47 + 10; ) if (e + H === 42 + 42 && kt() === 47) break;
    return '/*' + zi(t, Re - 1) + '*' + Zn(e === 47 ? e : Ne());
  }
  function gp(e) {
    for (; !Vu(kt()); ) Ne();
    return zi(e, Re);
  }
  function Fi(e) {
    return pp(Ai('', null, null, null, [''], (e = dp(e)), 0, [0], e));
  }
  function Ai(e, t, r, n, o, i, l, s, u) {
    for (
      var a = 0, y = 0, S = l, m = 0, w = 0, k = 0, x = 1, d = 1, f = 1, c = 0, h = '', p = o, N = i, C = n, P = h;
      d;

    )
      switch (((k = c), (c = Ne()))) {
        case 40:
          if (k != 108 && P.charCodeAt(S - 1) == 58) {
            Jn((P += O($i(c), '&', '&\f')), '&\f') != -1 && (f = -1);
            break;
          }
        case 34:
        case 39:
        case 91:
          P += $i(c);
          break;
        case 9:
        case 10:
        case 13:
        case 32:
          P += mp(k);
          break;
        case 92:
          P += hp(to() - 1, 7);
          continue;
        case 47:
          switch (kt()) {
            case 42:
            case 47:
              Lr(Xy(yp(Ne(), to()), t, r), u);
              break;
            default:
              P += '/';
          }
          break;
        case 123 * x:
          s[a++] = ae(P) * f;
        case 125 * x:
        case 59:
        case 0:
          switch (c) {
            case 0:
            case 125:
              d = 0;
            case 59 + y:
              w > 0 && ae(P) - S && Lr(w > 32 ? vp(P + ';', n, r, S - 1) : vp(O(P, ' ', '') + ';', n, r, S - 2), u);
              break;
            case 59:
              P += ';';
            default:
              if ((Lr((C = Sp(P, t, r, a, y, o, s, h, (p = []), (N = []), S)), i), c === 123))
                if (y === 0) Ai(P, t, C, C, p, i, S, s, N);
                else
                  switch (m) {
                    case 100:
                    case 109:
                    case 115:
                      Ai(e, C, C, n && Lr(Sp(e, C, C, 0, 0, o, s, h, o, (p = []), S), N), o, N, S, s, n ? p : N);
                      break;
                    default:
                      Ai(P, C, C, C, [''], N, 0, s, N);
                  }
          }
          (a = y = w = 0), (x = f = 1), (h = P = ''), (S = l);
          break;
        case 58:
          (S = 1 + ae(P)), (w = k);
        default:
          if (x < 1) {
            if (c == 123) --x;
            else if (c == 125 && x++ == 0 && cp() == 125) continue;
          }
          switch (((P += Zn(c)), c * x)) {
            case 38:
              f = y > 0 ? 1 : ((P += '\f'), -1);
              break;
            case 44:
              (s[a++] = (ae(P) - 1) * f), (f = 1);
              break;
            case 64:
              kt() === 45 && (P += $i(Ne())), (m = kt()), (y = S = ae((h = P += gp(to())))), c++;
              break;
            case 45:
              k === 45 && ae(P) == 2 && (x = 0);
          }
      }
    return i;
  }
  function Sp(e, t, r, n, o, i, l, s, u, a, y) {
    for (var S = o - 1, m = o === 0 ? i : [''], w = Or(m), k = 0, x = 0, d = 0; k < n; ++k)
      for (var f = 0, c = Ct(e, S + 1, (S = op((x = l[k])))), h = e; f < w; ++f)
        (h = Di(x > 0 ? m[f] + ' ' + c : O(c, /&\f/g, m[f]))) && (u[d++] = h);
    return eo(e, t, r, o === 0 ? Ir : s, u, a, y);
  }
  function Xy(e, t, r) {
    return eo(e, t, r, Li, Zn(fp()), Ct(e, 2, -2), 0);
  }
  function vp(e, t, r, n) {
    return eo(e, t, r, br, Ct(e, 0, n), Ct(e, n + 1, -1), n);
  }
  function Qu(e, t) {
    switch (lp(e, t)) {
      case 5103:
        return b + 'print-' + e + e;
      case 5737:
      case 4201:
      case 3177:
      case 3433:
      case 1641:
      case 4457:
      case 2921:
      case 5572:
      case 6356:
      case 5844:
      case 3191:
      case 6645:
      case 3005:
      case 6391:
      case 5879:
      case 5623:
      case 6135:
      case 4599:
      case 4855:
      case 4215:
      case 6389:
      case 5109:
      case 5365:
      case 5621:
      case 3829:
        return b + e + e;
      case 5349:
      case 4246:
      case 4810:
      case 6968:
      case 2756:
        return b + e + _r + e + K + e + e;
      case 6828:
      case 4268:
        return b + e + K + e + e;
      case 6165:
        return b + e + K + 'flex-' + e + e;
      case 5187:
        return b + e + O(e, /(\w+).+(:[^]+)/, b + 'box-$1$2' + K + 'flex-$1$2') + e;
      case 5443:
        return b + e + K + 'flex-item-' + O(e, /flex-|-self/, '') + e;
      case 4675:
        return b + e + K + 'flex-line-pack' + O(e, /align-content|flex-|-self/, '') + e;
      case 5548:
        return b + e + K + O(e, 'shrink', 'negative') + e;
      case 5292:
        return b + e + K + O(e, 'basis', 'preferred-size') + e;
      case 6060:
        return b + 'box-' + O(e, '-grow', '') + b + e + K + O(e, 'grow', 'positive') + e;
      case 4554:
        return b + O(e, /([^-])(transform)/g, '$1' + b + '$2') + e;
      case 6187:
        return O(O(O(e, /(zoom-|grab)/, b + '$1'), /(image-set)/, b + '$1'), e, '') + e;
      case 5495:
      case 3959:
        return O(e, /(image-set\([^]*)/, b + '$1$`$1');
      case 4968:
        return (
          O(O(e, /(.+:)(flex-)?(.*)/, b + 'box-pack:$3' + K + 'flex-pack:$3'), /s.+-b[^;]+/, 'justify') + b + e + e
        );
      case 4095:
      case 3583:
      case 4068:
      case 2532:
        return O(e, /(.+)-inline(.+)/, b + '$1$2') + e;
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
        if (ae(e) - 1 - t > 6)
          switch (te(e, t + 1)) {
            case 109:
              if (te(e, t + 4) !== 45) break;
            case 102:
              return O(e, /(.+:)(.+)-([^]+)/, '$1' + b + '$2-$3$1' + _r + (te(e, t + 3) == 108 ? '$3' : '$2-$3')) + e;
            case 115:
              return ~Jn(e, 'stretch') ? Qu(O(e, 'stretch', 'fill-available'), t) + e : e;
          }
        break;
      case 4949:
        if (te(e, t + 1) !== 115) break;
      case 6444:
        switch (te(e, ae(e) - 3 - (~Jn(e, '!important') && 10))) {
          case 107:
            return O(e, ':', ':' + b) + e;
          case 101:
            return (
              O(
                e,
                /(.+:)([^;!]+)(;|!.+)?/,
                '$1' + b + (te(e, 14) === 45 ? 'inline-' : '') + 'box$3$1' + b + '$2$3$1' + K + '$2box$3',
              ) + e
            );
        }
        break;
      case 5936:
        switch (te(e, t + 11)) {
          case 114:
            return b + e + K + O(e, /[svh]\w+-[tblr]{2}/, 'tb') + e;
          case 108:
            return b + e + K + O(e, /[svh]\w+-[tblr]{2}/, 'tb-rl') + e;
          case 45:
            return b + e + K + O(e, /[svh]\w+-[tblr]{2}/, 'lr') + e;
        }
        return b + e + K + e + e;
    }
    return e;
  }
  function He(e, t) {
    for (var r = '', n = Or(e), o = 0; o < n; o++) r += t(e[o], o, e, t) || '';
    return r;
  }
  function Ui(e, t, r, n) {
    switch (e.type) {
      case np:
      case br:
        return (e.return = e.return || e.value);
      case Li:
        return '';
      case Mi:
        return (e.return = e.value + '{' + He(e.children, n) + '}');
      case Ir:
        e.value = e.props.join(',');
    }
    return ae((r = He(e.children, n))) ? (e.return = e.value + '{' + r + '}') : '';
  }
  function Wi(e) {
    var t = Or(e);
    return function (r, n, o, i) {
      for (var l = '', s = 0; s < t; s++) l += e[s](r, n, o, i) || '';
      return l;
    };
  }
  function Hi(e) {
    return function (t) {
      t.root || ((t = t.return) && e(t));
    };
  }
  function Vi(e, t, r, n) {
    if (e.length > -1 && !e.return)
      switch (e.type) {
        case br:
          e.return = Qu(e.value, e.length);
          break;
        case Mi:
          return He([jr(e, { value: O(e.value, '@', '@' + b) })], n);
        case Ir:
          if (e.length)
            return up(e.props, function (o) {
              switch (sp(o, /(::plac\w+|:read-\w+)/)) {
                case ':read-only':
                case ':read-write':
                  return He([jr(e, { props: [O(o, /:(read-\w+)/, ':' + _r + '$1')] })], n);
                case '::placeholder':
                  return He(
                    [
                      jr(e, { props: [O(o, /:(plac\w+)/, ':' + b + 'input-$1')] }),
                      jr(e, { props: [O(o, /:(plac\w+)/, ':' + _r + '$1')] }),
                      jr(e, { props: [O(o, /:(plac\w+)/, K + 'input-$1')] }),
                    ],
                    n,
                  );
              }
              return '';
            });
      }
  }
  var qy = /[A-Z]/g,
    Zy = /^ms-/,
    Yu = {};
  function Jy(e) {
    return '-' + e.toLowerCase();
  }
  function Ft(e) {
    if (Object.prototype.hasOwnProperty.call(Yu, e)) return Yu[e];
    if (e.substr(0, 2) === '--') return e;
    let t = e.replace(qy, Jy);
    return (Yu[e] = Zy.test(t) ? '-' + t : t);
  }
  function ro(e) {
    return e.charAt(0) === '&' ? e.slice(1) : e;
  }
  var e0 = /,( *[^ &])/g;
  function t0(e) {
    return '&' + ro(e.replace(e0, ',&$1'));
  }
  function r0(e) {
    let t = [];
    return He(Fi(e), Wi([Vi, Ui, Hi(r => t.push(r))])), t;
  }
  function Ku(e) {
    let {
        className: t,
        media: r,
        layer: n,
        pseudo: o,
        support: i,
        property: l,
        rtlClassName: s,
        rtlProperty: u,
        rtlValue: a,
        value: y,
      } = e,
      S = `.${t}`,
      m = Array.isArray(y) ? `{ ${y.map(d => `${Ft(l)}: ${d}`).join(';')}; }` : `{ ${Ft(l)}: ${y}; }`,
      w = null,
      k = null;
    u &&
      s &&
      ((w = `.${s}`),
      (k = Array.isArray(a) ? `{ ${a.map(d => `${Ft(u)}: ${d}`).join(';')}; }` : `{ ${Ft(u)}: ${a}; }`));
    let x = '';
    if (o.indexOf(':global(') === 0) {
      let d = /global\((.+)\)(.+)?/,
        [, f, c = ''] = d.exec(o),
        h = ro(c.trim()),
        p = `${S}${h} ${m}`,
        N = u ? `${w}${h} ${k}` : '';
      x = `${f} { ${p}; ${N} }`;
    } else {
      let d = t0(o);
      (x = `${S}{${d} ${m}};`), u && (x = `${x}; ${w}{${d} ${k}};`);
    }
    return (
      r && (x = `@media ${r} { ${x} }`), n && (x = `@layer ${n} { ${x} }`), i && (x = `@supports ${i} { ${x} }`), r0(x)
    );
  }
  function xp(e) {
    let t = '';
    for (let r in e) {
      let n = e[r];
      (typeof n != 'string' && typeof n != 'number') || (t += Ft(r) + ':' + n + ';');
    }
    return t;
  }
  function Zu(e) {
    return e.reduce(function (t, r) {
      var n = r[0],
        o = r[1];
      return (t[n] = o), (t[o] = n), t;
    }, {});
  }
  function wp(e) {
    return typeof e == 'string' && e.match(/var\(.*\)/g);
  }
  function Cp(e) {
    return typeof e == 'boolean';
  }
  function kp(e) {
    return typeof e == 'function';
  }
  function zr(e) {
    return typeof e == 'number';
  }
  function Ep(e) {
    return e === null || typeof e > 'u';
  }
  function Pp(e) {
    return e && typeof e == 'object';
  }
  function Rp(e) {
    return typeof e == 'string';
  }
  function no(e, t) {
    return e.indexOf(t) !== -1;
  }
  function Np(e) {
    return parseFloat(e) === 0 ? e : e[0] === '-' ? e.slice(1) : '-' + e;
  }
  function $r(e, t, r, n) {
    return t + Np(r) + n;
  }
  function Tp(e) {
    var t = e.indexOf('.');
    if (t === -1) e = 100 - parseFloat(e) + '%';
    else {
      var r = e.length - t - 2;
      (e = 100 - parseFloat(e)), (e = e.toFixed(r) + '%');
    }
    return e;
  }
  function Ju(e) {
    return e
      .replace(/ +/g, ' ')
      .split(' ')
      .map(function (t) {
        return t.trim();
      })
      .filter(Boolean)
      .reduce(
        function (t, r) {
          var n = t.list,
            o = t.state,
            i = (r.match(/\(/g) || []).length,
            l = (r.match(/\)/g) || []).length;
          return (
            o.parensDepth > 0 ? (n[n.length - 1] = n[n.length - 1] + ' ' + r) : n.push(r),
            (o.parensDepth += i - l),
            { list: n, state: o }
          );
        },
        { list: [], state: { parensDepth: 0 } },
      ).list;
  }
  function Xu(e) {
    var t = Ju(e);
    if (t.length <= 3 || t.length > 4) return e;
    var r = t[0],
      n = t[1],
      o = t[2],
      i = t[3];
    return [r, i, o, n].join(' ');
  }
  function Bp(e) {
    return !Cp(e) && !Ep(e) && !wp(e);
  }
  function _p(e) {
    for (var t = [], r = 0, n = 0, o = !1; n < e.length; )
      !o && e[n] === ','
        ? (t.push(e.substring(r, n).trim()), n++, (r = n))
        : e[n] === '('
        ? ((o = !0), n++)
        : (e[n] === ')' && (o = !1), n++);
    return r != n && t.push(e.substring(r, n + 1)), t;
  }
  var g = {
    padding: function (t) {
      var r = t.value;
      return zr(r) ? r : Xu(r);
    },
    textShadow: function (t) {
      var r = t.value,
        n = _p(r).map(function (o) {
          return o.replace(/(-*)([.|\d]+)/, function (i, l, s) {
            if (s === '0') return i;
            var u = l === '' ? '-' : '';
            return '' + u + s;
          });
        });
      return n.join(',');
    },
    borderColor: function (t) {
      var r = t.value;
      return Xu(r);
    },
    borderRadius: function (t) {
      var r = t.value;
      if (zr(r)) return r;
      if (no(r, '/')) {
        var n = r.split('/'),
          o = n[0],
          i = n[1],
          l = g.borderRadius({ value: o.trim() }),
          s = g.borderRadius({ value: i.trim() });
        return l + ' / ' + s;
      }
      var u = Ju(r);
      switch (u.length) {
        case 2:
          return u.reverse().join(' ');
        case 4: {
          var a = u[0],
            y = u[1],
            S = u[2],
            m = u[3];
          return [y, a, m, S].join(' ');
        }
        default:
          return r;
      }
    },
    background: function (t) {
      var r = t.value,
        n = t.valuesToConvert,
        o = t.isRtl,
        i = t.bgImgDirectionRegex,
        l = t.bgPosDirectionRegex;
      if (zr(r)) return r;
      var s = r.replace(/(url\(.*?\))|(rgba?\(.*?\))|(hsl\(.*?\))|(#[a-fA-F0-9]+)|((^| )(\D)+( |$))/g, '').trim();
      return (
        (r = r.replace(s, g.backgroundPosition({ value: s, valuesToConvert: n, isRtl: o, bgPosDirectionRegex: l }))),
        g.backgroundImage({ value: r, valuesToConvert: n, bgImgDirectionRegex: i })
      );
    },
    backgroundImage: function (t) {
      var r = t.value,
        n = t.valuesToConvert,
        o = t.bgImgDirectionRegex;
      return !no(r, 'url(') && !no(r, 'linear-gradient(')
        ? r
        : r.replace(o, function (i, l, s) {
            return i.replace(s, n[s]);
          });
    },
    backgroundPosition: function (t) {
      var r = t.value,
        n = t.valuesToConvert,
        o = t.isRtl,
        i = t.bgPosDirectionRegex;
      return r
        .replace(o ? /^((-|\d|\.)+%)/ : null, function (l, s) {
          return Tp(s);
        })
        .replace(i, function (l) {
          return n[l];
        });
    },
    backgroundPositionX: function (t) {
      var r = t.value,
        n = t.valuesToConvert,
        o = t.isRtl,
        i = t.bgPosDirectionRegex;
      return zr(r) ? r : g.backgroundPosition({ value: r, valuesToConvert: n, isRtl: o, bgPosDirectionRegex: i });
    },
    transition: function (t) {
      var r = t.value,
        n = t.propertiesToConvert;
      return r
        .split(/,\s*/g)
        .map(function (o) {
          var i = o.split(' ');
          return (i[0] = n[i[0]] || i[0]), i.join(' ');
        })
        .join(', ');
    },
    transitionProperty: function (t) {
      var r = t.value,
        n = t.propertiesToConvert;
      return r
        .split(/,\s*/g)
        .map(function (o) {
          return n[o] || o;
        })
        .join(', ');
    },
    transform: function (t) {
      var r = t.value,
        n = '[^\\u0020-\\u007e]',
        o = '(?:(?:(?:\\[0-9a-f]{1,6})(?:\\r\\n|\\s)?)|\\\\[^\\r\\n\\f0-9a-f])',
        i =
          '((?:-?' +
          ('(?:[0-9]*\\.[0-9]+|[0-9]+)(?:\\s*(?:em|ex|px|cm|mm|in|pt|pc|deg|rad|grad|ms|s|hz|khz|%)|' +
            ('-?' + ('(?:[_a-z]|' + n + '|' + o + ')') + ('(?:[_a-z0-9-]|' + n + '|' + o + ')') + '*') +
            ')?') +
          ')|(?:inherit|auto))',
        l = new RegExp('(translateX\\s*\\(\\s*)' + i + '(\\s*\\))', 'gi'),
        s = new RegExp('(translate\\s*\\(\\s*)' + i + '((?:\\s*,\\s*' + i + '){0,1}\\s*\\))', 'gi'),
        u = new RegExp('(translate3d\\s*\\(\\s*)' + i + '((?:\\s*,\\s*' + i + '){0,2}\\s*\\))', 'gi'),
        a = new RegExp('(rotate[ZY]?\\s*\\(\\s*)' + i + '(\\s*\\))', 'gi');
      return r.replace(l, $r).replace(s, $r).replace(u, $r).replace(a, $r);
    },
  };
  g.objectPosition = g.backgroundPosition;
  g.margin = g.padding;
  g.borderWidth = g.padding;
  g.boxShadow = g.textShadow;
  g.webkitBoxShadow = g.boxShadow;
  g.mozBoxShadow = g.boxShadow;
  g.WebkitBoxShadow = g.boxShadow;
  g.MozBoxShadow = g.boxShadow;
  g.borderStyle = g.borderColor;
  g.webkitTransform = g.transform;
  g.mozTransform = g.transform;
  g.WebkitTransform = g.transform;
  g.MozTransform = g.transform;
  g.transformOrigin = g.backgroundPosition;
  g.webkitTransformOrigin = g.transformOrigin;
  g.mozTransformOrigin = g.transformOrigin;
  g.WebkitTransformOrigin = g.transformOrigin;
  g.MozTransformOrigin = g.transformOrigin;
  g.webkitTransition = g.transition;
  g.mozTransition = g.transition;
  g.WebkitTransition = g.transition;
  g.MozTransition = g.transition;
  g.webkitTransitionProperty = g.transitionProperty;
  g.mozTransitionProperty = g.transitionProperty;
  g.WebkitTransitionProperty = g.transitionProperty;
  g.MozTransitionProperty = g.transitionProperty;
  g['text-shadow'] = g.textShadow;
  g['border-color'] = g.borderColor;
  g['border-radius'] = g.borderRadius;
  g['background-image'] = g.backgroundImage;
  g['background-position'] = g.backgroundPosition;
  g['background-position-x'] = g.backgroundPositionX;
  g['object-position'] = g.objectPosition;
  g['border-width'] = g.padding;
  g['box-shadow'] = g.textShadow;
  g['-webkit-box-shadow'] = g.textShadow;
  g['-moz-box-shadow'] = g.textShadow;
  g['border-style'] = g.borderColor;
  g['-webkit-transform'] = g.transform;
  g['-moz-transform'] = g.transform;
  g['transform-origin'] = g.transformOrigin;
  g['-webkit-transform-origin'] = g.transformOrigin;
  g['-moz-transform-origin'] = g.transformOrigin;
  g['-webkit-transition'] = g.transition;
  g['-moz-transition'] = g.transition;
  g['transition-property'] = g.transitionProperty;
  g['-webkit-transition-property'] = g.transitionProperty;
  g['-moz-transition-property'] = g.transitionProperty;
  var ea = Zu([
      ['paddingLeft', 'paddingRight'],
      ['marginLeft', 'marginRight'],
      ['left', 'right'],
      ['borderLeft', 'borderRight'],
      ['borderLeftColor', 'borderRightColor'],
      ['borderLeftStyle', 'borderRightStyle'],
      ['borderLeftWidth', 'borderRightWidth'],
      ['borderTopLeftRadius', 'borderTopRightRadius'],
      ['borderBottomLeftRadius', 'borderBottomRightRadius'],
      ['padding-left', 'padding-right'],
      ['margin-left', 'margin-right'],
      ['border-left', 'border-right'],
      ['border-left-color', 'border-right-color'],
      ['border-left-style', 'border-right-style'],
      ['border-left-width', 'border-right-width'],
      ['border-top-left-radius', 'border-top-right-radius'],
      ['border-bottom-left-radius', 'border-bottom-right-radius'],
    ]),
    Ip = ['content'],
    qu = Zu([
      ['ltr', 'rtl'],
      ['left', 'right'],
      ['w-resize', 'e-resize'],
      ['sw-resize', 'se-resize'],
      ['nw-resize', 'ne-resize'],
    ]),
    n0 = new RegExp('(^|\\W|_)((ltr)|(rtl)|(left)|(right))(\\W|_|$)', 'g'),
    o0 = new RegExp('(left)|(right)');
  function Gi(e) {
    return Object.keys(e).reduce(
      function (t, r) {
        var n = e[r];
        if ((Rp(n) && (n = n.trim()), no(Ip, r))) return (t[r] = n), t;
        var o = oo(r, n),
          i = o.key,
          l = o.value;
        return (t[i] = l), t;
      },
      Array.isArray(e) ? [] : {},
    );
  }
  function oo(e, t) {
    var r = /\/\*\s?@noflip\s?\*\//.test(t),
      n = r ? e : bp(e),
      o = r ? t : Op(n, t);
    return { key: n, value: o };
  }
  function bp(e) {
    return ea[e] || e;
  }
  function Op(e, t) {
    if (!Bp(t)) return t;
    if (Pp(t)) return Gi(t);
    var r = zr(t),
      n = kp(t),
      o = r || n ? t : t.replace(/ !important.*?$/, ''),
      i = !r && o.length !== t.length,
      l = g[e],
      s;
    return (
      l
        ? (s = l({
            value: o,
            valuesToConvert: qu,
            propertiesToConvert: ea,
            isRtl: !0,
            bgImgDirectionRegex: n0,
            bgPosDirectionRegex: o0,
          }))
        : (s = qu[o] || o),
      i ? s + ' !important' : s
    );
  }
  function ta(e) {
    let t = '';
    for (let r in e) t += `${r}{${xp(e[r])}}`;
    return t;
  }
  function ra(e, t) {
    let r = `@keyframes ${e} {${t}}`,
      n = [];
    return He(Fi(r), Wi([Vi, Ui, Hi(o => n.push(o))])), n;
  }
  function na(e, t) {
    return e.length === 0 ? t : `${e} and ${t}`;
  }
  function Lp(e) {
    return e.substr(0, 6) === '@media';
  }
  function Mp(e) {
    return e.substr(0, 6) === '@layer';
  }
  var i0 = /^(:|\[|>|&)/;
  function Dp(e) {
    return i0.test(e);
  }
  function jp(e) {
    return e.substr(0, 9) === '@supports';
  }
  function zp(e) {
    return e != null && typeof e == 'object' && Array.isArray(e) === !1;
  }
  var $p = { 'us-w': 'w', 'us-v': 'i', nk: 'l', si: 'v', cu: 'f', ve: 'h', ti: 'a' };
  function oa(e, t, r, n) {
    if (r || t || n) return 't';
    let o = e.trim();
    return (o.charCodeAt(0) === 58 && ($p[o.slice(4, 8)] || $p[o.slice(3, 5)])) || 'd';
  }
  function io({ media: e, layer: t, property: r, pseudo: n, support: o, value: i }) {
    let l = Ie(n + e + t + o + r + i.trim());
    return Xn + l;
  }
  function ia(e, t, r, n) {
    let o = e + t + r + n,
      i = Ie(o),
      l = i.charCodeAt(0);
    return l >= 48 && l <= 57 ? String.fromCharCode(l + 17) + i.substr(1) : i;
  }
  function Ap(e, t, r, n) {
    e[t] = n ? [r, n] : r;
  }
  function la(e, t, r, n) {
    (e[t] = e[t] || []), e[t].push(r), n && e[t].push(n);
  }
  function Ut(e, t = '', r = '', n = '', o = '', i = {}, l = {}, s) {
    for (let u in e) {
      if (ep.hasOwnProperty(u)) continue;
      let a = e[u];
      if (a != null) {
        if (typeof a == 'string' || typeof a == 'number') {
          let y = ia(t, r, o, u),
            S = io({ media: r, layer: n, value: a.toString(), support: o, pseudo: t, property: u }),
            m = (s && { key: u, value: s }) || oo(u, a),
            w = m.key !== u || m.value !== a,
            k = w
              ? io({ value: m.value.toString(), property: m.key, pseudo: t, media: r, layer: n, support: o })
              : void 0,
            x = w ? { rtlClassName: k, rtlProperty: m.key, rtlValue: m.value } : void 0,
            d = oa(t, n, r, o),
            [f, c] = Ku(E({ className: S, media: r, layer: n, pseudo: t, property: u, support: o, value: a }, x));
          Ap(i, y, S, k), la(l, d, f, c);
        } else if (u === 'animationName') {
          let y = Array.isArray(a) ? a : [a],
            S = [],
            m = [];
          for (let w of y) {
            let k = ta(w),
              x = ta(Gi(w)),
              d = Xn + Ie(k),
              f,
              c = ra(d, k),
              h = [];
            k === x ? (f = d) : ((f = Xn + Ie(x)), (h = ra(f, x)));
            for (let p = 0; p < c.length; p++) la(l, 'k', c[p], h[p]);
            S.push(d), m.push(f);
          }
          Ut({ animationName: S.join(', ') }, t, r, n, o, i, l, m.join(', '));
        } else if (Array.isArray(a)) {
          if (a.length === 0) continue;
          let y = ia(t, r, o, u),
            S = io({
              media: r,
              layer: n,
              value: a.map(p => (p != null ? p : '').toString()).join(';'),
              support: o,
              pseudo: t,
              property: u,
            }),
            m = a.map(p => oo(u, p));
          if (!!m.some(p => p.key !== m[0].key)) continue;
          let k = m[0].key !== u || m.some((p, N) => p.value !== a[N]),
            x = k
              ? io({
                  value: m
                    .map(p => {
                      var N;
                      return ((N = p == null ? void 0 : p.value) != null ? N : '').toString();
                    })
                    .join(';'),
                  property: m[0].key,
                  pseudo: t,
                  layer: n,
                  media: r,
                  support: o,
                })
              : void 0,
            d = k ? { rtlClassName: x, rtlProperty: m[0].key, rtlValue: m.map(p => p.value) } : void 0,
            f = oa(t, n, r, o),
            [c, h] = Ku(E({ className: S, media: r, layer: n, pseudo: t, property: u, support: o, value: a }, d));
          Ap(i, y, S, x), la(l, f, c, h);
        } else if (zp(a)) {
          if (Dp(u)) Ut(a, t + ro(u), r, n, o, i, l);
          else if (Lp(u)) {
            let y = na(r, u.slice(6).trim());
            Ut(a, t, y, n, o, i, l);
          } else if (Mp(u)) {
            let y = (n ? `${n}.` : '') + u.slice(6).trim();
            Ut(a, t, r, y, o, i, l);
          } else if (jp(u)) {
            let y = na(o, u.slice(9).trim());
            Ut(a, t, r, n, y, i, l);
          }
        }
      }
    }
    return [i, l];
  }
  function Fp(e) {
    let t = {},
      r = {};
    for (let n in e) {
      let o = e[n],
        [i, l] = Ut(o);
      (t[n] = i),
        Object.keys(l).forEach(s => {
          r[s] = (r[s] || []).concat(l[s]);
        });
    }
    return [t, r];
  }
  function sa(e) {
    let t = {},
      r = null,
      n = null,
      o = null,
      i = null;
    function l(s) {
      let { dir: u, renderer: a } = s;
      r === null && ([r, n] = Fp(e));
      let y = u === 'ltr',
        S = y ? a.id : a.id + 'r';
      return (
        y ? o === null && (o = Uu(r, u)) : i === null && (i = Uu(r, u)),
        t[S] === void 0 && (a.insertCSSRules(n), (t[S] = !0)),
        y ? o : i
      );
    }
    return l;
  }
  var U = {
    border: Ru,
    borderLeft: Nu,
    borderBottom: Tu,
    borderRight: Bu,
    borderTop: _u,
    borderColor: Kn,
    borderStyle: Yn,
    borderRadius: Iu,
    borderWidth: Qn,
    flex: Ou,
    gap: Lu,
    margin: Mu,
    padding: Du,
    overflow: ju,
    inset: zu,
    outline: $u,
  };
  var u0 = q(Q());
  var Et = q(Q());
  function l0() {
    return typeof window != 'undefined' && !!(window.document && window.document.createElement);
  }
  var Up = Et.createContext(Br()),
    ua = ({ children: e, renderer: t, targetDocument: r }) => (
      l0() &&
        Et.useMemo(() => {
          Hu(t, r);
        }, [t, r]),
      Et.createElement(Up.Provider, { value: t }, e)
    );
  function aa() {
    return Et.useContext(Up);
  }
  var lo = q(Q()),
    s0 = lo.createContext('ltr');
  function Wp() {
    return lo.useContext(s0);
  }
  function ge(e) {
    let t = sa(e);
    return function () {
      let n = Wp(),
        o = aa();
      return t({ dir: n, renderer: o });
    };
  }
  var X = q(Q());
  var ma = {};
  ul(ma, { default: () => Wt });
  var a0 = '@griffel/benchmark',
    f0 = 'Performance benchmarking app for Griffel',
    c0 = !0,
    d0 = {},
    Hp = { name: a0, description: f0, private: c0, dependencies: d0 };
  var fa = {};
  ul(fa, { default: () => v0 });
  var Gp = q(Q());
  var Vp = q(Q());
  var p0 = ge({
      root: M(
        E(
          E(
            M(E(E({ alignItems: 'stretch' }, U.borderWidth('0px')), U.borderStyle('solid')), {
              boxSizing: 'border-box',
              display: 'flex',
              flexBasis: 'auto',
              flexDirection: 'column',
              flexShrink: 0,
            }),
            U.margin('0px'),
          ),
          U.padding('0px'),
        ),
        { position: 'relative', minHeight: 0, minWidth: 0 },
      ),
    }),
    m0 = r => {
      var n = r,
        { className: e } = n,
        t = Me(n, ['className']);
      let o = p0();
      return Vp.default.createElement('div', M(E({}, t), { className: Tr(o.root, e) }));
    },
    Qi = m0;
  var h0 = ge({
      outer: E({ alignSelf: 'flex-start' }, U.padding('4px')),
      row: { flexDirection: 'row' },
      color0: { backgroundColor: '#14171A' },
      color1: { backgroundColor: '#AAB8C2' },
      color2: { backgroundColor: '#E6ECF0' },
      color3: { backgroundColor: '#FFAD1F' },
      color4: { backgroundColor: '#F45D22' },
      color5: { backgroundColor: '#E0245E' },
      fixed: { width: '6px', height: '6px' },
    }),
    y0 = i => {
      var l = i,
        { color: e, fixed: t = !1, layout: r = 'column', outer: n = !1 } = l,
        o = Me(l, ['color', 'fixed', 'layout', 'outer']);
      let s = h0();
      return Gp.default.createElement(
        Qi,
        M(E({}, o), { className: Tr(s[`color${e}`], t && s.fixed, r === 'row' && s.row, n && s.outer) }),
      );
    },
    Qp = y0;
  var Yp = q(Q());
  var g0 = ge({
      root: M(
        E(
          E({ position: 'absolute', cursor: 'pointer', width: 0, height: 0 }, U.borderColor('transparent')),
          U.borderStyle('solid'),
        ),
        { borderTopWidth: 0, transform: 'translate(50%, 50%)' },
      ),
    }),
    S0 = ({ size: e, x: t, y: r, children: n, color: o }) => {
      let i = g0();
      return Yp.default.createElement(
        'div',
        {
          className: i.root,
          style: {
            borderBottomColor: o,
            borderRightWidth: `${e / 2}px`,
            borderBottomWidth: `${e / 2}px`,
            borderLeftWidth: `${e / 2}px`,
            marginLeft: `${t}px`,
            marginTop: `${r}px`,
          },
        },
        n,
      );
    };
  var Kp = S0;
  var v0 = { Box: Qp, View: Qi, Dot: Kp };
  var pa = {};
  ul(pa, { default: () => P0 });
  var Xp = q(Q());
  var ca = q(Q()),
    x0 = (e, t) => (e && t ? E(E({}, e), t) : e || t),
    da = class extends ca.default.Component {
      render() {
        let n = this.props,
          { style: t } = n,
          r = Me(n, ['style']);
        return ca.default.createElement('div', M(E({}, r), { style: x0(w0, t) }));
      }
    },
    w0 = {
      alignItems: 'stretch',
      borderWidth: 0,
      borderStyle: 'solid',
      boxSizing: 'border-box',
      display: 'flex',
      flexBasis: 'auto',
      flexDirection: 'column',
      flexShrink: 0,
      margin: 0,
      padding: 0,
      position: 'relative',
      minHeight: 0,
      minWidth: 0,
    },
    Yi = da;
  var C0 = i => {
      var l = i,
        { color: e, fixed: t = !1, layout: r = 'column', outer: n = !1 } = l,
        o = Me(l, ['color', 'fixed', 'layout', 'outer']);
      return Xp.default.createElement(
        Yi,
        M(E({}, o), { style: E(E(E(E({}, Ki[`color${e}`]), t && Ki.fixed), r === 'row' && Ki.row), n && Ki.outer) }),
      );
    },
    Ki = {
      outer: { alignSelf: 'flex-start', padding: 4 },
      row: { flexDirection: 'row' },
      color0: { backgroundColor: '#14171A' },
      color1: { backgroundColor: '#AAB8C2' },
      color2: { backgroundColor: '#E6ECF0' },
      color3: { backgroundColor: '#FFAD1F' },
      color4: { backgroundColor: '#F45D22' },
      color5: { backgroundColor: '#E0245E' },
      fixed: { width: 6, height: 6 },
    },
    qp = C0;
  var Zp = q(Q()),
    k0 = ({ size: e, x: t, y: r, children: n, color: o }) =>
      Zp.default.createElement(
        'div',
        {
          style: M(E({}, E0.root), {
            borderBottomColor: o,
            borderRightWidth: `${e / 2}px`,
            borderBottomWidth: `${e / 2}px`,
            borderLeftWidth: `${e / 2}px`,
            marginLeft: `${t}px`,
            marginTop: `${r}px`,
          }),
        },
        n,
      ),
    E0 = {
      root: {
        position: 'absolute',
        cursor: 'pointer',
        width: 0,
        height: 0,
        borderColor: 'transparent',
        borderStyle: 'solid',
        borderTopWidth: 0,
        transform: 'translate(50%, 50%)',
      },
    },
    Jp = k0;
  var P0 = { Box: qp, View: Yi, Dot: Jp };
  var R0 = [fa, ma, pa],
    em = R0,
    tm = [
      '../implementations/griffel/index.ts',
      '../implementations/index.ts',
      '../implementations/inline-styles/index.ts',
    ];
  var T0 = tm.reduce((e, t, r) => {
      var l;
      if (t.includes('implementations/index.ts')) return e;
      let n = em[r].default,
        o = t.split('/')[2],
        i = (l = Hp.dependencies[o]) != null ? l : '';
      return (e[o] = { components: n, name: o, version: i }), e;
    }, {}),
    Wt = T0;
  var Xi = q(Q());
  var B0 = ge({
      root: E({ display: 'flex', flexDirection: 'column' }, U.gap('4px')),
      select: M(
        E(E({ cursor: 'pointer', backgroundColor: 'transparent' }, U.padding('0', '1em')), U.borderRadius('4px')),
        { boxShadow: 'none', boxSizing: 'border-box', fontSize: '20px', '& option': {} },
      ),
    }),
    _0 = e => {
      let i = e,
        { children: t, label: r } = i,
        n = Me(i, ['children', 'label']),
        o = B0();
      return Xi.default.createElement(
        'div',
        { className: o.root },
        Xi.default.createElement('label', null, r),
        Xi.default.createElement('select', E({ className: o.select }, n), t),
      );
    },
    qi = _0;
  var be = q(Q());
  var I0 = ge({
      root: M(E(E(E({}, U.margin('10px', '0px')), U.padding('4px', '10px')), U.borderBottom('1px', 'solid', 'gray')), {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }),
      column: { display: 'flex', flexDirection: 'column' },
      strong: { fontSize: '20px', fontWeight: 700 },
    }),
    Zi = e => {
      let t = Number(Math.round(e + 'e2') + 'e-2').toFixed(2);
      return 10 / t > 1 ? `0${t}` : t;
    },
    b0 = ({ library: e, version: t, benchmark: r, analysis: n }) => {
      let o = I0(),
        i = n ? `(${n.sampleCount})` : '';
      return be.default.createElement(
        'div',
        { className: o.root },
        be.default.createElement(
          'div',
          { className: o.column },
          be.default.createElement('div', { className: o.strong }, `${e}${t ? '@' : ''}${t}`),
          be.default.createElement('div', null, r, ' ', i),
        ),
        be.default.createElement(
          'div',
          { className: o.column },
          n
            ? be.default.createElement(
                be.default.Fragment,
                null,
                be.default.createElement('div', { className: o.strong }, Zi(n.mean), ' \xB1', Zi(n.stdDev), ' ms'),
                be.default.createElement('div', null, '(S/L) ', Zi(n.meanScripting), '/', Zi(n.meanLayout), ' ms'),
              )
            : be.default.createElement('div', { className: o.strong }, 'In progress...'),
        ),
      );
    },
    ha = b0;
  var Ht = q(Q()),
    ga = class extends Ht.Component {
      render() {
        let { breadth: t, components: r, depth: n, id: o, wrap: i } = this.props,
          { Box: l } = r,
          s = Ht.default.createElement(
            l,
            { color: o % 3, layout: n % 2 === 0 ? 'column' : 'row', outer: !0 },
            n === 0 && Ht.default.createElement(l, { color: (o % 3) + 3, fixed: !0 }),
            n !== 0 &&
              Array.from({ length: t }).map((u, a) =>
                Ht.default.createElement(ga, { breadth: t, components: r, depth: n - 1, id: a, key: a, wrap: i }),
              ),
          );
        for (let u = 0; u < i; u++) s = Ht.default.createElement(l, null, s);
        return s;
      }
    },
    uo = ga;
  (uo.displayName = 'Tree'), (uo.benchmarkType = 'mount');
  var ya = uo;
  var Je = q(Q());
  function Ar(e) {
    for (var t = (e.length / 6) | 0, r = new Array(t), n = 0; n < t; ) r[n] = '#' + e.slice(n * 6, ++n * 6);
    return r;
  }
  function Ji(e, t, r) {
    (e.prototype = t.prototype = r), (r.constructor = e);
  }
  function Sa(e, t) {
    var r = Object.create(e.prototype);
    for (var n in t) r[n] = t[n];
    return r;
  }
  function co() {}
  var ao = 0.7,
    rl = 1 / ao,
    Fr = '\\s*([+-]?\\d+)\\s*',
    fo = '\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*',
    Ve = '\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*',
    O0 = /^#([0-9a-f]{3,8})$/,
    L0 = new RegExp(`^rgb\\(${Fr},${Fr},${Fr}\\)$`),
    M0 = new RegExp(`^rgb\\(${Ve},${Ve},${Ve}\\)$`),
    D0 = new RegExp(`^rgba\\(${Fr},${Fr},${Fr},${fo}\\)$`),
    j0 = new RegExp(`^rgba\\(${Ve},${Ve},${Ve},${fo}\\)$`),
    z0 = new RegExp(`^hsl\\(${fo},${Ve},${Ve}\\)$`),
    $0 = new RegExp(`^hsla\\(${fo},${Ve},${Ve},${fo}\\)$`),
    rm = {
      aliceblue: 15792383,
      antiquewhite: 16444375,
      aqua: 65535,
      aquamarine: 8388564,
      azure: 15794175,
      beige: 16119260,
      bisque: 16770244,
      black: 0,
      blanchedalmond: 16772045,
      blue: 255,
      blueviolet: 9055202,
      brown: 10824234,
      burlywood: 14596231,
      cadetblue: 6266528,
      chartreuse: 8388352,
      chocolate: 13789470,
      coral: 16744272,
      cornflowerblue: 6591981,
      cornsilk: 16775388,
      crimson: 14423100,
      cyan: 65535,
      darkblue: 139,
      darkcyan: 35723,
      darkgoldenrod: 12092939,
      darkgray: 11119017,
      darkgreen: 25600,
      darkgrey: 11119017,
      darkkhaki: 12433259,
      darkmagenta: 9109643,
      darkolivegreen: 5597999,
      darkorange: 16747520,
      darkorchid: 10040012,
      darkred: 9109504,
      darksalmon: 15308410,
      darkseagreen: 9419919,
      darkslateblue: 4734347,
      darkslategray: 3100495,
      darkslategrey: 3100495,
      darkturquoise: 52945,
      darkviolet: 9699539,
      deeppink: 16716947,
      deepskyblue: 49151,
      dimgray: 6908265,
      dimgrey: 6908265,
      dodgerblue: 2003199,
      firebrick: 11674146,
      floralwhite: 16775920,
      forestgreen: 2263842,
      fuchsia: 16711935,
      gainsboro: 14474460,
      ghostwhite: 16316671,
      gold: 16766720,
      goldenrod: 14329120,
      gray: 8421504,
      green: 32768,
      greenyellow: 11403055,
      grey: 8421504,
      honeydew: 15794160,
      hotpink: 16738740,
      indianred: 13458524,
      indigo: 4915330,
      ivory: 16777200,
      khaki: 15787660,
      lavender: 15132410,
      lavenderblush: 16773365,
      lawngreen: 8190976,
      lemonchiffon: 16775885,
      lightblue: 11393254,
      lightcoral: 15761536,
      lightcyan: 14745599,
      lightgoldenrodyellow: 16448210,
      lightgray: 13882323,
      lightgreen: 9498256,
      lightgrey: 13882323,
      lightpink: 16758465,
      lightsalmon: 16752762,
      lightseagreen: 2142890,
      lightskyblue: 8900346,
      lightslategray: 7833753,
      lightslategrey: 7833753,
      lightsteelblue: 11584734,
      lightyellow: 16777184,
      lime: 65280,
      limegreen: 3329330,
      linen: 16445670,
      magenta: 16711935,
      maroon: 8388608,
      mediumaquamarine: 6737322,
      mediumblue: 205,
      mediumorchid: 12211667,
      mediumpurple: 9662683,
      mediumseagreen: 3978097,
      mediumslateblue: 8087790,
      mediumspringgreen: 64154,
      mediumturquoise: 4772300,
      mediumvioletred: 13047173,
      midnightblue: 1644912,
      mintcream: 16121850,
      mistyrose: 16770273,
      moccasin: 16770229,
      navajowhite: 16768685,
      navy: 128,
      oldlace: 16643558,
      olive: 8421376,
      olivedrab: 7048739,
      orange: 16753920,
      orangered: 16729344,
      orchid: 14315734,
      palegoldenrod: 15657130,
      palegreen: 10025880,
      paleturquoise: 11529966,
      palevioletred: 14381203,
      papayawhip: 16773077,
      peachpuff: 16767673,
      peru: 13468991,
      pink: 16761035,
      plum: 14524637,
      powderblue: 11591910,
      purple: 8388736,
      rebeccapurple: 6697881,
      red: 16711680,
      rosybrown: 12357519,
      royalblue: 4286945,
      saddlebrown: 9127187,
      salmon: 16416882,
      sandybrown: 16032864,
      seagreen: 3050327,
      seashell: 16774638,
      sienna: 10506797,
      silver: 12632256,
      skyblue: 8900331,
      slateblue: 6970061,
      slategray: 7372944,
      slategrey: 7372944,
      snow: 16775930,
      springgreen: 65407,
      steelblue: 4620980,
      tan: 13808780,
      teal: 32896,
      thistle: 14204888,
      tomato: 16737095,
      turquoise: 4251856,
      violet: 15631086,
      wheat: 16113331,
      white: 16777215,
      whitesmoke: 16119285,
      yellow: 16776960,
      yellowgreen: 10145074,
    };
  Ji(co, po, {
    copy(e) {
      return Object.assign(new this.constructor(), this, e);
    },
    displayable() {
      return this.rgb().displayable();
    },
    hex: nm,
    formatHex: nm,
    formatHex8: A0,
    formatHsl: F0,
    formatRgb: om,
    toString: om,
  });
  function nm() {
    return this.rgb().formatHex();
  }
  function A0() {
    return this.rgb().formatHex8();
  }
  function F0() {
    return fm(this).formatHsl();
  }
  function om() {
    return this.rgb().formatRgb();
  }
  function po(e) {
    var t, r;
    return (
      (e = (e + '').trim().toLowerCase()),
      (t = O0.exec(e))
        ? ((r = t[1].length),
          (t = parseInt(t[1], 16)),
          r === 6
            ? im(t)
            : r === 3
            ? new me(((t >> 8) & 15) | ((t >> 4) & 240), ((t >> 4) & 15) | (t & 240), ((t & 15) << 4) | (t & 15), 1)
            : r === 8
            ? el((t >> 24) & 255, (t >> 16) & 255, (t >> 8) & 255, (t & 255) / 255)
            : r === 4
            ? el(
                ((t >> 12) & 15) | ((t >> 8) & 240),
                ((t >> 8) & 15) | ((t >> 4) & 240),
                ((t >> 4) & 15) | (t & 240),
                (((t & 15) << 4) | (t & 15)) / 255,
              )
            : null)
        : (t = L0.exec(e))
        ? new me(t[1], t[2], t[3], 1)
        : (t = M0.exec(e))
        ? new me((t[1] * 255) / 100, (t[2] * 255) / 100, (t[3] * 255) / 100, 1)
        : (t = D0.exec(e))
        ? el(t[1], t[2], t[3], t[4])
        : (t = j0.exec(e))
        ? el((t[1] * 255) / 100, (t[2] * 255) / 100, (t[3] * 255) / 100, t[4])
        : (t = z0.exec(e))
        ? um(t[1], t[2] / 100, t[3] / 100, 1)
        : (t = $0.exec(e))
        ? um(t[1], t[2] / 100, t[3] / 100, t[4])
        : rm.hasOwnProperty(e)
        ? im(rm[e])
        : e === 'transparent'
        ? new me(NaN, NaN, NaN, 0)
        : null
    );
  }
  function im(e) {
    return new me((e >> 16) & 255, (e >> 8) & 255, e & 255, 1);
  }
  function el(e, t, r, n) {
    return n <= 0 && (e = t = r = NaN), new me(e, t, r, n);
  }
  function U0(e) {
    return e instanceof co || (e = po(e)), e ? ((e = e.rgb()), new me(e.r, e.g, e.b, e.opacity)) : new me();
  }
  function Ur(e, t, r, n) {
    return arguments.length === 1 ? U0(e) : new me(e, t, r, n ?? 1);
  }
  function me(e, t, r, n) {
    (this.r = +e), (this.g = +t), (this.b = +r), (this.opacity = +n);
  }
  Ji(
    me,
    Ur,
    Sa(co, {
      brighter(e) {
        return (e = e == null ? rl : Math.pow(rl, e)), new me(this.r * e, this.g * e, this.b * e, this.opacity);
      },
      darker(e) {
        return (e = e == null ? ao : Math.pow(ao, e)), new me(this.r * e, this.g * e, this.b * e, this.opacity);
      },
      rgb() {
        return this;
      },
      clamp() {
        return new me(Gt(this.r), Gt(this.g), Gt(this.b), nl(this.opacity));
      },
      displayable() {
        return (
          -0.5 <= this.r &&
          this.r < 255.5 &&
          -0.5 <= this.g &&
          this.g < 255.5 &&
          -0.5 <= this.b &&
          this.b < 255.5 &&
          0 <= this.opacity &&
          this.opacity <= 1
        );
      },
      hex: lm,
      formatHex: lm,
      formatHex8: W0,
      formatRgb: sm,
      toString: sm,
    }),
  );
  function lm() {
    return `#${Vt(this.r)}${Vt(this.g)}${Vt(this.b)}`;
  }
  function W0() {
    return `#${Vt(this.r)}${Vt(this.g)}${Vt(this.b)}${Vt((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
  }
  function sm() {
    let e = nl(this.opacity);
    return `${e === 1 ? 'rgb(' : 'rgba('}${Gt(this.r)}, ${Gt(this.g)}, ${Gt(this.b)}${e === 1 ? ')' : `, ${e})`}`;
  }
  function nl(e) {
    return isNaN(e) ? 1 : Math.max(0, Math.min(1, e));
  }
  function Gt(e) {
    return Math.max(0, Math.min(255, Math.round(e) || 0));
  }
  function Vt(e) {
    return (e = Gt(e)), (e < 16 ? '0' : '') + e.toString(16);
  }
  function um(e, t, r, n) {
    return n <= 0 ? (e = t = r = NaN) : r <= 0 || r >= 1 ? (e = t = NaN) : t <= 0 && (e = NaN), new Oe(e, t, r, n);
  }
  function fm(e) {
    if (e instanceof Oe) return new Oe(e.h, e.s, e.l, e.opacity);
    if ((e instanceof co || (e = po(e)), !e)) return new Oe();
    if (e instanceof Oe) return e;
    e = e.rgb();
    var t = e.r / 255,
      r = e.g / 255,
      n = e.b / 255,
      o = Math.min(t, r, n),
      i = Math.max(t, r, n),
      l = NaN,
      s = i - o,
      u = (i + o) / 2;
    return (
      s
        ? (t === i ? (l = (r - n) / s + (r < n) * 6) : r === i ? (l = (n - t) / s + 2) : (l = (t - r) / s + 4),
          (s /= u < 0.5 ? i + o : 2 - i - o),
          (l *= 60))
        : (s = u > 0 && u < 1 ? 0 : l),
      new Oe(l, s, u, e.opacity)
    );
  }
  function cm(e, t, r, n) {
    return arguments.length === 1 ? fm(e) : new Oe(e, t, r, n ?? 1);
  }
  function Oe(e, t, r, n) {
    (this.h = +e), (this.s = +t), (this.l = +r), (this.opacity = +n);
  }
  Ji(
    Oe,
    cm,
    Sa(co, {
      brighter(e) {
        return (e = e == null ? rl : Math.pow(rl, e)), new Oe(this.h, this.s, this.l * e, this.opacity);
      },
      darker(e) {
        return (e = e == null ? ao : Math.pow(ao, e)), new Oe(this.h, this.s, this.l * e, this.opacity);
      },
      rgb() {
        var e = (this.h % 360) + (this.h < 0) * 360,
          t = isNaN(e) || isNaN(this.s) ? 0 : this.s,
          r = this.l,
          n = r + (r < 0.5 ? r : 1 - r) * t,
          o = 2 * r - n;
        return new me(
          va(e >= 240 ? e - 240 : e + 120, o, n),
          va(e, o, n),
          va(e < 120 ? e + 240 : e - 120, o, n),
          this.opacity,
        );
      },
      clamp() {
        return new Oe(am(this.h), tl(this.s), tl(this.l), nl(this.opacity));
      },
      displayable() {
        return (
          ((0 <= this.s && this.s <= 1) || isNaN(this.s)) &&
          0 <= this.l &&
          this.l <= 1 &&
          0 <= this.opacity &&
          this.opacity <= 1
        );
      },
      formatHsl() {
        let e = nl(this.opacity);
        return `${e === 1 ? 'hsl(' : 'hsla('}${am(this.h)}, ${tl(this.s) * 100}%, ${tl(this.l) * 100}%${
          e === 1 ? ')' : `, ${e})`
        }`;
      },
    }),
  );
  function am(e) {
    return (e = (e || 0) % 360), e < 0 ? e + 360 : e;
  }
  function tl(e) {
    return Math.max(0, Math.min(1, e || 0));
  }
  function va(e, t, r) {
    return (e < 60 ? t + ((r - t) * e) / 60 : e < 180 ? r : e < 240 ? t + ((r - t) * (240 - e)) / 60 : t) * 255;
  }
  function xa(e, t, r, n, o) {
    var i = e * e,
      l = i * e;
    return ((1 - 3 * e + 3 * i - l) * t + (4 - 6 * i + 3 * l) * r + (1 + 3 * e + 3 * i - 3 * l) * n + l * o) / 6;
  }
  function dm(e) {
    var t = e.length - 1;
    return function (r) {
      var n = r <= 0 ? (r = 0) : r >= 1 ? ((r = 1), t - 1) : Math.floor(r * t),
        o = e[n],
        i = e[n + 1],
        l = n > 0 ? e[n - 1] : 2 * o - i,
        s = n < t - 1 ? e[n + 2] : 2 * i - o;
      return xa((r - n / t) * t, l, o, i, s);
    };
  }
  function pm(e) {
    var t = e.length;
    return function (r) {
      var n = Math.floor(((r %= 1) < 0 ? ++r : r) * t),
        o = e[(n + t - 1) % t],
        i = e[n % t],
        l = e[(n + 1) % t],
        s = e[(n + 2) % t];
      return xa((r - n / t) * t, o, i, l, s);
    };
  }
  var wa = e => () => e;
  function H0(e, t) {
    return function (r) {
      return e + r * t;
    };
  }
  function V0(e, t, r) {
    return (
      (e = Math.pow(e, r)),
      (t = Math.pow(t, r) - e),
      (r = 1 / r),
      function (n) {
        return Math.pow(e + n * t, r);
      }
    );
  }
  function mm(e) {
    return (e = +e) == 1
      ? ol
      : function (t, r) {
          return r - t ? V0(t, r, e) : wa(isNaN(t) ? r : t);
        };
  }
  function ol(e, t) {
    var r = t - e;
    return r ? H0(e, r) : wa(isNaN(e) ? t : e);
  }
  var G0 = (function e(t) {
    var r = mm(t);
    function n(o, i) {
      var l = r((o = Ur(o)).r, (i = Ur(i)).r),
        s = r(o.g, i.g),
        u = r(o.b, i.b),
        a = ol(o.opacity, i.opacity);
      return function (y) {
        return (o.r = l(y)), (o.g = s(y)), (o.b = u(y)), (o.opacity = a(y)), o + '';
      };
    }
    return (n.gamma = e), n;
  })(1);
  function hm(e) {
    return function (t) {
      var r = t.length,
        n = new Array(r),
        o = new Array(r),
        i = new Array(r),
        l,
        s;
      for (l = 0; l < r; ++l) (s = Ur(t[l])), (n[l] = s.r || 0), (o[l] = s.g || 0), (i[l] = s.b || 0);
      return (
        (n = e(n)),
        (o = e(o)),
        (i = e(i)),
        (s.opacity = 1),
        function (u) {
          return (s.r = n(u)), (s.g = o(u)), (s.b = i(u)), s + '';
        }
      );
    };
  }
  var Ca = hm(dm),
    Q0 = hm(pm);
  var Wr = e => Ca(e[e.length - 1]);
  var ym = new Array(3)
      .concat(
        'e0ecf49ebcda8856a7',
        'edf8fbb3cde38c96c688419d',
        'edf8fbb3cde38c96c68856a7810f7c',
        'edf8fbbfd3e69ebcda8c96c68856a7810f7c',
        'edf8fbbfd3e69ebcda8c96c68c6bb188419d6e016b',
        'f7fcfde0ecf4bfd3e69ebcda8c96c68c6bb188419d6e016b',
        'f7fcfde0ecf4bfd3e69ebcda8c96c68c6bb188419d810f7c4d004b',
      )
      .map(Ar),
    ka = Wr(ym);
  var gm = new Array(3)
      .concat(
        'fde0ddfa9fb5c51b8a',
        'feebe2fbb4b9f768a1ae017e',
        'feebe2fbb4b9f768a1c51b8a7a0177',
        'feebe2fcc5c0fa9fb5f768a1c51b8a7a0177',
        'feebe2fcc5c0fa9fb5f768a1dd3497ae017e7a0177',
        'fff7f3fde0ddfcc5c0fa9fb5f768a1dd3497ae017e7a0177',
        'fff7f3fde0ddfcc5c0fa9fb5f768a1dd3497ae017e7a017749006a',
      )
      .map(Ar),
    Ea = Wr(gm);
  var Sm = new Array(3)
      .concat(
        'efedf5bcbddc756bb1',
        'f2f0f7cbc9e29e9ac86a51a3',
        'f2f0f7cbc9e29e9ac8756bb154278f',
        'f2f0f7dadaebbcbddc9e9ac8756bb154278f',
        'f2f0f7dadaebbcbddc9e9ac8807dba6a51a34a1486',
        'fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a34a1486',
        'fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a354278f3f007d',
      )
      .map(Ar),
    Pa = Wr(Sm);
  var il = 10,
    mo = class extends Je.default.Component {
      render() {
        let { components: t, x: r, y: n, depth: o, renderCount: i } = this.props,
          { s: l } = this.props,
          { Dot: s } = t;
        if (s) {
          if (l <= il) {
            let u;
            switch (o) {
              case 1:
                u = Pa;
                break;
              case 2:
                u = ka;
                break;
              case 3:
              default:
                u = Ea;
            }
            let a = u((i * Math.random()) / 20);
            return Je.default.createElement(s, { color: a, size: il, x: r - il / 2, y: n - il / 2 });
          }
          return (
            (l /= 2),
            Je.default.createElement(
              Je.default.Fragment,
              null,
              Je.default.createElement(mo, { components: t, depth: 1, renderCount: i, s: l, x: r, y: n - l / 2 }),
              Je.default.createElement(mo, { components: t, depth: 2, renderCount: i, s: l, x: r - l, y: n + l / 2 }),
              Je.default.createElement(mo, { components: t, depth: 3, renderCount: i, s: l, x: r + l, y: n + l / 2 }),
            )
          );
        } else return Je.default.createElement('span', { style: { color: 'white' } }, 'No implementation available');
      }
    },
    Hr = mo;
  (Hr.displayName = 'SierpinskiTriangle'),
    (Hr.benchmarkType = 'update'),
    (Hr.defaultProps = { depth: 0, renderCount: 0 });
  var vm = Hr;
  var Y0 = Object.keys(Wt),
    Ra = e =>
      Y0.reduce((t, r) => {
        let { name: n, components: o, version: i } = Wt[r],
          { Component: l, getComponentProps: s, sampleCount: u, type: a } = e(o);
        return (t[r] = { Component: l, getComponentProps: s, sampleCount: u, type: a, version: i, name: n }), t;
      }, {}),
    K0 = {
      'Mount deep tree': Ra(e => ({
        type: 'mount',
        Component: ya,
        getComponentProps: () => ({ breadth: 2, components: e, depth: 7, id: 0, wrap: 1 }),
        Provider: e.Provider,
        sampleCount: 50,
      })),
      'Mount wide tree': Ra(e => ({
        type: 'mount',
        Component: ya,
        getComponentProps: () => ({ breadth: 6, components: e, depth: 3, id: 0, wrap: 2 }),
        Provider: e.Provider,
        sampleCount: 50,
      })),
      'Update dynamic styles': Ra(e => ({
        type: 'update',
        Component: vm,
        getComponentProps: ({ cycle: t }) => ({ components: e, s: 200, renderCount: t, x: 0, y: 0 }),
        Provider: e.Provider,
        sampleCount: 100,
      })),
    },
    Na = K0;
  var ll = q(Q());
  var xm = e => {
      let t = Vr(e),
        r = e.map(n => {
          let o = n - t;
          return o * o;
        });
      return Math.sqrt(Vr(r));
    },
    Vr = e => e.reduce((r, n) => r + n, 0) / e.length,
    wm = e => {
      if (e.length === 1) return e[0];
      let t = e.sort((r, n) => r - n);
      return (t[(t.length - 1) >> 1] + t[t.length >> 1]) / 2;
    };
  function Qt() {
    if (window && window.performance) return window.performance.now();
    if (process && process.hrtime) {
      let [e, t] = process.hrtime(),
        r = e * 1e3,
        n = t / 1e6;
      return r + n;
    } else return Date.now();
  }
  var Le = { MOUNT: 'mount', UPDATE: 'update', UNMOUNT: 'unmount' },
    q0 = (e, t) => {
      switch (t) {
        case Le.MOUNT:
        case Le.UNMOUNT:
          return !((e + 1) % 2);
        case Le.UPDATE:
          return !0;
        default:
          return !1;
      }
    },
    Cm = (e, t) => {
      switch (t) {
        case Le.MOUNT:
          return !((e + 1) % 2);
        case Le.UPDATE:
          return !0;
        case Le.UNMOUNT:
          return !(e % 2);
        default:
          return !1;
      }
    },
    Z0 = (e, t, r) => {
      switch (r) {
        case Le.MOUNT:
          return e >= t * 2 - 1;
        case Le.UPDATE:
          return e >= t - 1;
        case Le.UNMOUNT:
          return e >= t * 2;
        default:
          return !0;
      }
    },
    Ta = (e, t) => e - t,
    Gr = class extends ll.Component {
      constructor(r, n) {
        super(r, n);
        let o = 0,
          i = r.getComponentProps({ cycle: o });
        (this.state = { componentProps: i, cycle: o, running: !1 }), (this._startTime = 0), (this._samples = []);
      }
      componentWillReceiveProps(r) {
        r && this.setState(n => ({ componentProps: r.getComponentProps(n.cycle) }));
      }
      componentWillUpdate(r, n) {
        n.running && !this.state.running && (this._startTime = Qt());
      }
      componentDidUpdate() {
        let { forceLayout: r, sampleCount: n, timeout: o, type: i } = this.props,
          { cycle: l, running: s } = this.state;
        if (
          (s &&
            Cm(l, i) &&
            ((this._samples[l].scriptingEnd = Qt()),
            r &&
              ((this._samples[l].layoutStart = Qt()),
              document.body && document.body.offsetWidth,
              (this._samples[l].layoutEnd = Qt()))),
          s)
        ) {
          let u = Qt();
          !Z0(l, n, i) && u - this._startTime < o ? this._handleCycleComplete() : this._handleComplete(u);
        }
      }
      componentWillUnmount() {
        this._raf && window.cancelAnimationFrame(this._raf);
      }
      render() {
        let { Component: r, type: n } = this.props,
          { componentProps: o, cycle: i, running: l } = this.state;
        return (
          l && Cm(i, n) && (this._samples[i] = { scriptingStart: Qt() }),
          l && q0(i, n) ? ll.default.createElement(r, E({}, o)) : null
        );
      }
      start() {
        (this._samples = []), this.setState(() => ({ running: !0, cycle: 0 }));
      }
      _handleCycleComplete() {
        let { getComponentProps: r, type: n } = this.props,
          { cycle: o } = this.state,
          i;
        r && ((i = r({ cycle: o })), n === Le.UPDATE && (i['data-test'] = o)),
          (this._raf = window.requestAnimationFrame(() => {
            this.setState(l => ({ cycle: l.cycle + 1, componentProps: i }));
          }));
      }
      getSamples() {
        return this._samples.reduce(
          (r, { scriptingStart: n, scriptingEnd: o, layoutStart: i, layoutEnd: l }) => (
            r.push({
              start: n,
              end: l || o || 0,
              scriptingStart: n,
              scriptingEnd: o || 0,
              layoutStart: i,
              layoutEnd: l,
            }),
            r
          ),
          [],
        );
      }
      _handleComplete(r) {
        let { onComplete: n } = this.props,
          o = this.getSamples();
        this.setState(() => ({ running: !1, cycle: 0 }));
        let i = r - this._startTime,
          l = o.map(({ start: a, end: y }) => y - a).sort(Ta),
          s = o.map(({ scriptingStart: a, scriptingEnd: y }) => y - a).sort(Ta),
          u = o.map(({ layoutStart: a, layoutEnd: y }) => (y || 0) - (a || 0)).sort(Ta);
        n({
          startTime: this._startTime,
          endTime: r,
          runTime: i,
          sampleCount: o.length,
          samples: o,
          max: l[l.length - 1],
          min: l[0],
          median: wm(l),
          mean: Vr(l),
          stdDev: xm(l),
          meanLayout: Vr(u),
          meanScripting: Vr(s),
        });
      }
    };
  (Gr.displayName = 'Benchmark'), (Gr.defaultProps = { sampleCount: 50, timeout: 1e4, type: Le.MOUNT });
  var J0 = ge({
      root: { display: 'flex', height: '100%' },
      button: { minHeight: '40px', fontSize: ' 20px', cursor: 'pointer' },
      results: E(E({ marginTop: '10px' }, U.borderTop('1px', 'solid', 'black')), U.padding('10px', '0')),
      runContainer: { flexGrow: 1, flexShrink: 1, flexBasis: '0%' },
      runActions: { display: 'flex', '& button': { flexGrow: 1 } },
      benchmarkContainer: {
        backgroundColor: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: '0%',
      },
    }),
    eg = { benchmark: 'Mount deep tree', library: Object.keys(Wt)[0], results: [], inProgress: !1 };
  function tg(e, t) {
    switch (t.type) {
      case 'SELECT_LIBRARY':
        return M(E({}, e), { library: t.payload });
      case 'SELECT_BENCHMARK':
        return M(E({}, e), { benchmark: t.payload });
      case 'CLEAR_RESULTS':
        return M(E({}, e), { results: [] });
      case 'BENCHMARK_COMPLETED':
        let r = [...e.results].slice(0, -1);
        return (
          r.push({ analysis: E({}, t.payload), library: e.library, benchmark: e.benchmark }),
          M(E({}, e), { inProgress: !1, results: r })
        );
      case 'START_BENCHMARK':
        let n = [...e.results];
        return n.push({ library: e.library, benchmark: e.benchmark }), M(E({}, e), { inProgress: !0, results: n });
    }
  }
  var km = () => {
    let e = J0(),
      [t, r] = X.default.useReducer(tg, eg),
      { library: n, benchmark: o, results: i, inProgress: l } = t,
      s = X.default.useRef({ start: () => null });
    X.default.useEffect(() => {
      l && s.current.start();
    }, [l]);
    let u = Na[o][n];
    return X.default.createElement(
      'div',
      { className: e.root },
      X.default.createElement(
        'div',
        { className: e.runContainer },
        X.default.createElement(
          'div',
          { className: e.runActions },
          X.default.createElement(
            'button',
            {
              className: e.button,
              disabled: l,
              onClick: () => {
                r({ type: 'START_BENCHMARK' });
              },
            },
            l ? 'Running...' : 'Run',
          ),
          X.default.createElement(
            'button',
            { className: e.button, onClick: () => r({ type: 'CLEAR_RESULTS' }) },
            'Clear results',
          ),
        ),
        X.default.createElement(
          qi,
          { label: 'Library', value: n, onChange: a => r({ type: 'SELECT_LIBRARY', payload: a.target.value }) },
          Object.keys(Wt).map(a => X.default.createElement('option', { value: a, key: a }, a)),
        ),
        X.default.createElement(
          qi,
          { label: 'Benchmark', value: o, onChange: a => r({ type: 'SELECT_BENCHMARK', payload: a.target.value }) },
          Object.keys(Na).map(a => X.default.createElement('option', { value: a, key: a }, a)),
        ),
        X.default.createElement(
          'div',
          { className: e.results },
          i.map(a => X.default.createElement(ha, M(E({}, a), { version: '1.0.0' }))),
        ),
      ),
      X.default.createElement(
        'div',
        { className: e.benchmarkContainer },
        l
          ? X.default.createElement(
              Gr,
              M(E({ ref: s }, u), { onComplete: a => r({ type: 'BENCHMARK_COMPLETED', payload: a }) }),
            )
          : X.default.createElement(u.Component, E({}, u.getComponentProps({ cycle: 10 }))),
      ),
    );
  };
  var rg = Br(document);
  Em.default.render(
    Ba.default.createElement(ua, { renderer: rg }, Ba.default.createElement(km, null)),
    document.getElementById('root'),
  );
})();
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/
/** @license React v0.20.2
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/** @license React v17.0.2
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/** @license React v17.0.2
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
