# COMANDO - NodeBackedModelMap.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\model-core\org\gradle\model\internal\core\NodeBackedModelMap.java
**SHA:** 0ea6381c89fb9bdf
**Timestamp:** 2026-08-28T02:50:49.500238
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- this.delegate = delegate;

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

package org.gradle.model.internal.core;

import com.google.common.base.Function;
import com.google.common.base.Predicate;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.ImmutableSetMultimap;
import com.google.common.collect.Iterables;
import com.google.common.collect.Iterators;
import com.google.common.collect.Lists;
import com.google.common.collect.Multimap;
import org.gradle.api.Action;
import org.gradle.api.Transformer;
import org.gradle.api.specs.Spec;
import org.gradle.internal.Cast;
import org.gradle.internal.Factories;
import org.gradle.model.InvalidModelRuleException;
import org.gradle.model.ModelMap;
import org.gradle.model.ModelRuleBindingException;
import org.gradle.model.RuleSource;
import org.gradle.model.internal.core.rule.describe.ModelRuleDescriptor;
import org.gradle.model.internal.inspect.ModelElementProjection;
import org.gradle.model.internal.manage.instance.ManagedInstance;
import org.gradle.model.internal.report.IncompatibleTypeReferenceReporter;
import org.gradle.model.internal.type.ModelType;

import javax.annotation.Nullable;
import java.util.Collection;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import static org.gradle.internal.Cast.uncheckedCast;
import static org.gradle.model.internal.core.NodeInitializerContext.forExtensibleType;
import static org.gradle.model.internal.core.NodePredicate.allLinks;

// TODO - mix Groovy DSL support in
public class NodeBackedModelMap<T> extends ModelMapGroovyView<T> implements ManagedInstance {

    private static final ElementFilter NO_PARENT = new ElementFilter(ModelType.UNTYPED) {
        @Override
        public boolean apply(MutableModelNode node) {
            return true;
        }

        @Override
        public boolean isSatisfiedBy(ModelType<?> element) {
            return true;
        }

        @Override
        public void validateCanBindAction(MutableModelNode node, ModelAction action) {}

        @Override
        public void validateCanCreateElement(ModelPath path, ModelType<?> type) {}
    };

    private final ModelType<T> elementType;
    private final ModelRuleDescriptor sourceDescriptor;
    private final MutableModelNode modelNode;
    private final ModelViewState viewState;
    private final ChildNodeInitializerStrategy<? super T> creatorStrategy;
    private final ElementFilter elementFilter;
    private final ModelType<?> publicType;

    // Note: used by generated subtypes
    public NodeBackedModelMap(ModelType<?> publicType, ModelType<T> elementType, ModelRuleDescriptor sourceDescriptor, MutableModelNode modelNode,
                              ModelViewState viewState, ChildNodeInitializerStrategy<? super T> creatorStrategy) {
        this(publicType, elementType, sourceDescriptor, modelNode, viewState, NO_PARENT, creatorStrategy);
    }

    private NodeBackedModelMap(ModelType<?> publicType, ModelType<T> elementType, ModelRuleDescriptor sourceDescriptor, MutableModelNode modelNode,
                               ModelViewState viewState, ElementFilter parentFilter, ChildNodeInitializerStrategy<? super T> creatorStrategy) {
        this.publicType = publicType;
        this.viewState = viewState;
        this.creatorStrategy = creatorStrategy;
        this.elementType = elementType;
        this.modelNode = modelNode;
        this.sourceDescriptor = sourceDescriptor;
        this.elementFilter = parentFilter.withType(elementType);
    }

    public static <T> ChildNodeInitializerStrategy<T> createUsingRegistry(final NodeInitializerRegistry nodeInitializerRegistry) {
        return new ChildNodeInitializerStrategy<T>() {
            @Override
            public <S extends T> NodeInitializer initializer(ModelType<S> type, Spec<ModelType<?>> constraints) {
                return nodeInitializerRegistry.getNodeInitializer(forExtensibleType(type, constraints));
            }
        };
    }

    public static <T> ChildNodeInitializerStrategy<T> createUsingParentNode(final ModelType<T> baseItemModelType) {
        return createUsingParentNode(new Transformer<NamedEntityInstantiator<T>, MutableModelNode>() {
            @Override
            public NamedEntityInstantiator<T> transform(MutableModelNode modelNode) {
                return modelNode.getPrivateData(instantiatorTypeOf(baseItemModelType));
            }
        
```