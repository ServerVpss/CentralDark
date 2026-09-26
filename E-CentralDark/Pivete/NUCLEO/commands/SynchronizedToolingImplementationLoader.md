# COMANDO - SynchronizedToolingImplementationLoader.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\tooling-api\org\gradle\tooling\internal\consumer\loader\SynchronizedToolingImplementationLoader.java
**SHA:** ad603a055d242238
**Timestamp:** 2026-08-28T02:52:05.237957
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- this.delegate = delegate;

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2011 the original author or authors.
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

package org.gradle.tooling.internal.consumer.loader;

import org.gradle.initialization.BuildCancellationToken;
import org.gradle.internal.concurrent.CompositeStoppable;
import org.gradle.internal.logging.progress.ProgressLogger;
import org.gradle.internal.logging.progress.ProgressLoggerFactory;
import org.gradle.tooling.internal.consumer.ConnectionParameters;
import org.gradle.tooling.internal.consumer.Distribution;
import org.gradle.tooling.internal.consumer.connection.ConsumerConnection;
import org.gradle.tooling.internal.protocol.InternalBuildProgressListener;

import java.io.Closeable;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

public class SynchronizedToolingImplementationLoader implements ToolingImplementationLoader, Closeable {
    private final Lock lock = new ReentrantLock();
    private final ToolingImplementationLoader delegate;

    public SynchronizedToolingImplementationLoader(ToolingImplementationLoader delegate) {
        this.delegate = delegate;
    }

    @Override
    public ConsumerConnection create(Distribution distribution, ProgressLoggerFactory progressLoggerFactory, InternalBuildProgressListener progressListener, ConnectionParameters connectionParameters, BuildCancellationToken cancellationToken) {
        if (lock.tryLock()) {
            try {
                return delegate.create(distribution, progressLoggerFactory, progressListener, connectionParameters, cancellationToken);
            } finally {
                lock.unlock();
            }
        }
        ProgressLogger logger = progressLoggerFactory.newOperation(SynchronizedToolingImplementationLoader.class);
        logger.setDescription("Wait for the other thread to finish acquiring the distribution");
        logger.started();
        lock.lock();
        try {
            return delegate.create(distribution, progressLoggerFactory, progressListener, connectionParameters, cancellationToken);
        } finally {
            lock.unlock();
            logger.completed();
        }
    }

    @Override
    public void close() {
        lock.lock();
        try {
            CompositeStoppable.stoppable(delegate).stop();
        } finally {
            lock.unlock();
        }
    }
}

```