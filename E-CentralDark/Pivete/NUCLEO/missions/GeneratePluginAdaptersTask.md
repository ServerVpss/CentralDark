# MISSAO - GeneratePluginAdaptersTask.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\plugin-development\org\gradle\plugin\devel\internal\precompiled\GeneratePluginAdaptersTask.java
**SHA:** f3347301e2ac3bda
**Timestamp:** 2026-08-28T02:51:12.405395
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Use worker API?

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2020 the original author or authors.
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

package org.gradle.plugin.devel.internal.precompiled;

import org.gradle.api.DefaultTask;
import org.gradle.api.UncheckedIOException;
import org.gradle.api.file.DirectoryProperty;
import org.gradle.api.file.FileSystemOperations;
import org.gradle.api.internal.initialization.ClassLoaderScope;
import org.gradle.api.provider.ListProperty;
import org.gradle.api.tasks.CacheableTask;
import org.gradle.api.tasks.IgnoreEmptyDirectories;
import org.gradle.api.tasks.InputFiles;
import org.gradle.api.tasks.Internal;
import org.gradle.api.tasks.OutputDirectory;
import org.gradle.api.tasks.PathSensitive;
import org.gradle.api.tasks.PathSensitivity;
import org.gradle.api.tasks.SkipWhenEmpty;
import org.gradle.api.tasks.TaskAction;
import org.gradle.configuration.CompileOperationFactory;
import org.gradle.groovy.scripts.internal.CompileOperation;
import org.gradle.groovy.scripts.internal.CompiledScript;
import org.gradle.groovy.scripts.internal.ScriptCompilationHandler;
import org.gradle.initialization.ClassLoaderScopeRegistry;
import org.gradle.internal.classpath.DefaultClassPath;
import org.gradle.internal.exceptions.LocationAwareException;
import org.gradle.plugin.management.PluginRequest;
import org.gradle.plugin.management.internal.PluginRequests;
import org.gradle.plugin.use.internal.PluginsAwareScript;

import javax.inject.Inject;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.InvocationTargetException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashSet;
import java.util.Set;

@CacheableTask
public abstract class GeneratePluginAdaptersTask extends DefaultTask {
    @Inject
    abstract protected FileSystemOperations getFileSystemOperations();

    @Inject
    abstract protected ClassLoaderScopeRegistry getClassLoaderScopeRegistry();

    @Inject
    abstract protected ScriptCompilationHandler getScriptCompilationHandler();

    @Inject
    abstract protected CompileOperationFactory getCompileOperationFactory();

    @InputFiles
    @SkipWhenEmpty
    @IgnoreEmptyDirectories
    @PathSensitive(PathSensitivity.RELATIVE)
    abstract DirectoryProperty getExtractedPluginRequestsClassesDirectory();

    @OutputDirectory
    abstract DirectoryProperty getPluginAdapterSourcesOutputDirectory();

    @Internal
    abstract ListProperty<PrecompiledGroovyScript> getScriptPlugins();

    @TaskAction
    void generatePluginAdapters() {
        getFileSystemOperations().delete(spec -> spec.delete(getPluginAdapterSourcesOutputDirectory()));
        getPluginAdapterSourcesOutputDirectory().get().getAsFile().mkdirs();

        // TODO: Use worker API?
        for (PrecompiledGroovyScript scriptPlugin : getScriptPlugins().get()) {
            String firstPassCode = generateFirstPassAdapterCode(scriptPlugin);
            generateScriptPluginAdapter(scriptPlugin, firstPassCode);
        }
    }

    private String generateFirstPassAdapterCode(PrecompiledGroovyScript scriptPlugin) {
        CompiledScript<PluginsAwareScript, ?> pluginsBlock = loadCompiledPluginsBlocks(scriptPlugin);
        if (!pluginsBlock.getRunDoesSomething()) {
            return "";
        }
        PluginRequests pluginRequests = extractPluginRequests(pluginsBlock, scriptPlugin);
        validatePluginRequests(scriptPlugin, pluginRequests);

        StringBuilder applyPlugins = new StringBuilder();
        applyPlugins.append("            Class<? extends BasicScript> pluginsBlockClass = Class.forName(\"").append(scriptPlugin.getFirstPassClassName()).append("\").asSubclass(BasicScript.class);\n");
        applyPlugins.append("            BasicScript pluginsBlockScript = pluginsBlockClass.getDeclaredConstructor().newInstance();\n");
        applyPlugins.append("            pluginsBlockScript.setScriptSource(scriptSource(pluginsBlockClass));\n");
        applyPlugins.append("            pluginsBlockScript.init(target, target.getServices());\n");
        applyPlugins.append("            pluginsBlockScript.run();\n");
        for (PluginRequest pluginRequest : pluginRequests) {
            applyPlugins.append("            target.getPluginManager().apply(\"").append(pluginRequest.getId().getId()).append("\");\n");
        }
        return applyPlugins.toString();
    }

    private void validatePluginRequests(PrecompiledGroovyScript scriptPlugin, PluginRequests pluginRequests) {
```