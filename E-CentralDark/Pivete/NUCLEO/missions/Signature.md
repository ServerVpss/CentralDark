# MISSAO - Signature.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\signing\org\gradle\plugins\signing\Signature.java
**SHA:** 576f9a4bbbb23160
**Timestamp:** 2026-08-28T02:51:38.165123
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: find a way to inject a proper task dependency factory without breaking the public API
- // TODO: find a way to inject a proper task dependency factory without breaking the public API
- // TODO: find a way to inject a proper task dependency factory without breaking the public API
- // TODO: find a way to inject a proper task dependency factory without breaking the public API
- // TODO: find a way to inject a proper task dependency factory without breaking the public API

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2011 the original author or authors.
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
package org.gradle.plugins.signing;

import groovy.lang.Closure;
import org.gradle.api.Buildable;
import org.gradle.api.Incubating;
import org.gradle.api.InvalidUserDataException;
import org.gradle.api.artifacts.PublishArtifact;
import org.gradle.api.internal.artifacts.publish.AbstractPublishArtifact;
import org.gradle.api.internal.tasks.DefaultTaskDependencyFactory;
import org.gradle.api.tasks.InputFile;
import org.gradle.api.tasks.Internal;
import org.gradle.api.tasks.OutputFile;
import org.gradle.api.tasks.PathSensitive;
import org.gradle.api.tasks.PathSensitivity;
import org.gradle.api.tasks.TaskDependency;
import org.gradle.internal.instrumentation.api.annotations.ToBeReplacedByLazyProperty;
import org.gradle.plugins.signing.signatory.Signatory;
import org.gradle.plugins.signing.type.SignatureType;

import javax.annotation.Nullable;
import java.io.File;
import java.util.Date;
import java.util.concurrent.Callable;

import static com.google.common.util.concurrent.Callables.returning;
import static org.gradle.internal.UncheckedException.uncheckedCall;

/**
 * A digital signature file artifact.
 *
 * <p>A signature file is always generated from another file, which may be a {@link PublishArtifact}.</p>
 */
public class Signature extends AbstractPublishArtifact {

    /**
     * The specification of how to generate the signature.
     */
    private SignatureSpec signatureSpec;

    /**
     * The artifact that this signature is for, which may be {@code null} if this signature is not for an artifact.
     */
    private Buildable source;

    /**
     * The name of the signature artifact.
     *
     * @see #getName()
     */
    private String name;

    /**
     * The extension of the signature artifact.
     *
     * @see #getExtension()
     */
    private String extension;

    /**
     * The type of the signature artifact.
     *
     * @see #getType()
     */
    private String type;

    /**
     * The classifier of the signature artifact.
     *
     * @see #getClassifier()
     */
    private String classifier;

    /**
     * The date of the signature artifact.
     *
     * @see #getDate()
     */
    private Date date;

    private Callable<File> toSignGenerator;

    private Callable<String> classifierGenerator;

    @Nullable
    private Callable<String> nameGenerator;

    /**
     * Creates a signature artifact for the given public artifact.
     *
     * <p>The file to sign will be the file of the given artifact and the classifier of this signature artifact will default to the classifier of the given artifact to sign.</p>
     * <p>The artifact to sign may change after being used as the source for this signature.</p>
     *
     * @param toSign The artifact that is to be signed
     * @param signatureSpec The specification of how the artifact is to be signed
     * @param tasks The task(s) that will invoke {@link #generate()} on this signature (optional)
     */
    public Signature(final PublishArtifact toSign, SignatureSpec signatureSpec, Object... tasks) {
        this(toSign, toSign::getFile, toSign::getClassifier, toSign::getName, signatureSpec, tasks);
    }

    Signature(Buildable source, Callable<File> toSign, Callable<String> classifier, Callable<String> name, SignatureSpec signatureSpec, Object... tasks) {
        // TODO: find a way to inject a proper task dependency factory without breaking the public API
        super(DefaultTaskDependencyFactory.withNoAssociatedProject(), tasks);
        init(toSign, classifier, name, signatureSpec);
        this.source = source;
    }

    /**
     * Creates a signature artifact for the given file.
     *
     * @param toSign The file that is to be signed
     * @param signatureSpec The specification of how the artifact is to be signed
     * @param tasks The task(s) that will invoke {@link #generate()} on this signature (optional)
     */
    public Signature(final File toSign, SignatureSpec signatureSpec, Object... tasks) {
        // TODO: find a way to inject a proper task dependency factory without breaking the public API
        super(DefaultTaskDependencyFactory.withNoAssociatedProject(), tasks);
        init(returning(toSign), null, null, signatureSpec);
    }

    /**
     * Creates a signature artifact for the given file, with the given classifier.
     *
     * @param toSign The file that is to be signed
     * @param classifi
```