import assert from 'node:assert/strict';
import { getAnalysisLimit, hasReachedAnalysisLimit } from '../../dist/utils/limits.js';

assert.equal(getAnalysisLimit('free', 3), 3);
assert.equal(hasReachedAnalysisLimit('free', 2, 3), false);
assert.equal(hasReachedAnalysisLimit('free', 3, 3), true);
assert.equal(getAnalysisLimit('plus', 3), Number.POSITIVE_INFINITY);
assert.equal(hasReachedAnalysisLimit('plus', 100, 3), false);

console.log('planGuard limit logic passed');
