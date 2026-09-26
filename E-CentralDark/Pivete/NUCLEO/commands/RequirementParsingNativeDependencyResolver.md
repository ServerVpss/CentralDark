# COMANDO - RequirementParsingNativeDependencyResolver.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\platform-native\org\gradle\nativeplatform\internal\resolve\RequirementParsingNativeDependencyResolver.java
**SHA:** 7573d6312f6bb271
**Timestamp:** 2026-08-28T02:51:07.286170
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

package org.gradle.nativeplatform.internal.resolve;

import org.gradle.internal.typeconversion.NotationParser;
import org.gradle.nativeplatform.NativeLibraryRequirement;

public class RequirementParsingNativeDependencyResolver implements NativeDependencyResolver {
    private final NotationParser<Object, NativeLibraryRequirement> parser = NativeDependencyNotationParser.parser();

    private final NativeDependencyResolver delegate;

    public RequirementParsingNativeDependencyResolver(NativeDependencyResolver delegate) {
        this.delegate = delegate;
    }

    @Override
    public void resolve(NativeBinaryResolveResult nativeBinaryResolveResult) {
        for (NativeBinaryRequirementResolveResult resolution : nativeBinaryResolveResult.getPendingResolutions()) {
            NativeLibraryRequirement requirement = parser.parseNotation(resolution.getInput());
            if (requirement.getProjectPath() == null || requirement.getProjectPath().isEmpty()) {
                requirement = requirement.withProjectPath(nativeBinaryResolveResult.getTarget().getProjectPath());
            }
            resolution.setRequirement(requirement);
        }
        delegate.resolve(nativeBinaryResolveResult);
    }
}

```