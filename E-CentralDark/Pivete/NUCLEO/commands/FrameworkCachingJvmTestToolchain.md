# COMANDO - FrameworkCachingJvmTestToolchain.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\plugins-jvm-test-suite\org\gradle\api\testing\toolchains\internal\FrameworkCachingJvmTestToolchain.java
**SHA:** aaf8a34b7dc9c935
**Timestamp:** 2026-08-28T02:51:18.862111
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- this.delegate = delegate;

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2023 the original author or authors.
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

package org.gradle.api.testing.toolchains.internal;

import org.gradle.api.artifacts.Dependency;
import org.gradle.api.internal.tasks.testing.TestFramework;
import org.gradle.api.tasks.testing.Test;
import org.gradle.util.Path;

import java.util.HashMap;
import java.util.Map;

/**
 * A {@link JvmTestToolchain} that caches the {@link TestFramework} instances it creates.  This prevents multiple calls
 * to {@link JvmTestToolchain#createTestFramework(Test)} for the same test task from overwriting the test framework options.
 *
 * @since 8.5
 */
public class FrameworkCachingJvmTestToolchain<T extends JvmTestToolchainParameters> implements JvmTestToolchain<T> {
    private final JvmTestToolchain<T> delegate;
    private final Map<Path, TestFramework> testFrameworks = new HashMap<>();

    public FrameworkCachingJvmTestToolchain(JvmTestToolchain<T> delegate) {
        this.delegate = delegate;
    }

    @Override
    public TestFramework createTestFramework(Test task) {
        return testFrameworks.computeIfAbsent(task.getIdentityPath(), k -> delegate.createTestFramework(task));
    }

    @Override
    public Iterable<Dependency> getCompileOnlyDependencies() {
        return delegate.getCompileOnlyDependencies();
    }

    @Override
    public Iterable<Dependency> getRuntimeOnlyDependencies() {
        return delegate.getRuntimeOnlyDependencies();
    }

    @Override
    public Iterable<Dependency> getImplementationDependencies() {
        return delegate.getImplementationDependencies();
    }

    @Override
    public T getParameters() {
        return delegate.getParameters();
    }
}

```