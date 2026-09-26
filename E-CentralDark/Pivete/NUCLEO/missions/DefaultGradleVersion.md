# MISSAO - DefaultGradleVersion.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\logging\org\gradle\util\internal\DefaultGradleVersion.java
**SHA:** d8bfcccae103a6d5
**Timestamp:** 2026-08-28T02:50:39.508209
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- private static final Pattern VERSION_PATTERN = Pattern.compile("((\\d+)(\\.\\d+)+)(-(\\p{Alpha}+)-(\\w+))?(-(SNAPSHOT|\\d{14}([-+]\\d{4})?))?");

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2021 the original author or authors.
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

package org.gradle.util.internal;


import org.gradle.api.GradleException;
import org.gradle.internal.UncheckedException;
import org.gradle.internal.deprecation.DeprecationLogger;
import org.gradle.util.GradleVersion;

import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Properties;
import java.util.TimeZone;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static java.lang.String.format;
import static org.gradle.internal.IoActions.uncheckedClose;

public final class DefaultGradleVersion extends GradleVersion {
    private static final Pattern VERSION_PATTERN = Pattern.compile("((\\d+)(\\.\\d+)+)(-(\\p{Alpha}+)-(\\w+))?(-(SNAPSHOT|\\d{14}([-+]\\d{4})?))?");
    private static final int STAGE_MILESTONE = 0;
    private static final int STAGE_UNKNOWN = 1;
    private static final int STAGE_PREVIEW = 2;
    private static final int STAGE_RC = 3;

    private final String version;
    private final int majorPart;
    private final String buildTime;
    private final String commitId;
    private final Long snapshot;
    private final String versionPart;
    private final Stage stage;
    private static final DefaultGradleVersion CURRENT;

    public static final String RESOURCE_NAME = "/org/gradle/build-receipt.properties";
    public static final String VERSION_OVERRIDE_VAR = "GRADLE_VERSION_OVERRIDE";
    public static final String VERSION_NUMBER_PROPERTY = "versionNumber";

    static {
        URL resource = DefaultGradleVersion.class.getResource(RESOURCE_NAME);
        if (resource == null) {
            throw new GradleException(format("Resource '%s' not found.", RESOURCE_NAME));
        }

        InputStream inputStream = null;
        try {
            URLConnection connection = resource.openConnection();
            connection.setUseCaches(false);
            inputStream = connection.getInputStream();
            Properties properties = new Properties();
            properties.load(inputStream);

            String version = properties.get(VERSION_NUMBER_PROPERTY).toString();

            // We allow the gradle version to be overridden for tests that are sensitive
            // to the version and need to test with various different version patterns.
            // We use an env variable because these are easy to set on daemon startup,
            // whereas system properties are scrubbed at daemon startup.
            String overrideVersion = System.getenv(VERSION_OVERRIDE_VAR);
            if (overrideVersion != null) {
                version = overrideVersion;
            }

            String buildTimestamp = properties.get("buildTimestampIso").toString();
            String commitId = properties.get("commitId").toString();

            CURRENT = new DefaultGradleVersion(version, "unknown".equals(buildTimestamp) ? null : buildTimestamp, commitId);
        } catch (Exception e) {
            throw new GradleException(format("Could not load version details from resource '%s'.", resource), e);
        } finally {
            if (inputStream != null) {
                uncheckedClose(inputStream);
            }
        }
    }

    public static DefaultGradleVersion current() {
        return CURRENT;
    }

    /**
     * Parses the given string into a GradleVersion.
     *
     * @throws IllegalArgumentException On unrecognized version string.
     */
    public static DefaultGradleVersion version(String version) throws IllegalArgumentException {
        return new DefaultGradleVersion(version, null, null);
    }

    private DefaultGradleVersion(String version, String buildTime, String commitId) {
        this.version = version;
        this.buildTime = buildTime;
        Matcher matcher = VERSION_PATTERN.matcher(version);
        if (!matcher.matches()) {
            throw new IllegalArgumentException(format("'%s' is not a valid Gradle version string (examples: '1.0', '1.0-rc-1')", version));
        }

        versionPart = matcher.group(1);
        majorPart = Integer.parseInt(matcher.group(2), 10);

        this.commitId = setOrParseCommitId(commitId, matcher);
        this.stage = parseStage(matcher);
        this.snapshot = parseSnapshot(matcher);
    }

    private Long parseSnapshot(Matcher matcher) {
        if ("snapshot".equals(matcher.group(5)) || is
```