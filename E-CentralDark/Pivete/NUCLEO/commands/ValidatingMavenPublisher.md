# COMANDO - ValidatingMavenPublisher.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\maven\org\gradle\api\publish\maven\internal\publisher\ValidatingMavenPublisher.java
**SHA:** ff38e856da8d38bf
**Timestamp:** 2026-08-28T02:50:40.922801
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- this.delegate = delegate;

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

package org.gradle.api.publish.maven.internal.publisher;

import org.apache.commons.lang.ObjectUtils;
import org.gradle.api.UncheckedIOException;
import org.gradle.api.artifacts.repositories.MavenArtifactRepository;
import org.gradle.api.publish.PublicationArtifact;
import org.gradle.api.publish.internal.PublicationFieldValidator;
import org.gradle.api.publish.maven.InvalidMavenPublicationException;
import org.apache.maven.model.Model;
import org.apache.maven.model.io.xpp3.MavenXpp3Reader;
import org.codehaus.plexus.util.xml.pull.XmlPullParserException;
import org.gradle.api.publish.maven.MavenArtifact;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

public class ValidatingMavenPublisher implements MavenPublisher {
    private static final java.lang.String ID_REGEX = "[A-Za-z0-9_\\-.]+";
    private final MavenPublisher delegate;

    public ValidatingMavenPublisher(MavenPublisher delegate) {
        this.delegate = delegate;
    }

    @Override
    public void publish(MavenNormalizedPublication publication, MavenArtifactRepository artifactRepository) {
        validateIdentity(publication);
        validateArtifacts(publication);
        checkNoDuplicateArtifacts(publication);

        delegate.publish(publication, artifactRepository);
    }

    private void validateIdentity(MavenNormalizedPublication publication) {
        Model model = parsePomFileIntoMavenModel(publication);

        field(publication, "artifactId", publication.getArtifactId())
                .validMavenIdentifier()
                .matches(model.getArtifactId());

        boolean hasParentPom = model.getParent() != null;
        MavenFieldValidator groupIdValidator = field(publication, "groupId", publication.getGroupId())
                .validMavenIdentifier();
        MavenFieldValidator versionValidator = field(publication, "version", publication.getVersion())
                .notEmpty()
                .validInFileName();

        if (!hasParentPom) {
            groupIdValidator.matches(model.getGroupId());
            versionValidator.matches(model.getVersion());
        }
    }

    private Model parsePomFileIntoMavenModel(MavenNormalizedPublication publication) {
        File pomFile = publication.getPomArtifact().getFile();
        try {
            Model model = readModelFromPom(pomFile);
            model.setPomFile(pomFile);
            return model;
        } catch (XmlPullParserException parseException) {
            throw new InvalidMavenPublicationException(publication.getName(),
                    "POM file is invalid. Check any modifications you have made to the POM file.",
                    parseException);
        } catch (IOException ex) {
            throw new UncheckedIOException(ex);
        }
    }

    private Model readModelFromPom(File pomFile) throws IOException, XmlPullParserException {
        try (FileReader reader = new FileReader(pomFile)) {
            return new MavenXpp3Reader().read(reader);
        }
    }

    private void validateArtifacts(MavenNormalizedPublication publication) {
        for (MavenArtifact artifact : publication.getAllArtifacts()) {
            field(publication, "artifact extension", artifact.getExtension())
                    .notNull()
                    .validInFileName();
            field(publication, "artifact classifier", artifact.getClassifier())
                    .optionalNotEmpty()
                    .validInFileName();

            checkCanPublish(publication.getName(), artifact);
        }
    }

    private void checkNoDuplicateArtifacts(MavenNormalizedPublication publication) {
        Set<MavenArtifact> verified = new HashSet<>();
        for (MavenArtifact artifact : publication.getAllArtifacts()) {
            checkNotDuplicate(publication, verified, artifact.getExtension(), artifact.getClassifier());
            verified.add(artifact);
        }
    }

    private void checkNotDuplicate(MavenNormalizedPublication publication, Set<MavenArtifact> artifacts, String extension, String classifier) {
        for (MavenArtifact artifact : artifacts) {
            if (ObjectUtils.equals(artifact.getExtension(), extension) && ObjectUtils.equals(artifact.getClassifier(), classifier)) {
                String message = String.format(
                        "multiple artifacts w
```