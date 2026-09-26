# MISSAO - JUnitTestClassExecutor.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\testing-jvm-infrastructure\org\gradle\api\internal\tasks\testing\junit\JUnitTestClassExecutor.java
**SHA:** c6250e8d4f829725
**Timestamp:** 2026-08-28T02:51:52.587463
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- boolean run = true;
- run = false;

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

import org.gradle.api.Action;
import org.gradle.api.GradleException;
import org.gradle.api.internal.tasks.testing.filter.TestFilterSpec;
import org.gradle.api.internal.tasks.testing.filter.TestSelectionMatcher;
import org.gradle.api.tasks.testing.TestFailure;
import org.gradle.internal.concurrent.ThreadSafe;
import org.junit.experimental.runners.Enclosed;
import org.junit.runner.Description;
import org.junit.runner.Request;
import org.junit.runner.RunWith;
import org.junit.runner.Runner;
import org.junit.runner.manipulation.Filter;
import org.junit.runner.manipulation.Filterable;
import org.junit.runner.manipulation.NoTestsRemainException;
import org.junit.runner.notification.RunListener;
import org.junit.runner.notification.RunNotifier;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public class JUnitTestClassExecutor implements Action<String> {
    private final ClassLoader applicationClassLoader;
    private final RunListener listener;
    private final JUnitSpec spec;
    private final TestClassExecutionListener executionListener;

    public JUnitTestClassExecutor(ClassLoader applicationClassLoader, JUnitSpec spec, RunListener listener, TestClassExecutionListener executionListener) {
        assert executionListener instanceof ThreadSafe;
        this.applicationClassLoader = applicationClassLoader;
        this.listener = listener;
        this.spec = spec;
        this.executionListener = executionListener;
    }

    @Override
    public void execute(String testClassName) {
        executionListener.testClassStarted(testClassName);
        try {
            runTestClass(testClassName);
            executionListener.testClassFinished(null);
        } catch (Throwable throwable) {
            executionListener.testClassFinished(TestFailure.fromTestFrameworkFailure(throwable));
        }
    }

    private void runTestClass(String testClassName) throws ClassNotFoundException {
        final Class<?> testClass = Class.forName(testClassName, false, applicationClassLoader);
        if (isNestedClassInsideEnclosedRunner(testClass)) {
            return;
        }
        List<Filter> filters = new ArrayList<Filter>();
        if (spec.hasCategoryConfiguration()) {
            verifyJUnitCategorySupport();
            filters.add(new CategoryFilter(spec.getIncludeCategories(), spec.getExcludeCategories(), applicationClassLoader));
        }

        Request request = Request.aClass(testClass);
        Runner runner = request.getRunner();

        TestFilterSpec filterSpec = spec.getFilter();
        if (!filterSpec.getIncludedTests().isEmpty()
            || !filterSpec.getIncludedTestsCommandLine().isEmpty()
            || !filterSpec.getExcludedTests().isEmpty()) {
            TestSelectionMatcher matcher = new TestSelectionMatcher(filterSpec);

            // For test suites (including suite-like custom Runners), if the test suite class
            // matches the filter, run the entire suite instead of filtering away its contents.
            if (!runner.getDescription().isSuite() || !matcher.matchesTest(testClassName, null)) {
                filters.add(new MethodNameFilter(matcher));
            }
        }

        if (runner instanceof Filterable) {
            Filterable filterable = (Filterable) runner;
            for (Filter filter : filters) {
                try {
                    filterable.filter(filter);
                } catch (NoTestsRemainException e) {
                    // Ignore
                    return;
                }
            }
        } else if (allTestsFiltered(runner, filters)) {
            return;
        }

        if (spec.isDryRun()) {
            runner = new JUnitTestDryRunner(runner);
        }

        RunNotifier notifier = new RunNotifier();
        notifier.addListener(listener);
        runner.run(notifier);
    }

    // https://github.com/gradle/gradle/issues/2319
    public static boolean isNestedClassInsideEnclosedRunner(Class<?> testClass) {
        if (testClass.getEnclosingClass() == null) {
            return false;
        }

        Class<?> outermostClass = testClass;
        while (outermostClass.getEnclosingClass() != null) {
            outermostClass = outermostClass.getEnclosingClass();
        }

        RunWith runWith = outermostClass.getAnnota
```