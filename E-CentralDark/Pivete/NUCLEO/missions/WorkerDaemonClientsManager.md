# MISSAO - WorkerDaemonClientsManager.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\workers\org\gradle\workers\internal\WorkerDaemonClientsManager.java
**SHA:** 7b3ffd4fc89ac995
**Timestamp:** 2026-08-28T02:52:14.783705
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Send a message to workers to change their log level rather than stopping

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2017 the original author or authors.
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

package org.gradle.workers.internal;

import com.google.common.annotations.VisibleForTesting;
import org.gradle.api.Transformer;
import org.gradle.api.logging.LogLevel;
import org.gradle.api.logging.Logger;
import org.gradle.api.logging.Logging;
import org.gradle.internal.concurrent.Stoppable;
import org.gradle.internal.event.ListenerManager;
import org.gradle.internal.logging.LoggingManagerInternal;
import org.gradle.internal.logging.events.LogLevelChangeEvent;
import org.gradle.internal.logging.events.OutputEvent;
import org.gradle.internal.logging.events.OutputEventListener;
import org.gradle.internal.os.OperatingSystem;
import org.gradle.internal.service.scopes.Scope;
import org.gradle.internal.service.scopes.ServiceScope;
import org.gradle.internal.session.BuildSessionLifecycleListener;
import org.gradle.process.internal.health.memory.MemoryManager;
import org.gradle.process.internal.health.memory.OsMemoryInfo;
import org.gradle.util.internal.CollectionUtils;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.function.Consumer;

import static java.util.Comparator.comparingInt;

@ServiceScope(Scope.UserHome.class)
public class WorkerDaemonClientsManager implements Stoppable {

    private static final Logger LOGGER = Logging.getLogger(WorkerDaemonClientsManager.class);

    private final Object lock = new Object();
    private final List<WorkerDaemonClient> allClients = new ArrayList<WorkerDaemonClient>();
    private final List<WorkerDaemonClient> idleClients = new ArrayList<WorkerDaemonClient>();

    private final WorkerDaemonStarter workerDaemonStarter;
    private final ListenerManager listenerManager;
    private final LoggingManagerInternal loggingManager;
    private final OsMemoryInfo memoryInfo;
    private final BuildSessionLifecycleListener stopSessionScopeWorkers;
    private final OutputEventListener logLevelChangeEventListener;
    private final WorkerDaemonExpiration workerDaemonExpiration;
    private final MemoryManager memoryManager;
    private volatile LogLevel currentLogLevel;

    public WorkerDaemonClientsManager(WorkerDaemonStarter workerDaemonStarter, ListenerManager listenerManager, LoggingManagerInternal loggingManager, MemoryManager memoryManager, OsMemoryInfo memoryInfo) {
        this.workerDaemonStarter = workerDaemonStarter;
        this.listenerManager = listenerManager;
        this.loggingManager = loggingManager;
        this.memoryInfo = memoryInfo;
        this.stopSessionScopeWorkers = new StopSessionScopedWorkers();
        listenerManager.addListener(stopSessionScopeWorkers);
        this.logLevelChangeEventListener = new LogLevelChangeEventListener();
        loggingManager.addOutputEventListener(logLevelChangeEventListener);
        this.currentLogLevel = loggingManager.getLevel();
        this.memoryManager = memoryManager;
        this.workerDaemonExpiration = new WorkerDaemonExpiration(this, getTotalPhysicalMemory());
        memoryManager.addMemoryHolder(workerDaemonExpiration);
    }

    // TODO - should supply and check for the same parameters as passed to reserveNewClient()
    public WorkerDaemonClient reserveIdleClient(DaemonForkOptions forkOptions) {
        return reserveIdleClient(forkOptions, idleClients);
    }

    WorkerDaemonClient reserveIdleClient(DaemonForkOptions forkOptions, List<WorkerDaemonClient> clients) {
        synchronized (lock) {
            Iterator<WorkerDaemonClient> it = clients.iterator();
            while (it.hasNext()) {
                WorkerDaemonClient candidate = it.next();
                if (candidate.isFailed()) {
                    emitUnexpectedWorkerFailureWarning(candidate);
                    it.remove();
                } else {
                    if (candidate.isCompatibleWith(forkOptions)) {
                        it.remove();
                        if (candidate.getLogLevel() != currentLogLevel) {
                            // TODO: Send a message to workers to change their log level rather than stopping
                            LOGGER.info("Log level has changed, stopping idle worker daemon with out-of-date log level.");
                            candidate.stop();
                        } else {
                            return candidate;
                        }
                    }
                }
            }
            return null
```