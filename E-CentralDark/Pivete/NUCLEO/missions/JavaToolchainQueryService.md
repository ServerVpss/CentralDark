# MISSAO - JavaToolchainQueryService.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\toolchains-jvm-shared\org\gradle\jvm\toolchain\internal\JavaToolchainQueryService.java
**SHA:** c3f099135b2238dc
**Timestamp:** 2026-08-28T02:51:56.776401
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: We could optimize here by reusing results which have capabilities that are supersets of the required capabilities

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2024 the original author or authors.
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

package org.gradle.jvm.toolchain.internal;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Sets;
import org.gradle.api.GradleException;
import org.gradle.api.internal.file.FileFactory;
import org.gradle.api.internal.provider.DefaultProvider;
import org.gradle.api.internal.provider.ProviderInternal;
import org.gradle.internal.deprecation.DeprecationLogger;
import org.gradle.internal.deprecation.Documentation;
import org.gradle.internal.deprecation.DocumentedFailure;
import org.gradle.internal.jvm.Jvm;
import org.gradle.internal.jvm.inspection.JavaInstallationCapability;
import org.gradle.internal.jvm.inspection.JavaInstallationRegistry;
import org.gradle.internal.jvm.inspection.JvmInstallationMetadata;
import org.gradle.internal.jvm.inspection.JvmInstallationMetadataComparator;
import org.gradle.internal.jvm.inspection.JvmMetadataDetector;
import org.gradle.internal.service.scopes.Scope;
import org.gradle.internal.service.scopes.ServiceScope;
import org.gradle.jvm.toolchain.JavaToolchainSpec;
import org.gradle.jvm.toolchain.internal.install.JavaToolchainProvisioningService;
import org.gradle.jvm.toolchain.internal.install.JvmInstallationMetadataMatcher;

import javax.inject.Inject;
import java.io.File;
import java.util.Collections;
import java.util.Comparator;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.function.Predicate;

@ServiceScope(Scope.Build.class)
public class JavaToolchainQueryService {

    private static final class ToolchainLookupKey {
        private final JavaToolchainSpecInternal.Key specKey;
        private final Set<JavaInstallationCapability> requiredCapabilities;

        private ToolchainLookupKey(JavaToolchainSpecInternal.Key specKey, Set<JavaInstallationCapability> requiredCapabilities) {
            this.specKey = specKey;
            this.requiredCapabilities = Sets.immutableEnumSet(requiredCapabilities);
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) {
                return true;
            }
            if (o == null || getClass() != o.getClass()) {
                return false;
            }
            ToolchainLookupKey that = (ToolchainLookupKey) o;
            return Objects.equals(specKey, that.specKey) && Objects.equals(requiredCapabilities, that.requiredCapabilities);
        }

        @Override
        public int hashCode() {
            return Objects.hash(specKey, requiredCapabilities);
        }

        @Override
        public String toString() {
            return "ToolchainLookupKey{" +
                "specKey=" + specKey +
                ", requiredCapabilities=" + requiredCapabilities +
                '}';
        }
    }

    // A key that matches only the fallback toolchain
    private static final JavaToolchainSpecInternal.Key FALLBACK_TOOLCHAIN_KEY = new JavaToolchainSpecInternal.Key() {
        @Override
        public String toString() {
            return "FallbackToolchainSpecKey";
        }
    };

    private final FileFactory fileFactory;
    private final JvmMetadataDetector detector;
    private final JavaToolchainProvisioningService installService;
    // Map values are either `JavaToolchain` or `Exception`
    private final ConcurrentMap<ToolchainLookupKey, Object> matchingToolchains;
    private final JavaToolchainSpec fallbackToolchainSpec;
    private final File currentJavaHome;
    private final JavaInstallationRegistry registry;

    @Inject
    public JavaToolchainQueryService(
        JvmMetadataDetector detector,
        FileFactory fileFactory,
        JavaToolchainProvisioningService provisioningService,
        JavaInstallationRegistry registry,
        CurrentJvmToolchainSpec fallbackToolchainSpec
    ) {
        this(detector, fileFactory, provisioningService, registry, fallbackToolchainSpec, Jvm.current().getJavaHome());
    }

    @VisibleForTesting
    JavaToolchainQueryService(
        JvmMetadataDetector detector,
        FileFactory fileFactory,
        JavaToolchainProvisioningService provisioningService,
        JavaInstallationRegistry registry,
        JavaToolchainSpec fallbackToolchainSpec,
        File currentJavaHome
    ) {
        this.d
```