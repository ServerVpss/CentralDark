# COMANDO - CachingLibraryBinaryLocator.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\platform-native\org\gradle\nativeplatform\internal\resolve\CachingLibraryBinaryLocator.java
**SHA:** e4ed20c1e494a0a7
**Timestamp:** 2026-08-28T02:51:06.884094
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- this.delegate = delegate;

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

package org.gradle.nativeplatform.internal.resolve;

import org.gradle.api.DomainObjectSet;
import org.gradle.api.internal.collections.DomainObjectCollectionFactory;
import org.gradle.nativeplatform.NativeLibraryBinary;

import javax.annotation.Nullable;
import java.util.HashMap;
import java.util.Map;

public class CachingLibraryBinaryLocator implements LibraryBinaryLocator {
    private static DomainObjectSet<NativeLibraryBinary> nullResult;
    private final LibraryBinaryLocator delegate;
    private final Map<LibraryIdentifier, DomainObjectSet<NativeLibraryBinary>> libraries = new HashMap<LibraryIdentifier, DomainObjectSet<NativeLibraryBinary>>();

    public CachingLibraryBinaryLocator(LibraryBinaryLocator delegate, DomainObjectCollectionFactory domainObjectCollectionFactory) {
        this.delegate = delegate;
        if (nullResult == null) {
            nullResult = domainObjectCollectionFactory.newDomainObjectSet(NativeLibraryBinary.class);
        }
    }

    @Nullable
    @Override
    public DomainObjectSet<NativeLibraryBinary> getBinaries(LibraryIdentifier library) {
        DomainObjectSet<NativeLibraryBinary> libraryBinaries = libraries.get(library);
        if (libraryBinaries == null) {
            libraryBinaries = delegate.getBinaries(library);
            if (libraryBinaries == null) {
                libraryBinaries = nullResult;
            }
            libraries.put(library, libraryBinaries);
        }
        return libraryBinaries == nullResult ? null : libraryBinaries;
    }
}

```