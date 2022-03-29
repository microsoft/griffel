export type SlotInfo = { slot: string; rules: AtomicRules[] };

export type AtomicRules = { cssRule: string; overriddenBy?: string };

export type RuleDetail = {
  className: string;
  css: string;
  overriddenBy?: string;
};
export type MonolithicAtRules = Record<string /** selector */, RuleDetail[]>;
export type MonolithicRules = Record<string /** selector */, RuleDetail[] | MonolithicAtRules>;
