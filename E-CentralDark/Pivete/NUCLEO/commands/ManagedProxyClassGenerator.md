# COMANDO - ManagedProxyClassGenerator.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\model-core\org\gradle\model\internal\manage\schema\extract\ManagedProxyClassGenerator.java
**SHA:** 4876f4add624e8d2
**Timestamp:** 2026-08-28T02:50:51.595683
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Label start = new Label();

### Contratos
- final ImmutableSet.Builder<ModelType<?>> typesToDelegate = ImmutableSet.builder();

### Gaps
- // TODO:LPTR This should be removed once BinaryContainer is a ModelMap
- // TODO:LPTR What is with the "metaClass" property here?
- // TODO:LPTR Instead of the first view property, we should figure out these parameters from the actual property

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2014 the original author or authors.
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

package org.gradle.model.internal.manage.schema.extract;

import com.google.common.base.Equivalence.Wrapper;
import com.google.common.base.Predicate;
import com.google.common.collect.ArrayListMultimap;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Iterables;
import com.google.common.collect.Multimap;
import groovy.lang.Closure;
import groovy.lang.MissingMethodException;
import groovy.lang.MissingPropertyException;
import groovy.lang.ReadOnlyPropertyException;
import org.apache.commons.lang.StringUtils;
import org.gradle.internal.Cast;
import org.gradle.internal.reflect.Types.TypeVisitResult;
import org.gradle.internal.reflect.Types.TypeVisitor;
import org.gradle.internal.reflect.UnsupportedPropertyValueException;
import org.gradle.internal.typeconversion.TypeConversionException;
import org.gradle.internal.typeconversion.TypeConverter;
import org.gradle.model.internal.asm.AsmClassGenerator;
import org.gradle.model.internal.asm.AsmClassGeneratorUtils;
import org.gradle.model.internal.core.MutableModelNode;
import org.gradle.model.internal.manage.binding.BridgeMethodBinding;
import org.gradle.model.internal.manage.binding.DelegateMethodBinding;
import org.gradle.model.internal.manage.binding.DirectMethodBinding;
import org.gradle.model.internal.manage.binding.ManagedProperty;
import org.gradle.model.internal.manage.binding.ManagedPropertyMethodBinding;
import org.gradle.model.internal.manage.binding.StructBindings;
import org.gradle.model.internal.manage.binding.StructMethodBinding;
import org.gradle.model.internal.manage.instance.GeneratedViewState;
import org.gradle.model.internal.manage.instance.ManagedInstance;
import org.gradle.model.internal.manage.instance.ModelElementState;
import org.gradle.model.internal.manage.schema.CompositeSchema;
import org.gradle.model.internal.manage.schema.ModelProperty;
import org.gradle.model.internal.manage.schema.ScalarValueSchema;
import org.gradle.model.internal.manage.schema.StructSchema;
import org.gradle.model.internal.manage.schema.UnmanagedImplStructSchema;
import org.gradle.model.internal.method.WeaklyTypeReferencingMethod;
import org.gradle.model.internal.type.ModelType;
import org.gradle.util.internal.ClosureBackedAction;
import org.objectweb.asm.ClassVisitor;
import org.objectweb.asm.ClassWriter;
import org.objectweb.asm.FieldVisitor;
import org.objectweb.asm.Label;
import org.objectweb.asm.MethodVisitor;
import org.objectweb.asm.Opcodes;
import org.objectweb.asm.Type;

import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

import static org.gradle.internal.reflect.Methods.SIGNATURE_EQUIVALENCE;
import static org.gradle.internal.reflect.PropertyAccessorType.GET_GETTER;
import static org.gradle.internal.reflect.PropertyAccessorType.IS_GETTER;
import static org.gradle.internal.reflect.PropertyAccessorType.SETTER;
import static org.gradle.internal.reflect.Types.walkTypeHierarchy;
import static org.gradle.model.internal.manage.schema.extract.ModelSchemaUtils.IGNORED_OBJECT_TYPES;
import static org.objectweb.asm.Opcodes.ACC_FINAL;
import static org.objectweb.asm.Opcodes.ACC_PRIVATE;
import static org.objectweb.asm.Opcodes.ACC_PUBLIC;
import static org.objectweb.asm.Opcodes.ACC_STATIC;
import static org.objectweb.asm.Opcodes.ACC_SYNTHETIC;
import static org.objectweb.asm.Opcodes.ALOAD;
import static org.objectweb.asm.Opcodes.ARETURN;
import static org.objectweb.asm.Opcodes.ASTORE;
import static org.objectweb.asm.Opcodes.ATHROW;
import static org.objectweb.asm.Opcodes.CHECKCAST;
import static org.objectweb.asm.Opcodes.DCONST_0;
import static org.objectweb.asm.Opcodes.DUP;
import static org.objectweb.asm.Opcodes.FCONST_0;
import static org.objectweb.asm.Opcodes.GETFIELD;
import static org.objectweb.asm.Opcodes.GETSTATIC;
import static org.objectweb.asm.Opcodes.GOTO;
import static org.objectweb.asm.Opcodes.ICONST_0;
import static org.objectweb.asm.Opcodes.ICONST_1;
import static org.objectweb.asm.Opcodes.IFNE;
import static org.objectweb.asm.Opcodes.IFNONNULL;
import static org.objectweb.asm.Opcodes.IF_ACMPNE;
import static org.objectweb.asm.Opcodes.ILOAD;
import static org.objectweb.asm.Opcodes.INSTANCEOF;
import static org.objectweb.asm.Opcodes.INVOKEINTERFACE;
impor
```