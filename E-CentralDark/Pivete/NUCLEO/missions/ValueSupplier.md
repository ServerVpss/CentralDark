# MISSAO - ValueSupplier.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\model-core\org\gradle\api\internal\provider\ValueSupplier.java
**SHA:** b3583a5a6b5be483
**Timestamp:** 2026-08-28T02:50:44.426766
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- Value<Object> MISSING = new Missing<>();
- private static final MissingExecutionTimeValue MISSING = new MissingExecutionTimeValue();

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2019 the original author or authors.
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

package org.gradle.api.internal.provider;

import com.google.common.collect.ImmutableList;
import org.gradle.api.Action;
import org.gradle.api.Task;
import org.gradle.api.Transformer;
import org.gradle.api.internal.tasks.TaskDependencyContainer;
import org.gradle.api.internal.tasks.TaskDependencyResolveContext;
import org.gradle.internal.Cast;
import org.gradle.internal.DisplayName;

import javax.annotation.Nullable;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Encapsulates the production of some value by some producer.
 * <p>
 * All providers implement this interface, but this interface may be implemented whenever
 * lazy evaluation is required.
 * </p>
 */
public interface ValueSupplier {
    /**
     * Visits the producer of the value for this supplier. This might be one or more tasks, some external location, nothing (for a fixed value) or might unknown.
     */
    ValueProducer getProducer();

    boolean calculatePresence(ValueConsumer consumer);

    enum ValueConsumer {
        DisallowUnsafeRead, IgnoreUnsafeRead
    }

    /**
     * Carries information about the producer of a value.
     */
    @SuppressWarnings("ClassInitializationDeadlock")
    interface ValueProducer extends TaskDependencyContainer {
        NoProducer NO_PRODUCER = new NoProducer();
        UnknownProducer UNKNOWN_PRODUCER = new UnknownProducer();

        default boolean isKnown() {
            return true;
        }

        @Override
        default void visitDependencies(TaskDependencyResolveContext context) {
            visitProducerTasks(context);
        }

        void visitProducerTasks(Action<? super Task> visitor);

        default void visitContentProducerTasks(Action<? super Task> visitor) {
            visitProducerTasks(visitor);
        }

        default ValueProducer plus(ValueProducer producer) {
            if (this == NO_PRODUCER) {
                return producer;
            }
            if (producer == NO_PRODUCER) {
                return this;
            }
            if (producer == this) {
                return this;
            }
            return new PlusProducer(this, producer);
        }

        static ValueProducer noProducer() {
            return NO_PRODUCER;
        }

        static ValueProducer unknown() {
            return UNKNOWN_PRODUCER;
        }

        static ValueProducer externalValue() {
            // At the moment, external values do not differ from values without the producer.
            return NO_PRODUCER;
        }

        /**
         * Value and its contents are produced by task.
         */
        static ValueProducer task(Task task) {
            return new TaskProducer(task, true);
        }

        /**
         * Value is produced from the properties of the task, and carries an implicit dependency on the task
         */
        static ValueProducer taskState(Task task) {
            return new TaskProducer(task, false);
        }
    }

    class TaskProducer implements ValueProducer {
        private final Task task;
        private final boolean content;

        public TaskProducer(Task task, boolean content) {
            this.task = task;
            this.content = content;
        }

        @Override
        public void visitProducerTasks(Action<? super Task> visitor) {
            visitor.execute(task);
        }

        @Override
        public void visitContentProducerTasks(Action<? super Task> visitor) {
            if (content) {
                visitor.execute(task);
            }
        }
    }

    class PlusProducer implements ValueProducer {
        private final ValueProducer left;
        private final ValueProducer right;

        public PlusProducer(ValueProducer left, ValueProducer right) {
            this.left = left;
            this.right = right;
        }

        @Override
        public boolean isKnown() {
            return left.isKnown() || right.isKnown();
        }

        @Override
        public void visitProducerTasks(Action<? super Task> visitor) {
            left.visitProducerTasks(visitor);
            right.visitProducerTasks(visitor);
        }
    }

    class UnknownProducer implements ValueProducer {
        @Override
        public boolean isKnown() {
            return false;
        }

        @Override
        public void visitPro
```