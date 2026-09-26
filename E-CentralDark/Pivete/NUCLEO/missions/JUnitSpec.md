# MISSAO - JUnitSpec.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\testing-jvm-infrastructure\org\gradle\api\internal\tasks\testing\junit\JUnitSpec.java
**SHA:** 8a075eb860bc3d26
**Timestamp:** 2026-08-28T02:51:52.547228
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- this.isDryRun = isDryRun;

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2010 the original author or authors.
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
package org.gradle.api.internal.tasks.testing.junit;

import org.gradle.api.internal.tasks.testing.filter.TestFilterSpec;

import java.io.Serializable;
import java.util.Set;

public class JUnitSpec implements Serializable {
    private final TestFilterSpec filter;
    private final Set<String> includeCategories;
    private final Set<String> excludeCategories;
    private final boolean isDryRun;

    public JUnitSpec(
        TestFilterSpec filter,
        Set<String> includeCategories,
        Set<String> excludeCategories,
        boolean isDryRun
    ) {
        this.filter = filter;
        this.includeCategories = includeCategories;
        this.excludeCategories = excludeCategories;
        this.isDryRun = isDryRun;
    }

    public TestFilterSpec getFilter() {
        return filter;
    }

    public Set<String> getIncludeCategories() {
        return includeCategories;
    }

    public Set<String> getExcludeCategories() {
        return excludeCategories;
    }

    public boolean hasCategoryConfiguration() {
        return !(excludeCategories.isEmpty() && includeCategories.isEmpty());
    }

    public boolean isDryRun() {
        return isDryRun;
    }
}

```