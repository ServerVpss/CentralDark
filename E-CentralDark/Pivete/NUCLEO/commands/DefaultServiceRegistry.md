# COMANDO - DefaultServiceRegistry.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\service-registry-impl\org\gradle\internal\service\DefaultServiceRegistry.java
**SHA:** 1040a4c4acf17ec4
**Timestamp:** 2026-08-28T02:51:37.741398
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- this.delegate = delegate;
- this.delegate = delegate;

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2010 the original author or authors.
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

import org.gradle.internal.Cast;
import org.gradle.internal.Factory;
import org.gradle.internal.InternalTransformer;
import org.gradle.internal.concurrent.CompositeStoppable;
import org.gradle.internal.concurrent.Stoppable;

import javax.annotation.Nullable;
import java.io.Closeable;
import java.lang.annotation.Annotation;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.lang.reflect.WildcardType;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Formatter;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.Set;
import java.util.TreeSet;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicReference;

import static java.util.Collections.singletonList;
import static org.gradle.util.internal.CollectionUtils.collect;
import static org.gradle.util.internal.CollectionUtils.join;

/**
 * A hierarchical {@link ServiceRegistry} implementation.
 *
 * <p>Subclasses can register services by:</p>
 *
 * <ul>
 *
 * <li>Calling {@link #add(Class, Object)} or {@link #add(Object)} to register a service instance.</li>
 *
 * <li>Calling {@link #addProvider(ServiceRegistrationProvider)} to register a service provider bean. A provider bean may have factory, decorator and configuration methods as described below.</li>
 *
 * <li>Adding a factory method. A factory method should be annotated with {@literal @}{@link Provides}, have a name that starts with 'create', and have a non-void return type.
 * For example, <code>@Provides protected SomeService createSomeService() { ....
 * }</code>.
 * Parameters are injected using services from this registry or its parents. Parameter of type {@link ServiceRegistry} will receive the service registry that owns the service. Parameter of
 * type {@code List<T>} will receive all services of type {@code T}, if any.
 * If a parameter has the same type as the return type of the factory method, then that parameter will be located in the parent registry.
 * This allows decorating services, i.e. specializing a service from a parent scope.</li>
 *
 * <li>Adding a configure method. A configure method should be called 'configure', take a {@link ServiceRegistration} parameter, and a have a void return type. Additional parameters are injected using
 * services from this registry or its parents.</li>
 *
 * </ul>
 *
 * <p>Service instances are created on demand. {@link #getFactory(Class)} looks for a service instance which implements {@code Factory<T>} where {@code T} is the expected type.</p>
 *
 * <p>Service instances and factories are closed when the registry that created them is closed using {@link #close()}. If a service instance or factory implements {@link java.io.Closeable} or {@link
 * org.gradle.internal.concurrent.Stoppable} then the appropriate {@link Closeable#close()} or {@link Stoppable#stop()} method is called. Instances are closed in reverse dependency order.</p>
 *
 * <p>Service registries are arranged in a hierarchy. If a service of a given type cannot be located, the registry uses its parent registry, if any, to locate the service.</p>
 *
 * <p>Service interfaces should be annotated with {@link org.gradle.internal.service.scopes.ServiceScope} to indicate their intended usage.</p>
 *
 * <p>Service interfaces can be annotated with {@link org.gradle.internal.service.scopes.StatefulListener} to indicate that services instances that implement the interface should
 * be registered as a listener of that type. Alternatively, service implementations can be annotated with {@link org.gradle.internal.service.scopes.ListenerService} to indicate that the should be
 * registered as a listener.</p>
 */
public class DefaultServiceRegistry implements CloseableServiceRegistry, ContainsServices, ServiceRegistrationProvider {
    private enum State {INIT, STARTED, CLOSED}

    private final static ServiceRegistry[] NO_PARENTS = new ServiceRegistry[0];
    private final static Service[] NO_DEPENDENTS = new Service[0];
    private final static Object
```