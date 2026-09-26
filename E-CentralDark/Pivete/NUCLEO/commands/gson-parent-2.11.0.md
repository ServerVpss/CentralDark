# COMANDO - gson-parent-2.11.0.pom
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\caches\modules-2\files-2.1\com.google.code.gson\gson-parent\2.11.0\b32d3bc5c89c852efe4c176df6c3fdeccbe150ef\gson-parent-2.11.0.pom
**SHA:** 8acb1f3b72a6f026
**Timestamp:** 2026-08-28T02:47:54.732991
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- antrun:run@replace-version-placeholders
- antrun:run@replace-old-version-references
- antrun:run@git-add-changed

### Gaps
- TODO: Does not work properly yet, see https://github.com/google/error-prone/issues/4206,

### Ouro Bruto (primeiros 5000 chars)
```
<?xml version="1.0" encoding="UTF-8"?>
<!--
  Copyright 2015 Google LLC

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd" child.project.url.inherit.append.path="false">
  <modelVersion>4.0.0</modelVersion>

  <groupId>com.google.code.gson</groupId>
  <artifactId>gson-parent</artifactId>
  <version>2.11.0</version>
  <packaging>pom</packaging>

  <name>Gson Parent</name>
  <description>Gson JSON library</description>
  <url>https://github.com/google/gson</url>

  <modules>
    <module>gson</module>
    <module>graal-native-image-test</module>
    <module>shrinker-test</module>
    <module>extras</module>
    <module>metrics</module>
    <module>proto</module>
  </modules>

  <properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <maven.compiler.release>7</maven.compiler.release>
    <maven.compiler.testRelease>11</maven.compiler.testRelease>

    <!-- Make the build reproducible, see https://maven.apache.org/guides/mini/guide-reproducible-builds.html -->
    <!-- Automatically updated by Maven Release Plugin -->
    <project.build.outputTimestamp>2024-05-19T18:53:38Z</project.build.outputTimestamp>
  </properties>

  <!-- These attributes specify that the URLs should be inherited by the modules as is, to avoid constructing
    invalid URLs, see also https://maven.apache.org/ref/3.9.1/maven-model-builder/index.html#inheritance-assembly -->
  <scm child.scm.url.inherit.append.path="false" child.scm.connection.inherit.append.path="false" child.scm.developerConnection.inherit.append.path="false">
    <url>https://github.com/google/gson/</url>
    <connection>scm:git:https://github.com/google/gson.git</connection>
    <developerConnection>scm:git:git@github.com:google/gson.git</developerConnection>
    <tag>gson-parent-2.11.0</tag>
  </scm>

  <developers>
    <developer>
      <id>google</id>
      <organization>Google</organization>
      <organizationUrl>https://www.google.com</organizationUrl>
    </developer>
  </developers>

  <issueManagement>
    <system>GitHub Issues</system>
    <url>https://github.com/google/gson/issues</url>
  </issueManagement>

  <licenses>
    <license>
      <name>Apache-2.0</name>
      <url>https://www.apache.org/licenses/LICENSE-2.0.txt</url>
    </license>
  </licenses>

  <distributionManagement>
    <repository>
      <id>sonatype-nexus-staging</id>
      <name>Nexus Release Repository</name>
      <url>https://oss.sonatype.org/service/local/staging/deploy/maven2/</url>
    </repository>
  </distributionManagement>

  <dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.13.2</version>
      </dependency>

      <dependency>
        <groupId>com.google.truth</groupId>
        <artifactId>truth</artifactId>
        <version>1.4.2</version>
      </dependency>
    </dependencies>
  </dependencyManagement>

  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-enforcer-plugin</artifactId>
        <version>3.4.1</version>
        <executions>
          <execution>
            <id>enforce-versions</id>
            <goals>
              <goal>enforce</goal>
            </goals>
            <configuration>
              <rules>
                <requireMavenVersion>
                  <!-- Usage of `.mvn/jvm.config` for Error Prone requires at least Maven 3.3.1 -->
                  <version>[3.3.1,)</version>
                </requireMavenVersion>

                <!-- Enforce that correct JDK version is used to avoid cryptic build errors -->
                <requireJavaVersion>
                  <!-- Other plugins of this build require at least JDK 11 -->
                  <!-- Fail fast when building with JDK > 17 because it causes build failures,
                    see https://github.com/google/gson/issues/2501 -->
                  <version>[11,18)</version>
                </requireJavaVersion>
              </rules>
            </configuration>
          </execution>
        </executions>
      </plugin>

      <!-- Spotless plugin: keeps the code formatted following the google-java-styleguide -->
      <plugin>
        <groupId>com.diffplug.spotless</groupId>
        <artifactId>spotless-maven-plugi
```