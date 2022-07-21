export type ColorTokens = {
  foreground: string;
  background: string;

  slotNameBackground: string;
  slotNameBorder: string;

  /** tokens for css highlighting */
  cssAtRule: string;
  cssNumber: string;
  cssProperty: string;
  cssPunctuation: string;
  cssSelector: string;
};

export type SlotInfo = { slot: string; rules: AtomicRules[]; sourceURL?: string };

export type AtomicRules = { cssRule: string; overriddenBy?: string };

export type RuleDetail = {
  className: string;
  css: string;
  overriddenBy?: string;
};
export type MonolithicAtRules = Record<string /** selector */, RuleDetail[]>;
export type MonolithicRules = Record<string /** selector */, RuleDetail[] | MonolithicAtRules>;
