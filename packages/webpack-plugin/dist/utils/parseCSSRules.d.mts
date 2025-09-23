import { CSSRulesByBucket } from '@griffel/core';
export declare function parseCSSRules(css: string): {
    cssRulesByBucket: Required<CSSRulesByBucket>;
    remainingCSS: string;
};
