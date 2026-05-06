import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

// @typescript-eslint/rule-tester reads describe/it from a static API; without
// `globals: true` they aren't on globalThis, so wire them in explicitly.
RuleTester.describe = describe;
RuleTester.describeSkip = describe.skip;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.afterAll = afterAll;
