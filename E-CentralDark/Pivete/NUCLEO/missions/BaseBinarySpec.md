# MISSAO - BaseBinarySpec.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\platform-base\org\gradle\platform\base\binary\BaseBinarySpec.java
**SHA:** 913eb02caabf3569
**Timestamp:** 2026-08-28T02:51:02.230295
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: This can throw a NPE: will need an identifier for a variant without an owning component

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2014 the original author or authors.
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

package org.gradle.platform.base.binary;

import org.gradle.api.Action;
import org.gradle.api.DomainObjectSet;
import org.gradle.api.Incubating;
import org.gradle.api.Task;
import org.gradle.api.artifacts.component.LibraryBinaryIdentifier;
import org.gradle.api.internal.AbstractBuildableComponentSpec;
import org.gradle.api.internal.CollectionCallbackActionDecorator;
import org.gradle.api.internal.collections.DomainObjectCollectionFactory;
import org.gradle.api.reflect.ObjectInstantiationException;
import org.gradle.internal.component.local.model.DefaultLibraryBinaryIdentifier;
import org.gradle.internal.reflect.Instantiator;
import org.gradle.language.base.LanguageSourceSet;
import org.gradle.model.ModelMap;
import org.gradle.model.internal.core.ModelActionRole;
import org.gradle.model.internal.core.ModelMaps;
import org.gradle.model.internal.core.ModelRegistration;
import org.gradle.model.internal.core.ModelRegistrations;
import org.gradle.model.internal.core.MutableModelNode;
import org.gradle.model.internal.core.NamedEntityInstantiator;
import org.gradle.model.internal.core.UnmanagedModelProjection;
import org.gradle.model.internal.type.ModelType;
import org.gradle.platform.base.BinarySpec;
import org.gradle.platform.base.BinaryTasksCollection;
import org.gradle.platform.base.ComponentSpec;
import org.gradle.platform.base.ModelInstantiationException;
import org.gradle.platform.base.internal.BinaryBuildAbility;
import org.gradle.platform.base.internal.BinaryNamingScheme;
import org.gradle.platform.base.internal.BinarySpecInternal;
import org.gradle.platform.base.internal.ComponentSpecIdentifier;
import org.gradle.platform.base.internal.DefaultBinaryNamingScheme;
import org.gradle.platform.base.internal.DefaultBinaryTasksCollection;
import org.gradle.platform.base.internal.FixedBuildAbility;

import javax.annotation.Nullable;
import java.io.File;
import java.util.Set;

/**
 * Base class that may be used for custom {@link BinarySpec} implementations. However, it is generally better to use an
 * interface annotated with {@link org.gradle.model.Managed} and not use an implementation class at all.
 */
@Incubating
public class BaseBinarySpec extends AbstractBuildableComponentSpec implements BinarySpecInternal {
    private static final ModelType<BinaryTasksCollection> BINARY_TASKS_COLLECTION = ModelType.of(BinaryTasksCollection.class);
    private static final ModelType<LanguageSourceSet> LANGUAGE_SOURCE_SET_MODELTYPE = ModelType.of(LanguageSourceSet.class);

    private static final ThreadLocal<BinaryInfo> NEXT_BINARY_INFO = new ThreadLocal<BinaryInfo>();
    private final DomainObjectSet<LanguageSourceSet> inputSourceSets;
    private final BinaryTasksCollection tasks;
    private final MutableModelNode componentNode;
    private final MutableModelNode sources;
    private final Class<? extends BinarySpec> publicType;
    private BinaryNamingScheme namingScheme;
    private boolean disabled;

    /**
     * Creates a {@link BaseBinarySpec}.
     *
     * @since 5.6
     */
    public static <T extends BaseBinarySpec> T create(Class<? extends BinarySpec> publicType, Class<T> implementationType,
                                                      ComponentSpecIdentifier componentId, MutableModelNode modelNode, @Nullable MutableModelNode componentNode,
                                                      Instantiator instantiator, NamedEntityInstantiator<Task> taskInstantiator,
                                                      CollectionCallbackActionDecorator collectionCallbackActionDecorator, DomainObjectCollectionFactory domainObjectCollectionFactory) {
        NEXT_BINARY_INFO.set(new BinaryInfo(componentId, publicType, modelNode, componentNode, taskInstantiator, instantiator, collectionCallbackActionDecorator, domainObjectCollectionFactory));
        try {
            try {
                return instantiator.newInstance(implementationType);
            } catch (ObjectInstantiationException e) {
                throw new ModelInstantiationException(String.format("Could not create binary of type %s", publicType.getSimpleName()), e.getCause());
            }
        } finally {
            NEXT_BINARY_INFO.set(null);
        }
    }

    public BaseBinarySpec() {
        this(NEXT_BINARY_INFO.get());
    }

    private BaseBinarySpec(BinaryInfo info) {
        super(validate(info).componentId, inf
```