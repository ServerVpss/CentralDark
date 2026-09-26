# MISSAO - GccMetadataProvider.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\platform-native\org\gradle\nativeplatform\toolchain\internal\gcc\metadata\GccMetadataProvider.java
**SHA:** ac791d1e924d7e15
**Timestamp:** 2026-08-28T02:51:10.114416
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- private static final String SYSTEM_INCLUDES_START = "#include <...> search starts here:";

### Padroes
- private static final Pattern DEFINE_PATTERN = Pattern.compile("\\s*#define\\s+(\\S+)\\s+(.*)");

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

package org.gradle.nativeplatform.toolchain.internal.gcc.metadata;

import com.google.common.base.Joiner;
import com.google.common.collect.ImmutableList;
import org.gradle.api.GradleException;
import org.gradle.api.UncheckedIOException;
import org.gradle.internal.FileUtils;
import org.gradle.internal.io.StreamByteBuffer;
import org.gradle.internal.os.OperatingSystem;
import org.gradle.nativeplatform.platform.internal.ArchitectureInternal;
import org.gradle.nativeplatform.platform.internal.Architectures;
import org.gradle.nativeplatform.platform.internal.DefaultNativePlatform;
import org.gradle.nativeplatform.toolchain.internal.SystemLibraries;
import org.gradle.nativeplatform.toolchain.internal.metadata.AbstractMetadataProvider;
import org.gradle.nativeplatform.toolchain.internal.metadata.CompilerType;
import org.gradle.process.internal.ExecAction;
import org.gradle.process.internal.ExecActionFactory;
import org.gradle.util.internal.VersionNumber;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.StringReader;
import java.nio.file.NoSuchFileException;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.gradle.nativeplatform.toolchain.internal.gcc.metadata.GccCompilerType.CLANG;
import static org.gradle.nativeplatform.toolchain.internal.gcc.metadata.GccCompilerType.GCC;

/**
 * Given a File pointing to an (existing) gcc/g++/clang/clang++ binary, extracts the version number and default architecture by running with -dM -E -v and scraping the output.
 */
public class GccMetadataProvider extends AbstractMetadataProvider<GccMetadata> {
    private static final Pattern DEFINE_PATTERN = Pattern.compile("\\s*#define\\s+(\\S+)\\s+(.*)");
    private static final String SYSTEM_INCLUDES_START = "#include <...> search starts here:";
    private static final String SYSTEM_INCLUDES_END = "End of search list.";
    private static final String FRAMEWORK_INCLUDE = " (framework directory)";
    private final GccCompilerType compilerType;

    public static GccMetadataProvider forGcc(ExecActionFactory execActionFactory) {
        return new GccMetadataProvider(execActionFactory, GccCompilerType.GCC);
    }

    public static GccMetadataProvider forClang(ExecActionFactory execActionFactory) {
        return new GccMetadataProvider(execActionFactory, GccCompilerType.CLANG);
    }

    GccMetadataProvider(ExecActionFactory execActionFactory, GccCompilerType compilerType) {
        super(execActionFactory);
        this.compilerType = compilerType;
    }

    @Override
    public CompilerType getCompilerType() {
        return compilerType;
    }

    @Override
    protected List<String> compilerArgs() {
        return ImmutableList.of("-dM", "-E", "-v", "-");
    }

    @Override
    protected GccMetadata parseCompilerOutput(String output, String error, File gccBinary, List<File> path) {
        Map<String, String> defines = parseDefines(output, gccBinary);
        VersionNumber scrapedVersion = determineVersion(defines, gccBinary);
        ArchitectureInternal architecture = determineArchitecture(defines);
        String scrapedVendor = determineVendor(error, scrapedVersion, gccBinary);
        ImmutableList<File> systemIncludes = determineSystemIncludes(defines, path, error);

        return new DefaultGccMetadata(scrapedVersion, scrapedVendor, architecture, systemIncludes);
    }

    private String determineVendor(String error, VersionNumber versionNumber, File gccBinary) {
        BufferedReader reader = new BufferedReader(new StringReader(error));
        String majorMinorOnly = versionNumber.getMajor() + "." + versionNumber.getMinor();
        String line;
        try {
            while ((line = reader.readLine()) != null) {
                // allowing win32 to bypass the check is due to the mingw compiler on linux not including major.minor in the version string.
                if ((line.contains(majorMinorOnly) || line.contains("win32"))
                    && line.contains(" version ")
                    && line.contains(compilerType.getIdentifier())
                    && !line.contains(" default target ")) {
                    return line;
                }
            }
        } catch (IOException e) {
            // Should not happe
```