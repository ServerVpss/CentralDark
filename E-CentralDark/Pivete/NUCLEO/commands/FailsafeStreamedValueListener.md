# COMANDO - FailsafeStreamedValueListener.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\tooling-api\org\gradle\tooling\internal\consumer\parameters\FailsafeStreamedValueListener.java
**SHA:** 9a40029e847c9d09
**Timestamp:** 2026-08-28T02:52:05.382968
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- this.delegate = delegate;

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

package org.gradle.tooling.internal.consumer.parameters;

import org.gradle.internal.event.ListenerNotificationException;
import org.gradle.tooling.StreamedValueListener;

import javax.annotation.Nullable;
import java.util.Collections;

public class FailsafeStreamedValueListener implements StreamedValueListener {
    @Nullable
    private final StreamedValueListener delegate;
    private RuntimeException failure;

    public FailsafeStreamedValueListener(@Nullable StreamedValueListener delegate) {
        this.delegate = delegate;
    }

    @Override
    public void onValue(Object value) {
        if (failure != null) {
            // Stop handling further values after a failure
            return;
        }

        if (delegate != null) {
            try {
                delegate.onValue(value);
            } catch (Throwable e) {
                failure = new ListenerNotificationException(null, "Streaming model listener failed with an exception.", Collections.singletonList(e));
            }
        } else {
            failure = new IllegalStateException("No streaming model listener registered.");
        }
    }

    public void rethrowErrors() {
        if (failure != null) {
            throw failure;
        }
    }
}

```