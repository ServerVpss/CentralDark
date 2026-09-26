# COMANDO - FinalizerGroup.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\core\org\gradle\execution\plan\FinalizerGroup.java
**SHA:** d893da365d70f04d
**Timestamp:** 2026-08-28T02:49:54.976696
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- this.delegate = delegate;
- return "finalizer " + node + " ordinal: " + ordinal + ", delegate: " + delegate;

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2022 the original author or authors.
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

package org.gradle.execution.plan;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Iterables;
import com.google.common.collect.SetMultimap;
import kotlin.collections.ArrayDeque;

import javax.annotation.Nullable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.function.Consumer;

/**
 * The set of nodes reachable from a particular finalizer node.
 */
public class FinalizerGroup extends HasFinalizers {
    private static final MemberSuccessors DO_NOT_BLOCK = new DoNotBlock();
    private final TaskNode node;
    private final NodeGroup delegate;
    private final Set<Node> members = new LinkedHashSet<>();
    @Nullable
    private OrdinalGroup ordinal;
    @Nullable
    private ElementSuccessors successors;
    private boolean finalizedNodeHasStarted;
    private boolean hasBeenScheduled;

    public FinalizerGroup(TaskNode node, NodeGroup delegate) {
        this(node, delegate, delegate.asOrdinal());
    }

    public FinalizerGroup(TaskNode node, NodeGroup delegate, @Nullable OrdinalGroup ordinal) {
        this.node = node;
        this.delegate = delegate;
        this.ordinal = ordinal;
    }

    @Override
    public String toString() {
        return "finalizer " + node + " ordinal: " + ordinal + ", delegate: " + delegate;
    }

    public TaskNode getNode() {
        return node;
    }

    @Override
    public NodeGroup getOrdinalGroup() {
        return delegate;
    }

    @Override
    public NodeGroup withOrdinalGroup(OrdinalGroup newOrdinal) {
        ordinal = newOrdinal;
        return this;
    }

    @Override
    public NodeGroup reachableFrom(OrdinalGroup newOrdinal) {
        ordinal = newOrdinal;
        return this;
    }

    public NodeGroup getDelegate() {
        return delegate;
    }

    /**
     * Returns a set of nodes that are finalized by this group. The returned set might contain the nodes belonging to this group.
     */
    public Set<Node> getFinalizedNodes() {
        return node.getFinalizingSuccessors();
    }

    @Nullable
    @Override
    public OrdinalGroup asOrdinal() {
        return ordinal;
    }

    @Override
    public boolean isReachableFromEntryPoint() {
        return delegate.isReachableFromEntryPoint();
    }

    @Nullable
    @Override
    public FinalizerGroup asFinalizer() {
        return this;
    }

    private static boolean memberCanStartAtAnyTime(Node node) {
        return node.getGroup().isReachableFromEntryPoint();
    }

    @Override
    public Set<FinalizerGroup> getFinalizerGroups() {
        return ImmutableSet.of(this);
    }

    @Override
    public void addMember(Node node) {
        assert successors == null;
        members.add(node);
        delegate.addMember(node);
    }

    @Override
    public void removeMember(Node node) {
        assert successors == null;
        members.remove(node);
        delegate.removeMember(node);
    }

    public void visitAllMembers(Consumer<Node> visitor) {
        for (Node member : members) {
            visitor.accept(member);
        }
    }

    @Override
    public boolean isCanCancel() {
        if (!isCanCancel(Collections.singletonList(this))) {
            return false;
        } else {
            return delegate.isCanCancel();
        }
    }

    public boolean isCanCancelSelf() {
        if (node.allDependenciesComplete() && !node.allDependenciesSuccessful()) {
            // Finalizer won't run, so there's no point running its dependencies
            return true;
        }
        // Don't cancel if any finalized node has started
        return !finalizedNodeHasStarted;
    }

    @Override
    public void onNodeStart(Node finalizer, Node node) {
        if (isFinalizerNode(finalizer) && !finalizedNodeHasStarted && getFinalizedNodes().contains(node)) {
            finalizedNodeHasStarted = true;
        }
    }

    public void scheduleMembers(SetMultimap<FinalizerGroup, FinalizerGroup> reachableGroups) {
        if (hasBeenScheduled) {
            return;
        } else {
            hasBeenScheduled = true;
        }

        Set<Node> finalizedNodesToBlockOn = findFinalizedNodesThatDoNotIntroduceACycle(reachableGroups);
        WaitForNodesToComplete waitForFi
```