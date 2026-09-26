# COMANDO - OutputEventRenderer.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\logging\org\gradle\internal\logging\sink\OutputEventRenderer.java
**SHA:** 0dd2acdce1644db4
**Timestamp:** 2026-08-28T02:50:39.247408
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- if (delegate == null) {
- delegate = factory.create();

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

package org.gradle.internal.logging.sink;

import org.gradle.api.logging.LogLevel;
import org.gradle.api.logging.StandardOutputListener;
import org.gradle.api.logging.configuration.ConsoleOutput;
import org.gradle.internal.Factory;
import org.gradle.internal.event.ListenerBroadcast;
import org.gradle.internal.logging.config.LoggingRouter;
import org.gradle.internal.logging.console.BuildLogLevelFilterRenderer;
import org.gradle.internal.logging.console.BuildStatusRenderer;
import org.gradle.internal.logging.console.ColorMap;
import org.gradle.internal.logging.console.Console;
import org.gradle.internal.logging.console.ConsoleLayoutCalculator;
import org.gradle.internal.logging.console.DefaultColorMap;
import org.gradle.internal.logging.console.DefaultWorkInProgressFormatter;
import org.gradle.internal.logging.console.FlushConsoleListener;
import org.gradle.internal.logging.console.GlobalUserInputReceiver;
import org.gradle.internal.logging.console.StyledTextOutputBackedRenderer;
import org.gradle.internal.logging.console.ThrottlingOutputEventListener;
import org.gradle.internal.logging.console.UserInputConsoleRenderer;
import org.gradle.internal.logging.console.UserInputStandardOutputRenderer;
import org.gradle.internal.logging.console.WorkInProgressRenderer;
import org.gradle.internal.logging.events.EndOutputEvent;
import org.gradle.internal.logging.events.FlushOutputEvent;
import org.gradle.internal.logging.events.LogLevelChangeEvent;
import org.gradle.internal.logging.events.OutputEvent;
import org.gradle.internal.logging.events.OutputEventListener;
import org.gradle.internal.logging.events.ProgressCompleteEvent;
import org.gradle.internal.logging.events.ProgressEvent;
import org.gradle.internal.logging.events.ProgressStartEvent;
import org.gradle.internal.logging.events.RenderableOutputEvent;
import org.gradle.internal.logging.format.PrettyPrefixedLogHeaderFormatter;
import org.gradle.internal.logging.text.StreamBackedStandardOutputListener;
import org.gradle.internal.logging.text.StreamingStyledTextOutput;
import org.gradle.internal.nativeintegration.console.ConsoleMetaData;
import org.gradle.internal.nativeintegration.console.FallbackConsoleMetaData;
import org.gradle.internal.time.Clock;

import javax.annotation.Nullable;
import javax.annotation.concurrent.ThreadSafe;
import java.io.OutputStream;
import java.util.concurrent.atomic.AtomicReference;

/**
 * A {@link OutputEventListener} implementation which renders output events to various
 * destinations. This implementation is thread-safe.
 */
@ThreadSafe
public class OutputEventRenderer implements OutputEventListener, LoggingRouter {
    private final Object lock = new Object();
    private final AtomicReference<LogLevel> logLevel = new AtomicReference<LogLevel>(LogLevel.LIFECYCLE);
    private final Clock clock;
    private final GlobalUserInputReceiver userInput;
    private final ListenerBroadcast<OutputEventListener> formatters = new ListenerBroadcast<OutputEventListener>(OutputEventListener.class);
    private final OutputEventTransformer transformer = new OutputEventTransformer(formatters.getSource(), lock);

    private ColorMap colourMap;
    private OutputStream originalStdOut;
    private OutputStream originalStdErr;
    private OutputEventListener stdOutListener;
    private OutputEventListener stdErrListener;
    private OutputEventListener console;
    private OutputEventListener userListenerChain;
    private ListenerBroadcast<StandardOutputListener> userStdoutListeners;
    private ListenerBroadcast<StandardOutputListener> userStderrListeners;

    public OutputEventRenderer(final Clock clock, GlobalUserInputReceiver userInput) {
        this.clock = clock;
        this.userInput = userInput;
    }

    @Override
    public Snapshot snapshot() {
        synchronized (lock) {
            // Currently only snapshot the console output listener. Should snapshot all output listeners, and cleanup in restore()
            return new SnapshotImpl(logLevel.get(), console);
        }
    }

    @Override
    public void restore(Snapshot state) {
        synchronized (lock) {
            SnapshotImpl snapshot = (SnapshotImpl) state;
            if (snapshot.logLevel != logLevel.get()) {
                configure(snapshot.logLevel);
            }

            // TODO - also close console when it is replaced
            if (snapshot.console !=
```