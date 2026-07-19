# Project Rules for Travel-Packing-Optimizer

## Mandatory Audit & Linting
Before claiming any task, feature, or bug fix is complete and ready for the user, you MUST perform a full audit check.
1. You must run `npm run lint` and resolve any ReferenceErrors or critical warnings.
2. You must run `npm test` and ensure all tests pass. If you touched `packerLogic.js` or `parser.js`, add or update a test that would have caught the bug you just fixed -- don't just make the existing suite pass.
3. You must run `npm run build` to ensure the application compiles successfully without fatal Rollup errors.
4. If the change is observable in a browser (UI, styling, a user flow), run `npm run test:e2e` too, and verify live in an actual browser rather than trusting computed-style reads alone -- a CSS transition can freeze mid-animation in a headless/non-compositing environment and report a stale value that looks like a bug but isn't; confirm with transitions disabled (`* { transition: none !important; }`) before concluding something is actually broken.
5. You cannot say something is "ready" or "fully built" until it passes these audit checks.

## Releases
Releases are manual and on-demand, not per-commit -- see `SESSION_SUMMARY.md`'s "Release Process" section for the full steps. Never tag or release a commit whose CI (including Android Build) hasn't been verified green.
