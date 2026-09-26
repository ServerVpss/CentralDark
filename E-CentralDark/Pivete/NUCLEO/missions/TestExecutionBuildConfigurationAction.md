# MISSAO - TestExecutionBuildConfigurationAction.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\tooling-api-builders\org\gradle\tooling\internal\provider\runner\TestExecutionBuildConfigurationAction.java
**SHA:** 352a64ed1edad929
**Timestamp:** 2026-08-28T02:52:11.498014
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- final Set<Task> allTasksToRun = new LinkedHashSet<>();

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

import org.gradle.api.NonNullApi;
import org.gradle.api.Task;
import org.gradle.api.internal.GradleInternal;
import org.gradle.api.internal.project.ProjectState;
import org.gradle.api.internal.tasks.testing.filter.DefaultTestFilter;
import org.gradle.api.specs.Specs;
import org.gradle.api.tasks.testing.AbstractTestTask;
import org.gradle.api.tasks.testing.Test;
import org.gradle.api.tasks.testing.TestExecutionException;
import org.gradle.api.tasks.testing.TestFilter;
import org.gradle.execution.EntryTaskSelector;
import org.gradle.execution.TaskSelection;
import org.gradle.execution.TaskSelectionException;
import org.gradle.execution.plan.ExecutionPlan;
import org.gradle.execution.plan.QueryableExecutionPlan;
import org.gradle.internal.build.event.types.DefaultTestDescriptor;
import org.gradle.process.internal.DefaultJavaDebugOptions;
import org.gradle.tooling.internal.protocol.events.InternalJvmTestDescriptor;
import org.gradle.tooling.internal.protocol.events.InternalTestDescriptor;
import org.gradle.tooling.internal.protocol.test.InternalDebugOptions;
import org.gradle.tooling.internal.protocol.test.InternalJvmTestRequest;
import org.gradle.tooling.internal.protocol.test.InternalTaskSpec;
import org.gradle.tooling.internal.protocol.test.InternalTestSpec;
import org.gradle.tooling.internal.provider.action.TestExecutionRequestAction;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Consumer;

@NonNullApi
class TestExecutionBuildConfigurationAction implements EntryTaskSelector {
    private final TestExecutionRequestAction testExecutionRequest;

    public TestExecutionBuildConfigurationAction(TestExecutionRequestAction testExecutionRequest) {
        this.testExecutionRequest = testExecutionRequest;
    }

    @Override
    public void applyTasksTo(Context context, ExecutionPlan plan) {
        final Set<Task> allTasksToRun = new LinkedHashSet<>();
        collectTasksForTestDescriptors(context, allTasksToRun);
        collectTasksForInternalJvmTestRequest(context.getGradle(), allTasksToRun);
        collectTestTasks(context, allTasksToRun);
        configureTestTasks(allTasksToRun);
        addEntryTasksTo(plan, allTasksToRun);
    }

    @Override
    public void postProcessExecutionPlan(Context context, QueryableExecutionPlan plan) {
        configureTestTasksForTestDescriptors(context);
        configureTestTasksForInternalJvmTestRequest(plan);
        configureTestTasksInBuild(context);
    }

    private static void addEntryTasksTo(ExecutionPlan plan, Set<Task> allTasksToRun) {
        for (Task task : allTasksToRun) {
            plan.addEntryTask(task);
        }
    }

    private void configureTestTasks(Set<Task> tasks) {
        for (Task task : tasks) {
            if (task instanceof AbstractTestTask) {
                configureTestTask((AbstractTestTask) task);
            }
        }
    }

    private void configureTestTask(AbstractTestTask test) {
        test.getFilter().setFailOnNoMatchingTests(false);
        test.getOutputs().upToDateWhen(Specs.SATISFIES_NONE);
        if (test instanceof Test) {
            InternalDebugOptions debugOptions = testExecutionRequest.getDebugOptions();
            if (debugOptions.isDebugMode()) {
                ((Test) test).debugOptions(javaDebugOptions -> {
                    DefaultJavaDebugOptions options = (DefaultJavaDebugOptions) javaDebugOptions;
                    options.getEnabled().set(true);
                    options.getPort().set(debugOptions.getPort());
                    options.getServer().set(false);
                    options.getSuspend().set(false);
                });
            } else {
                ((Test) test).debugOptions(javaDebugOptions -> {
                    DefaultJavaDebugOptions options = (DefaultJavaDebugOptions) javaDebugOptions;
                    options.getEnabled().set(false);
                });
            }
        }
    }

    private void configureTestTasksForTestDescriptors(Context context) {
        Map<String, List<InternalJvmTestRequest>> taskAndTests = testExecutionRequest.getTaskAndTests();
        for (final Map.Entry<String, List<InternalJvmTestRequest>> entry : taskAndTests.entrySet()) {
            String testTaskPath = entry.
```