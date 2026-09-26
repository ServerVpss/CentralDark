# COMANDO - ExtensibleDynamicObject.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\model-core\org\gradle\internal\extensibility\ExtensibleDynamicObject.java
**SHA:** bdf51b9c65b02833
**Timestamp:** 2026-08-28T02:50:45.689269
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- this.dynamicDelegate = dynamicDelegate;

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2018 the original author or authors.
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
package org.gradle.internal.extensibility;

import groovy.lang.MissingMethodException;
import groovy.lang.MissingPropertyException;
import org.gradle.api.plugins.ExtraPropertiesExtension;
import org.gradle.internal.deprecation.DeprecationLogger;
import org.gradle.internal.instantiation.InstanceGenerator;
import org.gradle.internal.metaobject.AbstractDynamicObject;
import org.gradle.internal.metaobject.BeanDynamicObject;
import org.gradle.internal.metaobject.CompositeDynamicObject;
import org.gradle.internal.metaobject.DynamicInvokeResult;
import org.gradle.internal.metaobject.DynamicObject;

import javax.annotation.Nullable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * A {@link DynamicObject} implementation that provides extensibility.
 *
 * This is the dynamic object implementation that "enhanced" objects expose.
 *
 * @see org.gradle.internal.instantiation.generator.MixInExtensibleDynamicObject
 */
@SuppressWarnings("deprecation")
public class ExtensibleDynamicObject extends MixInClosurePropertiesAsMethodsDynamicObject implements org.gradle.api.internal.HasConvention {

    public enum Location {
        BeforeConvention, AfterConvention
    }

    private final AbstractDynamicObject dynamicDelegate;
    private DynamicObject parent;
    private final org.gradle.api.plugins.Convention convention;
    private DynamicObject beforeConvention;
    private DynamicObject afterConvention;
    private final DynamicObject extraPropertiesDynamicObject;

    public ExtensibleDynamicObject(Object delegate, Class<?> publicType, InstanceGenerator instanceGenerator) {
        this(delegate, createDynamicObject(delegate, publicType), new DefaultConvention(instanceGenerator));
    }

    public ExtensibleDynamicObject(Object delegate, AbstractDynamicObject dynamicDelegate, InstanceGenerator instanceGenerator) {
        this(delegate, dynamicDelegate, new DefaultConvention(instanceGenerator));
    }

    public ExtensibleDynamicObject(Object delegate, AbstractDynamicObject dynamicDelegate, org.gradle.api.plugins.Convention convention) {
        this.dynamicDelegate = dynamicDelegate;
        this.convention = convention;
        this.extraPropertiesDynamicObject = new ExtraPropertiesDynamicObjectAdapter(delegate.getClass(), convention.getExtraProperties());

        updateDelegates();
    }

    private static BeanDynamicObject createDynamicObject(Object delegate, Class<?> publicType) {
        return new BeanDynamicObject(delegate, publicType);
    }

    private void updateDelegates() {
        DynamicObject[] delegates = new DynamicObject[6];
        delegates[0] = dynamicDelegate;
        delegates[1] = extraPropertiesDynamicObject;
        int idx = 2;
        if (beforeConvention != null) {
            delegates[idx++] = beforeConvention;
        }
        if (convention != null) {
            delegates[idx++] = convention.getExtensionsAsDynamicObject();
        }
        if (afterConvention != null) {
            delegates[idx++] = afterConvention;
        }
        boolean addedParent = false;
        if (parent != null) {
            addedParent = true;
            delegates[idx++] = parent;
        }
        DynamicObject[] objects = new DynamicObject[idx];
        System.arraycopy(delegates, 0, objects, 0, idx);
        setObjects(objects);

        if (addedParent) {
            idx--;
            objects = new DynamicObject[idx];
            System.arraycopy(delegates, 0, objects, 0, idx);
            setObjectsForUpdate(objects);
        }
    }

    @Override
    public String getDisplayName() {
        return dynamicDelegate.getDisplayName();
    }

    @Nullable
    @Override
    public Class<?> getPublicType() {
        return dynamicDelegate.getPublicType();
    }

    @Override
    public boolean hasUsefulDisplayName() {
        return dynamicDelegate.hasUsefulDisplayName();
    }

    public ExtraPropertiesExtension getDynamicProperties() {
        return convention.getExtraProperties();
    }

    public DynamicObject getParent() {
        return parent;
    }

    public void setParent(DynamicObject parent) {
        this.parent = parent;
        updateDelegates();
    }

    @Override
    @Deprecated
    public org.gradle.api.plugins.Convention getConvention() {
        DeprecationLogger.deprecateType(org.gradle.api.plugins.Convention.class)
            .willB
```