# MISSAO - NioFileInterceptors.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\core\org\gradle\internal\classpath\declarations\NioFileInterceptors.java
**SHA:** cdba70081799a913
**Timestamp:** 2026-08-28T02:50:06.144075
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: handle varargs in Groovy
- Set<?> options, // todo: use a proper type argument here once the tool supports it

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2023 the original author or authors.
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

package org.gradle.internal.classpath.declarations;

import org.gradle.internal.Cast;
import org.gradle.internal.classpath.Instrumented;
import org.gradle.internal.instrumentation.api.annotations.CallableKind.InstanceMethod;
import org.gradle.internal.instrumentation.api.annotations.CallableKind.StaticMethod;
import org.gradle.internal.instrumentation.api.annotations.InterceptCalls;
import org.gradle.internal.instrumentation.api.annotations.ParameterKind.CallerClassName;
import org.gradle.internal.instrumentation.api.annotations.ParameterKind.Receiver;
import org.gradle.internal.instrumentation.api.annotations.ParameterKind.VarargParameter;
import org.gradle.internal.instrumentation.api.annotations.SpecificGroovyCallInterceptors;
import org.gradle.internal.instrumentation.api.annotations.SpecificJvmCallInterceptors;
import org.gradle.internal.instrumentation.api.declarations.InterceptorDeclaration;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.nio.channels.FileChannel;
import java.nio.channels.SeekableByteChannel;
import java.nio.charset.Charset;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.OpenOption;
import java.nio.file.Path;
import java.nio.file.attribute.FileAttribute;
import java.nio.file.spi.FileSystemProvider;
import java.nio.file.spi.FileTypeDetector;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;

import static org.gradle.internal.classpath.FileUtils.optionsAllowReading;
import static org.gradle.internal.classpath.FileUtils.tryReportDirectoryContentObserved;
import static org.gradle.internal.classpath.FileUtils.tryReportFileOpened;
import static org.gradle.internal.classpath.FileUtils.tryReportFileSystemEntryObserved;

@SuppressWarnings("NewMethodNamingConvention")
@SpecificJvmCallInterceptors(generatedClassName = InterceptorDeclaration.JVM_BYTECODE_GENERATED_CLASS_NAME_FOR_CONFIG_CACHE)
@SpecificGroovyCallInterceptors(generatedClassName = InterceptorDeclaration.GROOVY_INTERCEPTORS_GENERATED_CLASS_NAME_FOR_CONFIG_CACHE)
public class NioFileInterceptors {
    @InterceptCalls
    @StaticMethod(ofClass = Files.class)
    public static boolean intercept_isRegularFile(
        Path path,
        @VarargParameter LinkOption[] options,
        @CallerClassName String consumer
    ) {
        tryReportFileSystemEntryObserved(path, consumer);
        return Files.isRegularFile(path, options);
    }

    @InterceptCalls
    @StaticMethod(ofClass = Files.class)
    public static boolean intercept_isDirectory(
        Path path,
        @VarargParameter LinkOption[] options,
        @CallerClassName String consumer
    ) {
        tryReportFileSystemEntryObserved(path, consumer);
        return Files.isDirectory(path, options);
    }

    @InterceptCalls
    @StaticMethod(ofClass = Files.class)
    public static boolean intercept_exists(
        Path path,
        @VarargParameter LinkOption[] options,
        @CallerClassName String consumer
    ) {
        tryReportFileSystemEntryObserved(path, consumer);
        return Files.exists(path, options);
    }

    @InterceptCalls
    @StaticMethod(ofClass = Files.class)
    public static boolean intercept_notExists(
        Path path,
        @VarargParameter LinkOption[] options,
        @CallerClassName String consumer
    ) {
        tryReportFileSystemEntryObserved(path, consumer);
        return Files.notExists(path, options);
    }

    // TODO: handle varargs in Groovy
    @InterceptCalls
    @StaticMethod(ofClass = Files.class)
    public static SeekableByteChannel intercept_newByteChannel(
        Path path,
        @VarargParameter OpenOption[] options,
        @CallerClassName String consumer
    ) throws IOException {
        if (optionsAllowReading(options)) {
            tryReportFileOpened(path, consumer);
        }
        return Files.newByteChannel(path, options);
    }

    @InterceptCalls
    @StaticMethod(ofClass = Files.class)
    public static SeekableByteChannel intercept_newByteChannel(
        Path path,
        Set<?> options, // todo: use a proper type argument here once the tool supports it
        @VarargParameter FileAttribute<?>[] attrs,
        @CallerClassName String consumer
    ) throws IOException {
        if (optionsAllowReading(options)) {
            tryReportF
```