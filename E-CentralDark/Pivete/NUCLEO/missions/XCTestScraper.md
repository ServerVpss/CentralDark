# MISSAO - XCTestScraper.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\testing-native\org\gradle\nativeplatform\test\xctest\internal\execution\XCTestScraper.java
**SHA:** 075081c61a6fb66e
**Timestamp:** 2026-08-28T02:51:54.744630
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- private static final Pattern TEST_FAILURE_PATTERN = Pattern.compile(":\\d+: error: (-\\[\\p{Alnum}+.)?(\\p{Alnum}+)[ .](\\p{Alnum}+)]? : (.*)");

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2017 the original author or authors.
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

package org.gradle.nativeplatform.test.xctest.internal.execution;

import com.google.common.base.Joiner;
import org.gradle.api.internal.tasks.testing.DefaultTestClassDescriptor;
import org.gradle.api.internal.tasks.testing.DefaultTestMethodDescriptor;
import org.gradle.api.internal.tasks.testing.DefaultTestOutputEvent;
import org.gradle.api.internal.tasks.testing.TestCompleteEvent;
import org.gradle.api.internal.tasks.testing.TestDescriptorInternal;
import org.gradle.api.internal.tasks.testing.TestResultProcessor;
import org.gradle.api.internal.tasks.testing.TestStartEvent;
import org.gradle.api.tasks.testing.TestFailure;
import org.gradle.api.tasks.testing.TestOutputEvent;
import org.gradle.api.tasks.testing.TestResult;
import org.gradle.internal.SystemProperties;
import org.gradle.internal.id.IdGenerator;
import org.gradle.internal.io.TextStream;
import org.gradle.internal.os.OperatingSystem;
import org.gradle.internal.time.Clock;
import org.gradle.util.internal.TextUtil;

import javax.annotation.Nullable;
import java.util.Deque;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Scrapes XCTest's output and converts them into {@code TestResultProcessor} events.
 *
 * NOTE: We eventually want to get rid of this and use our own hooks in the test process itself.
 */
class XCTestScraper implements TextStream {
    private static final Pattern TEST_FAILURE_PATTERN = Pattern.compile(":\\d+: error: (-\\[\\p{Alnum}+.)?(\\p{Alnum}+)[ .](\\p{Alnum}+)]? : (.*)");

    private final TestResultProcessor processor;
    private final TestOutputEvent.Destination destination;
    private final IdGenerator<?> idGenerator;
    private final Clock clock;
    private final String rootTestSuiteId;
    private final Deque<XCTestDescriptor> testDescriptors;
    private TestDescriptorInternal lastDescriptor;
    private StringBuilder textBuilder = new StringBuilder();

    XCTestScraper(TestOutputEvent.Destination destination, TestResultProcessor processor, IdGenerator<?> idGenerator, Clock clock, String rootTestSuiteId, Deque<XCTestDescriptor> testDescriptors) {
        this.processor = processor;
        this.destination = destination;
        this.idGenerator = idGenerator;
        this.clock = clock;
        this.rootTestSuiteId = rootTestSuiteId;
        this.testDescriptors = testDescriptors;
    }

    @Override
    public void text(String textFragment) {
        textBuilder.append(textFragment);
        if (!textFragment.endsWith(SystemProperties.getInstance().getLineSeparator())) {
            return;
        }
        String text = textBuilder.toString();
        textBuilder = new StringBuilder();
        synchronized (testDescriptors) {
            Scanner scanner = new Scanner(text).useDelimiter("'");
            if (scanner.hasNext()) {
                String token = scanner.next().trim();
                if (token.equals("Test Suite")) {
                    // Test Suite 'PassingTestSuite' started at 2017-10-30 10:45:47.828
                    String testSuite = scanner.next();
                    if (testSuite.equals("All tests") || testSuite.equals("Selected tests") || testSuite.endsWith(".xctest")) {
                        // ignore these test suites
                        return;
                    }
                    String status = scanner.next();
                    boolean started = status.contains("started at");

                    if (started) {
                        TestDescriptorInternal testDescriptor = new DefaultTestClassDescriptor(idGenerator.generateId(), testSuite);  // Using DefaultTestClassDescriptor to fake JUnit test
                        processor.started(testDescriptor, new TestStartEvent(clock.getCurrentTime()));
                        testDescriptors.push(new XCTestDescriptor(testDescriptor));
                    } else {
                        XCTestDescriptor xcTestDescriptor = testDescriptors.pop();
                        lastDescriptor = xcTestDescriptor.getDescriptorInternal();
                        TestDescriptorInternal testDescriptor = xcTestDescriptor.getDescriptorInternal();
                        TestResult.ResultType resultType = TestResult.ResultType.SUCCESS;
                        boolean failed = status.contains("failed at");
                        if (failed) {
                            resultType = Test
```