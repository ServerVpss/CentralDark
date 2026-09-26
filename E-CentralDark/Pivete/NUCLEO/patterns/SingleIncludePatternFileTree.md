# PADRAO - SingleIncludePatternFileTree.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\file-collections\org\gradle\api\internal\file\collections\SingleIncludePatternFileTree.java
**SHA:** 5523da9352b34b5c
**Timestamp:** 2026-08-28T02:50:37.601073
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- this.includePattern = includePattern;

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2012 the original author or authors.
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
package org.gradle.api.internal.file.collections;

import org.gradle.api.GradleException;
import org.gradle.api.file.DirectoryTree;
import org.gradle.api.file.FileTreeElement;
import org.gradle.api.file.FileVisitDetails;
import org.gradle.api.file.FileVisitor;
import org.gradle.api.file.RelativePath;
import org.gradle.api.internal.file.AttributeBasedFileVisitDetailsFactory;
import org.gradle.api.internal.file.FileTreeInternal;
import org.gradle.api.internal.file.pattern.PatternStep;
import org.gradle.api.internal.file.pattern.PatternStepFactory;
import org.gradle.api.specs.Spec;
import org.gradle.api.specs.Specs;
import org.gradle.api.tasks.util.PatternSet;
import org.gradle.internal.nativeintegration.filesystem.FileSystem;
import org.gradle.internal.nativeintegration.services.FileSystems;

import java.io.File;
import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Deque;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Directory walker that supports a single Ant-style include pattern
 * and an optional exclude spec. Efficient in the sense that it will only
 * exhaustively scan a directory hierarchy if, and from the point where,
 * a '**' pattern is encountered.
 */
public class SingleIncludePatternFileTree implements MinimalFileTree, LocalFileTree, DirectoryTree {
    private final File baseDir;
    private final String includePattern;
    private final List<String> patternSegments;
    private final Spec<FileTreeElement> excludeSpec;
    private final FileSystem fileSystem = FileSystems.getDefault();

    public SingleIncludePatternFileTree(File baseDir, String includePattern) {
        this(baseDir, includePattern, Specs.satisfyNone());
    }

    public SingleIncludePatternFileTree(File baseDir, String includePattern, Spec<FileTreeElement> excludeSpec) {
        this.baseDir = baseDir;
        if (includePattern.endsWith("/") || includePattern.endsWith("\\")) {
            includePattern += "**";
        }
        this.includePattern = includePattern;
        this.patternSegments = Arrays.asList(includePattern.split("[/\\\\]"));
        this.excludeSpec = excludeSpec;
    }

    @Override
    public File getDir() {
        return baseDir;
    }

    @Override
    public PatternSet getPatterns() {
        return new PatternSet().include(includePattern).exclude(excludeSpec);
    }

    @Override
    public void visitStructure(MinimalFileTreeStructureVisitor visitor, FileTreeInternal owner) {
        visitor.visitFileTree(baseDir, getPatterns(), owner);
    }

    @Override
    public void visit(FileVisitor visitor) {
        doVisit(visitor, baseDir, new ArrayDeque<>(), 0, new AtomicBoolean());
    }

    private void doVisit(FileVisitor visitor, File file, Deque<String> pathSegments, int segmentIndex, AtomicBoolean stopFlag) {
        if (stopFlag.get()) {
            return;
        }

        String segment = patternSegments.get(segmentIndex);

        if (segment.contains("**")) {
            PatternSet patternSet = new PatternSet();
            patternSet.include(includePattern);
            patternSet.exclude(excludeSpec);
            DirectoryFileTree fileTree = new DirectoryFileTree(baseDir, patternSet, fileSystem);
            fileTree.visitFrom(visitor, file, new RelativePath(file.isFile(), pathSegments.toArray(new String[0])), stopFlag);
        } else if (segment.contains("*") || segment.contains("?")) {
            PatternStep step = PatternStepFactory.getStep(segment, false);
            File[] children = file.listFiles();
            if (children == null) {
                if (!file.canRead()) {
                    throw new GradleException(String.format("Could not list contents of directory '%s' as it is not readable.", file));
                }
                // else, might be a link which points to nothing, or has been removed while we're visiting, or ...
                throw new GradleException(String.format("Could not list contents of '%s'.", file));
            }
            for (File child : children) {
                if (stopFlag.get()) {
                    break;
                }
                String childName = child.getName();
                if (step.matches(childName)) {
                    pathSegments.addLast(childName);
                    doVisitDirOrFile(visitor, child, pathSegments, segmentIndex + 1, stopFlag);
  
```