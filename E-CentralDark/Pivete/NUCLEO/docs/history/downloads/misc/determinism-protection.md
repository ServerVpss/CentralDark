# TypeScript Workflow V8 Sandboxing

## Overview

The TypeScript SDK runs workflows in a V8 sandbox that provides automatic protection against non-deterministic operations, and replaces common non-deterministic function calls with deterministic variants.

## Import Blocking

The sandbox blocks imports of `fs`, `https` modules, and any Node/DOM APIs. Otherwise, workflow code can import any package as long as it does not reference Node.js or DOM APIs.

**Note**: If you must use a library that references a Node.js or DOM API and you are certain that those APIs are not used at runtime, add that module to the `ignoreModules` list:

```ts
const worker = await Worker.create({
  workflowsPath: require.resolve('./workflows'), // bundlerOptions only apply with workflowsPath
  activities: require('./activities'),
  taskQueue: 'my-task-queue',
  bundlerOptions: {
    // These modules may be imported (directly or transitively),
    // but will be excluded from the Workflow bundle.
    ignoreModules: ['fs', 'http', 'crypto'],
  },
});
```

**Important**: Excluded modules are completely unavailable at runtime. Any attempt to call functions from these modules will throw an error. Only exclude modules when you are certain the code paths using them will never execute during workflow execution.

**Note**: Modules with the `node:` prefix (e.g., `node:fs`) require additional webpack configuration to ignore. You may need to configure the bundler's `externals` or use webpack `resolve.alias` to handle these imports.

Use this with *extreme caution*.


## Function Replacement

Functions like `Math.random()`, `Date`, and `setTimeout()` are replaced by deterministic versions.

Date-related functions return the timestamp at which the current workflow task was initially executed. That timestamp remains the same when the workflow task is replayed, and only advances when a durable operation occurs (like `sleep()`). For example:

```ts
import { sleep } from '@temporalio/workflow';

// this prints the *exact* same timestamp repeatedly
for (let x = 0; x < 10; ++x) {
  console.log(Date.now());
}

// this prints timestamps increasing roughly 1s each iteration
for (let x = 0; x < 10; ++x) {
  await sleep('1 second');
  console.log(Date.now());
}
```

Generally, this is the behavior you want.

Additionally, `FinalizationRegistry` and `WeakRef` are removed because v8's garbage collector is not deterministic.


---

# OUTRO - determinism-protection.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\temporal\skills\temporal-developer\references\java\determinism-protection.md
**SHA:** 0fa9392efc4e0253
**Timestamp:** 2026-08-26T18:44:42.149263
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Download the `-all.jar` from Maven Central (`io.temporal:temporal-workflowcheck`) and run:

### Ouro Bruto (primeiros 5000 chars)
```
# Java Determinism Protection

## Overview

The Java SDK has **no sandbox** (only Python and TypeScript have sandboxing). Java relies on developer conventions and runtime replay detection to enforce determinism. A static analysis tool (`temporal-workflowcheck`) is available in beta.

## Forbidden Operations

```java
// BAD: Non-deterministic operations in workflow code
Thread.sleep(1000);
UUID id = UUID.randomUUID();
double val = Math.random();
long now = System.currentTimeMillis();
new Thread(() -> doWork()).start();
CompletableFuture.supplyAsync(() -> compute());

// GOOD: Deterministic Workflow.* alternatives
Workflow.sleep(Duration.ofSeconds(1));
String id = Workflow.randomUUID().toString();
int val = Workflow.newRandom().nextInt();
long now = Workflow.currentTimeMillis();
Promise<Void> promise = Async.procedure(() -> doWork());
CompletablePromise<String> promise = Workflow.newPromise();
```

## Static Analysis with `temporal-workflowcheck`

**Warning:** This tool is in beta.

`temporal-workflowcheck` scans compiled bytecode to detect non-deterministic operations in workflow code. It catches threading, I/O, randomization, system time access, and non-final static field access — including transitive violations through call chains.

### Setup (Gradle)

Add the dependency as a compile-only check:

```groovy
dependencies {
    implementation 'io.temporal:temporal-sdk:1.+'
    compileOnly 'io.temporal:temporal-workflowcheck:1.+'
}
```

See the [Gradle sample](https://github.com/temporalio/sdk-java/tree/master/temporal-workflowcheck/samples/gradle) for full task configuration.

### Setup (Maven)

See the [Maven sample](https://github.com/temporalio/sdk-java/tree/master/temporal-workflowcheck/samples/maven) for POM configuration.

### Running Manually

Download the `-all.jar` from Maven Central (`io.temporal:temporal-workflowcheck`) and run:

```bash
java -jar temporal-workflowcheck-<version>-all.jar check <classpath-entries>
```

### Suppressing False Positives

Use the `@WorkflowCheck.SuppressWarnings` annotation on methods:

```java
@WorkflowCheck.SuppressWarnings(invalidMembers = "currentTimeMillis")
public long getCurrentMillis() {
    return System.currentTimeMillis();
}
```

Or use a `.properties` configuration file with `--config <path>` for third-party library false positives.

## Convention-Based Enforcement

Java workflow code runs in a cooperative threading model where only one workflow thread executes at a time under a global lock. The SDK does not intercept or block non-deterministic calls. Instead, non-determinism is detected at **replay time**: if replayed code produces results that differ from the recorded history, the SDK throws a `NonDeterministicException`.

Use both `temporal-workflowcheck` (static, pre-deploy) and `WorkflowReplayer` (replay testing) to catch non-determinism before production.

## Best Practices

1. Run `temporal-workflowcheck` in CI to catch non-deterministic code statically
2. Always use `Workflow.*` APIs instead of standard Java equivalents for time, randomness, UUIDs, sleeping, and threading
3. Test all workflow code changes with `WorkflowReplayer` against recorded histories
4. Keep workflows focused on orchestration logic; move all I/O and side effects into activities
5. Avoid mutable static state shared across workflow instances

```