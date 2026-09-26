# MISSAO - DefaultConfigurableUserClassFilePermissions.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\file-collections\org\gradle\api\internal\file\DefaultConfigurableUserClassFilePermissions.java
**SHA:** ed85515851d5115a
**Timestamp:** 2026-08-28T02:50:37.262845
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- private boolean execute = false;
- this.execute = execute;

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

import javax.inject.Inject;

public class DefaultConfigurableUserClassFilePermissions extends AbstractUserClassFilePermissions implements ConfigurableUserClassFilePermissionsInternal {

    private boolean read = false;
    private boolean write = false;
    private boolean execute = false;

    @Inject
    public DefaultConfigurableUserClassFilePermissions(int unixNumeric) {
        setRead(isRead(unixNumeric));
        setWrite(isWrite(unixNumeric));
        setExecute(isExecute(unixNumeric));
    }

    @Override
    public void unix(String unixSymbolic) {
        setRead(isRead(unixSymbolic));
        setWrite(isWrite(unixSymbolic));
        setExecute(isExecute(unixSymbolic));
    }

    @Override
    public void unix(int unixNumeric) {
        setRead(isRead(unixNumeric));
        setWrite(isWrite(unixNumeric));
        setExecute(isExecute(unixNumeric));
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

    @Override
    public void setRead(boolean read) {
        this.read = read;
    }

    @Override
    public void setWrite(boolean write) {
        this.write = write;
    }

    @Override
    public void setExecute(boolean execute) {
        this.execute = execute;
    }
}

```