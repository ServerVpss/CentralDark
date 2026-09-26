# MISSAO - IsolatableSerializerRegistry.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\model-core\org\gradle\internal\snapshot\impl\IsolatableSerializerRegistry.java
**SHA:** b72a4a4386762a95
**Timestamp:** 2026-08-28T02:50:47.742062
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: consider changing to `encoder.writeShort`
- // TODO: consider changing to `decoder.readShort`

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2025 the original author or authors.
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

package org.gradle.internal.snapshot.impl;

import com.google.common.collect.ImmutableCollection;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;
import org.gradle.api.NonNullApi;
import org.gradle.api.attributes.Attribute;
import org.gradle.api.problems.internal.IsolatableToBytesSerializer;
import org.gradle.internal.Cast;
import org.gradle.internal.classloader.ClassLoaderUtils;
import org.gradle.internal.hash.ClassLoaderHierarchyHasher;
import org.gradle.internal.hash.HashCode;
import org.gradle.internal.isolation.Isolatable;
import org.gradle.internal.serialize.Decoder;
import org.gradle.internal.serialize.DefaultSerializerRegistry;
import org.gradle.internal.serialize.Encoder;
import org.gradle.internal.serialize.Serializer;
import org.gradle.internal.serialize.kryo.KryoBackedDecoder;
import org.gradle.internal.serialize.kryo.KryoBackedEncoder;
import org.gradle.internal.service.scopes.Scope;
import org.gradle.internal.service.scopes.ServiceScope;
import org.gradle.internal.state.Managed;
import org.gradle.internal.state.ManagedFactory;
import org.gradle.internal.state.ManagedFactoryRegistry;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.lang.reflect.Array;
import java.util.Collection;
import java.util.List;

@NonNullApi
@ServiceScope({Scope.UserHome.class, Scope.Global.class})  //Global scope is needed for the usage in process isolated worker actions
public class IsolatableSerializerRegistry extends DefaultSerializerRegistry implements IsolatableToBytesSerializer {
    private static final byte STRING_VALUE = (byte) 0;
    private static final byte BOOLEAN_VALUE = (byte) 1;
    private static final byte SHORT_VALUE = (byte) 2;
    private static final byte INTEGER_VALUE = (byte) 3;
    private static final byte LONG_VALUE = (byte) 4;
    private static final byte ATTRIBUTE_VALUE = (byte) 5;
    private static final byte MANAGED_VALUE = (byte) 6;
    private static final byte IMMUTABLE_MANAGED_VALUE = (byte) 7;
    private static final byte FILE_VALUE = (byte) 8;
    private static final byte NULL_VALUE = (byte) 9;
    private static final byte SERIALIZED_VALUE = (byte) 10;
    private static final byte ENUM_VALUE = (byte) 11;
    private static final byte ISOLATED_MAP = (byte) 12;
    private static final byte ISOLATED_ARRAY = (byte) 13;
    private static final byte ISOLATED_LIST = (byte) 14;
    private static final byte ISOLATED_SET = (byte) 15;
    private static final byte ISOLATED_PROPERTIES = (byte) 16;
    private static final byte ISOLATED_ARRAY_OF_PRIMITIVE = (byte) 17;

    private static final byte ISOLATABLE_TYPE = (byte) 0;
    private static final byte ARRAY_TYPE = (byte) 1;
    private static final byte OTHER_TYPE = (byte) 2;
    private static final byte NULL_TYPE = (byte) 3;

    private final IsolatableSerializer<?>[] isolatableSerializers = {
        new StringValueSnapshotSerializer(),
        new BooleanValueSnapshotSerializer(),
        new ShortValueSnapshotSerializer(),
        new IntegerValueSnapshotSerializer(),
        new LongValueSnapshotSerializer(),
        new AttributeDefinitionSnapshotSerializer(),
        new IsolatedManagedValueSerializer(),
        new IsolatedImmutableManagedValueSerializer(),
        new FileValueSnapshotSerializer(),
        new NullValueSnapshotSerializer(),
        new IsolatedJavaSerializedValueSnapshotSerializer(),
        new IsolatedEnumValueSnapshotSerializer(),
        new IsolatedMapSerializer(),
        new IsolatedArraySerializer(),
        new IsolatedListSerializer(),
        new IsolatedSetSerializer(),
        new IsolatedPropertiesSerializer(),
        new IsolatedArrayOfPrimitiveSerializer()
    };

    private final ClassLoaderHierarchyHasher classLoaderHierarchyHasher;
    private final ManagedFactoryRegistry managedFactoryRegistry;

    public IsolatableSerializerRegistry(ClassLoaderHierarchyHasher classLoaderHierarchyHasher, ManagedFactoryRegistry managedFactoryRegistry) {
        super(false);
        this.classLoaderHierarchyHasher = classLoaderHierarchyHasher;
        this.managedFactoryRegistry = managedFactoryRegistry;
        registerIsolatableSerializers();
    }

    private void registerIsolatableSerializers() {
        for (int i = 0; i < isolatableSerializers.length; i++) {
            IsolatableSerializer<?> serializer 
```