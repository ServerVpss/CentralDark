# COMANDO - FileIntegrityViolationSuppressingObjectHolderDecorator.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\persistent-cache\org\gradle\cache\internal\FileIntegrityViolationSuppressingObjectHolderDecorator.java
**SHA:** 5f7ab586822a1868
**Timestamp:** 2026-08-28T02:50:57.973330
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- this.delegate = delegate;

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2012 the original author or authors.
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

package org.gradle.cache.internal;

import org.gradle.cache.FileIntegrityViolationException;
import org.gradle.cache.ObjectHolder;

import java.util.function.Supplier;

public class FileIntegrityViolationSuppressingObjectHolderDecorator<T> implements ObjectHolder<T> {

    private final ObjectHolder<T> delegate;

    public FileIntegrityViolationSuppressingObjectHolderDecorator(ObjectHolder<T> delegate) {
        this.delegate = delegate;
    }

    @Override
    public T get() {
        try {
            return delegate.get();
        } catch (FileIntegrityViolationException e) {
            return null;
        }
    }

    @Override
    public void set(T newValue) {
        delegate.set(newValue);
    }

    @Override
    public T update(final UpdateAction<T> updateAction) {
        return doUpdate(updateAction, () -> delegate.update(updateAction));
    }

    @Override
    public T maybeUpdate(final UpdateAction<T> updateAction) {
        return doUpdate(updateAction, () -> delegate.maybeUpdate(updateAction));
    }

    private T doUpdate(UpdateAction<T> updateAction, Supplier<T> work) {
        try {
            return work.get();
        } catch (FileIntegrityViolationException e) {
            T newValue = updateAction.update(null);
            set(newValue);
            return newValue;
        }
    }
}

```