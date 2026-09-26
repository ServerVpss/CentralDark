# MISSAO - MavenPublishingAwareVariant.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\publish\org\gradle\api\publish\internal\component\MavenPublishingAwareVariant.java
**SHA:** 79d7921a3401f4ff
**Timestamp:** 2026-08-28T02:51:25.483977
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Update native plugins to use maven-aware variants so we can remove this.

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
package org.gradle.api.publish.internal.component;

import org.gradle.api.component.SoftwareComponentVariant;

public interface MavenPublishingAwareVariant extends SoftwareComponentVariant {
    ScopeMapping getScopeMapping();

    // Order is important!
    enum ScopeMapping {
        compile("compile", false),
        runtime("runtime", false),
        compile_optional("compile", true),
        runtime_optional("runtime", true);

        private final String scope;
        private final boolean optional;

        ScopeMapping(String scope, boolean optional) {
            this.scope = scope;
            this.optional = optional;
        }

        public String getScope() {
            return scope;
        }

        public boolean isOptional() {
            return optional;
        }

        public static ScopeMapping of(String scope, boolean optional) {
            if (optional) {
                scope += "_optional";
            }
            return ScopeMapping.valueOf(scope);
        }
    }

    static ScopeMapping scopeForVariant(SoftwareComponentVariant variant) {
        if (variant instanceof MavenPublishingAwareVariant) {
            return ((MavenPublishingAwareVariant) variant).getScopeMapping();
        }
        // TODO: Update native plugins to use maven-aware variants so we can remove this.
        String name = variant.getName();
        if ("api".equals(name) || "apiElements".equals(name)) {
            return ScopeMapping.compile;
        }
        return ScopeMapping.runtime;
    }
}

```