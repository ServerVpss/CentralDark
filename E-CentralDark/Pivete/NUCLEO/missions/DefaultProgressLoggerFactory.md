# MISSAO - DefaultProgressLoggerFactory.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\logging\org\gradle\internal\logging\progress\DefaultProgressLoggerFactory.java
**SHA:** e1065d5f75beb80c
**Timestamp:** 2026-08-28T02:50:39.107841
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- this.buildOperationStart = buildOperationStart;

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

package org.gradle.internal.logging.progress;

import org.gradle.internal.logging.events.ProgressCompleteEvent;
import org.gradle.internal.logging.events.ProgressEvent;
import org.gradle.internal.logging.events.ProgressStartEvent;
import org.gradle.internal.operations.BuildOperationCategory;
import org.gradle.internal.operations.BuildOperationDescriptor;
import org.gradle.internal.operations.BuildOperationIdFactory;
import org.gradle.internal.operations.BuildOperationMetadata;
import org.gradle.internal.operations.BuildOperationRef;
import org.gradle.internal.operations.CurrentBuildOperationRef;
import org.gradle.internal.operations.OperationIdentifier;
import org.gradle.internal.time.Clock;
import org.gradle.util.internal.GUtil;

import javax.annotation.Nullable;

public class DefaultProgressLoggerFactory implements ProgressLoggerFactory {
    private final ProgressListener progressListener;
    private final Clock clock;
    private final BuildOperationIdFactory buildOperationIdFactory;
    @SuppressWarnings("ThreadLocalUsage")
    private final ThreadLocal<ProgressLoggerImpl> current = new ThreadLocal<ProgressLoggerImpl>();
    private final CurrentBuildOperationRef currentBuildOperationRef = CurrentBuildOperationRef.instance();

    public DefaultProgressLoggerFactory(ProgressListener progressListener, Clock clock, BuildOperationIdFactory buildOperationIdFactory) {
        this.progressListener = progressListener;
        this.clock = clock;
        this.buildOperationIdFactory = buildOperationIdFactory;
    }

    @Override
    public ProgressLogger newOperation(Class<?> loggerCategory) {
        return newOperation(loggerCategory.getName());
    }

    @Override
    public ProgressLogger newOperation(Class<?> loggerCategory, BuildOperationDescriptor buildOperationDescriptor) {
        String category = ProgressStartEvent.BUILD_OP_CATEGORY;
        BuildOperationMetadata metadata = buildOperationDescriptor.getMetadata();
        BuildOperationCategory buildOperationCategory = BuildOperationCategory.toCategory(metadata);
        if (buildOperationCategory == BuildOperationCategory.TASK) {
            // This is a legacy quirk.
            // Scans use this to determine that progress logging is indicating start/finish of tasks.
            // This can be removed in Gradle 5.0 (along with the concept of a "logging category" of an operation)
            category = ProgressStartEvent.TASK_CATEGORY;
        }

        ProgressLoggerImpl logger = new ProgressLoggerImpl(
            null,
            buildOperationDescriptor.getId(),
            category,
            progressListener,
            clock,
            true,
            buildOperationDescriptor.getId(),
            buildOperationDescriptor.getParentId(),
            buildOperationCategory
        );
        logger.totalProgress = buildOperationDescriptor.getTotalProgress();

        // Make some assumptions about the console output
        if (buildOperationCategory.isTopLevelWorkItem()) {
            logger.loggingHeader = buildOperationDescriptor.getProgressDisplayName();
        }

        return logger;
    }

    @Override
    public ProgressLogger newOperation(String loggerCategory) {
        return init(loggerCategory, null);
    }

    @Override
    public ProgressLogger newOperation(Class<?> loggerClass, ProgressLogger parent) {
        return init(loggerClass.toString(), parent);
    }

    private ProgressLogger init(
        String loggerCategory,
        @Nullable ProgressLogger parentOperation
    ) {
        if (parentOperation != null && !(parentOperation instanceof ProgressLoggerImpl)) {
            throw new IllegalArgumentException("Unexpected parent logger.");
        }
        BuildOperationRef currentBuildOperation = currentBuildOperationRef.get();
        return new ProgressLoggerImpl(
            (ProgressLoggerImpl) parentOperation,
            new OperationIdentifier(buildOperationIdFactory.nextId()),
            loggerCategory,
            progressListener,
            clock,
            false,
            currentBuildOperation != null ? currentBuildOperation.getId() : null,
            currentBuildOperation != null ? currentBuildOperation.getParentId() : null,
            null
        );
    }

    private enum State {idle, started, completed}

    private class ProgressLoggerImpl implements ProgressLogger {
      
```