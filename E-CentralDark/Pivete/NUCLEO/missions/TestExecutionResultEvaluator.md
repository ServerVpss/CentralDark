# MISSAO - TestExecutionResultEvaluator.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\tooling-api-builders\org\gradle\tooling\internal\provider\runner\TestExecutionResultEvaluator.java
**SHA:** dfd4150a770a0ff6
**Timestamp:** 2026-08-28T02:52:11.531614
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- for (String pattern : testSpec.getPatterns()) {

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2015 the original author or authors.
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

package org.gradle.tooling.internal.provider.runner;

import com.google.common.base.Strings;
import org.gradle.api.Task;
import org.gradle.api.internal.tasks.execution.ExecuteTaskBuildOperationDetails;
import org.gradle.api.internal.tasks.testing.TestDescriptorInternal;
import org.gradle.api.internal.tasks.testing.operations.ExecuteTestBuildOperationType;
import org.gradle.api.tasks.testing.TestExecutionException;
import org.gradle.api.tasks.testing.TestResult;
import org.gradle.internal.build.event.types.DefaultTestDescriptor;
import org.gradle.internal.operations.BuildOperationAncestryTracker;
import org.gradle.internal.operations.BuildOperationDescriptor;
import org.gradle.internal.operations.BuildOperationListener;
import org.gradle.internal.operations.OperationFinishEvent;
import org.gradle.internal.operations.OperationIdentifier;
import org.gradle.internal.operations.OperationProgressEvent;
import org.gradle.internal.operations.OperationStartEvent;
import org.gradle.tooling.internal.protocol.events.InternalTestDescriptor;
import org.gradle.tooling.internal.protocol.test.InternalJvmTestRequest;
import org.gradle.tooling.internal.protocol.test.InternalTaskSpec;
import org.gradle.tooling.internal.protocol.test.InternalTestSpec;
import org.gradle.tooling.internal.provider.action.TestExecutionRequestAction;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicLong;

class TestExecutionResultEvaluator implements BuildOperationListener {
    private static final String INDENT = "    ";

    private final BuildOperationAncestryTracker ancestryTracker;
    private final TestExecutionRequestAction internalTestExecutionRequest;

    private final AtomicLong resultCount = new AtomicLong();
    private final Map<Object, String> runningTasks = new ConcurrentHashMap<>();
    private final Queue<FailedTest> failedTests = new ConcurrentLinkedQueue<FailedTest>();

    public TestExecutionResultEvaluator(
        BuildOperationAncestryTracker ancestryTracker,
        TestExecutionRequestAction internalTestExecutionRequest
    ) {
        this.ancestryTracker = ancestryTracker;
        this.internalTestExecutionRequest = internalTestExecutionRequest;
    }

    public boolean hasUnmatchedTests() {
        if (noTestsSelected()) {
             return false;
        } else {
            return resultCount.get() == 0;
        }
    }

    private boolean noTestsSelected() {
        return noTestDescriptorsSelected() && noTestsClassesNorMethodsSelected() && noTestsSelectedInTaskSpecs();
    }

    private boolean noTestDescriptorsSelected() {
        return internalTestExecutionRequest.getTestExecutionDescriptors().isEmpty();
    }

    private boolean noTestsClassesNorMethodsSelected() {
        return internalTestExecutionRequest.getInternalJvmTestRequests().isEmpty();
    }

    private boolean noTestsSelectedInTaskSpecs() {
        return internalTestExecutionRequest.getTaskSpecs()
            .stream()
            .filter(InternalTestSpec.class::isInstance)
            .map(InternalTestSpec.class::cast)
            .allMatch(TestExecutionResultEvaluator::emptyTest);
    }

    private static boolean emptyTest(InternalTestSpec spec) {
        return allEmpty(spec.getClasses(), spec.getMethods().keySet(), spec.getPackages(), spec.getPatterns());
    }

    private static boolean allEmpty(Collection<?>... collections) {
        return Arrays.stream(collections).allMatch(Collection::isEmpty);
    }

    public boolean hasFailedTests() {
        return !failedTests.isEmpty();
    }

    public void evaluate() {
        if (hasUnmatchedTests()) {
            String formattedTestRequest = formatInternalTestExecutionRequest();
            throw new TestExecutionException("No matching tests found in any candidate test task.\n" + formattedTestRequest);
        }
        if (hasFailedTests()) {
            StringBuilder failedTestsMessage = new StringBuilder("Test failed.\n")
                .append(INDENT).append("Failed tests:");
            for (FailedTest failedTest : failedTests) {
                failedTestsMessage.append("\n").append(twoIndent()).append(failedTest.getDescription());
            }
            thro
```