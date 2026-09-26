# MISSAO - ServiceScopeValidator.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\service-registry-impl\org\gradle\internal\service\ServiceScopeValidator.java
**SHA:** f371a2ffaad4fb34
**Timestamp:** 2026-08-28T02:51:37.980013
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: use the implementation from `org.gradle.internal.reflect.Types`, when its available for `:base-services`

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2023 the original author or authors.
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

package org.gradle.internal.service;

import org.gradle.internal.InternalTransformer;
import org.gradle.internal.service.scopes.Scope;
import org.gradle.internal.service.scopes.ServiceScope;

import javax.annotation.Nullable;
import java.lang.annotation.Annotation;
import java.util.ArrayDeque;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Queue;
import java.util.Set;

import static org.gradle.util.internal.ArrayUtils.contains;
import static org.gradle.util.internal.CollectionUtils.join;

/**
 * Checks that services are being declared in the correct scope.
 * <p>
 * Only services that are annotated with {@link ServiceScope} are validated.
 * In {@link #strict}-mode all services must be annotated.
 */
class ServiceScopeValidator implements AnnotatedServiceLifecycleHandler {

    private static final List<Class<? extends Annotation>> SCOPE_ANNOTATIONS = Collections.<Class<? extends Annotation>>singletonList(ServiceScope.class);

    private final Class<? extends Scope> scope;
    private final boolean strict;

    public ServiceScopeValidator(Class<? extends Scope> scope, boolean strict) {
        this.scope = scope;
        this.strict = strict;
    }

    @Override
    public List<Class<? extends Annotation>> getAnnotations() {
        return SCOPE_ANNOTATIONS;
    }

    @Override
    public Class<? extends Annotation> getImplicitAnnotation() {
        return ServiceScope.class;
    }

    @Override
    public void whenRegistered(Class<? extends Annotation> annotation, Registration registration) {
        for (Class<?> declaredType : registration.getDeclaredTypes()) {
            validateScope(declaredType);
        }
    }

    private void validateScope(Class<?> serviceType) {
        if (ServiceScopeValidator.class.isAssignableFrom(serviceType)) {
            return;
        }

        if (ServiceScopeValidatorWorkarounds.shouldSuppressValidation(serviceType)) {
            return;
        }

        Class<? extends Scope>[] serviceScopes = scopeOf(serviceType);

        if (serviceScopes == null) {
            if (strict) {
                failWithMissingScope(serviceType);
            }
            return;
        }

        if (serviceScopes.length == 0) {
            throw new IllegalArgumentException(String.format("Service '%s' is declared with empty scope list", serviceType.getName()));
        }

        if (!contains(serviceScopes, scope)) {
            throw new IllegalArgumentException(invalidScopeMessage(serviceType, serviceScopes));
        }
    }

    private void failWithMissingScope(Class<?> serviceType) {
        Set<Class<?>> annotatedSupertypes = findAnnotatedSupertypes(serviceType);
        if (annotatedSupertypes.size() != 1) {
            throw new IllegalArgumentException(missingScopeMessage(serviceType));
        }

        // TODO(alllex): let the registration explicitly provide the Class of the implementation
        Class<?> inferredServiceType = annotatedSupertypes.iterator().next();
        throw new IllegalArgumentException(implementationWithMissingScopeMessage(inferredServiceType, serviceType));
    }

    // TODO: use the implementation from `org.gradle.internal.reflect.Types`, when its available for `:base-services`
    private static Set<Class<?>> findAnnotatedSupertypes(Class<?> serviceType) {
        Set<Class<?>> annotatedSuperTypes = new LinkedHashSet<Class<?>>();

        Set<Class<?>> seen = new HashSet<Class<?>>();
        seen.add(Object.class);

        Queue<Class<?>> queue = new ArrayDeque<Class<?>>();
        queue.add(serviceType);

        while (!queue.isEmpty()) {
            Class<?> type = queue.remove();
            if (scopeOf(type) != null) {
                annotatedSuperTypes.add(type);
                continue;
            }

            if (type.getSuperclass() != null) {
                queue.add(type.getSuperclass());
            }
            for (Class<?> superInterface : type.getInterfaces()) {
                if (seen.add(superInterface)) {
                    queue.add(superInterface);
                }
            }
        }

        return annotatedSuperTypes;
    }

    private String invalidScopeMessage(Class<?> serviceType, Class<? extends Scope>[] actualScopes) {
        return String.format(
            "The service '%s' declares %s but is regist
```