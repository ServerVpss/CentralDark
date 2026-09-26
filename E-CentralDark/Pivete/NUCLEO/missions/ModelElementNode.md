# MISSAO - ModelElementNode.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\model-core\org\gradle\model\internal\registry\ModelElementNode.java
**SHA:** 3ad698c2fe1aef57
**Timestamp:** 2026-08-28T02:50:52.615658
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO:LPTR Remove projection for reference node

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

package org.gradle.model.internal.registry;

import com.google.common.base.Predicate;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Iterables;
import org.gradle.internal.Cast;
import org.gradle.model.RuleSource;
import org.gradle.model.internal.core.DuplicateModelException;
import org.gradle.model.internal.core.EmptyReferenceProjection;
import org.gradle.model.internal.core.ModelAction;
import org.gradle.model.internal.core.ModelActionRole;
import org.gradle.model.internal.core.ModelNode;
import org.gradle.model.internal.core.ModelPath;
import org.gradle.model.internal.core.ModelProjection;
import org.gradle.model.internal.core.ModelRegistration;
import org.gradle.model.internal.core.ModelRegistrations;
import org.gradle.model.internal.core.ModelView;
import org.gradle.model.internal.core.MutableModelNode;
import org.gradle.model.internal.core.NodePredicate;
import org.gradle.model.internal.core.rule.describe.ModelRuleDescriptor;
import org.gradle.model.internal.type.ModelType;

import javax.annotation.Nullable;
import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

import static org.gradle.model.internal.core.ModelNode.State.Created;
import static org.gradle.model.internal.core.ModelNode.State.Initialized;

class ModelElementNode extends ModelNodeInternal {
    private Map<String, ModelNodeInternal> links;
    private final MutableModelNode parent;
    private Object privateData;
    private ModelType<?> privateDataType;

    public ModelElementNode(ModelRegistryInternal modelRegistry, ModelRegistration registration, MutableModelNode parent) {
        super(modelRegistry, registration);
        this.parent = parent;
    }

    @Override
    public MutableModelNode getParent() {
        return parent;
    }

    @Override
    public <T> ModelView<? extends T> asImmutable(ModelType<T> type, @Nullable ModelRuleDescriptor ruleDescriptor) {
        ModelView<? extends T> modelView = getAdapter().asImmutable(type, this, ruleDescriptor);
        if (modelView == null) {
            throw new IllegalStateException("Model element " + getPath() + " cannot be expressed as a read-only view of type " + type);
        }
        return modelView;
    }

    @Override
    public <T> ModelView<? extends T> asMutable(ModelType<T> type, ModelRuleDescriptor ruleDescriptor) {
        ModelView<? extends T> modelView;
        if (isMutable()) {
            modelView = getAdapter().asMutable(type, this, ruleDescriptor);
        } else {
            modelView = getAdapter().asImmutable(type, this, ruleDescriptor);
        }
        if (modelView == null) {
            throw new IllegalStateException("Model element " + getPath() + " cannot be expressed as a mutable view of type " + type);
        }
        return modelView;
    }

    @Override
    public <T> T getPrivateData(Class<T> type) {
        return getPrivateData(ModelType.of(type));
    }

    @Override
    public <T> T getPrivateData(ModelType<T> type) {
        if (privateData == null) {
            return null;
        }

        if (!type.isAssignableFrom(privateDataType)) {
            throw new ClassCastException("Cannot get private data '" + privateData + "' of type '" + privateDataType + "' as type '" + type);
        }
        return Cast.uncheckedCast(privateData);
    }

    @Override
    public Object getPrivateData() {
        return privateData;
    }

    @Override
    public <T> void setPrivateData(Class<? super T> type, T object) {
        setPrivateData(ModelType.of(type), object);
    }

    @Override
    public <T> void setPrivateData(ModelType<? super T> type, T object) {
        if (!isMutable()) {
            throw new IllegalStateException(String.format("Cannot set value for model element '%s' as this element is not mutable.", getPath()));
        }
        this.privateDataType = type;
        this.privateData = object;
    }

    @Override
    public boolean hasLink(String name) {
        return links != null && links.containsKey(name);
    }

    @Override
    @Nullable
    public ModelNodeInternal getLink(String name) {
        return links == null ? null : links.get(name);
    }

    @Override
    public Iterable<? extends ModelNodeInternal> getLinks() {
        return links == null ? Collections.<ModelNodeInternal>emptyList() : links.values();
    }

    @Ove
```