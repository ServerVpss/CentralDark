# COMANDO - DefaultTaskDependency.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\model-core\org\gradle\api\internal\tasks\DefaultTaskDependency.java
**SHA:** 5c8685ea87cb344c
**Timestamp:** 2026-08-28T02:50:44.903922
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- private final Set<Object> delegate = new HashSet<>();

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

package org.gradle.api.internal.tasks;

import com.google.common.collect.ImmutableSet;
import groovy.lang.Closure;
import org.gradle.api.Buildable;
import org.gradle.api.InvalidUserDataException;
import org.gradle.api.Task;
import org.gradle.api.internal.provider.ProviderInternal;
import org.gradle.api.internal.provider.ValueSupplier;
import org.gradle.api.tasks.TaskDependency;
import org.gradle.internal.Cast;
import org.gradle.internal.typeconversion.UnsupportedNotationException;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import java.nio.file.Path;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Deque;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;
import java.util.Map;
import java.util.RandomAccess;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.function.Consumer;

import static com.google.common.collect.Iterables.toArray;
import static org.gradle.internal.UncheckedException.uncheckedCall;

/**
 * A task dependency which can have both mutable and immutable dependency values.
 *
 * If dependencies are known up-front, it is much more efficient to pass
 * them as immutable values to the {@link DefaultTaskDependency#DefaultTaskDependency(TaskResolver, ImmutableSet, TaskDependencyUsageTracker)}
 * constructor than to use the {@link #add(Object...)} method, as the former will
 * require less memory to store them.
 */
public class DefaultTaskDependency extends AbstractTaskDependency {
    private final ImmutableSet<Object> immutableValues;
    private Set<Object> mutableValues;
    private final TaskResolver resolver;

    public DefaultTaskDependency() {
        this(null, null);
    }

    public DefaultTaskDependency(
        @Nullable TaskResolver resolver,
        @Nullable TaskDependencyUsageTracker taskDependencyUsageTracker
    ) {
        this(resolver, ImmutableSet.of(), taskDependencyUsageTracker);
    }

    public DefaultTaskDependency(
        @Nullable TaskResolver resolver,
        ImmutableSet<Object> immutableValues,
        @Nullable TaskDependencyUsageTracker taskDependencyUsageTracker
    ) {
        super(taskDependencyUsageTracker);
        this.resolver = resolver;
        this.immutableValues = immutableValues;
    }

    @Override
    public void visitDependencies(final TaskDependencyResolveContext context) {
        Set<Object> mutableValues = getMutableValues();
        if (mutableValues.isEmpty() && immutableValues.isEmpty()) {
            return;
        }
        final Deque<Object> queue = new ArrayDeque<Object>(mutableValues.size() + immutableValues.size());
        queue.addAll(immutableValues);
        queue.addAll(mutableValues);
        while (!queue.isEmpty()) {
            Object dependency = queue.removeFirst();
            if (dependency instanceof Buildable) {
                context.add(dependency);
            } else if (dependency instanceof Task) {
                context.add(dependency);
            } else if (dependency instanceof TaskDependency) {
                context.add(dependency);
            } else if (dependency instanceof ProviderInternal) {
                // When a Provider is used as a task dependency (rather than as a task input), need to unpack the value
                ProviderInternal<?> provider = (ProviderInternal<?>) dependency;
                ValueSupplier.ValueProducer producer = provider.getProducer();
                if (producer.isKnown()) {
                    producer.visitDependencies(context);
                } else {
                    // The provider does not know how to produce the value, so use the value instead
                    queue.addFirst(provider.get());
                }
            } else if (dependency instanceof TaskDependencyContainer) {
                ((TaskDependencyContainer) dependency).visitDependencies(context);
            } else if (dependency instanceof Closure) {
                Closure closure = (Closure) dependency;
                Object closureResult = closure.call(context.getTask());
                if (closureResult != null) {
                    queue.addFirst(closureResult);
                }
            } else if (dependency instanceof List) {
                List<?> list = (List) dependency;
                if (list instanc
```