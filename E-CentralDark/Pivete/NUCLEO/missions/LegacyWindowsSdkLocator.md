# MISSAO - LegacyWindowsSdkLocator.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\platform-native\org\gradle\nativeplatform\toolchain\internal\msvcpp\LegacyWindowsSdkLocator.java
**SHA:** 97f638ae63e74366
**Timestamp:** 2026-08-28T02:51:10.614463
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- //TODO: Simplify this class by busting it up into a locator for legacy SDKs and locator(s) for Windows 8 kits

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
package org.gradle.nativeplatform.toolchain.internal.msvcpp;

import com.google.common.collect.Lists;
import net.rubygrapefruit.platform.MissingRegistryEntryException;
import net.rubygrapefruit.platform.WindowsRegistry;
import org.apache.commons.lang.StringUtils;
import org.gradle.internal.FileUtils;
import org.gradle.internal.os.OperatingSystem;
import org.gradle.platform.base.internal.toolchain.ComponentFound;
import org.gradle.platform.base.internal.toolchain.ComponentNotFound;
import org.gradle.platform.base.internal.toolchain.SearchResult;
import org.gradle.util.internal.VersionNumber;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.Nullable;
import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

//TODO: Simplify this class by busting it up into a locator for legacy SDKs and locator(s) for Windows 8 kits
public class LegacyWindowsSdkLocator implements WindowsSdkLocator {
    private static final Logger LOGGER = LoggerFactory.getLogger(LegacyWindowsSdkLocator.class);
    private static final String REGISTRY_BASEPATHS[] = {
        "SOFTWARE\\",
        "SOFTWARE\\Wow6432Node\\"
    };
    private static final String REGISTRY_ROOTPATH_SDK = "Microsoft\\Microsoft SDKs\\Windows";
    private static final String REGISTRY_ROOTPATH_KIT = "Microsoft\\Windows Kits\\Installed Roots";
    private static final String REGISTRY_FOLDER = "InstallationFolder";
    private static final String REGISTRY_VERSION = "ProductVersion";
    private static final String REGISTRY_NAME = "ProductName";
    private static final String REGISTRY_KIT_8 = "KitsRoot";
    private static final String REGISTRY_KIT_81 = "KitsRoot81";
    private static final String VERSION_KIT_8 = "8.0";
    private static final String VERSION_KIT_81 = "8.1";
    private static final String VERSION_USER = "user";

    private static final String NAME_USER = "User-provided Windows SDK";
    private static final String NAME_KIT = "Windows Kit";

    private static final String RESOURCE_PATHS[] = {
        "bin/x86/",
        "bin/"
    };

    private static final String KERNEL32_PATHS[] = {
        "lib/winv6.3/um/x86/",
        "lib/win8/um/x86/",
        "lib/"
    };

    private static final String RESOURCE_FILENAME = "rc.exe";
    private static final String KERNEL32_FILENAME = "kernel32.lib";

    private final Map<File, WindowsSdkInstall> foundSdks = new HashMap<File, WindowsSdkInstall>();
    private final OperatingSystem os;
    private final WindowsRegistry windowsRegistry;
    private WindowsSdkInstall pathSdk;
    private boolean initialised;

    public LegacyWindowsSdkLocator(OperatingSystem os, WindowsRegistry windowsRegistry) {
        this.os = os;
        this.windowsRegistry = windowsRegistry;
    }

    @Override
    public SearchResult<WindowsSdkInstall> locateComponent(@Nullable File candidate) {
        initializeWindowsSdks();

        if (candidate != null) {
            return locateUserSpecifiedSdk(candidate);
        }

        return locateDefaultSdk();
    }

    @Override
    public List<? extends WindowsSdkInstall> locateAllComponents() {
        initializeWindowsSdks();
        return Lists.newArrayList(foundSdks.values());
    }

    private void initializeWindowsSdks() {
        if (!initialised) {
            locateSdksInRegistry();
            locateKitsInRegistry();
            locateSdkInPath();
            initialised = true;
        }
    }

    private void locateSdksInRegistry() {
        for (String baseKey : REGISTRY_BASEPATHS) {
            locateSdksInRegistry(baseKey);
        }
    }

    private void locateSdksInRegistry(String baseKey) {
        try {
            List<String> subkeys = windowsRegistry.getSubkeys(WindowsRegistry.Key.HKEY_LOCAL_MACHINE, baseKey + REGISTRY_ROOTPATH_SDK);
            for (String subkey : subkeys) {
                try {
                    String basePath = baseKey + REGISTRY_ROOTPATH_SDK + "\\" + subkey;
                    File sdkDir = FileUtils.canonicalize(new File(windowsRegistry.getStringValue(WindowsRegistry.Key.HKEY_LOCAL_MACHINE, basePath, REGISTRY_FOLDER)));
                    String version = formatVersion(windowsRegistry.getStringValue(WindowsRegistry.Key.HKEY_LOCAL_MACHINE, basePath, REGISTRY_VERSION));
                    String name = windowsRegistry.getStringValue(WindowsRegistry.Key.H
```