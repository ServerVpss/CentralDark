# COMANDO - DefaultCrossBuildInMemoryCacheFactory.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\persistent-cache\org\gradle\cache\internal\DefaultCrossBuildInMemoryCacheFactory.java
**SHA:** 85b7765478f48d43
**Timestamp:** 2026-08-28T02:50:57.722224
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- private final ManualEvictionInMemoryCache<K, V> delegate = new ManualEvictionInMemoryCache<>();

### Gaps
- // TODO: Should use some variation of DefaultClassMap below to associate values with classes, as currently we retain a strong reference to each value for one session after the ClassLoader

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2018 the original author or authors.
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

import org.gradle.cache.ManualEvictionInMemoryCache;
import org.gradle.internal.UncheckedException;
import org.gradle.internal.classloader.VisitableURLClassLoader;
import org.gradle.internal.event.ListenerManager;
import org.gradle.internal.lazy.Lazy;
import org.gradle.internal.session.BuildSessionLifecycleListener;

import javax.annotation.Nullable;
import javax.annotation.concurrent.ThreadSafe;
import java.lang.ref.SoftReference;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.WeakHashMap;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Stream;

import static java.util.Collections.synchronizedMap;

/**
 * A factory for {@link CrossBuildInMemoryCache} instances.
 *
 * Note that this implementation should only be used to create global scoped services.
 * Note that this implementation currently retains strong references to keys and values during the whole lifetime of a build session.
 *
 * Uses a simple algorithm to collect unused values, by retaining strong references to all keys and values used during the current build session, and the previous build session. All other values are referenced only by soft references.
 */
@ThreadSafe
public class DefaultCrossBuildInMemoryCacheFactory implements CrossBuildInMemoryCacheFactory {
    private final ListenerManager listenerManager;

    public DefaultCrossBuildInMemoryCacheFactory(ListenerManager listenerManager) {
        this.listenerManager = listenerManager;
    }

    @Override
    public <K, V> CrossBuildInMemoryCache<K, V> newCache() {
        DefaultCrossBuildInMemoryCache<K, V> cache = new DefaultCrossBuildInMemoryCache<>(KeyRetentionPolicy.STRONG);
        listenerManager.addListener(cache);
        return cache;
    }

    @Override
    public <K, V> CrossBuildInMemoryCache<K, V> newCache(Consumer<V> onReuse) {
        DefaultCrossBuildInMemoryCache<K, V> cache = new DefaultCrossBuildInMemoryCache<K, V>(KeyRetentionPolicy.STRONG) {
            @Nullable
            @Override
            protected V maybeGetRetainedValue(K key) {
                V v = super.maybeGetRetainedValue(key);
                if (v != null) {
                    // This callback better be swift as it runs under the cache lock.
                    onReuse.accept(v);
                }
                return v;
            }
        };
        listenerManager.addListener(cache);
        return cache;
    }


    @Override
    public <K, V> CrossBuildInMemoryCache<K, V> newCacheRetainingDataFromPreviousBuild(Predicate<V> retentionFilter) {
        CrossBuildCacheRetainingDataFromPreviousBuild<K, V> cache = new CrossBuildCacheRetainingDataFromPreviousBuild<>(retentionFilter);
        listenerManager.addListener(cache);
        return cache;
    }

    @Override
    public <V> CrossBuildInMemoryCache<Class<?>, V> newClassCache() {
        // TODO: Should use some variation of DefaultClassMap below to associate values with classes, as currently we retain a strong reference to each value for one session after the ClassLoader
        //       for the entry's key is discarded, which is unnecessary because we won't attempt to locate the entry again once the ClassLoader has been discarded
        DefaultCrossBuildInMemoryCache<Class<?>, V> cache = new DefaultCrossBuildInMemoryCache<>(KeyRetentionPolicy.WEAK);
        listenerManager.addListener(cache);
        return cache;
    }

    @Override
    public <V> CrossBuildInMemoryCache<Class<?>, V> newClassMap() {
        DefaultClassMap<V> map = new DefaultClassMap<>();
        listenerManager.addListener(map);
        return map;
    }

    private abstract static class AbstractCrossBuildInMemoryCache<K, V> implements CrossBuildInMemoryCache<K, V>, BuildSessionLifecycleListener {
        private final ConcurrentHashMap<K, Lazy<V>> valuesForThisSession = new ConcurrentHashMap<>();

        @Override
        public void beforeComplete() {
            retainValuesFromCurrentSession(valuesForThisSession.values().stream().map(Lazy::get));
            valuesForThisSession.clear();
        }

        @Override
        public void clear() {
            valuesForThisSession.clear();
            discar
```