# MISSAO - apache-18.pom
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\caches\modules-2\files-2.1\org.apache\apache\18\bd408bbea3840f2c7f914b29403e39a90f84fd5f\apache-18.pom
**SHA:** 7831307285fd475b
**Timestamp:** 2026-08-28T02:49:02.359228
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- TODO: remove when upgrading to 0.12
- <dependencies><!-- TODO: remove when upgrading to 0.12, see https://issues.apache.org/jira/browse/RAT-158 -->

### Ouro Bruto (primeiros 5000 chars)
```
<?xml version="1.0" encoding="UTF-8"?>

<!--
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
-->

<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <!-- for more information, see the documentation of this POM: http://maven.apache.org/pom/asf/ -->
  <groupId>org.apache</groupId>
  <artifactId>apache</artifactId>
  <version>18</version>
  <packaging>pom</packaging>

  <name>The Apache Software Foundation</name>
  <description>
    The Apache Software Foundation provides support for the Apache community of open-source software projects.
    The Apache projects are characterized by a collaborative, consensus based development process, an open and
    pragmatic software license, and a desire to create high quality software that leads the way in its field.
    We consider ourselves not simply a group of projects sharing a server, but rather a community of developers
    and users.
  </description>
  <url>https://www.apache.org/</url>
  <organization>
    <name>The Apache Software Foundation</name>
    <url>https://www.apache.org/</url>
  </organization>
  <licenses>
    <license>
      <name>Apache License, Version 2.0</name>
      <url>https://www.apache.org/licenses/LICENSE-2.0.txt</url>
      <distribution>repo</distribution>
    </license>
  </licenses>

  <mailingLists>
    <mailingList>
      <name>Apache Announce List</name>
      <subscribe>announce-subscribe@apache.org</subscribe>
      <unsubscribe>announce-unsubscribe@apache.org</unsubscribe>
      <post>announce@apache.org</post>
      <archive>https://mail-archives.apache.org/mod_mbox/www-announce/</archive>
    </mailingList>
  </mailingLists>

  <prerequisites><!-- just for information: not inherited in child poms -->
    <maven>3.0</maven><!-- prerequisite of some plugins -->
  </prerequisites>

  <scm>
    <connection>scm:svn:https://svn.apache.org/repos/asf/maven/pom/tags/apache-18</connection>
    <developerConnection>scm:svn:https://svn.apache.org/repos/asf/maven/pom/tags/apache-18</developerConnection>
    <url>https://svn.apache.org/viewvc/maven/pom/tags/apache-18</url>
  </scm>

  <distributionManagement>
    <repository>
      <id>apache.releases.https</id>
      <name>Apache Release Distribution Repository</name>
      <url>https://repository.apache.org/service/local/staging/deploy/maven2</url>
    </repository>
    <snapshotRepository>
      <id>apache.snapshots.https</id>
      <name>${distMgmtSnapshotsName}</name>
      <url>${distMgmtSnapshotsUrl}</url>
    </snapshotRepository>
  </distributionManagement>

  <properties>
    <distMgmtSnapshotsName>Apache Development Snapshot Repository</distMgmtSnapshotsName>
    <distMgmtSnapshotsUrl>https://repository.apache.org/content/repositories/snapshots</distMgmtSnapshotsUrl>
    <organization.logo>https://www.apache.org/images/asf_logo_wide.gif</organization.logo>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
    <sourceReleaseAssemblyDescriptor>source-release</sourceReleaseAssemblyDescriptor>
    <gpg.useagent>true</gpg.useagent>
    <arguments />
    <maven.compiler.source>1.6</maven.compiler.source>
    <maven.compiler.target>1.6</maven.compiler.target>
    <surefire.version>2.19.1</surefire.version>
  </properties>

  <repositories>
    <repository>
      <id>apache.snapshots</id>
      <name>Apache Snapshot Repository</name>
      <url>https://repository.apache.org/snapshots</url>
      <releases>
        <enabled>false</enabled>
      </releases>
    </repository>
  </repositories>

  <build>
    <pluginManagement>
      <plugins>
        <!-- set versions of common plugins for reproducibility, ordered alphabetically -->
        <plugin>
          <groupId>org.apache.maven.plugins</groupId>
          <artifactId>maven-antrun-plugin</artifactId>
          <version>1.8</version>
        </plugin>
        <plugin>
          <groupId>org.apache.maven.plugins</groupId>
          <artifactId>maven-assembly-plugin</artifactId>
          <version>2.6</version>
        </plugin>
        <plugin>
          <g
```