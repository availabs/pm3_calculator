/*
 * This module provides the list of hashes
 *   in the current git branch's history.
 *
 * NOTE: If we start hopping through the git history
 *   searching for where calculator output changes,
 *   we will need to keep the calculators/__tests__
 *   directory outside of the effects of said
 *   "time traveling."
 */

const { execSync } = require('child_process');

// Get the list of hashes in the git history,
//   convert to a JS array,
//   then filter out empty strings
const hashes = execSync('git log --pretty=format:"%H"', {
  encoding: 'utf8'
})
  .split(/\n/)
  .filter(h => h);

module.exports = hashes;
