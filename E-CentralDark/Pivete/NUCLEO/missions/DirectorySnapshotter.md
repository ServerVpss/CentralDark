# MISSAO - DirectorySnapshotter.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\snapshots\org\gradle\internal\snapshot\impl\DirectorySnapshotter.java
**SHA:** 7c60e3cf0c919b24
**Timestamp:** 2026-08-28T02:51:40.606357
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Predicate<String> start = firstStar == 0
- this.start = start;

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

package org.gradle.internal.snapshot.impl;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Interner;
import com.google.common.collect.Iterables;
import org.gradle.internal.file.FileMetadata;
import org.gradle.internal.file.FileMetadata.AccessType;
import org.gradle.internal.file.FileType;
import org.gradle.internal.file.impl.DefaultFileMetadata;
import org.gradle.internal.hash.FileHasher;
import org.gradle.internal.hash.HashCode;
import org.gradle.internal.snapshot.DirectorySnapshot;
import org.gradle.internal.snapshot.FileSystemLeafSnapshot;
import org.gradle.internal.snapshot.FileSystemLocationSnapshot;
import org.gradle.internal.snapshot.MissingFileSnapshot;
import org.gradle.internal.snapshot.RegularFileSnapshot;
import org.gradle.internal.snapshot.RelativePathTracker;
import org.gradle.internal.snapshot.SnapshottingFilter;

import javax.annotation.CheckReturnValue;
import javax.annotation.Nullable;
import java.io.File;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.FileSystemLoopException;
import java.nio.file.FileVisitOption;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Deque;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.Consumer;
import java.util.function.Predicate;

import static org.gradle.internal.snapshot.DirectorySnapshotBuilder.EmptyDirectoryHandlingStrategy.INCLUDE_EMPTY_DIRS;

/**
 * For creating {@link DirectorySnapshot}s of directories.
 */
public class DirectorySnapshotter {
    private static final EnumSet<FileVisitOption> DONT_FOLLOW_SYMLINKS = EnumSet.noneOf(FileVisitOption.class);
    private static final SymbolicLinkMapping EMPTY_SYMBOLIC_LINK_MAPPING = new SymbolicLinkMapping() {

        @Override
        public String remapAbsolutePath(Path path) {
            return path.toString();
        }

        @Override
        public SymbolicLinkMapping withNewMapping(String source, String target, RelativePathTracker currentPathTracker) {
            return new DefaultSymbolicLinkMapping(source, target, currentPathTracker.getSegments());
        }

        @Override
        public Iterable<String> getRemappedSegments(Iterable<String> segments) {
            return segments;
        }
    };

    private final FileHasher hasher;
    private final Interner<String> stringInterner;
    private final DefaultExcludes defaultExcludes;
    private final DirectorySnapshotterStatistics.Collector collector;

    public DirectorySnapshotter(FileHasher hasher, Interner<String> stringInterner, Collection<String> defaultExcludes, DirectorySnapshotterStatistics.Collector collector) {
        this.hasher = hasher;
        this.stringInterner = stringInterner;
        this.defaultExcludes = new DefaultExcludes(defaultExcludes);
        this.collector = collector;
    }

    /**
     * Snapshots a directory, reusing existing previously known snapshots.
     *
     * Follows symlinks and includes them in the returned snapshot.
     * Snapshots of followed symlinks are marked with {@link AccessType#VIA_SYMLINK}.
     *
     * @param absolutePath The absolute path of the directory to snapshot.
     * @param predicate A predicate that determines which files to include in the snapshot.
     *                  {@code null} means to include everything.
     * @param previouslyKnownSnapshots Snapshots already known to exist in the file system.
     * @param unfilteredSnapshotRecorder If the returned snapshot is filtered by the predicate, i.e. it doesn't have all the contents of the directory,
     * then this consumer will receive all the unfiltered snapshots within the snapshot directory.
     * For example, if an element of a directory is filtered out, the consumer will receive all the non-filtered out
     * file snapshots and all the non-filtered directory snapshots in the directory.
     * @return The (possible filtered) snapshot of the directory.
     */
    
```