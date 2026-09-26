# COMANDO - IncrementalResultStoringCompiler.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\language-java\org\gradle\api\internal\tasks\compile\incremental\IncrementalResultStoringCompiler.java
**SHA:** 685727ac44092eb3
**Timestamp:** 2026-08-28T02:50:38.762190
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- this.delegate = delegate;

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

package org.gradle.api.internal.tasks.compile.incremental;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Iterables;
import org.gradle.api.GradleException;
import org.gradle.api.internal.tasks.compile.ApiCompilerResult;
import org.gradle.api.internal.tasks.compile.JavaCompileSpec;
import org.gradle.api.internal.tasks.compile.incremental.compilerapi.CompilerApiData;
import org.gradle.api.internal.tasks.compile.incremental.compilerapi.constants.ConstantToDependentsMapping;
import org.gradle.api.internal.tasks.compile.incremental.compilerapi.constants.ConstantToDependentsMappingMerger;
import org.gradle.api.internal.tasks.compile.incremental.compilerapi.deps.GeneratedResource;
import org.gradle.api.internal.tasks.compile.incremental.deps.ClassSetAnalysisData;
import org.gradle.api.internal.tasks.compile.incremental.processing.AnnotationProcessingData;
import org.gradle.api.internal.tasks.compile.incremental.processing.AnnotationProcessingResult;
import org.gradle.api.internal.tasks.compile.incremental.recomp.CurrentCompilationAccess;
import org.gradle.api.internal.tasks.compile.incremental.recomp.IncrementalCompilationResult;
import org.gradle.api.internal.tasks.compile.incremental.recomp.PreviousCompilationAccess;
import org.gradle.api.internal.tasks.compile.incremental.recomp.PreviousCompilationData;
import org.gradle.api.internal.tasks.compile.incremental.recomp.RecompilationSpec;
import org.gradle.api.internal.tasks.compile.processing.AnnotationProcessorDeclaration;
import org.gradle.api.tasks.WorkResult;
import org.gradle.language.base.internal.compile.Compiler;

import java.io.File;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/**
 * Stores the incremental class dependency analysis after compilation has finished.
 */
class IncrementalResultStoringCompiler<T extends JavaCompileSpec> implements Compiler<T> {

    private final Compiler<T> delegate;
    private final CurrentCompilationAccess classpathSnapshotter;
    private final PreviousCompilationAccess previousCompilationAccess;

    IncrementalResultStoringCompiler(Compiler<T> delegate, CurrentCompilationAccess classpathSnapshotter, PreviousCompilationAccess previousCompilationAccess) {
        this.delegate = delegate;
        this.classpathSnapshotter = classpathSnapshotter;
        this.previousCompilationAccess = previousCompilationAccess;
    }

    @Override
    public WorkResult execute(T spec) {
        WorkResult result = delegate.execute(spec);
        if (result instanceof RecompilationNotNecessary) {
            return result;
        }
        storeResult(spec, result);
        return result;
    }

    private void storeResult(JavaCompileSpec spec, WorkResult result) {
        ClassSetAnalysisData outputSnapshot = classpathSnapshotter.analyzeOutputFolder(spec.getDestinationDir());
        ClassSetAnalysisData classpathSnapshot = classpathSnapshotter.getClasspathSnapshot(Iterables.concat(spec.getCompileClasspath(), spec.getModulePath()));
        AnnotationProcessingData annotationProcessingData = getAnnotationProcessingData(spec, result);
        CompilerApiData compilerApiData = getCompilerApiData(spec, result);
        ClassSetAnalysisData minimizedClasspathSnapshot = classpathSnapshot.reduceToTypesAffecting(outputSnapshot, compilerApiData);
        PreviousCompilationData data = new PreviousCompilationData(outputSnapshot, annotationProcessingData, minimizedClasspathSnapshot, compilerApiData);
        File previousCompilationDataFile = Objects.requireNonNull(spec.getCompileOptions().getPreviousCompilationDataFile());
        previousCompilationAccess.writePreviousCompilationData(data, previousCompilationDataFile);
    }

    private CompilerApiData getCompilerApiData(JavaCompileSpec spec, WorkResult result) {
        if (spec.getCompileOptions().supportsCompilerApi()) {
            CompilerApiData previousCompilerApiData = null;
            RecompilationSpec recompilationSpec = null;
            if (result instanceof IncrementalCompilationResult) {
                previousCompilerApiData = ((IncrementalCompilationResult) result).getPreviousCompilationData().getCompilerApiData();
                recompilationSpec = ((IncrementalCompilationResult) 
```