# MISSAO - TestEventSerializer.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\testing-base-infrastructure\org\gradle\api\internal\tasks\testing\worker\TestEventSerializer.java
**SHA:** 1e5aa4cb09237269
**Timestamp:** 2026-08-28T02:51:50.530282
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: These could be optimized to only write out fields when necessary

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

package org.gradle.api.internal.tasks.testing.worker;

import org.gradle.api.NonNullApi;
import org.gradle.api.internal.tasks.testing.AssertionFailureDetails;
import org.gradle.api.internal.tasks.testing.AssumptionFailureDetails;
import org.gradle.api.internal.tasks.testing.DefaultNestedTestSuiteDescriptor;
import org.gradle.api.internal.tasks.testing.DefaultParameterizedTestDescriptor;
import org.gradle.api.internal.tasks.testing.DefaultTestClassDescriptor;
import org.gradle.api.internal.tasks.testing.DefaultTestClassRunInfo;
import org.gradle.api.internal.tasks.testing.DefaultTestDescriptor;
import org.gradle.api.internal.tasks.testing.DefaultTestFailure;
import org.gradle.api.internal.tasks.testing.DefaultTestFailureDetails;
import org.gradle.api.internal.tasks.testing.DefaultTestMethodDescriptor;
import org.gradle.api.internal.tasks.testing.DefaultTestOutputEvent;
import org.gradle.api.internal.tasks.testing.DefaultTestSuiteDescriptor;
import org.gradle.api.internal.tasks.testing.FileComparisonFailureDetails;
import org.gradle.api.internal.tasks.testing.TestCompleteEvent;
import org.gradle.api.internal.tasks.testing.TestFailureSerializationException;
import org.gradle.api.internal.tasks.testing.TestStartEvent;
import org.gradle.api.tasks.testing.TestFailure;
import org.gradle.api.tasks.testing.TestFailureDetails;
import org.gradle.api.tasks.testing.TestOutputEvent;
import org.gradle.api.tasks.testing.TestResult;
import org.gradle.internal.id.CompositeIdGenerator;
import org.gradle.internal.serialize.BaseSerializerFactory;
import org.gradle.internal.serialize.Decoder;
import org.gradle.internal.serialize.DefaultSerializerRegistry;
import org.gradle.internal.serialize.Encoder;
import org.gradle.internal.serialize.Serializer;
import org.gradle.internal.serialize.SerializerRegistry;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class TestEventSerializer {
    public static SerializerRegistry create() {
        BaseSerializerFactory factory = new BaseSerializerFactory();
        DefaultSerializerRegistry registry = new DefaultSerializerRegistry();
        registry.register(DefaultTestClassRunInfo.class, new DefaultTestClassRunInfoSerializer());
        registry.register(CompositeIdGenerator.CompositeId.class, new IdSerializer());
        registry.register(DefaultNestedTestSuiteDescriptor.class, new DefaultNestedTestSuiteDescriptorSerializer());
        registry.register(DefaultParameterizedTestDescriptor.class, new DefaultParameterizedTestDescriptorSerializer());
        registry.register(DefaultTestSuiteDescriptor.class, new DefaultTestSuiteDescriptorSerializer());
        registry.register(WorkerTestClassProcessor.WorkerTestSuiteDescriptor.class, new WorkerTestSuiteDescriptorSerializer());
        registry.register(DefaultTestClassDescriptor.class, new DefaultTestClassDescriptorSerializer());
        registry.register(DefaultTestMethodDescriptor.class, new DefaultTestMethodDescriptorSerializer());
        registry.register(DefaultTestDescriptor.class, new DefaultTestDescriptorSerializer());
        registry.register(TestStartEvent.class, new TestStartEventSerializer());
        registry.register(TestCompleteEvent.class, new TestCompleteEventSerializer());
        registry.register(DefaultTestOutputEvent.class, new DefaultTestOutputEventSerializer());
        Serializer<Throwable> throwableSerializer = factory.getSerializerFor(Throwable.class);
        registry.register(Throwable.class, throwableSerializer);
        registry.register(TestFailure.class, new DefaultTestFailureSerializer(throwableSerializer));
        return registry;
    }

    private static class NullableSerializer<T> implements Serializer<T> {
        private final Serializer<T> serializer;

        private NullableSerializer(Serializer<T> serializer) {
            this.serializer = serializer;
        }

        @Override
        public T read(Decoder decoder) throws Exception {
            if (!decoder.readBoolean()) {
                return null;
            }
            return serializer.read(decoder);
        }

        @Override
        public void write(Encoder encoder, T value) throws Exception {
            encoder.writeBoolean(value != null);
            if (value != null) {
                serializer.write(encoder, value);
            }
        }
    }

    private static class IdS
```