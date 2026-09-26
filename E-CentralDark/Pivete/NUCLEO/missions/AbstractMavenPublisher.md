# MISSAO - AbstractMavenPublisher.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\maven\org\gradle\api\publish\maven\internal\publisher\AbstractMavenPublisher.java
**SHA:** d89fc56c2cba9ffd
**Timestamp:** 2026-08-28T02:50:40.779815
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- private static final Pattern VERSION_FILE_PATTERN = Pattern.compile("^(.*)-([0-9]{8}.[0-9]{6})-([0-9]+)$");

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

package org.gradle.api.publish.maven.internal.publisher;

import org.apache.maven.artifact.repository.metadata.Metadata;
import org.apache.maven.artifact.repository.metadata.Versioning;
import org.apache.maven.artifact.repository.metadata.io.xpp3.MetadataXpp3Reader;
import org.apache.maven.artifact.repository.metadata.io.xpp3.MetadataXpp3Writer;
import org.gradle.api.NonNullApi;
import org.gradle.api.UncheckedIOException;
import org.gradle.api.internal.artifacts.repositories.resolver.ExternalResourceResolver;
import org.gradle.api.internal.artifacts.repositories.transport.NetworkOperationBackOffAndRetry;
import org.gradle.api.publish.maven.MavenArtifact;
import org.gradle.internal.Factory;
import org.gradle.internal.UncheckedException;
import org.gradle.internal.hash.HashCode;
import org.gradle.internal.hash.HashFunction;
import org.gradle.internal.hash.Hashing;
import org.gradle.internal.resource.ExternalResourceName;
import org.gradle.internal.resource.ExternalResourceReadResult;
import org.gradle.internal.resource.ExternalResourceRepository;
import org.gradle.internal.resource.ReadableContent;
import org.gradle.internal.resource.local.ByteArrayReadableContent;
import org.gradle.internal.resource.local.FileReadableContent;
import org.gradle.internal.xml.XmlTransformer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.Nullable;
import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.concurrent.Callable;
import java.util.regex.Pattern;

@NonNullApi
abstract class AbstractMavenPublisher implements MavenPublisher {
    private static final Logger LOGGER = LoggerFactory.getLogger(MavenPublisher.class);

    private final NetworkOperationBackOffAndRetry<ExternalResourceReadResult<Metadata>> metadataRetryCaller = new NetworkOperationBackOffAndRetry<>();
    private static final String POM_FILE_ENCODING = "UTF-8";
    private static final String SNAPSHOT_VERSION = "SNAPSHOT";
    private static final Pattern VERSION_FILE_PATTERN = Pattern.compile("^(.*)-([0-9]{8}.[0-9]{6})-([0-9]+)$");
    private final Factory<File> temporaryDirFactory;
    private final XmlTransformer xmlTransformer = new XmlTransformer();

    AbstractMavenPublisher(Factory<File> temporaryDirFactory) {
        this.temporaryDirFactory = temporaryDirFactory;
    }

    protected void publish(MavenNormalizedPublication publication, ExternalResourceRepository repository, URI rootUri, boolean localRepo) {
        String groupId = publication.getGroupId();
        String artifactId = publication.getArtifactId();
        String version = publication.getVersion();

        ModuleArtifactPublisher artifactPublisher = new ModuleArtifactPublisher(repository, localRepo, rootUri, groupId, artifactId, version);
        SnapshotMetadataResult snapshotMetadataResult = computeSnapshotMetadata(publication, repository, version, artifactPublisher, groupId, artifactId);

        if (snapshotMetadataResult != null && !localRepo) {
            // Use the timestamped version for all published artifacts
            artifactPublisher.artifactVersion = snapshotMetadataResult.getVersion();
        }

        publishArtifactsAndMetadata(publication, artifactPublisher);

        publishPublicationMetadata(repository, version, artifactPublisher, groupId, artifactId, snapshotMetadataResult);
    }

    @Nullable
    private SnapshotMetadataResult computeSnapshotMetadata(MavenNormalizedPublication publication, ExternalResourceRepository repository, String version, ModuleArtifactPublisher artifactPublisher, String groupId, String artifactId) {
        if (isSnapshot(version)) {
            ExternalResourceName snapshotMetadataPath = artifactPublisher.getSnapshotMetadataLocation();
            Metadata snapshotMetadata = createSnapshotMetadata(publication, groupId, artifactId, version, repository, snapshotMetadataPath);
            return new SnapshotMetadataResult(snapshotMetadataPath, snapshotMetadata);
        }
        return null;
    }

    private void publishPublicationMetadata(ExternalResourceRepository repository, String version, ModuleArtifactPublisher artifactPublisher, String groupId, String artifactId, @Nullable SnapshotMetadataResult snapshotMetadataResult) {
        if (snapshotMetadataResult != null) {
            artifactPubl
```