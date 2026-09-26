# MISSAO - UnparameterizedBuildController.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\tooling-api\org\gradle\tooling\internal\consumer\connection\UnparameterizedBuildController.java
**SHA:** af03fdc22b0433fb
**Timestamp:** 2026-08-28T02:52:04.966171
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: move this to ObjectFactory

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2016 the original author or authors.
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

package org.gradle.tooling.internal.consumer.connection;

import org.gradle.api.Action;
import org.gradle.internal.operations.MultipleBuildOperationFailures;
import org.gradle.tooling.BuildAction;
import org.gradle.tooling.BuildController;
import org.gradle.tooling.UnknownModelException;
import org.gradle.tooling.UnsupportedVersionException;
import org.gradle.tooling.internal.adapter.ObjectGraphAdapter;
import org.gradle.tooling.internal.adapter.ProtocolToModelAdapter;
import org.gradle.tooling.internal.adapter.ViewBuilder;
import org.gradle.tooling.internal.consumer.versioning.ModelMapping;
import org.gradle.tooling.internal.consumer.versioning.VersionDetails;
import org.gradle.tooling.internal.gradle.DefaultProjectIdentifier;
import org.gradle.tooling.internal.protocol.BuildResult;
import org.gradle.tooling.internal.protocol.InternalUnsupportedModelException;
import org.gradle.tooling.internal.protocol.ModelIdentifier;
import org.gradle.tooling.model.Model;
import org.gradle.tooling.model.ProjectModel;
import org.gradle.tooling.model.gradle.GradleBuild;
import org.gradle.tooling.model.internal.Exceptions;

import javax.annotation.Nullable;
import java.io.File;
import java.lang.reflect.Proxy;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

abstract class UnparameterizedBuildController extends HasCompatibilityMapping implements BuildController {
    private final ProtocolToModelAdapter adapter;
    private final ObjectGraphAdapter resultAdapter;
    private final ModelMapping modelMapping;
    protected final VersionDetails gradleVersion;
    private final File rootDir;

    public UnparameterizedBuildController(ProtocolToModelAdapter adapter, ModelMapping modelMapping, VersionDetails gradleVersion, File rootDir) {
        this.adapter = adapter;
        // Treat all models returned to the action as part of the same object graph
        this.resultAdapter = adapter.newGraph();
        this.modelMapping = modelMapping;
        this.gradleVersion = gradleVersion;
        this.rootDir = rootDir;
    }

    @Override
    public <T> T getModel(Class<T> modelType) throws UnknownModelException {
        return getModel(null, modelType);
    }

    @Override
    public <T> T findModel(Class<T> modelType) {
        return findModel(null, modelType);
    }

    @Override
    public GradleBuild getBuildModel() {
        return getModel(null, GradleBuild.class);
    }

    @Override
    public <T> T getModel(Model target, Class<T> modelType) throws UnknownModelException {
        return getModel(target, modelType, null, null);
    }

    @Override
    public <T> T findModel(Model target, Class<T> modelType) {
        return findModel(target, modelType, null, null);
    }

    @Override
    public <T, P> T getModel(Class<T> modelType, Class<P> parameterType, Action<? super P> parameterInitializer) throws UnsupportedVersionException {
        return getModel(null, modelType, parameterType, parameterInitializer);
    }

    @Override
    public <T, P> T findModel(Class<T> modelType, Class<P> parameterType, Action<? super P> parameterInitializer) {
        return findModel(null, modelType, parameterType, parameterInitializer);
    }

    @Override
    public <T, P> T findModel(Model target, Class<T> modelType, Class<P> parameterType, Action<? super P> parameterInitializer) {
        try {
            return getModel(target, modelType, parameterType, parameterInitializer);
        } catch (UnknownModelException e) {
            // Ignore
            return null;
        }
    }

    @Override
    public <T, P> T getModel(Model target, Class<T> modelType, Class<P> parameterType, Action<? super P> parameterInitializer) throws UnsupportedVersionException, UnknownModelException {
        ModelIdentifier modelIdentifier = modelMapping.getModelIdentifierFromModelType(modelType);
        Object originalTarget = target == null ? null : adapter.unpack(target);

        P parameter = initializeParameter(parameterType, parameterInitializer);

        BuildResult<?> result;
        try {
            result = getModel(originalTarget, modelIdentifier, parameter);
        } catch (InternalUnsupportedModelException e) {
            throw Exceptions.unknownModel(modelType, e);
        }

        ViewBuilder<T> viewBuilder = resultAdapter.builder(modelType);
        applyCompatibilityMapping(viewBuilder,
```