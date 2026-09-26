# MISSAO - ExceptionPlaceholder.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\serialization\org\gradle\internal\serialize\ExceptionPlaceholder.java
**SHA:** b875f8322017b349
**Timestamp:** 2026-08-28T02:51:34.245684
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO:ADAM - switch the logging back on. Need to make sending messages from daemon to client async wrt log event generation
- // TODO:ADAM - switch the logging back on.
- // TODO:ADAM - switch the logging back on.

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

package org.gradle.internal.serialize;

import org.gradle.api.JavaVersion;
import org.gradle.internal.Cast;
import org.gradle.internal.InternalTransformer;
import org.gradle.internal.UncheckedException;
import org.gradle.internal.exceptions.Contextual;
import org.gradle.internal.exceptions.DefaultMultiCauseException;
import org.gradle.internal.exceptions.MultiCauseException;
import org.gradle.internal.io.StreamByteBuffer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.Serializable;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

class ExceptionPlaceholder implements Serializable {
    @SuppressWarnings("DoubleBraceInitialization")
    // TODO Use Guava's immutable collections here
    private static final Set<String> CANDIDATE_GET_CAUSES = Collections.unmodifiableSet(
        new HashSet<String>() {{
            add("getCauses");
            add("getFailures");
        }}
    );
    private static final long serialVersionUID = 1L;
    private static final Logger LOGGER = LoggerFactory.getLogger(ExceptionPlaceholder.class);
    private final String type;
    private byte[] serializedException;
    private String message;
    private String toString;
    private final boolean contextual;
    private final boolean assertionError;
    private final List<ExceptionPlaceholder> causes;
    private final List<ExceptionPlaceholder> suppressed;
    private List<StackTraceElementPlaceholder> stackTrace;
    private Throwable toStringRuntimeExec;
    private Throwable getMessageExec;

    public ExceptionPlaceholder(Throwable original, InternalTransformer<ExceptionReplacingObjectOutputStream, OutputStream> objectOutputStreamCreator, Set<Throwable> dejaVu) {
        boolean hasCycle = !dejaVu.add(original);
        Throwable throwable = original;
        type = throwable.getClass().getName();
        contextual = throwable.getClass().getAnnotation(Contextual.class) != null;
        assertionError = throwable instanceof AssertionError;
        try {
            stackTrace = throwable.getStackTrace() == null ? Collections.<StackTraceElementPlaceholder>emptyList() : convertStackTrace(throwable.getStackTrace());
        } catch (Throwable ignored) {
// TODO:ADAM - switch the logging back on. Need to make sending messages from daemon to client async wrt log event generation
//                LOGGER.debug("Ignoring failure to extract throwable stack trace.", ignored);
            stackTrace = Collections.emptyList();
        }

        try {
            message = throwable.getMessage();
        } catch (Throwable failure) {
            getMessageExec = failure;
        }

        if (isJava14()) {
            throwable = Java14NullPointerExceptionUsefulMessageSupport.maybeReplaceUsefulNullPointerMessage(throwable);
        }

        try {
            toString = throwable.toString();
        } catch (Throwable failure) {
            toStringRuntimeExec = failure;
        }

        final List<? extends Throwable> causes;
        final List<? extends Throwable> suppressed;
        if (hasCycle) {
            // Ignore causes and suppressed in case of cycle
            causes = Collections.emptyList();
            suppressed = Collections.emptyList();
        } else {
            causes = extractCauses(throwable);
            suppressed = extractSuppressed(throwable);
        }

        StreamByteBuffer buffer = new StreamByteBuffer();
        ExceptionReplacingObjectOutputStream oos = objectOutputStreamCreator.transform(buffer.getOutputStream());
        oos.setObjectTransformer(new InternalTransformer<Object, Object>() {
            boolean seenFirst;

            @Override
            public Object transform(Object obj) {
                if (!seenFirst) {
                    seenFirst = true;
                    return obj;
                }
                // Don't serialize the causes - we'll serialize them separately later
                int causeIndex = causes.indexOf(obj);
                if (causeIndex >= 0) {
   
```