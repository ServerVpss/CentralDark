# MISSAO - ContainersSchemaComponent.kt
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\declarative-dsl-provider\org\gradle\internal\declarativedsl\ndoc\ContainersSchemaComponent.kt
**SHA:** 937ce9d10496ff25
**Timestamp:** 2026-08-28T02:50:20.508143
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: this check relies on the hashing+equality implementation of the schema functions; if those get proxied (e.g. to TAPI), it won't work; We do not need that for now, though.
- member.annotationsWithGetters.none { it is Internal } // TODO: @Internal might not be the best fit, as it is more related to the task models

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2024 the original author or authors.
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

package org.gradle.internal.declarativedsl.ndoc

import org.gradle.api.NamedDomainObjectContainer
import org.gradle.api.tasks.Internal
import org.gradle.declarative.dsl.schema.ConfigureAccessor
import org.gradle.declarative.dsl.schema.DataClass
import org.gradle.declarative.dsl.schema.DataMemberFunction
import org.gradle.declarative.dsl.schema.DataParameter
import org.gradle.declarative.dsl.schema.DataTypeRef
import org.gradle.declarative.dsl.schema.SchemaFunction
import org.gradle.declarative.dsl.schema.SchemaMemberFunction
import org.gradle.internal.declarativedsl.analysis.ConfigureAccessorInternal
import org.gradle.internal.declarativedsl.analysis.DataTypeRefInternal
import org.gradle.internal.declarativedsl.analysis.DeclarativeDslInterpretationException
import org.gradle.internal.declarativedsl.analysis.DefaultDataClass
import org.gradle.internal.declarativedsl.analysis.DefaultDataMemberFunction
import org.gradle.internal.declarativedsl.analysis.DefaultDataParameter
import org.gradle.internal.declarativedsl.analysis.DefaultFqName
import org.gradle.internal.declarativedsl.analysis.FunctionSemanticsInternal
import org.gradle.internal.declarativedsl.analysis.FunctionSemanticsInternal.DefaultAccessAndConfigure.DefaultReturnType.DefaultUnit
import org.gradle.internal.declarativedsl.analysis.FunctionSemanticsInternal.DefaultConfigureBlockRequirement.DefaultRequired
import org.gradle.internal.declarativedsl.analysis.ParameterSemanticsInternal
import org.gradle.internal.declarativedsl.analysis.SchemaItemMetadataInternal.SchemaMemberOriginInternal.DefaultContainerElementFactory
import org.gradle.internal.declarativedsl.analysis.ref
import org.gradle.internal.declarativedsl.evaluationSchema.AnalysisSchemaComponent
import org.gradle.internal.declarativedsl.evaluationSchema.EvaluationSchemaBuilder
import org.gradle.internal.declarativedsl.evaluationSchema.ObjectConversionComponent
import org.gradle.internal.declarativedsl.evaluationSchema.ifConversionSupported
import org.gradle.internal.declarativedsl.language.DataTypeInternal
import org.gradle.internal.declarativedsl.mappingToJvm.DeclarativeRuntimeFunction
import org.gradle.internal.declarativedsl.InstanceAndPublicType
import org.gradle.internal.declarativedsl.mappingToJvm.RuntimeCustomAccessors
import org.gradle.internal.declarativedsl.mappingToJvm.RuntimeFunctionResolver
import org.gradle.internal.declarativedsl.schemaBuilder.DataSchemaBuilder
import org.gradle.internal.declarativedsl.schemaBuilder.FunctionExtractor
import org.gradle.internal.declarativedsl.schemaBuilder.SchemaBuildingHost
import org.gradle.internal.declarativedsl.schemaBuilder.SchemaBuildingTags
import org.gradle.internal.declarativedsl.schemaBuilder.TypeDiscovery
import org.gradle.internal.declarativedsl.schemaBuilder.annotationsWithGetters
import org.gradle.internal.declarativedsl.schemaBuilder.inContextOfModelMember
import org.gradle.internal.declarativedsl.schemaBuilder.withTag
import org.gradle.internal.declarativedsl.utils.DclContainerMemberExtractionUtils.elementFactoryFunctionNameFromElementType
import org.gradle.internal.declarativedsl.utils.DclContainerMemberExtractionUtils.elementTypeFromNdocContainerType
import java.util.Locale
import kotlin.reflect.KCallable
import kotlin.reflect.KClass
import kotlin.reflect.KFunction
import kotlin.reflect.KProperty
import kotlin.reflect.KType
import kotlin.reflect.KVisibility
import kotlin.reflect.full.isSubclassOf
import kotlin.reflect.full.memberFunctions
import kotlin.reflect.full.memberProperties
import kotlin.reflect.full.starProjectedType
import kotlin.reflect.jvm.jvmErasure


internal fun EvaluationSchemaBuilder.namedDomainObjectContainers() {
    val component = ContainersSchemaComponent()

    registerAnalysisSchemaComponent(component)
    ifConversionSupported {
        registerObjectConversionComponent(component)
    }
}


internal class ContainersSchemaComponent : AnalysisSchemaComponent, ObjectConversionComponent {
    private val containerByAccessorId = mutableMapOf<String, ContainerProperty>()
    private val elementFactoryFunctions = hashSetOf<SchemaMemberFunction>()
    private val elementPublicTypes = mutableMapOf<SchemaMemberFunction, KClass<*>>()

    override fun functionExtractors(): List<FunctionExtractor> = listOf(
        // For subtypes of NDOC<T>, generate the element factory function as a member:
        object : F
```