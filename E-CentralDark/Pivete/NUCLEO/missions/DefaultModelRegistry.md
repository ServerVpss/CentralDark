# MISSAO - DefaultModelRegistry.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\model-core\org\gradle\model\internal\registry\DefaultModelRegistry.java
**SHA:** fa3015552448e4c7
**Timestamp:** 2026-08-28T02:50:52.604136
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO:LPTR Remove projection for reference node

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

package org.gradle.model.internal.registry;

import com.google.common.base.Joiner;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMultimap;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import com.google.common.collect.Multimap;
import org.gradle.model.ConfigurationCycleException;
import org.gradle.model.InvalidModelRuleDeclarationException;
import org.gradle.model.RuleSource;
import org.gradle.model.internal.core.EmptyModelProjection;
import org.gradle.model.internal.core.ModelAction;
import org.gradle.model.internal.core.ModelActionRole;
import org.gradle.model.internal.core.ModelNode;
import org.gradle.model.internal.core.ModelPath;
import org.gradle.model.internal.core.ModelReference;
import org.gradle.model.internal.core.ModelRegistration;
import org.gradle.model.internal.core.ModelRegistrations;
import org.gradle.model.internal.core.ModelRuleExecutionException;
import org.gradle.model.internal.core.ModelSpec;
import org.gradle.model.internal.core.ModelView;
import org.gradle.model.internal.core.MutableModelNode;
import org.gradle.model.internal.core.rule.describe.ModelRuleDescriptor;
import org.gradle.model.internal.core.rule.describe.SimpleModelRuleDescriptor;
import org.gradle.model.internal.inspect.ExtractedRuleSource;
import org.gradle.model.internal.inspect.ModelRuleExtractor;
import org.gradle.model.internal.report.unbound.UnboundRule;
import org.gradle.model.internal.type.ModelType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.Nullable;
import javax.annotation.concurrent.NotThreadSafe;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Deque;
import java.util.Formatter;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.ListIterator;
import java.util.Map;
import java.util.Set;
import java.util.SortedSet;
import java.util.TreeSet;

import static org.gradle.model.internal.core.ModelNode.State.Created;
import static org.gradle.model.internal.core.ModelNode.State.Discovered;
import static org.gradle.model.internal.core.ModelNode.State.GraphClosed;
import static org.gradle.model.internal.core.ModelNode.State.Registered;
import static org.gradle.model.internal.core.ModelNode.State.SelfClosed;

@NotThreadSafe
public class DefaultModelRegistry implements ModelRegistryInternal {
    private static final Logger LOGGER = LoggerFactory.getLogger(DefaultModelRegistry.class);

    private final String projectPath;
    private final BoringProjectState projectState;
    private final ModelGraph modelGraph;
    private final RuleBindings ruleBindings;
    private final ModelRuleExtractor ruleExtractor;
    // Use of a LinkedList for 2 reasons: `Set` proved to have a significant negative impact on performance
    // And list will see a lot of removals, which ArrayList isn't very well suited for.
    private final List<RuleBinder> unboundRules = new LinkedList<RuleBinder>();

    public DefaultModelRegistry(ModelRuleExtractor ruleExtractor, String projectPath) {
        this(ruleExtractor, projectPath, BoringProjectState.IDENTITY);
    }

    public DefaultModelRegistry(ModelRuleExtractor ruleExtractor, String projectPath, BoringProjectState projectState) {
        this.ruleExtractor = ruleExtractor;
        this.projectPath = projectPath;
        this.projectState = projectState;
        ModelRegistration rootRegistration = ModelRegistrations.of(ModelPath.ROOT).descriptor("<root>").withProjection(EmptyModelProjection.INSTANCE).build();
        modelGraph = new ModelGraph(new ModelElementNode(this, rootRegistration, null));
        ruleBindings = new RuleBindings();
        transition(modelGraph.getRoot(), Created, false);
    }

    @Override
    public String getProjectPath() {
        return projectPath;
    }

    @Override
    public DefaultModelRegistry register(ModelRegistration registration) {
        ModelPath path = registration.getPath();
        if (!ModelPath.ROOT.isDirectChild(path)) {
            throw new InvalidModelRuleDeclarationException(registration.getDescriptor(), "Cannot register element at '" + path + "', only top level is allowed (e.g. '" + path.getRootParent() + "
```