# MISSAO - DefaultJavaToolchainProvisioningService.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\toolchains-jvm\org\gradle\jvm\toolchain\internal\install\DefaultJavaToolchainProvisioningService.java
**SHA:** 1d1b45280d2d37e9
**Timestamp:** 2026-08-28T02:51:55.973094
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: This should be refactored to leverage the new JavaToolchainResolverService but the current error handling makes it hard

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2022 the original author or authors.
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

package org.gradle.jvm.toolchain.internal.install;

import org.gradle.api.provider.Provider;
import org.gradle.api.provider.ProviderFactory;
import org.gradle.authentication.Authentication;
import org.gradle.cache.FileLock;
import org.gradle.internal.operations.BuildOperationContext;
import org.gradle.internal.operations.BuildOperationDescriptor;
import org.gradle.internal.operations.BuildOperationRunner;
import org.gradle.internal.operations.CallableBuildOperation;
import org.gradle.internal.resource.ExternalResource;
import org.gradle.jvm.toolchain.JavaToolchainDownload;
import org.gradle.jvm.toolchain.JavaToolchainResolver;
import org.gradle.jvm.toolchain.JavaToolchainResolverRegistry;
import org.gradle.jvm.toolchain.JavaToolchainSpec;
import org.gradle.jvm.toolchain.internal.DefaultJavaToolchainRequest;
import org.gradle.jvm.toolchain.internal.JavaToolchainResolverRegistryInternal;
import org.gradle.jvm.toolchain.internal.JdkCacheDirectory;
import org.gradle.jvm.toolchain.internal.RealizedJavaToolchainRepository;
import org.gradle.jvm.toolchain.internal.install.exceptions.ToolchainDownloadException;
import org.gradle.jvm.toolchain.internal.install.exceptions.ToolchainProvisioningException;
import org.gradle.platform.internal.CurrentBuildPlatform;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import java.io.File;
import java.net.URI;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;
import java.util.concurrent.Callable;
import java.util.stream.Collectors;

import static org.gradle.jvm.toolchain.internal.AutoInstalledInstallationSupplier.AUTO_DOWNLOAD;

public class DefaultJavaToolchainProvisioningService implements JavaToolchainProvisioningService {

    private static final Logger LOGGER = LoggerFactory.getLogger(DefaultJavaToolchainProvisioningService.class);
    private static final Object PROVISIONING_PROCESS_LOCK = new Object();

    private final JavaToolchainResolverRegistryInternal toolchainResolverRegistry;
    private final SecureFileDownloader downloader;
    private final DefaultJdkCacheDirectory cacheDirProvider;
    private final Provider<Boolean> downloadEnabled;
    private final BuildOperationRunner buildOperationRunner;
    private final CurrentBuildPlatform currentBuildPlatform;

    @Inject
    public DefaultJavaToolchainProvisioningService(
        JavaToolchainResolverRegistry toolchainResolverRegistry,
        SecureFileDownloader downloader,
        JdkCacheDirectory cacheDirProvider,
        ProviderFactory factory,
        BuildOperationRunner executor,
        CurrentBuildPlatform currentBuildPlatform
    ) {
        this.toolchainResolverRegistry = (JavaToolchainResolverRegistryInternal) toolchainResolverRegistry;
        this.downloader = downloader;
        this.cacheDirProvider = (DefaultJdkCacheDirectory)cacheDirProvider;
        this.downloadEnabled = factory.gradleProperty(AUTO_DOWNLOAD).map(Boolean::parseBoolean);
        this.buildOperationRunner = executor;
        this.currentBuildPlatform = currentBuildPlatform;
    }

    @Override
    public boolean isAutoDownloadEnabled() {
        return downloadEnabled.getOrElse(true);
    }

    @Override
    public boolean hasConfiguredToolchainRepositories() {
        return !toolchainResolverRegistry.requestedRepositories().isEmpty();
    }

    @Override
    public File tryInstall(JavaToolchainSpec spec) {
        if (!isAutoDownloadEnabled()) {
            throw new ToolchainProvisioningException(spec, "Toolchain auto-provisioning is not enabled.",
                ToolchainProvisioningException.AUTO_DETECTION_RESOLUTION);
        }

        List<? extends RealizedJavaToolchainRepository> repositories = toolchainResolverRegistry.requestedRepositories();
        if (repositories.isEmpty()) {
            throw new ToolchainProvisioningException(spec, "Toolchain download repositories have not been configured.",
                ToolchainProvisioningException.AUTO_DETECTION_RESOLUTION,
                ToolchainProvisioningException.DOWNLOAD_REPOSITORIES_RESOLUTION);
        }

        // TODO: This should be refactored to leverage the new JavaToolchainResolverService but the current error handling makes it hard
        // However, this exception handling is wrong as it may cause unreproducible behaviors sinc
```