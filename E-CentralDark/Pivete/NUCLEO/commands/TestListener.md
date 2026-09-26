# COMANDO - TestListener.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\testing-base\org\gradle\api\tasks\testing\TestListener.java
**SHA:** 0d459796cfe7b91d
**Timestamp:** 2026-08-28T02:51:49.506259
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // todo: consider multithreading/multiprocess issues

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

// todo: consider multithreading/multiprocess issues
// Teamcity has the concept of a "wave" of messages
// where each thread/process uses a unique wave id

import org.gradle.internal.DeprecatedInGradleScope;
import org.gradle.internal.service.scopes.EventScope;
import org.gradle.internal.service.scopes.Scope;

/**
 * Interface for listening to test execution.  The intent is to be
 * framework agnostic.  Currently this interface can support feedback
 * from JUnit and TestNG tests.
 */
@EventScope(Scope.Build.class)
@DeprecatedInGradleScope
public interface TestListener {
    /**
     * Called before a test suite is started.
     * @param suite The suite whose tests are about to be executed.
     */
    void beforeSuite(TestDescriptor suite);

    /**
     * Called after a test suite is finished.
     * @param suite The suite whose tests have finished being executed.
     * @param result The aggregate result for the suite.
     */
    void afterSuite(TestDescriptor suite, TestResult result);

    /**
     * Called before an atomic test is started.
     * @param testDescriptor The test which is about to be executed.
     */
    void beforeTest(TestDescriptor testDescriptor);

    /**
     * Called after an atomic test is finished.
     * @param testDescriptor The test which has finished executing.
     * @param result The test result.
     */
    void afterTest(TestDescriptor testDescriptor, TestResult result);
}

```