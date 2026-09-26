# COMANDO - CollectionUtils.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\stdlib-java-extensions\org\gradle\util\internal\CollectionUtils.java
**SHA:** 83921177d1003d8b
**Timestamp:** 2026-08-28T02:51:44.511445
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- private final Iterator<? extends Factory<? extends T>> delegate = factories.iterator();

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2021 the original author or authors.
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
package org.gradle.util.internal;

import org.gradle.api.specs.Spec;
import org.gradle.internal.Factory;
import org.gradle.internal.InternalTransformer;
import org.gradle.internal.InternalTransformers;
import org.gradle.internal.Pair;

import javax.annotation.Nullable;
import java.lang.reflect.Array;
import java.util.AbstractList;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Set;

import static org.gradle.internal.Cast.cast;
import static org.gradle.internal.Cast.castNullable;
import static org.gradle.internal.Cast.uncheckedNonnullCast;

@SuppressWarnings("join_with_collect")
public abstract class CollectionUtils {

    /**
     * Returns the single element in the collection or throws.
     */
    public static <T> T single(Iterable<? extends T> source) {
        Iterator<? extends T> iterator = source.iterator();
        if (!iterator.hasNext()) {
            throw new NoSuchElementException("Expecting collection with single element, got none.");
        }
        T element = iterator.next();
        if (iterator.hasNext()) {
            throw new IllegalArgumentException("Expecting collection with single element, got multiple.");
        }
        return element;
    }

    public static <T> Collection<? extends T> checkedCast(Class<T> type, Collection<?> input) {
        for (Object o : input) {
            castNullable(type, o);
        }
        return uncheckedNonnullCast(input);
    }

    @Nullable
    public static <T> T findFirst(Iterable<? extends T> source, Spec<? super T> filter) {
        for (T item : source) {
            if (filter.isSatisfiedBy(item)) {
                return item;
            }
        }

        return null;
    }

    @Nullable
    public static <T> T findFirst(T[] source, Spec<? super T> filter) {
        for (T thing : source) {
            if (filter.isSatisfiedBy(thing)) {
                return thing;
            }
        }

        return null;
    }

    public static <T> T first(Iterable<? extends T> source) {
        return source.iterator().next();
    }

    public static <T> boolean any(Iterable<? extends T> source, Spec<? super T> filter) {
        return findFirst(source, filter) != null;
    }

    public static <T> boolean any(T[] source, Spec<? super T> filter) {
        return findFirst(source, filter) != null;
    }

    public static <T> Set<T> filter(Set<? extends T> set, Spec<? super T> filter) {
        return filter(set, new LinkedHashSet<T>(), filter);
    }

    public static <T> List<T> filter(List<? extends T> list, Spec<? super T> filter) {
        return filter(list, new ArrayList<T>(list.size()), filter);
    }

    public static <T> List<T> filter(T[] array, Spec<? super T> filter) {
        return filter(Arrays.asList(array), new ArrayList<T>(array.length), filter);
    }

    /**
     * Returns a sorted copy of the provided collection of things. Uses the provided comparator to sort.
     */
    public static <T> List<T> sort(Iterable<? extends T> things, Comparator<? super T> comparator) {
        List<T> copy = toMutableList(things);
        Collections.sort(copy, comparator);
        return copy;
    }

    /**
     * Returns a sorted copy of the provided collection of things. Uses the natural ordering of the things.
     */
    public static <T extends Comparable<T>> List<T> sort(Iterable<T> things) {
        List<T> copy = toMutableList(things);
        Collections.sort(copy);
        return copy;
    }

    public static <T, C extends Collection<T>> C filter(Iterable<? extends T> source, C destination, Spec<? super T> filter) {
        for (T item : source) {
            if (filter.isSatisfiedBy(item)) {
                destination.add(item);
            }
        }
        return destination;
    }

    public static <K, V> Map<K, V> filter(Map<K, V> map, Spec<Map.Entry<K, V>> filter) {
        return filter(map, new HashMap<K, V>(), filter);
    }

    public static <K, V> Map<K, V> filter(Map<K, V> map, Map<K, V> destination, Spec
```