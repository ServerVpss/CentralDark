# MISSAO - AsmBackedClassGenerator.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\model-core\org\gradle\internal\instantiation\generator\AsmBackedClassGenerator.java
**SHA:** 28c1dd727f64afa9
**Timestamp:** 2026-08-28T02:50:46.036317
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: introduce a better way to communicate this for classes that don't need generated dynamic-object methods?

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

import com.google.common.collect.ImmutableSet;
import groovy.lang.Closure;
import groovy.lang.GroovyObject;
import groovy.lang.GroovySystem;
import groovy.lang.MetaClass;
import groovy.lang.MetaClassRegistry;
import org.gradle.api.Action;
import org.gradle.api.Describable;
import org.gradle.api.IsolatedAction;
import org.gradle.api.NonNullApi;
import org.gradle.api.Project;
import org.gradle.api.Task;
import org.gradle.api.internal.ConventionMapping;
import org.gradle.api.internal.DynamicObjectAware;
import org.gradle.api.internal.GeneratedSubclass;
import org.gradle.api.internal.IConventionAware;
import org.gradle.api.internal.provider.DefaultProperty;
import org.gradle.api.internal.provider.support.LazyGroovySupport;
import org.gradle.api.invocation.Gradle;
import org.gradle.api.plugins.ExtensionAware;
import org.gradle.api.plugins.ExtensionContainer;
import org.gradle.api.services.ServiceReference;
import org.gradle.cache.Cache;
import org.gradle.cache.internal.ClassCacheFactory;
import org.gradle.internal.Cast;
import org.gradle.internal.DisplayName;
import org.gradle.internal.Factory;
import org.gradle.internal.UncheckedException;
import org.gradle.internal.deprecation.DeprecationLogger;
import org.gradle.internal.extensibility.ConventionAwareHelper;
import org.gradle.internal.instantiation.ClassGenerationException;
import org.gradle.internal.instantiation.InjectAnnotationHandler;
import org.gradle.internal.instantiation.InstanceGenerator;
import org.gradle.internal.instantiation.PropertyRoleAnnotationHandler;
import org.gradle.internal.logging.text.TreeFormatter;
import org.gradle.internal.metaobject.AbstractDynamicObject;
import org.gradle.internal.metaobject.BeanDynamicObject;
import org.gradle.internal.metaobject.DynamicObject;
import org.gradle.internal.service.ServiceLookup;
import org.gradle.internal.service.ServiceRegistry;
import org.gradle.internal.state.Managed;
import org.gradle.internal.state.ModelObject;
import org.gradle.internal.state.OwnerAware;
import org.gradle.model.internal.asm.AsmClassGenerator;
import org.gradle.model.internal.asm.AsmClassGeneratorUtils;
import org.gradle.model.internal.asm.BytecodeFragment;
import org.gradle.model.internal.asm.ClassGeneratorSuffixRegistry;
import org.gradle.model.internal.asm.ClassVisitorScope;
import org.gradle.model.internal.asm.MethodVisitorScope;
import org.gradle.util.internal.ConfigureUtil;
import org.objectweb.asm.AnnotationVisitor;
import org.objectweb.asm.Handle;
import org.objectweb.asm.Label;
import org.objectweb.asm.MethodVisitor;
import org.objectweb.asm.Type;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import javax.inject.Inject;
import java.lang.annotation.Annotation;
import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.invoke.CallSite;
import java.lang.invoke.LambdaMetafactory;
import java.lang.invoke.MethodHandle;
import java.lang.invoke.MethodHandles;
import java.lang.invoke.MethodType;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicReference;

import static groovy.lang.MetaProperty.getSetterName;
import static org.gradle.model.internal.asm.AsmClassGeneratorUtils.getterSignature;
import static org.gradle.model.internal.asm.AsmClassGeneratorUtils.signature;
import static org.gradle.util.internal.CollectionUtils.collectArray;
import static org.gradle.util.internal.CollectionUtils.findFirst;
import static org.objectweb.asm.Opcodes.ACC_FINAL;
import static org.objectweb.asm.Opcodes.ACC_PRIVATE;
import static org.objectweb.asm.Opcodes.ACC_PUBLIC;
import static org.objectweb.asm.Opcodes.ACC_STATIC;
import static org.objectweb.asm.Opcodes.ACC_SYNTHETIC;
import static org.objectweb.asm.Opcodes.ACC_TRANSIENT;
import static org.objectweb.asm.Opcodes.H_INVOKESPECIAL;
import static org.objectweb.asm.Opcodes.H_INVOKESTATIC;
import static org.objectweb.asm.Opcodes.H_INVOKEVIRTUAL;
```