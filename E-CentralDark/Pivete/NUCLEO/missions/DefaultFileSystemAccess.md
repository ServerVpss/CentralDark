# MISSAO - DefaultFileSystemAccess.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\snapshots\org\gradle\internal\vfs\impl\DefaultFileSystemAccess.java
**SHA:** 3502be043099336a
**Timestamp:** 2026-08-28T02:51:40.884496
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- case Missing:
- case Missing:

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2019 the original author or authors.
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

package org.gradle.internal.vfs.impl;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Interner;
import com.google.common.util.concurrent.Striped;
import org.gradle.internal.file.FileMetadata;
import org.gradle.internal.file.FileMetadataAccessor;
import org.gradle.internal.file.FileType;
import org.gradle.internal.file.excludes.FileSystemDefaultExcludesListener;
import org.gradle.internal.hash.FileHasher;
import org.gradle.internal.hash.HashCode;
import org.gradle.internal.io.IoRunnable;
import org.gradle.internal.snapshot.FileSystemLocationSnapshot;
import org.gradle.internal.snapshot.MissingFileSnapshot;
import org.gradle.internal.snapshot.RegularFileSnapshot;
import org.gradle.internal.snapshot.SnapshottingFilter;
import org.gradle.internal.snapshot.impl.DirectorySnapshotter;
import org.gradle.internal.snapshot.impl.DirectorySnapshotterStatistics;
import org.gradle.internal.vfs.FileSystemAccess;
import org.gradle.internal.vfs.VirtualFileSystem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.locks.Lock;
import java.util.function.Function;
import java.util.function.Supplier;

import static java.nio.file.StandardCopyOption.ATOMIC_MOVE;
import static org.gradle.internal.snapshot.impl.FileSystemSnapshotFilter.filterSnapshot;

public class DefaultFileSystemAccess implements FileSystemAccess, FileSystemDefaultExcludesListener {
    private static final Logger LOGGER = LoggerFactory.getLogger(DefaultFileSystemAccess.class);

    private final VirtualFileSystem virtualFileSystem;
    private final FileMetadataAccessor stat;
    private final Interner<String> stringInterner;
    private final WriteListener writeListener;
    private final DirectorySnapshotterStatistics.Collector statisticsCollector;
    private ImmutableList<String> defaultExcludes;
    private DirectorySnapshotter directorySnapshotter;
    private final FileHasher hasher;
    private final StripedProducerGuard<String> producingSnapshots = new StripedProducerGuard<>();

    public DefaultFileSystemAccess(
        FileHasher hasher,
        Interner<String> stringInterner,
        FileMetadataAccessor stat,
        VirtualFileSystem virtualFileSystem,
        WriteListener writeListener,
        DirectorySnapshotterStatistics.Collector statisticsCollector,
        String... defaultExcludes
    ) {
        this.stringInterner = stringInterner;
        this.stat = stat;
        this.writeListener = writeListener;
        this.statisticsCollector = statisticsCollector;
        this.defaultExcludes = ImmutableList.copyOf(defaultExcludes);
        this.directorySnapshotter = new DirectorySnapshotter(hasher, stringInterner, this.defaultExcludes, statisticsCollector);
        this.hasher = hasher;
        this.virtualFileSystem = virtualFileSystem;
    }

    @Override
    public Optional<HashCode> readRegularFileContentHash(String location) {
        return virtualFileSystem.findMetadata(location)
            .<Optional<FileSystemLocationSnapshot>>flatMap(snapshot -> {
                if (snapshot.getType() != FileType.RegularFile) {
                    return Optional.of(Optional.empty());
                }
                if (snapshot instanceof FileSystemLocationSnapshot) {
                    return Optional.of(Optional.of((FileSystemLocationSnapshot) snapshot));
                }
                return Optional.empty();
            })
            .orElseGet(() -> virtualFileSystem.storeWithAction(location, vfsStorer -> {
                File file = new File(location);
                FileMetadata fileMetadata = this.stat.stat(file);
                switch (fileMetadata.getType()) {
                    case Missing:
                        // For performance reasons, we cache the information about the missing file snapshot.
                        vfsStorer.store(new MissingFileSnapshot(location, fileMetadata.getAccessType()));
                        return Optional.empty();
                    case Directory:
                        return Optional.empty();
                    case RegularFile:
                        // Avoid snapshotting the same location concurrently
    
```