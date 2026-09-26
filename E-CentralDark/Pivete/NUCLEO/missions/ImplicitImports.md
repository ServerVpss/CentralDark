# MISSAO - ImplicitImports.kt
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\kotlin-dsl\org\gradle\kotlin\dsl\support\ImplicitImports.kt
**SHA:** ab44b57e29d9dfb4
**Timestamp:** 2026-08-28T02:50:38.343237
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: let this be contributed by :plugins
- // TODO: infer list of types below at build time by inspecting the Gradle API

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2016 the original author or authors.
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

package org.gradle.kotlin.dsl.support

import org.gradle.configuration.ImportsReader
import org.gradle.internal.service.scopes.Scope
import org.gradle.internal.service.scopes.ServiceScope


/**
 * Holds the list of imports implicitly added to every Kotlin build script.
 */
@ServiceScope(Scope.Global::class)
class ImplicitImports internal constructor(
    @Transient
    private val importsReader: ImportsReader
) {

    val list by lazy {
        gradleImports() + gradleKotlinDslImports()
    }

    private
    fun gradleImports() =
        importsReader.simpleNameToFullClassNamesMapping.values.map { it.first() }

    private
    fun gradleKotlinDslImports() =
        listOf(
            "org.gradle.kotlin.dsl.*",
            // TODO: let this be contributed by :plugins
            "org.gradle.kotlin.dsl.plugins.dsl.*",
            // TODO: infer list of types below at build time by inspecting the Gradle API
            "java.util.concurrent.Callable",
            "java.util.concurrent.TimeUnit",
            "java.math.BigDecimal",
            "java.math.BigInteger",
            "java.io.File",
            "javax.inject.Inject"
        )
}

```