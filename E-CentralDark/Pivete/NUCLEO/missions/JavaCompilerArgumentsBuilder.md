# MISSAO - JavaCompilerArgumentsBuilder.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\language-java\org\gradle\api\internal\tasks\compile\JavaCompilerArgumentsBuilder.java
**SHA:** e0004665343f9b59
**Timestamp:** 2026-08-28T02:50:38.606761
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- if (bootClasspath != null) { //TODO: move bootclasspath to platform

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

package org.gradle.api.internal.tasks.compile;

import com.google.common.base.Joiner;
import org.gradle.api.InvalidUserDataException;
import org.gradle.api.JavaVersion;
import org.gradle.internal.Cast;
import org.gradle.util.internal.GUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

public class JavaCompilerArgumentsBuilder {
    public static final Logger LOGGER = LoggerFactory.getLogger(JavaCompilerArgumentsBuilder.class);
    public static final String USE_UNSHARED_COMPILER_TABLE_OPTION = "-XDuseUnsharedTable=true";
    public static final String EMPTY_SOURCE_PATH_REF_DIR = "emptySourcePathRef";

    private final JavaCompileSpec spec;

    private boolean includeLauncherOptions;
    private boolean includeMainOptions = true;
    private boolean includeClasspath = true;
    private boolean includeSourceFiles;
    private boolean allowEmptySourcePath = true;

    private List<String> args;

    public JavaCompilerArgumentsBuilder(JavaCompileSpec spec) {
        this.spec = spec;
    }

    public JavaCompilerArgumentsBuilder includeLauncherOptions(boolean flag) {
        includeLauncherOptions = flag;
        return this;
    }

    public JavaCompilerArgumentsBuilder includeMainOptions(boolean flag) {
        includeMainOptions = flag;
        return this;
    }

    public JavaCompilerArgumentsBuilder includeClasspath(boolean flag) {
        includeClasspath = flag;
        return this;
    }

    public JavaCompilerArgumentsBuilder includeSourceFiles(boolean flag) {
        includeSourceFiles = flag;
        return this;
    }

    public JavaCompilerArgumentsBuilder noEmptySourcePath() {
        allowEmptySourcePath = false;
        return this;
    }

    /**
     * Returns a list with all Java compiler arguments as configured in this builder.
     * Returned arguments are guaranteed not to be null.
     *
     * @return a list containing all Java compiler arguments
     */
    public List<String> build() {
        args = new ArrayList<>();
        // Take a deep copy of the compilerArgs because the following methods mutate it.
        List<Object> compilerArgs = Cast.uncheckedCast(spec.getCompileOptions().getCompilerArgs());
        List<String> compArgs = compilerArgs
            .stream()
            .map(Object::toString)
            .collect(Collectors.toList());

        validateCompilerArgs(compArgs);

        addLauncherOptions();
        addMainOptions(compArgs);
        addClasspath();
        addUserProvidedArgs(compArgs);
        addSourceFiles();

        return args;
    }

    private void validateCompilerArgs(List<String> compilerArgs) {
        for (String arg : compilerArgs) {
            if ("-sourcepath".equals(arg) || "--source-path".equals(arg)) {
                throw new InvalidUserDataException("Cannot specify -sourcepath or --source-path via `CompileOptions.compilerArgs`. " +
                    "Use the `CompileOptions.sourcepath` property instead.");
            }

            if ("-processorpath".equals(arg) || "--processor-path".equals(arg)) {
                throw new InvalidUserDataException("Cannot specify -processorpath or --processor-path via `CompileOptions.compilerArgs`. " +
                    "Use the `CompileOptions.annotationProcessorPath` property instead.");
            }

            if (arg != null && arg.startsWith("-J")) {
                throw new InvalidUserDataException("Cannot specify -J flags via `CompileOptions.compilerArgs`. " +
                    "Use the `CompileOptions.forkOptions.jvmArgs` property instead.");
            }

            if ("--release".equals(arg) && spec.getRelease() != null) {
                throw new InvalidUserDataException("Cannot specify --release via `CompileOptions.compilerArgs` when using `CompileOptions.release`.");
            }
        }
    }

    private void addLauncherOptions() {
        if (!includeLauncherOptions) {
            return;
        }

        MinimalJavaCompilerDaemonForkOptions forkOptions = spec.getCompileOptions().getForkOptions();
        if (forkOptions.getMemoryInitialSize() != null) {
            args.add("-J-Xms" + forkOptions.getMemoryInitialSize().trim());
        }
        if (forkOptions.getMemoryMaximumSize() != null) {
        
```