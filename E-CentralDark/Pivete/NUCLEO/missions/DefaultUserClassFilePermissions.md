# MISSAO - DefaultUserClassFilePermissions.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\file-collections\org\gradle\api\internal\file\DefaultUserClassFilePermissions.java
**SHA:** f4683f6e2f1a9694
**Timestamp:** 2026-08-28T02:50:37.296081
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- execute = isExecute(unixNumeric);

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

package org.gradle.api.internal.file;

public class DefaultUserClassFilePermissions extends AbstractUserClassFilePermissions {

    private final boolean read;
    private final boolean write;
    private final boolean execute;

    public DefaultUserClassFilePermissions(int unixNumeric) {
        read = isRead(unixNumeric);
        write = isWrite(unixNumeric);
        execute = isExecute(unixNumeric);
    }

    @Override
    public boolean getRead() {
        return read;
    }

    @Override
    public boolean getWrite() {
        return write;
    }

    @Override
    public boolean getExecute() {
        return execute;
    }
}

```