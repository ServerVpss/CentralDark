# MISSAO - StreamFailureMessage.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\messaging\org\gradle\internal\remote\internal\hub\protocol\StreamFailureMessage.java
**SHA:** afa3181ec7324412
**Timestamp:** 2026-08-28T02:50:42.662317
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: This should actually be a Routable message with a single handler,

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2016 the original author or authors.
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

package org.gradle.internal.remote.internal.hub.protocol;

public class StreamFailureMessage extends InterHubMessage {
    private final Throwable failure;

    public StreamFailureMessage(Throwable failure) {
        this.failure = failure;
    }

    @Override
    public Delivery getDelivery() {
        // TODO: This should actually be a Routable message with a single handler,
        // but we need some way to correlate a given request with a specific response channel
        return Delivery.AllHandlers;
    }

    public Throwable getFailure() {
        return failure;
    }
}

```