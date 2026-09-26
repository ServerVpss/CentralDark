# COMANDO - jaxb-parent-2.3.2.pom
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\caches\modules-2\files-2.1\com.sun.xml.bind.mvn\jaxb-parent\2.3.2\5d96ada92105844d8a2eedfb63bf782a712cc0a\jaxb-parent-2.3.2.pom
**SHA:** 20dd6dc34ab7549a
**Timestamp:** 2026-08-28T02:48:40.767942
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- <!--todo: fix me-->

### Ouro Bruto (primeiros 5000 chars)
```
<?xml version="1.0" encoding="UTF-8"?>
<!--

    Copyright (c) 2013, 2018 Oracle and/or its affiliates. All rights reserved.

    This program and the accompanying materials are made available under the
    terms of the Eclipse Distribution License v. 1.0, which is available at
    http://www.eclipse.org/org/documents/edl-v10.php.

    SPDX-License-Identifier: BSD-3-Clause

-->

<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.sun.xml.bind</groupId>
        <artifactId>jaxb-bom-ext</artifactId>
        <version>2.3.2</version>
        <relativePath>boms/bom-ext/pom.xml</relativePath>
    </parent>

    <groupId>com.sun.xml.bind.mvn</groupId>
    <artifactId>jaxb-parent</artifactId>
    <version>2.3.2</version>
    <packaging>pom</packaging>
    <name>JAXB Reference Implementation</name>
    <description>
        Open source Reference Implementation of JSR-222: Java Architecture for XML Binding
    </description>

    <url>https://javaee.github.io/jaxb-v2/</url>
    <scm>
        <connection>scm:git:ssh://git@github.com/eclipse-ee4j/jaxb-ri</connection>
        <developerConnection>scm:git:ssh://git@github.com/eclipse-ee4j/jaxb-ri.git</developerConnection>
        <url>https://github.com/eclipse-ee4j/jaxb-ri.git</url>
        <tag>HEAD</tag>
    </scm>

    <licenses>
        <license>
            <name>Eclipse Distribution License - v 1.0</name>
            <url>http://www.eclipse.org/org/documents/edl-v10.php</url>
            <distribution>repo</distribution>
        </license>
    </licenses>

    <developers>
        <developer>
            <name>Roman Grigoriadi</name>
            <email>roman.grigoriadi@oracle.com</email>
            <organization>Oracle Corporation</organization>
        </developer>
    </developers>

    <organization>
        <name>Oracle Corporation</name>
        <url>http://www.oracle.com/</url>
    </organization>

    <issueManagement>
        <system>github</system>
        <url>https://github.com/eclipse-ee4j/jaxb-ri/issues</url>
    </issueManagement>

    <mailingLists>
        <mailingList>
            <name>JAXB mailing list</name>
            <post>jaxb-dev@eclipse.org</post>
            <subscribe>https://dev.eclipse.org/mailman/listinfo/jaxb-dev</subscribe>
            <unsubscribe>https://dev.eclipse.org/mailman/listinfo/jaxb-dev</unsubscribe>
            <archive>https://dev.eclipse.org/mhonarc/lists/jaxb-dev</archive>
        </mailingList>
    </mailingLists>

    <repositories>
        <repository>
            <id>netbeans</id>
            <name>Repository hosting NetBeans modules</name>
            <url>http://bits.netbeans.org/nexus/content/groups/netbeans</url>
            <snapshots>
                <enabled>false</enabled>
            </snapshots>
        </repository>
    </repositories>

    <properties>
        <junit.version>4.12</junit.version>
        <args4j.version>1.0</args4j.version>

        <module.path>${project.build.directory}/mods</module.path>
        <!-- This will work ONLY if mvn is run from root folder. In case of runing from submodules - fail :( -->
        <glassfish.findbugs.version>1.7</glassfish.findbugs.version>
        <findbugs.skip>false</findbugs.skip>
        <findbugs.threshold>High</findbugs.threshold>
        <findbugs.exclude/>
        <findbugs.version>3.0.1</findbugs.version>
        <skipOsgiTests>true</skipOsgiTests>
        <netbeans.hint.jdkPlatform>JDK_9</netbeans.hint.jdkPlatform>
        <felix.junit4osgi>1.0.0</felix.junit4osgi>
        <felix.osgi.core>6.0.0</felix.osgi.core>
        <jmockit.version>1.34</jmockit.version>
        <copyright.template.file>tools/config/copyright.txt</copyright.template.file>
        <copyright.exclude.file>tools/config/copyright-exclude</copyright.exclude.file>
        <mrjar.sourceDirectory>${project.basedir}/src/main/java-mr</mrjar.sourceDirectory>
        <base.java.level>7</base.java.level>
        <upper.java.level>9</upper.java.level>
        <root.dir>${session.executionRootDirectory}/..</root.dir>
        <oss.disallow.snapshots>true</oss.disallow.snapshots>
    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>args4j</groupId>
                <artifactId>args4j</artifactId>
                <version>${args4j.version}</version>
            </dependency>
            <!-- Test -->
            <dependency>
                <groupId>org.jmockit</groupId>
                <artifactId>jmockit</artifactId>
                <version>${jmockit.version}</version>
                <scope>test</scope>
            </dependency>
            <dependency>
                <groupId>junit</groupId>
                <artifactId>junit</artifactId>
                <version>${junit.version}</version>
   
```