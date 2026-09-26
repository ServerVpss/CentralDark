# COMANDO - BeanDynamicObject.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\model-core\org\gradle\internal\metaobject\BeanDynamicObject.java
**SHA:** f9e5f9bd7e5d54e2
**Timestamp:** 2026-08-28T02:50:46.262060
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- this.delegate = determineDelegate(bean);

### Gaps
- this.implementsMissing = implementsMissing;
- if (withNoImplementsMissing == null) {
- withNoImplementsMissing = new BeanDynamicObject(bean, publicType, includeProperties, false, propertySetTransformer, argsTransformer);
- MetaMethod propertyMissing = findGetPropertyMissingMethod(metaClass);

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
package org.gradle.internal.metaobject;

import groovy.lang.GroovyObject;
import groovy.lang.GroovySystem;
import groovy.lang.MetaBeanProperty;
import groovy.lang.MetaClass;
import groovy.lang.MetaClassImpl;
import groovy.lang.MetaMethod;
import groovy.lang.MetaProperty;
import groovy.lang.MissingMethodException;
import groovy.lang.MissingPropertyException;
import org.codehaus.groovy.runtime.InvokerInvocationException;
import org.codehaus.groovy.runtime.MetaClassHelper;
import org.codehaus.groovy.runtime.metaclass.MultipleSetterProperty;
import org.codehaus.groovy.runtime.typehandling.DefaultTypeTransformation;
import org.gradle.api.internal.DynamicObjectAware;
import org.gradle.api.internal.coerce.MethodArgumentsTransformer;
import org.gradle.api.internal.coerce.PropertySetTransformer;
import org.gradle.api.internal.coerce.StringToEnumTransformer;
import org.gradle.api.internal.provider.support.LazyGroovySupport;
import org.gradle.api.provider.HasConfigurableValue;
import org.gradle.internal.Cast;
import org.gradle.internal.UncheckedException;
import org.gradle.internal.reflect.JavaPropertyReflectionUtil;
import org.gradle.internal.state.ModelObject;

import javax.annotation.Nullable;
import java.lang.invoke.MethodHandle;
import java.lang.invoke.MethodHandles;
import java.lang.invoke.MethodType;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * A {@link DynamicObject} which uses groovy reflection to provide access to the properties and methods of a bean.
 *
 * <p>Uses some deep hacks to avoid some expensive reflections and the use of exceptions when a particular property or method cannot be found,
 * for example, when a decorated object is used as the delegate of a configuration closure. Also uses some hacks to insert some customised type
 * coercion and error reporting. Enjoy.
 */
public class BeanDynamicObject extends AbstractDynamicObject {
    private static final Method META_PROP_METHOD;
    private static final Field MISSING_PROPERTY_GET_METHOD;
    private static final Field MISSING_PROPERTY_SET_METHOD;
    private static final Field MISSING_METHOD_METHOD;
    private final Object bean;
    private final boolean includeProperties;
    private final MetaClassAdapter delegate;
    private final boolean implementsMissing;
    @Nullable
    private final Class<?> publicType;

    private final MethodArgumentsTransformer argsTransformer;
    private final PropertySetTransformer propertySetTransformer;

    private BeanDynamicObject withNoProperties;
    private BeanDynamicObject withNoImplementsMissing;

    static {
        try {
            META_PROP_METHOD = MetaClassImpl.class.getDeclaredMethod("getMetaProperty", String.class, boolean.class);
            META_PROP_METHOD.setAccessible(true);
            MISSING_PROPERTY_GET_METHOD = MetaClassImpl.class.getDeclaredField("propertyMissingGet");
            MISSING_PROPERTY_GET_METHOD.setAccessible(true);
            MISSING_PROPERTY_SET_METHOD = MetaClassImpl.class.getDeclaredField("propertyMissingSet");
            MISSING_PROPERTY_SET_METHOD.setAccessible(true);
            MISSING_METHOD_METHOD = MetaClassImpl.class.getDeclaredField("methodMissing");
            MISSING_METHOD_METHOD.setAccessible(true);
        } catch (Exception e) {
            throw UncheckedException.throwAsUncheckedException(e);
        }
    }

    public BeanDynamicObject(Object bean) {
        this(bean, null, true, true, StringToEnumTransformer.INSTANCE, StringToEnumTransformer.INSTANCE);
    }

    public BeanDynamicObject(Object bean, @Nullable Class<?> publicType) {
        this(bean, publicType, true, true, StringToEnumTransformer.INSTANCE, StringToEnumTransformer.INSTANCE);
    }

    BeanDynamicObject(Object bean, @Nullable Class<?> publicType, boolean includeProperties, boolean implementsMissing, PropertySetTransformer propertySetTransformer, MethodArgumentsTransformer methodArgumentsTransformer) {
        if (bean == null) {
            throw new IllegalArgumentException("Value is null");
        }
        this.bean = bean;
        this.publicType = publicType;
        this.includeProperties = includeProperties;
        this.implementsMissing = implementsMissing;
        this.prope
```