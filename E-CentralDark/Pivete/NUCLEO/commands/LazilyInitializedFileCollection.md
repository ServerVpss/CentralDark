# COMANDO - LazilyInitializedFileCollection.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\file-collections\org\gradle\api\internal\file\collections\LazilyInitializedFileCollection.java
**SHA:** ba1fbaa4987ca41e
**Timestamp:** 2026-08-28T02:50:37.751296
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- if (delegate == null) {
- delegate = (FileCollectionInternal) createDelegate();

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
package org.gradle.api.internal.file.collections;

import org.gradle.api.file.FileCollection;
import org.gradle.api.internal.file.CompositeFileCollection;
import org.gradle.api.internal.file.FileCollectionInternal;
import org.gradle.api.internal.tasks.DefaultTaskDependencyFactory;
import org.gradle.api.internal.tasks.TaskDependencyFactory;

import java.util.function.Consumer;

/**
 * A {@link FileCollection} whose contents is created lazily.
 */
public abstract class LazilyInitializedFileCollection extends CompositeFileCollection {

    // Used in a third-party plugin Freefair AspectJ:
    //https://github.com/freefair/gradle-plugins/blob/fe992e9e8a3ed812c941aae02a594c8094da053c/aspectj-plugin/src/main/java/io/freefair/gradle/plugins/aspectj/internal/AspectJRuntime.java#L49
    // TODO Remove once the third-party usage is considered obsolete.
    /**
     * @deprecated Use the overload accepting the TaskDependencyFactory
     */
    @Deprecated
    @SuppressWarnings("InlineMeSuggester")
    public LazilyInitializedFileCollection() {
        this(DefaultTaskDependencyFactory.withNoAssociatedProject());
    }

    public LazilyInitializedFileCollection(TaskDependencyFactory taskDependencyFactory) {
        super(taskDependencyFactory);
    }

    private FileCollectionInternal delegate;

    @Override
    protected void visitChildren(Consumer<FileCollectionInternal> visitor) {
        if (delegate == null) {
            delegate = (FileCollectionInternal) createDelegate();
        }
        visitor.accept(delegate);
    }

    public abstract FileCollection createDelegate();
}

```