# COMANDO - test.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.github\workflows\test.yml
**SHA:** 4c3bee2eded1da01
**Timestamp:** 2026-08-28T02:02:29.025438
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: npm ci
- run: |
- run: |
- run: npm ci
- run: |
- run: |
- run: npm ci
- run: |
- run: |
- run: npm ci

### Ouro Bruto (primeiros 5000 chars)
```
name: Test
# Story 6.1: Specialized testing (security, build, integration, performance)
# Cross-platform compatibility testing moved to ci.yml
# NOTE: Only runs on push to main (PRs use ci.yml for validation)

on:
  push:
    branches: [main]
    paths-ignore:
      - 'docs/**'
      - '*.md'
      - '.aios/**'
      - 'squads/**'
  workflow_dispatch:

concurrency:
  group: test-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '20'

jobs:
  # NOTE: Lint job removed (Story 6.1) - handled by ci.yml

  security-audit:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run security audit
        run: |
          npm audit --audit-level=moderate || echo "Security audit completed with warnings"

      - name: Run penetration test
        run: |
          if [ -f "security/penetration-test.js" ]; then
            cd security
            node penetration-test.js
          else
            echo "Penetration test not found, skipping"
          fi

  build-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Test workspace package
        run: |
          echo "Testing workspace package: aios-core"

          # Check if package.json exists
          if [ -f "package.json" ]; then
            echo "✅ package.json exists"

            # Check if entry points exist
            if [ -f "index.js" ]; then
              echo "✅ index.js exists"
            else
              echo "ℹ️ index.js not found (CLI-based package)"
            fi

            # Validate package.json
            node -e "
              const pkg = require('./package.json');
              console.log('✅ Package validation passed:', pkg.name);
            "
          else
            echo "❌ package.json not found"
            exit 1
          fi

      - name: Test installer package
        run: |
          if [ -d "packages/installer" ]; then
            echo "Testing packages/installer"
            cd packages/installer
            if [ -f "package.json" ]; then
              echo "✅ Installer package.json exists"
            fi
          else
            echo "ℹ️ Installer package not found, skipping"
          fi

  integration-test:
    runs-on: ubuntu-latest
    needs: [security-audit, build-test]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Test CLI integration
        run: |
          # Test that CLI entry point works
          node -e "
            try {
              // Test bin/aios-init.js exists
              const fs = require('fs');
              if (fs.existsSync('./bin/aios-init.js')) {
                console.log('✅ aios-init.js exists');
              } else {
                console.log('❌ aios-init.js not found');
                process.exit(1);
              }

              // Test bin/aios.js exists
              if (fs.existsSync('./bin/aios.js')) {
                console.log('✅ aios.js exists');
              } else {
                console.log('❌ aios.js not found');
                process.exit(1);
              }

              console.log('✅ CLI integration test passed');
            } catch (error) {
              console.error('❌ CLI integration test failed:', error.message);
              process.exit(1);
            }
          "

      - name: Test core modules
        run: |
          # Test core scripts are loadable
          for script in health-check greeting-builder agent-parser; do
            SCRIPT_PATH=".aios-core/development/scripts/${script}.js"
            if [ -f "$SCRIPT_PATH" ]; then
              echo "✅ Found: $SCRIPT_PATH"
            else
              # Check alternative locations
              ALT_PATH=".aios-core/core/${script}.js"
              if [ -f "$ALT_PATH" ]; then
                echo "✅ Found: $ALT_PATH"
              else
                echo "ℹ️ Script not found: $script (may not be required)"
              fi
            fi
          done
          echo "✅ Core modules check completed"

  performance-test:
    runs-on: ubuntu-latest
    needs: [build-test]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - 
```

---

# COMANDO - Test.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\testing-jvm\org\gradle\api\tasks\testing\Test.java
**SHA:** b3810147a5d58e6e
**Timestamp:** 2026-08-28T02:51:51.831974
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- *   dryRun = true

### Gaps
- // TODO: Deprecate and remove this method
- // TODO: Deprecate and remove this method

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2010 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.gradle.api.tasks.testing;

import groovy.lang.Closure;
import groovy.lang.DelegatesTo;
import org.gradle.StartParameter;
import org.gradle.api.Action;
import org.gradle.api.Incubating;
import org.gradle.api.JavaVersion;
import org.gradle.api.NonNullApi;
import org.gradle.api.Transformer;
import org.gradle.api.file.ConfigurableFileCollection;
import org.gradle.api.file.FileCollection;
import org.gradle.api.file.FileTree;
import org.gradle.api.file.FileTreeElement;
import org.gradle.api.internal.DocumentationRegistry;
import org.gradle.api.internal.classpath.ModuleRegistry;
import org.gradle.api.internal.provider.PropertyFactory;
import org.gradle.api.internal.tasks.testing.JvmTestExecutionSpec;
import org.gradle.api.internal.tasks.testing.TestExecutableUtils;
import org.gradle.api.internal.tasks.testing.TestExecuter;
import org.gradle.api.internal.tasks.testing.TestFramework;
import org.gradle.api.internal.tasks.testing.detection.DefaultTestExecuter;
import org.gradle.api.internal.tasks.testing.filter.DefaultTestFilter;
import org.gradle.api.internal.tasks.testing.junit.JUnitTestFramework;
import org.gradle.api.internal.tasks.testing.junit.result.TestClassResult;
import org.gradle.api.internal.tasks.testing.junit.result.TestResultSerializer;
import org.gradle.api.internal.tasks.testing.junitplatform.JUnitPlatformTestFramework;
import org.gradle.api.internal.tasks.testing.testng.TestNGTestFramework;
import org.gradle.api.internal.tasks.testing.worker.TestWorker;
import org.gradle.api.jvm.ModularitySpec;
import org.gradle.api.model.ObjectFactory;
import org.gradle.api.provider.Property;
import org.gradle.api.provider.Provider;
import org.gradle.api.provider.ProviderFactory;
import org.gradle.api.specs.Spec;
import org.gradle.api.tasks.CacheableTask;
import org.gradle.api.tasks.Classpath;
import org.gradle.api.tasks.IgnoreEmptyDirectories;
import org.gradle.api.tasks.Input;
import org.gradle.api.tasks.InputFiles;
import org.gradle.api.tasks.Internal;
import org.gradle.api.tasks.Nested;
import org.gradle.api.tasks.PathSensitive;
import org.gradle.api.tasks.PathSensitivity;
import org.gradle.api.tasks.SkipWhenEmpty;
import org.gradle.api.tasks.TaskAction;
import org.gradle.api.tasks.options.Option;
import org.gradle.api.tasks.testing.junit.JUnitOptions;
import org.gradle.api.tasks.testing.junitplatform.JUnitPlatformOptions;
import org.gradle.api.tasks.testing.testng.TestNGOptions;
import org.gradle.api.tasks.util.PatternFilterable;
import org.gradle.api.tasks.util.internal.PatternSetFactory;
import org.gradle.internal.Actions;
import org.gradle.internal.Cast;
import org.gradle.internal.actor.ActorFactory;
import org.gradle.internal.concurrent.CompositeStoppable;
import org.gradle.internal.deprecation.DeprecationLogger;
import org.gradle.internal.instrumentation.api.annotations.ToBeReplacedByLazyProperty;
import org.gradle.internal.jvm.DefaultModularitySpec;
import org.gradle.internal.jvm.JavaModuleDetector;
import org.gradle.internal.jvm.UnsupportedJavaRuntimeException;
import org.gradle.internal.scan.UsedByScanPlugin;
import org.gradle.internal.time.Clock;
import org.gradle.internal.work.WorkerLeaseService;
import org.gradle.jvm.toolchain.JavaLauncher;
import org.gradle.jvm.toolchain.JavaToolchainService;
import org.gradle.jvm.toolchain.JavaToolchainSpec;
import org.gradle.jvm.toolchain.internal.JavaExecutableUtils;
import org.gradle.process.CommandLineArgumentProvider;
import org.gradle.process.JavaDebugOptions;
import org.gradle.process.JavaForkOptions;
import org.gradle.process.ProcessForkOptions;
import org.gradle.process.internal.JavaForkOptionsFactory;
import org.gradle.process.internal.worker.WorkerProcessFactory;
import org.gradle.util.internal.ConfigureUtil;

import javax.annotation.Nullable;
import javax.inject.Inject;
import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Callable;

import static org.gradle.util.internal.ConfigureUtil.configureUsing;

/**
 * Executes JUnit (3.8.x, 4.x or 5.x) or TestNG tests. Test are always run in (one or more) separate JVMs.
 *
 * <p>
 * The sample below shows various configuration options.
 *
 * <pre class='autoTested'>
 * plugins {
 *     id("java-library") // adds 'test' task
 * }
 *
 * test {
 *   // di
```