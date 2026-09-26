# COMANDO - LifecycleAwareBuildCacheControllerFactory.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\core\org\gradle\caching\internal\controller\impl\LifecycleAwareBuildCacheControllerFactory.java
**SHA:** eeed3772089fce41
**Timestamp:** 2026-08-28T02:49:45.233687
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- private final AtomicReference<BuildCacheController> delegate = new AtomicReference<>();
- private final AtomicReference<BuildCacheController> delegate = new AtomicReference<>();

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2017 the original author or authors.
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

package org.gradle.caching.internal.controller.impl;

import org.gradle.caching.BuildCacheKey;
import org.gradle.caching.configuration.internal.BuildCacheConfigurationInternal;
import org.gradle.caching.internal.CacheableEntity;
import org.gradle.caching.internal.controller.BuildCacheController;
import org.gradle.caching.internal.controller.NoOpBuildCacheController;
import org.gradle.caching.internal.controller.service.BuildCacheLoadResult;
import org.gradle.caching.internal.services.BuildCacheControllerFactory;
import org.gradle.internal.UncheckedException;
import org.gradle.internal.instantiation.InstanceGenerator;
import org.gradle.internal.service.scopes.Scope;
import org.gradle.internal.service.scopes.ServiceScope;
import org.gradle.internal.snapshot.FileSystemSnapshot;
import org.gradle.util.Path;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

/**
 * This service manages the state of the {@link BuildCacheController} instances in the build tree.
 * A separate instance is created for each build in the tree. This instance delegates to another immutable controller based on the state of the root build.
 *
 * <p>The implementation provides the following behavior:
 *
 * <ul>
 *     <li>All builds in the tree use the root build's cache configuration, once that configuration is available (ie the root build's settings have been evaluated).</li>
 *     <li>If caching is required in non-root build before the root build's configuration is available, that build's own cache configuration will be used.
 *      Once the root build's configuration is available, the build-specific configuration is discarded.
 *     </li>
 *     <li>If caching is required in any build before either the root build's configuration or the build-specific configuration is available, caching is disabled.
 *       Once configuration is available, it will be used, as per the above.
 *     </li>
 * </ul>
 *
 * <p>Currently, there is no simple, general way to know where in the above lifecycle a given piece of work will run.</p>
 */
@ServiceScope(Scope.BuildTree.class)
public class LifecycleAwareBuildCacheControllerFactory {
    private final RootBuildCacheController rootController = new RootBuildCacheController();

    public LifecycleAwareBuildCacheController createForRootBuild(Path identityPath, BuildCacheControllerFactory buildCacheControllerFactory, InstanceGenerator instanceGenerator) {
        return rootController.init(identityPath, buildCacheControllerFactory, instanceGenerator);
    }

    public LifecycleAwareBuildCacheController createForNonRootBuild(Path identityPath, BuildCacheControllerFactory buildCacheControllerFactory, InstanceGenerator instanceGenerator) {
        return rootController.createChild(identityPath, buildCacheControllerFactory, instanceGenerator);
    }

    private static abstract class DelegatingBuildCacheController implements LifecycleAwareBuildCacheController {
        @Override
        public boolean isEnabled() {
            return getDelegate().isEnabled();
        }

        @Override
        public Optional<BuildCacheLoadResult> load(BuildCacheKey cacheKey, CacheableEntity cacheableEntity) {
            return getDelegate().load(cacheKey, cacheableEntity);
        }

        @Override
        public void store(BuildCacheKey cacheKey, CacheableEntity entity, Map<String, FileSystemSnapshot> snapshots, Duration executionTime) {
            getDelegate().store(cacheKey, entity, snapshots, executionTime);
        }

        @Override
        public void close() {
            resetState();
        }

        protected static void createDelegate(BuildCacheConfigurationInternal configuration, AtomicReference<BuildCacheController> delegate, BuildCacheControllerFactory buildCacheControllerFactory, Path identityPath, InstanceGenerator instanceGenerator) {
            BuildCacheController controller = buildCacheControllerFactory.createController(identityPath, configuration, instanceGenerator);
            if (!delegate.compareAndSet(NoOpBuildCacheController.INSTANCE, controller)) {
                try {
                    controller.close();
                } catch (IOException e) {
                    throw UncheckedException.throwAsUncheckedException(e);
                }
                throw new Illega
```