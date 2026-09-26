# MISSAO - BuildConfigurationRule.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\platform-base\org\gradle\api\internal\plugins\BuildConfigurationRule.java
**SHA:** 64ecf418b8e602fa
**Timestamp:** 2026-08-28T02:51:00.040823
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- return "Pattern: " + PREFIX + "<ConfigurationName>: Assembles the artifacts of a configuration.";

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

package org.gradle.api.internal.plugins;

import org.apache.commons.lang.StringUtils;
import org.gradle.api.Rule;
import org.gradle.api.Task;
import org.gradle.api.artifacts.Configuration;
import org.gradle.api.artifacts.ConfigurationContainer;
import org.gradle.api.tasks.TaskContainer;

public class BuildConfigurationRule implements Rule {

    public static final String PREFIX = "build";

    private final ConfigurationContainer configurations;
    private final TaskContainer tasks;

    public BuildConfigurationRule(ConfigurationContainer configurations, TaskContainer tasks) {
        this.configurations = configurations;
        this.tasks = tasks;
    }

    @Override
    public String getDescription() {
        return "Pattern: " + PREFIX + "<ConfigurationName>: Assembles the artifacts of a configuration.";
    }

    @Override
    public void apply(String taskName) {
        if (taskName.startsWith(PREFIX)) {
            String configurationName = StringUtils.uncapitalize(taskName.substring(PREFIX.length()));
            Configuration configuration = configurations.findByName(configurationName);

            if (configuration != null) {
                @SuppressWarnings("deprecation")
                Task task = tasks.create(taskName);
                task.dependsOn(configuration.getAllArtifacts());
                task.setDescription("Builds the artifacts belonging to " + configuration + ".");
            }
        }
    }

    @Override
    public String toString() {
        return "Rule: " + getDescription();
    }
}

```