# OUTRO - test.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\@types\node\test.d.ts
**SHA:** c8d3e5a18ba35629
**Timestamp:** 2026-08-26T19:32:04.546607
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * correct number of assertions are run:

### Gaps
- todo: number;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * The `node:test` module facilitates the creation of JavaScript tests.
 * To access it:
 *
 * ```js
 * import test from 'node:test';
 * ```
 *
 * This module is only available under the `node:` scheme. The following will not
 * work:
 *
 * ```js
 * import test from 'node:test';
 * ```
 *
 * Tests created via the `test` module consist of a single function that is
 * processed in one of three ways:
 *
 * 1. A synchronous function that is considered failing if it throws an exception,
 * and is considered passing otherwise.
 * 2. A function that returns a `Promise` that is considered failing if the `Promise` rejects, and is considered passing if the `Promise` fulfills.
 * 3. A function that receives a callback function. If the callback receives any
 * truthy value as its first argument, the test is considered failing. If a
 * falsy value is passed as the first argument to the callback, the test is
 * considered passing. If the test function receives a callback function and
 * also returns a `Promise`, the test will fail.
 *
 * The following example illustrates how tests are written using the `test` module.
 *
 * ```js
 * test('synchronous passing test', (t) => {
 *   // This test passes because it does not throw an exception.
 *   assert.strictEqual(1, 1);
 * });
 *
 * test('synchronous failing test', (t) => {
 *   // This test fails because it throws an exception.
 *   assert.strictEqual(1, 2);
 * });
 *
 * test('asynchronous passing test', async (t) => {
 *   // This test passes because the Promise returned by the async
 *   // function is settled and not rejected.
 *   assert.strictEqual(1, 1);
 * });
 *
 * test('asynchronous failing test', async (t) => {
 *   // This test fails because the Promise returned by the async
 *   // function is rejected.
 *   assert.strictEqual(1, 2);
 * });
 *
 * test('failing test using Promises', (t) => {
 *   // Promises can be used directly as well.
 *   return new Promise((resolve, reject) => {
 *     setImmediate(() => {
 *       reject(new Error('this will cause the test to fail'));
 *     });
 *   });
 * });
 *
 * test('callback passing test', (t, done) => {
 *   // done() is the callback function. When the setImmediate() runs, it invokes
 *   // done() with no arguments.
 *   setImmediate(done);
 * });
 *
 * test('callback failing test', (t, done) => {
 *   // When the setImmediate() runs, done() is invoked with an Error object and
 *   // the test fails.
 *   setImmediate(() => {
 *     done(new Error('callback failure'));
 *   });
 * });
 * ```
 *
 * If any tests fail, the process exit code is set to `1`.
 * @since v18.0.0, v16.17.0
 * @see [source](https://github.com/nodejs/node/blob/v22.x/lib/test.js)
 */
declare module "node:test" {
    import { AssertMethodNames } from "node:assert";
    import { Readable } from "node:stream";
    import { URL } from "node:url";
    import TestFn = test.TestFn;
    import TestOptions = test.TestOptions;
    /**
     * The `test()` function is the value imported from the `test` module. Each
     * invocation of this function results in reporting the test to the `TestsStream`.
     *
     * The `TestContext` object passed to the `fn` argument can be used to perform
     * actions related to the current test. Examples include skipping the test, adding
     * additional diagnostic information, or creating subtests.
     *
     * `test()` returns a `Promise` that fulfills once the test completes.
     * if `test()` is called within a suite, it fulfills immediately.
     * The return value can usually be discarded for top level tests.
     * However, the return value from subtests should be used to prevent the parent
     * test from finishing first and cancelling the subtest
     * as shown in the following example.
     *
     * ```js
     * test('top level test', async (t) => {
     *   // The setTimeout() in the following subtest would cause it to outlive its
     *   // parent test if 'await' is removed on the next line. Once the parent test
     *   // completes, it will cancel any outstanding subtests.
     *   await t.test('longer running subtest', async (t) => {
     *     return new Promise((resolve, reject) => {
     *       setTimeout(resolve, 1000);
     *     });
     *   });
     * });
     * ```
     *
     * The `timeout` option can be used to fail the test if it takes longer than `timeout` milliseconds to complete. However, it is not a reliable mechanism for
     * canceling tests because a running test might block the application thread and
     * thus prevent the scheduled cancellation.
     * @since v18.0.0, v16.17.0
     * @param name The name of the test, which is displayed when reporting test results.
     * Defaults to the `name` property of `fn`, or `'<anonymous>'` if `fn` does not have a name.
     * @param options Configuration options for the test.
     * @param fn The function under test. The first argument to this function is a {@link TestContext} object.
     * If the test uses callbacks, the callbac
```