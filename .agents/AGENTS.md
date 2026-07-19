# Project Rules for Travel-Packing-Optimizer

## Mandatory Audit & Linting
Before claiming any task, feature, or bug fix is complete and ready for the user, you MUST perform a full audit check.
1. You must run `npm run lint` and resolve any ReferenceErrors or critical warnings.
2. You must run `npm test` and ensure all tests pass. If you touched `packerLogic.js` or `parser.js`, add or update a test that would have caught the bug you just fixed -- don't just make the existing suite pass.
3. You must run `npm run build` to ensure the application compiles successfully without fatal Rollup errors.
4. You cannot say something is "ready" or "fully built" until it passes these audit checks.
