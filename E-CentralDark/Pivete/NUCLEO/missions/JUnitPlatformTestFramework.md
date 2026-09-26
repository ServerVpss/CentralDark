# MISSAO - JUnitPlatformTestFramework.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\testing-jvm\org\gradle\api\internal\tasks\testing\junitplatform\JUnitPlatformTestFramework.java
**SHA:** d2702c52966d4a6d
**Timestamp:** 2026-08-28T02:51:51.655534
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- this.dryRun = dryRun;

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2018 the original author or authors.
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

package org.gradle.api.internal.tasks.testing.junitplatform;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Sets;
import org.gradle.api.Action;
import org.gradle.api.JavaVersion;
import org.gradle.api.internal.tasks.testing.TestFramework;
import org.gradle.api.internal.tasks.testing.TestFrameworkDistributionModule;
import org.gradle.api.internal.tasks.testing.WorkerTestClassProcessorFactory;
import org.gradle.api.internal.tasks.testing.detection.TestFrameworkDetector;
import org.gradle.api.internal.tasks.testing.filter.DefaultTestFilter;
import org.gradle.api.logging.Logger;
import org.gradle.api.logging.Logging;
import org.gradle.api.provider.Provider;
import org.gradle.api.tasks.testing.TestFilter;
import org.gradle.api.tasks.testing.junitplatform.JUnitPlatformOptions;
import org.gradle.internal.jvm.UnsupportedJavaRuntimeException;
import org.gradle.internal.scan.UsedByScanPlugin;
import org.gradle.process.internal.worker.WorkerProcessBuilder;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@UsedByScanPlugin("test-retry")
public class JUnitPlatformTestFramework implements TestFramework {
    private static final Logger LOGGER = Logging.getLogger(JUnitPlatformTestFramework.class);

    private static final List<TestFrameworkDistributionModule> DISTRIBUTION_MODULES =
        ImmutableList.of(
            new TestFrameworkDistributionModule(
                "junit-platform-engine",
                Pattern.compile("junit-platform-engine-1.*\\.jar"),
                "org.junit.platform.engine.DiscoverySelector"
            ),
            new TestFrameworkDistributionModule(
                "junit-platform-launcher",
                Pattern.compile("junit-platform-launcher-1.*\\.jar"),
                "org.junit.platform.launcher.core.LauncherDiscoveryRequestBuilder"
            ),
            new TestFrameworkDistributionModule(
                "junit-platform-commons",
                Pattern.compile("junit-platform-commons-1.*\\.jar"),
                "org.junit.platform.commons.util.ReflectionUtils"
            )
        );

    private final JUnitPlatformOptions options;
    private final DefaultTestFilter filter;
    private final boolean useImplementationDependencies;
    private final Provider<Boolean> dryRun;

    public JUnitPlatformTestFramework(DefaultTestFilter filter, boolean useImplementationDependencies, Provider<Boolean> dryRun) {
        this(filter, useImplementationDependencies, new JUnitPlatformOptions(), dryRun);
    }

    private JUnitPlatformTestFramework(DefaultTestFilter filter, boolean useImplementationDependencies, JUnitPlatformOptions options, Provider<Boolean> dryRun) {
        this.filter = filter;
        this.useImplementationDependencies = useImplementationDependencies;
        this.options = options;
        this.dryRun = dryRun;
    }

    @UsedByScanPlugin("test-retry")
    @Override
    public TestFramework copyWithFilters(TestFilter newTestFilters) {
        JUnitPlatformOptions copiedOptions = new JUnitPlatformOptions();
        copiedOptions.copyFrom(options);

        return new JUnitPlatformTestFramework(
            (DefaultTestFilter) newTestFilters,
            useImplementationDependencies,
            copiedOptions,
            dryRun
        );
    }

    @Override
    public WorkerTestClassProcessorFactory getProcessorFactory() {
        if (!JavaVersion.current().isJava8Compatible()) {
            throw new UnsupportedJavaRuntimeException("Running JUnit Platform requires Java 8+, please configure your test java executable with Java 8 or higher.");
        }
        validateOptions();
        return new JUnitPlatformTestClassProcessorFactory(new JUnitPlatformSpec(
            filter.toSpec(), options.getIncludeEngines(), options.getExcludeEngines(),
            options.getIncludeTags(), options.getExcludeTags(), dryRun.get()
        ));
    }

    @Override
    public Action<WorkerProcessBuilder> getWorkerConfigurationAction() {
        return workerProcessBuilder -> workerProcessBuilder.sharedPackages("org.junit");
    }

    @Override
    public List<TestFrameworkDistributionModule> getWorkerApplicationModulepathModules() {
        return DISTRIBUTION_MODULES;
    }

    @Override
    public boolean getUseDistributionDependenc
```