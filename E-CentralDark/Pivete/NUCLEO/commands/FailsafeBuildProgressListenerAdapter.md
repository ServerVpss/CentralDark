# COMANDO - FailsafeBuildProgressListenerAdapter.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\tooling-api\org\gradle\tooling\internal\consumer\parameters\FailsafeBuildProgressListenerAdapter.java
**SHA:** e749d86a78b03c1f
**Timestamp:** 2026-08-28T02:52:05.357473
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- this.delegate = delegate;

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
package org.gradle.tooling.internal.consumer.parameters;

import org.gradle.internal.event.ListenerNotificationException;
import org.gradle.tooling.internal.protocol.InternalBuildProgressListener;

import java.util.Collections;
import java.util.List;

public class FailsafeBuildProgressListenerAdapter implements InternalBuildProgressListener {
    private final InternalBuildProgressListener delegate;
    private Throwable listenerFailure;

    public FailsafeBuildProgressListenerAdapter(InternalBuildProgressListener delegate) {
        this.delegate = delegate;
    }

    @Override
    public void onEvent(Object event) {
        if (listenerFailure != null) {
            // Discard event
            return;
        }
        try {
            delegate.onEvent(event);
        } catch (Throwable t) {
            listenerFailure = t;
        }
    }

    @Override
    public List<String> getSubscribedOperations() {
        return delegate.getSubscribedOperations();
    }

    public void rethrowErrors() {
        if (listenerFailure != null) {
            throw new ListenerNotificationException(null, "One or more progress listeners failed with an exception.", Collections.singletonList(listenerFailure));
        }
    }
}

```