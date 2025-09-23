import { GriffelRenderer, StyleBucketName, CSSRulesByBucket } from '@griffel/core';
type RuleEntry = {
    styleBucketName: StyleBucketName;
    cssRule: string;
    priority: number;
    media: string;
};
export declare function getUniqueRulesFromSets(setOfCSSRules: CSSRulesByBucket[]): RuleEntry[];
export declare function sortCSSRules(setOfCSSRules: CSSRulesByBucket[], compareMediaQueries: GriffelRenderer['compareMediaQueries']): string;
export {};
