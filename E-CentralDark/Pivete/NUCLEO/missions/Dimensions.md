# MISSAO - Dimensions.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\language-native\org\gradle\language\nativeplatform\internal\Dimensions.java
**SHA:** 4acc95e284f29254
**Timestamp:** 2026-08-28T02:50:38.779315
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: These should come from somewhere else, probably
- // TODO: These should come from somewhere else, probably

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

package org.gradle.language.nativeplatform.internal;

import org.apache.commons.lang.StringUtils;
import org.gradle.api.Action;
import org.gradle.api.Named;
import org.gradle.api.attributes.AttributeContainer;
import org.gradle.api.attributes.Usage;
import org.gradle.api.internal.attributes.AttributesFactory;
import org.gradle.api.internal.component.DefaultSoftwareComponentVariant;
import org.gradle.api.internal.component.UsageContext;
import org.gradle.api.model.ObjectFactory;
import org.gradle.api.provider.Provider;
import org.gradle.api.provider.SetProperty;
import org.gradle.language.cpp.internal.NativeVariantIdentity;
import org.gradle.nativeplatform.Linkage;
import org.gradle.nativeplatform.MachineArchitecture;
import org.gradle.nativeplatform.OperatingSystemFamily;
import org.gradle.nativeplatform.TargetMachine;
import org.gradle.nativeplatform.TargetMachineFactory;
import org.gradle.nativeplatform.internal.DefaultTargetMachineFactory;
import org.gradle.nativeplatform.platform.internal.DefaultNativePlatform;

import javax.annotation.Nullable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

import static org.gradle.language.cpp.CppBinary.DEBUGGABLE_ATTRIBUTE;
import static org.gradle.language.cpp.CppBinary.LINKAGE_ATTRIBUTE;
import static org.gradle.language.cpp.CppBinary.OPTIMIZED_ATTRIBUTE;
import static org.gradle.nativeplatform.MachineArchitecture.ARCHITECTURE_ATTRIBUTE;
import static org.gradle.nativeplatform.OperatingSystemFamily.OPERATING_SYSTEM_ATTRIBUTE;

public class Dimensions {
    public static String createDimensionSuffix(Named dimensionValue, Collection<?> multivalueProperty) {
        return createDimensionSuffix(dimensionValue.getName(), multivalueProperty);
    }

    public static String createDimensionSuffix(String dimensionValue, Collection<?> multivalueProperty) {
        if (isDimensionVisible(multivalueProperty)) {
            return StringUtils.capitalize(dimensionValue.toLowerCase(Locale.ROOT));
        }
        return "";
    }

    private static boolean isDimensionVisible(Collection<?> multivalueProperty) {
        return multivalueProperty.size() > 1;
    }

    public static void unitTestVariants(Provider<String> baseName, SetProperty<TargetMachine> declaredTargetMachines, @Nullable SetProperty<TargetMachine> declaredTargetMachinesOfTestedComponent,
                                        ObjectFactory objectFactory, AttributesFactory attributesFactory,
                                        Provider<String> group, Provider<String> version,
                                        Action<NativeVariantIdentity> action) {
        Collection<TargetMachine> targetMachines = extractAndValidate("target machine", "unit test", declaredTargetMachines);
        if (declaredTargetMachinesOfTestedComponent != null) {
            Collection<TargetMachine> targetMachinesOfTestedComponent = extractAndValidate("target machine", "component under test", declaredTargetMachinesOfTestedComponent);
            validateTargetMachines(targetMachines, targetMachinesOfTestedComponent);
        }
        variants(baseName, Arrays.asList(BuildType.DEBUG), targetMachines, objectFactory, attributesFactory, group, version, action);
    }

    public static void applicationVariants(Provider<String> baseName, SetProperty<TargetMachine> declaredTargetMachines,
                                       ObjectFactory objectFactory, AttributesFactory attributesFactory,
                                       Provider<String> group, Provider<String> version,
                                       Action<NativeVariantIdentity> action) {
        Collection<BuildType> buildTypes = BuildType.DEFAULT_BUILD_TYPES;
        Collection<TargetMachine> targetMachines = extractAndValidate("target machine", "application", declaredTargetMachines);
        variants(baseName, buildTypes, targetMachines, objectFactory, attributesFactory, group, version, action);
    }

    public static void libraryVariants(Provider<String> baseName, SetProperty<Linkage> declaredLinkages, SetProperty<TargetMachine> declaredTargetMachines,
                                           ObjectFactory objectFactory, AttributesFactory attributesFactory,
                          
```