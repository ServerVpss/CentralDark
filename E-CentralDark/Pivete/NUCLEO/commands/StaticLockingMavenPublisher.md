# COMANDO - StaticLockingMavenPublisher.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\maven\org\gradle\api\publish\maven\internal\publisher\StaticLockingMavenPublisher.java
**SHA:** f05b51ae28ef452e
**Timestamp:** 2026-08-28T02:50:40.903989
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- this.delegate = delegate;

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2013 the original author or authors.
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
package org.gradle.api.publish.maven.internal.publisher;

import org.gradle.api.artifacts.repositories.MavenArtifactRepository;

import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * A MavenPublisher that restricts publishing to a single thread per Classloader that loads this class.
 * This is required to prevent concurrent access to the Maven Ant Tasks, which hold static state.
 */
public class StaticLockingMavenPublisher implements MavenPublisher {
    private static final Lock STATIC_LOCK = new ReentrantLock();
    private final MavenPublisher delegate;

    public StaticLockingMavenPublisher(MavenPublisher delegate) {
        this.delegate = delegate;
    }

    @Override
    public void publish(MavenNormalizedPublication publication, MavenArtifactRepository artifactRepository) {
        STATIC_LOCK.lock();
        try {
            delegate.publish(publication, artifactRepository);
        } finally {
            STATIC_LOCK.unlock();
        }
    }
}

```