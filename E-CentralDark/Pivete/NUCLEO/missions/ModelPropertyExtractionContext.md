# MISSAO - ModelPropertyExtractionContext.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\model-core\org\gradle\model\internal\manage\schema\extract\ModelPropertyExtractionContext.java
**SHA:** 560d7d485255fb4c
**Timestamp:** 2026-08-28T02:50:51.604783
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO:LPTR What happens when the property has multiple accessors in the same role but with different type?

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

package org.gradle.model.internal.manage.schema.extract;

import com.google.common.collect.ImmutableSortedSet;
import com.google.common.collect.Maps;
import com.google.common.collect.Ordering;
import org.gradle.internal.reflect.PropertyAccessorType;
import org.gradle.model.internal.type.ModelType;

import javax.annotation.Nullable;
import java.lang.reflect.Method;
import java.util.Collection;
import java.util.Map;
import java.util.Set;

import static org.gradle.internal.reflect.PropertyAccessorType.hasGetter;
import static org.gradle.internal.reflect.PropertyAccessorType.hasSetter;

public class ModelPropertyExtractionContext {

    private final String propertyName;
    private Map<PropertyAccessorType, PropertyAccessorExtractionContext> accessors;

    public ModelPropertyExtractionContext(String propertyName) {
        this.propertyName = propertyName;
        this.accessors = Maps.newEnumMap(PropertyAccessorType.class);
    }

    public String getPropertyName() {
        return propertyName;
    }

    public boolean isReadable() {
        return hasGetter(accessors.keySet());
    }

    public boolean isWritable() {
        return hasSetter(accessors.keySet());
    }

    public void addAccessor(PropertyAccessorExtractionContext accessor) {
        PropertyAccessorType type = accessor.getAccessorType();
        // TODO:LPTR What happens when the property has multiple accessors in the same role but with different type?
        // if (accessors.containsKey(type)) {
        //     throw new IllegalStateException("Accessor already registered: " + type + " " + accessor);
        // }
        accessors.put(type, accessor);
    }

    @Nullable
    public PropertyAccessorExtractionContext getAccessor(PropertyAccessorType type) {
        return accessors.get(type);
    }

    public Collection<PropertyAccessorExtractionContext> getAccessors() {
        return accessors.values();
    }

    public Set<ModelType<?>> getDeclaredBy() {
        ImmutableSortedSet.Builder<ModelType<?>> declaredBy = new ImmutableSortedSet.Builder<ModelType<?>>(Ordering.usingToString());
        for (PropertyAccessorExtractionContext accessor : accessors.values()) {
            for (Method method : accessor.getDeclaringMethods()) {
                declaredBy.add(ModelType.declaringType(method));
            }
        }
        return declaredBy.build();
    }

}

```