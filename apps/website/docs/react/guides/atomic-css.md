---
sidebar_position: 1
---

# Atomic CSS

Atomic CSS is an opposite approach to monolithic classes. In Atomic CSS every property-value is written as a single CSS rule.

```html
<!-- Monolithic classes -->
<button class="button"></button>
<!-- Atomic CSS -->
<button class="display-flex align-items"></button>
```

```css
/* Monolithic classes */
.button {
  display: flex;
  align-items: center;
}

/* Atomic CSS */
.display-flex {
  display: flex;
}
.align-items-center {
  align-items: center;
}
```

Atomic CSS enables CSS rules re-use and reduces total amount of defined rules. Other components can re-use the same CSS rules and create fewer rules as styles grow.

## Style overrides

While Griffel works by default in runtime it has [ahead-of-time compilation](/react/ahead-of-time-compilation/introduction). AOT compilation process [cannot create new rules at runtime](/react/guides/limitations) and because of that we rely on [merging CSS rules](/react/api/merge-classes).

Take these two rule sets:

```css
/* Group A */
.display-flex {
  display: flex;
}
.align-items-center {
  align-items: center;
}

/* Group B */
.align-items-end {
  align-items: end;
}
```

There are two pieces that are used to create classes: property name (`display`, `align-items`) & value (`flex`, `center`, `end`). Using [mergeClasses](/react/api/merge-classes) we ensure that only one set of properties is applied. The last defined property-value pair wins.

```html
<!-- Example: a result of merging classes -->
<button class="display-flex align-items-end"></button>
```

## LVFHA order of pseudo classes

Pseudo classes in CSS (like `:hover`, `:link`, `:focus`, `:active`) have equal specificity and the result is determined by [order of appearance](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Cascade_and_inheritance#understanding_the_cascade).
When atomic classes inserted to DOM, they are inserted based on definition, basically based on usage. This means the resulting styles would be based on which components’ styles were rendered first. A [CodeSandbox](https://codesandbox.io/s/lvfha-puzzle-ihbict) that shows this behavior.

To ensure that results are deterministic Griffel performs automatic ordering of common pseudo classes in the following order:

- `:link`
- `:visited`
- `:focus-within`
- `:focus`
- `:focus-visible`
- `:hover`
- `:active`

The last defined pseudo wins.

## Trade-offs

### Larger classes

Atomic CSS increases size of HTML markup as more classes added to elements: every CSS rules adds a class to the element.

- Compression techniques like [gzip](https://en.wikipedia.org/wiki/HTTP_compression) work well to reduce bundle sizes.
- CSS stylesheets are significantly smaller compared to traditional approaches due reused CSS rules.

### Recalculation performance

Once an element has many HTML class names each pointing to different CSS rules, Blink based browsers (Chrome, Edge) have linear performance degradation based on an amount of classes.

| Class names            |     1 |     10 |     50 |    100 |    200 |    500 | 1000   |
| ---------------------- | ----: | -----: | -----: | -----: | -----: | -----: | ------ |
| Elapsed (ms)           |    53 |     57 |     74 |     89 |    127 |    207 | 372    |
| Over baseline (ms)     |     0 |      4 |     21 |     36 |     74 |    154 | 319    |
| Match attempts         | 10000 |  10000 |  10000 |  10000 |  10000 |  10000 | 10000  |
| Elapsed time per match |   N/A | 0.0004 | 0.0021 | 0.0036 | 0.0074 | 0.0154 | 0.0319 |

_Measured in Edge 105 & Surface Go 2 on battery power._

Cases when elements have 100 classes and more are rare, but you can easily get there with [nested selectors](/react/api/make-styles#nesting-selector) what we recommend to avoid.

## Other materials

- [Fluent UI Insights, EP02 Styling](https://www.youtube.com/watch?v=a8TFywbXBt0) & [Fluent UI Insights, EP03 Griffel](https://www.youtube.com/watch?v=edyW7t-rIUU)
- [Atomic CSS-in-JS](https://sebastienlorber.com/atomic-css-in-js)
- [The Shorthand-Longhand Problem in Atomic CSS](https://weser.io/blog/the-shorthand-longhand-problem-in-atomic-css)
