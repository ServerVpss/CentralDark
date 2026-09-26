# MISSAO - StartScriptTemplateBindingFactory.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\plugins-application\org\gradle\api\internal\plugins\StartScriptTemplateBindingFactory.java
**SHA:** 18ffcb7a7cfee09b
**Timestamp:** 2026-08-28T02:51:14.535580
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- //quote ', ", \, $. Probably not perfect. TODO: identify non-working cases, fail-fast on them

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2015 the original author or authors.
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

package org.gradle.api.internal.plugins;

import com.google.common.base.Function;
import com.google.common.base.Joiner;
import com.google.common.collect.Iterables;
import com.google.common.collect.Streams;
import org.apache.commons.lang.StringUtils;
import org.gradle.api.Transformer;
import org.gradle.jvm.application.scripts.JavaAppStartScriptGenerationDetails;
import org.gradle.util.internal.CollectionUtils;

import java.text.CharacterIterator;
import java.text.StringCharacterIterator;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class StartScriptTemplateBindingFactory implements Transformer<Map<String, String>, JavaAppStartScriptGenerationDetails> {

    private final boolean windows;

    private StartScriptTemplateBindingFactory(boolean windows) {
        this.windows = windows;
    }

    public static StartScriptTemplateBindingFactory windows() {
        return new StartScriptTemplateBindingFactory(true);
    }

    public static StartScriptTemplateBindingFactory unix() {
        return new StartScriptTemplateBindingFactory(false);
    }

    @Override
    public Map<String, String> transform(JavaAppStartScriptGenerationDetails details) {
        Map<String, String> binding = new HashMap<>();
        // Before changing, see the note in ScriptBindingParameter's Javadoc
        binding.put(ScriptBindingParameter.APP_NAME.getKey(), details.getApplicationName());
        binding.put(ScriptBindingParameter.OPTS_ENV_VAR.getKey(), details.getOptsEnvironmentVar());
        binding.put(ScriptBindingParameter.EXIT_ENV_VAR.getKey(), details.getExitEnvironmentVar());

        AppEntryPoint entryPoint = getEntryPoint(details);
        String entryPointArgs = encodeEntryPoint(entryPoint);
        binding.put(ScriptBindingParameter.ENTRY_POINT_ARGS.getKey(), entryPointArgs);
        binding.put(ScriptBindingParameter.MAIN_CLASS_NAME.getKey(), getMainClassName(entryPoint, entryPointArgs));
        binding.put(ScriptBindingParameter.MODULE_ENTRY_POINT.getKey(), entryPoint instanceof MainModule ? getModuleEntryPoint((MainModule) entryPoint) : null);

        binding.put(ScriptBindingParameter.DEFAULT_JVM_OPTS.getKey(), createJoinedDefaultJvmOpts(details.getDefaultJvmOpts()));
        binding.put(ScriptBindingParameter.APP_NAME_SYS_PROP.getKey(), details.getAppNameSystemProperty());
        binding.put(ScriptBindingParameter.APP_HOME_REL_PATH.getKey(), createJoinedAppHomeRelativePath(details.getScriptRelPath()));
        binding.put(ScriptBindingParameter.CLASSPATH.getKey(), createJoinedPath(details.getClasspath()));
        binding.put(ScriptBindingParameter.MODULE_PATH.getKey(), createJoinedPath(details.getModulePath()));
        return binding;

    }

    private static String getMainClassName(AppEntryPoint entryPoint, String entryPointArgs) {
        if (entryPoint instanceof MainClass) {
            return ((MainClass) entryPoint).getMainClassName();
        } else if (entryPoint instanceof MainModule) {
            // For legacy reasons, keep the mainClassName as the module invocation for scripts which used it that way
            return entryPointArgs;
        } else {
            return "";
        }
    }

    private static AppEntryPoint getEntryPoint(JavaAppStartScriptGenerationDetails details) {
        if (details instanceof DefaultJavaAppStartScriptGenerationDetails) {
            return ((DefaultJavaAppStartScriptGenerationDetails) details).getEntryPoint();
        } else {
            // Provide compatibility in case someone was manually implementing JavaAppStartScriptGenerationDetails
            return new MainClass(details.getMainClassName());
        }
    }

    private String encodeEntryPoint(AppEntryPoint entryPoint) {
        if (entryPoint instanceof MainClass) {
            return ((MainClass) entryPoint).getMainClassName();
        } else if (entryPoint instanceof MainModule) {
            return "--module " + getModuleEntryPoint((MainModule) entryPoint);
        } else if (entryPoint instanceof ExecutableJar) {
            // We need to also escape quotes in the JAR path, so our quotes aren't broken by the JAR path
            // In theory we should be doing this in `encodePath`, but I wanted to avoid making behavioral changes to `classpath` and `modulePath`
            String jarPathEscape
```