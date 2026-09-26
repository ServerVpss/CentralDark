# MISSAO - AbstractWindowsKitComponentLocator.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\platform-native\org\gradle\nativeplatform\toolchain\internal\msvcpp\AbstractWindowsKitComponentLocator.java
**SHA:** 9b8ba542387c6eb0
**Timestamp:** 2026-08-28T02:51:10.299791
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- private final Pattern windowsKitVersionPattern = Pattern.compile("[0-9]+(\\.[0-9]+)*");

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

package org.gradle.nativeplatform.toolchain.internal.msvcpp;

import com.google.common.collect.HashMultimap;
import com.google.common.collect.Lists;
import com.google.common.collect.SetMultimap;
import net.rubygrapefruit.platform.MissingRegistryEntryException;
import net.rubygrapefruit.platform.WindowsRegistry;
import org.gradle.internal.FileUtils;
import org.gradle.platform.base.internal.toolchain.ComponentFound;
import org.gradle.platform.base.internal.toolchain.ComponentNotFound;
import org.gradle.platform.base.internal.toolchain.SearchResult;
import org.gradle.util.internal.CollectionUtils;
import org.gradle.util.internal.VersionNumber;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileFilter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedSet;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public abstract class AbstractWindowsKitComponentLocator<T extends WindowsKitInstall> implements WindowsComponentLocator<T> {
    static final String[] PLATFORMS = new String[]{"x86", "x64"};

    private static final String USER_PROVIDED = "User-provided";
    private static final Logger LOGGER = LoggerFactory.getLogger(AbstractWindowsKitComponentLocator.class);
    private final SetMultimap<File, T> foundComponents = HashMultimap.create();
    private final Set<File> brokenComponents = new LinkedHashSet<File>();
    private final WindowsRegistry windowsRegistry;
    private boolean initialised;

    protected enum DiscoveryType {REGISTRY, USER}

    private static final String[] REGISTRY_BASEPATHS = {
        "SOFTWARE\\",
        "SOFTWARE\\Wow6432Node\\"
    };
    private static final String REGISTRY_ROOTPATH_KIT = "Microsoft\\Windows Kits\\Installed Roots";
    private static final String REGISTRY_KIT_10 = "KitsRoot10";

    private final Pattern windowsKitVersionPattern = Pattern.compile("[0-9]+(\\.[0-9]+)*");
    private final FileFilter windowsKitVersionFilter = new FileFilter() {
        @Override
        public boolean accept(File pathname) {
            Matcher matcher = windowsKitVersionPattern.matcher(pathname.getName());
            return pathname.isDirectory() && matcher.matches();
        }
    };

    AbstractWindowsKitComponentLocator(WindowsRegistry windowsRegistry) {
        this.windowsRegistry = windowsRegistry;
    }

    @Override
    public SearchResult<T> locateComponent(File candidate) {
        initializeComponents();

        if (candidate != null) {
            return locateUserSpecifiedComponent(candidate);
        }

        return locateDefaultComponent();
    }

    @Override
    public List<T> locateAllComponents() {
        initializeComponents();

        return Lists.newArrayList(foundComponents.values());
    }

    private void initializeComponents() {
        if (!initialised) {
            locateComponentsInRegistry();
            initialised = true;
        }
    }

    private SearchResult<T> locateDefaultComponent() {
        T selected = getBestComponent();
        if (selected != null) {
            return new ComponentFound<T>(selected);
        }
        if (brokenComponents.isEmpty()) {
            return new ComponentNotFound<T>("Could not locate a " + getDisplayName() + " installation using the Windows registry.");
        }
        return new ComponentNotFound<T>("Could not locate a " + getDisplayName() + " installation. None of the following locations contain a valid installation",
            CollectionUtils.collect(brokenComponents, File::getAbsolutePath));
    }

    private T getBestComponent() {
        final SortedSet<T> candidates = new TreeSet<T>(new DescendingComponentVersionComparator());
        candidates.addAll(foundComponents.values());
        return candidates.isEmpty() ? null : candidates.iterator().next();
    }

    private void locateComponentsInRegistry() {
        for (String baseKey : REGISTRY_BASEPATHS) {
            locateComponentsInRegistry(baseKey);
        }
    }

    private void locateComponentsInRegistry(String baseKey) {
        try {
            File windowsKitDir = FileUtils.canonicalize(new File(windowsRegistry.getStringValue(WindowsRegistry.Key.HKEY
```