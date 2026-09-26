# MISSAO - TestSelectionMatcher.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\testing-base-infrastructure\org\gradle\api\internal\tasks\testing\filter\TestSelectionMatcher.java
**SHA:** fd38058a882457f1
**Timestamp:** 2026-08-28T02:51:50.411488
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- for (TestPattern pattern : patterns) {
- for (TestPattern pattern : patterns) {
- for (TestPattern pattern : patterns) {
- this.pattern = preparePattern(pattern);
- StringBuilder pattern = new StringBuilder();

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2013 the original author or authors.
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
package org.gradle.api.internal.tasks.testing.filter;


import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.regex.Pattern;

import org.apache.commons.lang.StringUtils;

import static org.apache.commons.lang.StringUtils.splitPreserveAllTokens;
import static org.apache.commons.lang.StringUtils.substringAfterLast;

/**
 * This class has two public APIs:
 *
 * <ul>
 * <li>Judge whether a test class might be included. For example, class 'org.gradle.Test' can't
 * be included by pattern 'org.apache.Test'
 * <li>Judge whether a test method is matched exactly.
 * </ul>
 *
 * In both cases, if the pattern starts with an upper-case letter, it will be used to match
 * simple class name;
 * otherwise, it will be used to match full qualified class name.
 */
public class TestSelectionMatcher {
    private final List<TestPattern> buildScriptIncludePatterns;
    private final List<TestPattern> buildScriptExcludePatterns;
    private final List<TestPattern> commandLineIncludePatterns;

    public TestSelectionMatcher(TestFilterSpec filter) {
        buildScriptIncludePatterns = preparePatternList(filter.getIncludedTests());
        buildScriptExcludePatterns = preparePatternList(filter.getExcludedTests());
        commandLineIncludePatterns = preparePatternList(filter.getIncludedTestsCommandLine());
    }

    private List<TestPattern> preparePatternList(Collection<String> includedTests) {
        List<TestPattern> includePatterns = new ArrayList<TestPattern>(includedTests.size());
        for (String includedTest : includedTests) {
            includePatterns.add(new TestPattern(includedTest));
        }
        return includePatterns;
    }

    public boolean matchesTest(String className, String methodName) {
        return matchesPattern(buildScriptIncludePatterns, className, methodName)
            && matchesPattern(commandLineIncludePatterns, className, methodName)
            && !matchesExcludePattern(className, methodName);
    }

    public boolean mayIncludeClass(String fullQualifiedClassName) {
        return mayIncludeClass(buildScriptIncludePatterns, fullQualifiedClassName)
            && mayIncludeClass(commandLineIncludePatterns, fullQualifiedClassName)
            && !mayExcludeClass(fullQualifiedClassName);
    }

    private boolean mayIncludeClass(List<TestPattern> includePatterns, String fullQualifiedName) {
        if (includePatterns.isEmpty()) {
            return true;
        }
        return mayMatchClass(includePatterns, fullQualifiedName);
    }

    private boolean mayExcludeClass(String fullQualifiedName) {
        if (buildScriptExcludePatterns.isEmpty()) {
            return false;
        }
        return matchesClass(buildScriptExcludePatterns, fullQualifiedName);
    }

    private boolean matchesClass(List<TestPattern> patterns, String fullQualifiedName) {
        for (TestPattern pattern : patterns) {
            if (pattern.matchesClass(fullQualifiedName)) {
                return true;
            }
        }
        return false;
    }

    private boolean mayMatchClass(List<TestPattern> patterns, String fullQualifiedName) {
        for (TestPattern pattern : patterns) {
            if (pattern.mayIncludeClass(fullQualifiedName)) {
                return true;
            }
        }
        return false;
    }

    private boolean matchesPattern(List<TestPattern> includePatterns, String className,
        String methodName) {
        if (includePatterns.isEmpty()) {
            return true;
        }
        return matchesClassAndMethod(includePatterns, className, methodName);
    }

    private boolean matchesExcludePattern(String className, String methodName) {
        if (buildScriptExcludePatterns.isEmpty()) {
            return false;
        }
        if (mayMatchClass(buildScriptExcludePatterns, className) && methodName == null) {
            // When there is a class name match, return true for excluding it so that we can keep
            // searching in individual test methods for an exact match. If we return false here
            // instead, then we'll give up searching individual test methods and just ignore the
            // entire test class, which may not be what we want.
            return true;
        }
        return matchesClassAndMethod(buildScriptExcludePatterns, className, methodName);
    }

    private boolean 
```