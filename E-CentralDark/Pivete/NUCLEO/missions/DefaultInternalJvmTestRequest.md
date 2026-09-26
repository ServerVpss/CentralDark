# MISSAO - DefaultInternalJvmTestRequest.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\tooling-api\org\gradle\tooling\internal\consumer\DefaultInternalJvmTestRequest.java
**SHA:** 1727cbbe2895e550
**Timestamp:** 2026-08-28T02:52:03.614713
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- this.testPattern = testPattern;

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

package org.gradle.tooling.internal.consumer;

import org.gradle.tooling.internal.protocol.test.InternalJvmTestRequest;

import javax.annotation.Nullable;

public class DefaultInternalJvmTestRequest implements InternalJvmTestRequest {
    private final String className;
    private final String methodName;
    private final String testPattern;

    public DefaultInternalJvmTestRequest(String className, @Nullable String methodName, @Nullable String testPattern) {
        this.className = className;
        this.methodName = methodName;
        this.testPattern = testPattern;
    }

    @Override
    public String getClassName() {
        return className;
    }

    @Override
    public String getMethodName() {
        return methodName;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        DefaultInternalJvmTestRequest that = (DefaultInternalJvmTestRequest) o;

        if (className != null ? !className.equals(that.className) : that.className != null) {
            return false;
        }

        if (methodName != null ? !methodName.equals(that.methodName) : that.methodName != null) {
            return false;
        }

        return !(testPattern != null ? !testPattern.equals(that.testPattern) : that.testPattern != null);
    }

    @Override
    public int hashCode() {
        int result = className != null ? className.hashCode() : 0;
        result = 31 * result + (methodName != null ? methodName.hashCode() : 0);
        result = 31 * result + (testPattern != null ? testPattern.hashCode() : 0);
        return result;
    }
}

```