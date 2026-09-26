# COMANDO - DefaultContextAwareTaskLogger.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\logging\org\gradle\internal\logging\slf4j\DefaultContextAwareTaskLogger.java
**SHA:** e7509402b3dcc338
**Timestamp:** 2026-08-28T02:50:39.268092
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- this.delegate = Cast.cast(BuildOperationAwareLogger.class, delegate);
- delegate = new MessageRewritingBuildOperationAwareLogger(delegate, messageRewriter);

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

package org.gradle.internal.logging.slf4j;

import org.gradle.api.logging.LogLevel;
import org.gradle.api.logging.Logger;
import org.gradle.internal.Cast;
import org.gradle.internal.operations.CurrentBuildOperationRef;
import org.gradle.internal.operations.OperationIdentifier;
import org.slf4j.Marker;
import org.slf4j.helpers.FormattingTuple;
import org.slf4j.helpers.MessageFormatter;

import static org.gradle.internal.logging.slf4j.BuildOperationAwareLogger.toLogLevel;

@SuppressWarnings("OverridingMethodInconsistentArgumentNamesChecker")
public class DefaultContextAwareTaskLogger implements ContextAwareTaskLogger {

    private BuildOperationAwareLogger delegate;
    private OperationIdentifier fallbackOperationIdentifier = null;

    public DefaultContextAwareTaskLogger(Logger delegate) {
        this.delegate = Cast.cast(BuildOperationAwareLogger.class, delegate);
    }

    public MessageRewriter getMessageRewriter() {
        return delegate instanceof MessageRewritingBuildOperationAwareLogger
            ? ((MessageRewritingBuildOperationAwareLogger) delegate).getMessageRewriter()
            : null;
    }

    @Override
    public void setMessageRewriter(MessageRewriter messageRewriter) {
        delegate = new MessageRewritingBuildOperationAwareLogger(delegate, messageRewriter);
    }

    @Override
    public void setFallbackBuildOperationId(OperationIdentifier operationIdentifier) {
        this.fallbackOperationIdentifier = operationIdentifier;
    }

    @Override
    public boolean isLifecycleEnabled() {
        return delegate.isLifecycleEnabled();
    }

    @Override
    public boolean isQuietEnabled() {
        return delegate.isQuietEnabled();
    }

    @Override
    public boolean isEnabled(LogLevel level) {
        return delegate.isEnabled(level);
    }

    @Override
    public String getName() {
        return delegate.getName();
    }

    @Override
    public boolean isTraceEnabled() {
        return delegate.isTraceEnabled();
    }

    @Override
    public boolean isTraceEnabled(Marker marker) {
        return delegate.isTraceEnabled(marker);
    }

    @Override
    public boolean isDebugEnabled() {
        return delegate.isDebugEnabled();
    }

    @Override
    public boolean isDebugEnabled(Marker marker) {
        return delegate.isDebugEnabled(marker);
    }

    @Override
    public boolean isInfoEnabled() {
        return delegate.isInfoEnabled();
    }

    @Override
    public boolean isInfoEnabled(Marker marker) {
        return delegate.isInfoEnabled(marker);
    }

    @Override
    public boolean isWarnEnabled() {
        return delegate.isWarnEnabled();
    }

    @Override
    public boolean isWarnEnabled(Marker marker) {
        return delegate.isWarnEnabled(marker);
    }

    @Override
    public boolean isErrorEnabled() {
        return delegate.isErrorEnabled();
    }

    @Override
    public boolean isErrorEnabled(Marker marker) {
        return delegate.isErrorEnabled(marker);
    }

    @Override
    public void trace(String msg) {
    }

    @Override
    public void trace(String format, Object arg) {
    }

    @Override
    public void trace(String format, Object arg1, Object arg2) {
    }

    @Override
    public void trace(String format, Object... arguments) {
    }

    @Override
    public void trace(String msg, Throwable t) {
    }

    @Override
    public void trace(Marker marker, String msg) {
    }

    @Override
    public void trace(Marker marker, String format, Object arg) {
    }

    @Override
    public void trace(Marker marker, String format, Object arg1, Object arg2) {
    }

    @Override
    public void trace(Marker marker, String format, Object... argArray) {
    }

    @Override
    public void trace(Marker marker, String msg, Throwable t) {
    }

    private void log(LogLevel logLevel, Throwable throwable, String message) {
        delegate.log(logLevel, throwable, message, currentBuildOperationId());
    }

    private OperationIdentifier currentBuildOperationId() {
        OperationIdentifier buildOperationId = CurrentBuildOperationRef.instance().getId();
        return buildOperationId != null ? buildOperationId : fallbackOperationIdentifier;
    }

    private void log(LogLevel logLevel, Throwable throwable, String format, Object arg) {
        log(logLevel, throwable, format, new Object[]{arg});
    }

    private vo
```