# COMANDO - LockFileReaderWriter.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\dependency-management\org\gradle\internal\locking\LockFileReaderWriter.java
**SHA:** fcaa882976b3987c
**Timestamp:** 2026-08-28T02:50:31.081414
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Can I find a way to use a convention here instead?

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

package org.gradle.internal.locking;

import com.google.common.collect.ImmutableList;
import org.gradle.api.file.RegularFileProperty;
import org.gradle.api.internal.DocumentationRegistry;
import org.gradle.api.internal.DomainObjectContext;
import org.gradle.api.internal.file.FileResolver;
import org.gradle.api.logging.Logger;
import org.gradle.api.logging.Logging;
import org.gradle.internal.resource.local.FileResourceListener;
import org.gradle.util.internal.GFileUtils;

import javax.annotation.Nullable;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class LockFileReaderWriter {

    private static final Logger LOGGER = Logging.getLogger(LockFileReaderWriter.class);
    private static final String LIMITATIONS_DOC_LINK = new DocumentationRegistry().getDocumentationRecommendationFor("information on limitations", "dependency_locking", "locking_limitations");
    static final String FORMATTING_DOC_LINK = "Verify the lockfile content. " + new DocumentationRegistry().getDocumentationRecommendationFor("information on lock file format", "dependency_locking", "lock_state_location_and_format");

    static final String UNIQUE_LOCKFILE_NAME = "gradle.lockfile";
    static final String FILE_SUFFIX = ".lockfile";
    static final String DEPENDENCY_LOCKING_FOLDER = "gradle/dependency-locks";
    static final Charset CHARSET = StandardCharsets.UTF_8;
    static final List<String> LOCKFILE_HEADER_LIST = ImmutableList.of("# This is a Gradle generated file for dependency locking.", "# Manual edits can break the build and are not advised.", "# This file is expected to be part of source control.");
    static final String EMPTY_RESOLUTIONS_ENTRY = "empty=";
    static final String BUILD_SCRIPT_PREFIX = "buildscript-";
    static final String SETTINGS_SCRIPT_PREFIX = "settings-";

    private final Path lockFilesRoot;
    private final DomainObjectContext context;
    private final RegularFileProperty lockFile;
    private final FileResourceListener listener;

    public LockFileReaderWriter(FileResolver fileResolver, DomainObjectContext context, RegularFileProperty lockFile, FileResourceListener listener) {
        this.context = context;
        this.lockFile = lockFile;
        this.listener = listener;
        Path resolve = null;
        if (fileResolver.canResolveRelativePath()) {
            resolve = fileResolver.resolve(DEPENDENCY_LOCKING_FOLDER).toPath();
            // TODO: Can I find a way to use a convention here instead?
            lockFile.set(fileResolver.resolve(decorate(UNIQUE_LOCKFILE_NAME)));
        }
        this.lockFilesRoot = resolve;
        LOGGER.debug("Lockfiles root: {}", lockFilesRoot);
    }

    @Nullable
    public List<String> readLockFile(String lockId) {
        checkValidRoot();

        Path lockFile = lockFilesRoot.resolve(decorate(lockId) + FILE_SUFFIX);
        listener.fileObserved(lockFile.toFile());
        if (Files.exists(lockFile)) {
            List<String> result;
            try {
                result = Files.readAllLines(lockFile, CHARSET);
            } catch (IOException e) {
                throw new RuntimeException("Unable to load lock file", e);
            }
            List<String> lines = result;
            filterNonModuleLines(lines);
            return lines;
        } else {
            return null;
        }
    }

    private String decorate(String lockId) {
        if (context.isScript()) {
            if (context.isRootScript()) {
                return SETTINGS_SCRIPT_PREFIX + lockId;
            }
            return BUILD_SCRIPT_PREFIX + lockId;
        } else {
            return lockId;
        }
    }

    private void checkValidRoot() {
        if (lockFilesRoot == null) {
            throw new IllegalStateException("Dependency locking cannot be used for " + context.getDisplayName() + ". " + LIMITATIONS_DOC_LINK);
        }
    }

    private static void filterNonModuleLines(List<String> lines) {
        Iterator<String> iter
```