# COMANDO - DefaultStructBindingsStore.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\model-core\org\gradle\model\internal\manage\binding\DefaultStructBindingsStore.java
**SHA:** f778625f87fd55c1
**Timestamp:** 2026-08-28T02:50:50.582174
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO:LPTR This should be removed once BinaryContainer is a ModelMap

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

package org.gradle.model.internal.manage.binding;

import com.google.common.base.Equivalence.Wrapper;
import com.google.common.base.Function;
import com.google.common.base.Joiner;
import com.google.common.base.Objects;
import com.google.common.base.Predicate;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.google.common.collect.ArrayListMultimap;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.ImmutableSortedMap;
import com.google.common.collect.Iterables;
import com.google.common.collect.Maps;
import com.google.common.collect.Multimap;
import com.google.common.collect.Ordering;
import com.google.common.collect.Sets;
import com.google.common.util.concurrent.UncheckedExecutionException;
import groovy.lang.GroovyObject;
import org.gradle.api.Named;
import org.gradle.internal.Cast;
import org.gradle.internal.UncheckedException;
import org.gradle.internal.reflect.PropertyAccessorType;
import org.gradle.internal.reflect.Types.TypeVisitResult;
import org.gradle.internal.reflect.Types.TypeVisitor;
import org.gradle.model.Managed;
import org.gradle.model.Unmanaged;
import org.gradle.model.internal.manage.schema.CollectionSchema;
import org.gradle.model.internal.manage.schema.ManagedImplSchema;
import org.gradle.model.internal.manage.schema.ModelSchema;
import org.gradle.model.internal.manage.schema.ModelSchemaStore;
import org.gradle.model.internal.manage.schema.RuleSourceSchema;
import org.gradle.model.internal.manage.schema.ScalarCollectionSchema;
import org.gradle.model.internal.manage.schema.ScalarValueSchema;
import org.gradle.model.internal.manage.schema.StructSchema;
import org.gradle.model.internal.method.WeaklyTypeReferencingMethod;
import org.gradle.model.internal.type.ModelType;
import org.gradle.model.internal.type.ModelTypes;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.concurrent.ExecutionException;

import static org.gradle.internal.reflect.Methods.DESCRIPTOR_EQUIVALENCE;
import static org.gradle.internal.reflect.Methods.SIGNATURE_EQUIVALENCE;
import static org.gradle.internal.reflect.PropertyAccessorType.GET_GETTER;
import static org.gradle.internal.reflect.PropertyAccessorType.IS_GETTER;
import static org.gradle.internal.reflect.PropertyAccessorType.SETTER;
import static org.gradle.internal.reflect.PropertyAccessorType.hasGetter;
import static org.gradle.internal.reflect.PropertyAccessorType.hasSetter;
import static org.gradle.internal.reflect.PropertyAccessorType.hasVoidReturnType;
import static org.gradle.internal.reflect.PropertyAccessorType.takesSingleParameter;
import static org.gradle.internal.reflect.Types.walkTypeHierarchy;

public class DefaultStructBindingsStore implements StructBindingsStore {
    private final LoadingCache<CacheKey, StructBindings<?>> bindings = CacheBuilder.newBuilder()
        .weakValues()
        .build(new CacheLoader<CacheKey, StructBindings<?>>() {
            @Override
            public StructBindings<?> load(CacheKey key) throws Exception {
                return extract(key.publicType, key.viewTypes, key.delegateType);
            }
        });

    private final ModelSchemaStore schemaStore;

    public DefaultStructBindingsStore(ModelSchemaStore schemaStore) {
        this.schemaStore = schemaStore;
    }

    @Override
    public <T> StructBindings<T> getBindings(ModelType<T> publicType) {
        return getBindings(publicType, Collections.<ModelType<?>>emptySet(), null);
    }

    @Override
    public <T> StructBindings<T> getBindings(ModelType<T> publicType, Iterable<? extends ModelType<?>> internalViewTypes, ModelType<?> delegateType) {
        try {
            return Cast.uncheckedCast(bindings.get(new CacheKey(publicType, internalViewTypes, delegateType)));
        } catch (ExecutionException e) {
            throw UncheckedException.throwAsUncheckedException(e);
        } catch (UncheckedExecutionEx
```