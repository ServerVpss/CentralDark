# MISSAO - JUnitTestEventAdapter.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\testing-jvm-infrastructure\org\gradle\api\internal\tasks\testing\junit\JUnitTestEventAdapter.java
**SHA:** f676bec9a393d9bd
**Timestamp:** 2026-08-28T02:51:52.724489
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- private static final Pattern DESCRIPTOR_PATTERN = Pattern.compile("(.*)\\((.*)\\)(\\[\\d+])?", Pattern.DOTALL);

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

package org.gradle.api.internal.tasks.testing.junit;

import org.gradle.api.NonNullApi;
import org.gradle.api.internal.tasks.testing.DefaultTestDescriptor;
import org.gradle.api.internal.tasks.testing.DefaultTestFailure;
import org.gradle.api.internal.tasks.testing.TestCompleteEvent;
import org.gradle.api.internal.tasks.testing.TestDescriptorInternal;
import org.gradle.api.internal.tasks.testing.TestResultProcessor;
import org.gradle.api.internal.tasks.testing.TestStartEvent;
import org.gradle.api.internal.tasks.testing.failure.DefaultThrowableToTestFailureMapper;
import org.gradle.api.internal.tasks.testing.failure.TestFailureMapper;
import org.gradle.api.internal.tasks.testing.failure.mappers.AssertErrorMapper;
import org.gradle.api.internal.tasks.testing.failure.mappers.AssertjMultipleAssertionsErrorMapper;
import org.gradle.api.internal.tasks.testing.failure.mappers.JUnitComparisonTestFailureMapper;
import org.gradle.api.internal.tasks.testing.failure.mappers.OpenTestAssertionFailedMapper;
import org.gradle.api.internal.tasks.testing.failure.mappers.OpenTestMultipleFailuresErrorMapper;
import org.gradle.api.tasks.testing.TestFailure;
import org.gradle.api.tasks.testing.TestResult;
import org.gradle.internal.id.IdGenerator;
import org.gradle.internal.time.Clock;
import org.junit.runner.Description;
import org.junit.runner.notification.Failure;
import org.junit.runner.notification.RunListener;

import javax.annotation.Nullable;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * A {@link RunListener} that maps JUnit4 events to Gradle test events.
 */
@NonNullApi
public class JUnitTestEventAdapter extends RunListener {

    private static final List<TestFailureMapper> MAPPERS = Arrays.asList(
        new JUnitComparisonTestFailureMapper(),
        new OpenTestAssertionFailedMapper(),
        new OpenTestMultipleFailuresErrorMapper(),
        new AssertjMultipleAssertionsErrorMapper(),
        new AssertErrorMapper()
    );

    private static final DefaultThrowableToTestFailureMapper FAILURE_MAPPER = new DefaultThrowableToTestFailureMapper(MAPPERS);

    private static final Pattern DESCRIPTOR_PATTERN = Pattern.compile("(.*)\\((.*)\\)(\\[\\d+])?", Pattern.DOTALL);
    private final IdGenerator<?> idGenerator;
    private final TestResultProcessor resultProcessor;
    private final Clock clock;
    private final Object lock = new Object();
    private final Map<Description, TestDescriptorInternal> executing = new HashMap<Description, TestDescriptorInternal>();
    private final Set<Description> assumptionFailed = new HashSet<Description>();

    public JUnitTestEventAdapter(TestResultProcessor resultProcessor, Clock clock, IdGenerator<?> idGenerator) {
        this.resultProcessor = resultProcessor;
        this.clock = clock;
        this.idGenerator = idGenerator;
    }

    @Override
    public void testStarted(Description description) {
        TestDescriptorInternal descriptor = nullSafeDescriptor(idGenerator.generateId(), description);
        synchronized (lock) {
            TestDescriptorInternal oldTest = executing.put(description, descriptor);
            assert oldTest == null : String.format("Unexpected start event for %s", description);
        }
        resultProcessor.started(descriptor, startEvent());
    }

    @Override
    public void testFailure(Failure failure) {
        TestDescriptorInternal testInternal;
        synchronized (lock) {
            testInternal = executing.get(failure.getDescription());
        }

        if (testInternal != null) {
            // This is the normal path, we've just seen a test failure
            // for a test that we saw start
            Throwable exception = failure.getException();
            reportFailure(testInternal.getId(), exception);
        } else {
            // This can happen when, for example, a @BeforeClass or @AfterClass method fails
            // We generate an artificial start/failure/completed sequence of events
            testInternal = nullSafeDescriptor(idGenerator.generateId(), failure.getDescription());
            resultProcessor.started(testInternal, startEvent());
            Throwable exception = failure.getException();
            reportFailure(testInte
```