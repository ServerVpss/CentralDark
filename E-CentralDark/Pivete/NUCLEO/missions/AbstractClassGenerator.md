# MISSAO - AbstractClassGenerator.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\model-core\org\gradle\internal\instantiation\generator\AbstractClassGenerator.java
**SHA:** 7b8ca985a367bc46
**Timestamp:** 2026-08-28T02:50:45.987838
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: remove in Gradle 10.0

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2019 the original author or authors.
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

package org.gradle.internal.instantiation.generator;

import com.google.common.collect.ImmutableCollection;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableListMultimap;
import com.google.common.collect.ImmutableMultimap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.LinkedHashMultimap;
import com.google.common.collect.Ordering;
import com.google.common.collect.SetMultimap;
import com.google.common.reflect.TypeParameter;
import com.google.common.reflect.TypeToken;
import groovy.lang.Closure;
import groovy.lang.GroovyObject;
import groovy.lang.MetaClass;
import org.gradle.api.Action;
import org.gradle.api.Describable;
import org.gradle.api.DomainObjectSet;
import org.gradle.api.ExtensiblePolymorphicDomainObjectContainer;
import org.gradle.api.IsolatedAction;
import org.gradle.api.NamedDomainObjectContainer;
import org.gradle.api.NonExtensible;
import org.gradle.api.NonNullApi;
import org.gradle.api.artifacts.dsl.DependencyCollector;
import org.gradle.api.file.ConfigurableFileCollection;
import org.gradle.api.file.ConfigurableFileTree;
import org.gradle.api.file.DirectoryProperty;
import org.gradle.api.file.RegularFileProperty;
import org.gradle.api.internal.DynamicObjectAware;
import org.gradle.api.internal.IConventionAware;
import org.gradle.api.internal.plugins.software.SoftwareType;
import org.gradle.api.plugins.ExtensionAware;
import org.gradle.api.provider.HasMultipleValues;
import org.gradle.api.provider.ListProperty;
import org.gradle.api.provider.MapProperty;
import org.gradle.api.provider.Property;
import org.gradle.api.provider.Provider;
import org.gradle.api.provider.SetProperty;
import org.gradle.api.provider.SupportsConvention;
import org.gradle.api.reflect.InjectionPointQualifier;
import org.gradle.api.tasks.Nested;
import org.gradle.cache.Cache;
import org.gradle.internal.Cast;
import org.gradle.internal.deprecation.DeprecationLogger;
import org.gradle.internal.extensibility.NoConventionMapping;
import org.gradle.internal.instantiation.ClassGenerationException;
import org.gradle.internal.instantiation.InjectAnnotationHandler;
import org.gradle.internal.instantiation.InstanceGenerator;
import org.gradle.internal.instantiation.PropertyRoleAnnotationHandler;
import org.gradle.internal.logging.text.TreeFormatter;
import org.gradle.internal.reflect.ClassDetails;
import org.gradle.internal.reflect.ClassInspector;
import org.gradle.internal.reflect.JavaPropertyReflectionUtil;
import org.gradle.internal.reflect.JavaReflectionUtil;
import org.gradle.internal.reflect.MethodSet;
import org.gradle.internal.reflect.PropertyAccessorType;
import org.gradle.internal.reflect.PropertyDetails;
import org.gradle.internal.service.ServiceLookup;
import org.gradle.internal.service.ServiceRegistry;

import javax.annotation.Nullable;
import javax.inject.Inject;
import java.lang.annotation.Annotation;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static java.util.Optional.ofNullable;
import static org.gradle.api.internal.GeneratedSubclasses.unpack;

/**
 * Generates a subclass of the target class to mix-in some DSL behaviour.
 *
 * <ul>
 * <li>For each property, a convention mapping is applied. These properties may have a setter method.</li>
 * <li>For each property whose getter is annotated with {@link Inject}, service instance will be injected instead. These properties may have a setter method and may be abstract.</li>
 * <li>For each mutable property as set method is generated.</li>
 * <li>For each method whose last parameter is an {@link org.gradle.api.Action}, an override is generated that accepts a {@link groovy.lang.Closure} instead.</li>
 * <li>Coercion from string to enum property is mixed in.</li>
 * <li>{@link groovy.lang.GroovyObject} and {@link DynamicObjectAware} is mixed in to the class.</li>
 * <li>An {@link ExtensionAware} implementation is added, unless {@link NonExtensible} is attached to the class.</li>
 * <li>An {@link IConve
```