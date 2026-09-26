# COMANDO - Collectors.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\model-core\org\gradle\api\internal\provider\Collectors.java
**SHA:** fbae8d8acac2c136
**Timestamp:** 2026-08-28T02:50:43.495051
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- this.delegate = delegate;

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

package org.gradle.api.internal.provider;

import com.google.common.base.Objects;
import com.google.common.collect.ImmutableCollection;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Iterables;
import org.gradle.api.provider.Provider;

import javax.annotation.Nullable;
import java.util.Arrays;

import static org.gradle.api.internal.lambdas.SerializableLambdas.transformer;

public class Collectors {
    public interface ProvidedCollector<T> extends Collector<T> {
        boolean isProvidedBy(Provider<?> provider);
    }

    public static class SingleElement<T> implements Collector<T> {
        private final T element;

        public SingleElement(T element) {
            this.element = element;
        }

        @Override
        public boolean calculatePresence(ValueConsumer consumer) {
            return true;
        }

        @Override
        public Value<Void> collectEntries(ValueConsumer consumer, ValueCollector<T> collector, ImmutableCollection.Builder<T> collection) {
            collector.add(element, collection);
            return Value.present();
        }

        @Override
        public ExecutionTimeValue<? extends Iterable<? extends T>> calculateExecutionTimeValue() {
            return ExecutionTimeValue.fixedValue(ImmutableList.of(element));
        }

        @Override
        public ValueProducer getProducer() {
            return ValueProducer.unknown();
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) {
                return true;
            }
            if (o == null || getClass() != o.getClass()) {
                return false;
            }
            SingleElement<?> that = (SingleElement<?>) o;
            return Objects.equal(element, that.element);
        }

        @Override
        public int hashCode() {
            return Objects.hashCode(element);
        }

        @Override
        public int size() {
            return 1;
        }

        @Override
        public String toString() {
            return String.format("[%s]", element);
        }
    }

    public static class ElementFromProvider<T> implements ProvidedCollector<T> {
        private final ProviderInternal<? extends T> provider;

        public ElementFromProvider(ProviderInternal<? extends T> provider) {
            this.provider = provider;
        }

        @Override
        public boolean calculatePresence(ValueConsumer consumer) {
            return provider.calculatePresence(consumer);
        }

        @Override
        public Value<Void> collectEntries(ValueConsumer consumer, ValueCollector<T> collector, ImmutableCollection.Builder<T> collection) {
            Value<? extends T> value = provider.calculateValue(consumer);
            if (value.isMissing()) {
                return value.asType();
            }

            collector.add(value.getWithoutSideEffect(), collection);
            return Value.present().withSideEffect(SideEffect.fixedFrom(value));
        }

        @Override
        public boolean isProvidedBy(Provider<?> provider) {
            return Objects.equal(provider, this.provider);
        }

        @Override
        public ExecutionTimeValue<? extends Iterable<? extends T>> calculateExecutionTimeValue() {
            ExecutionTimeValue<? extends T> value = provider.calculateExecutionTimeValue();
            return visitValue(value);
        }

        @Override
        public ValueProducer getProducer() {
            return provider.getProducer();
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) {
                return true;
            }
            if (o == null || getClass() != o.getClass()) {
                return false;
            }
            ElementFromProvider<?> that = (ElementFromProvider<?>) o;
            return Objects.equal(provider, that.provider);
        }

        @Override
        public int hashCode() {
            return Objects.hashCode(provider);
        }

        @Override
        public int size() {
            return 1;
        }

        @Override
        public String toString() {
            return String.format("item(%s)", provider);
        }
    }

    private static <T> ValueSupplier.ExecutionTimeValue<? extends Iterable<? extends T>> visitValue(ValueSupplier.ExecutionTimeValue<? extends T> value
```