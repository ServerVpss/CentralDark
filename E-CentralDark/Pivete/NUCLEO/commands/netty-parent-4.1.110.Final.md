# COMANDO - netty-parent-4.1.110.Final.pom
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\caches\modules-2\files-2.1\io.netty\netty-parent\4.1.110.Final\d05dfececb55882861d47645692896eb2b0c7964\netty-parent-4.1.110.Final.pom
**SHA:** 685adaf373666fc1
**Timestamp:** 2026-08-28T02:49:01.368236
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- <entry key="${project.artifactId}.buildDate" type="date" value="now" pattern="yyyy-MM-dd HH:mm:ss Z" />

### Ouro Bruto (primeiros 5000 chars)
```
<?xml version="1.0" encoding="UTF-8"?>
<!--
  ~ Copyright 2012 The Netty Project
  ~
  ~ The Netty Project licenses this file to you under the Apache License,
  ~ version 2.0 (the "License"); you may not use this file except in compliance
  ~ with the License. You may obtain a copy of the License at:
  ~
  ~   https://www.apache.org/licenses/LICENSE-2.0
  ~
  ~ Unless required by applicable law or agreed to in writing, software
  ~ distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
  ~ WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
  ~ License for the specific language governing permissions and limitations
  ~ under the License.
  -->
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/maven-v4_0_0.xsd">

  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.sonatype.oss</groupId>
    <artifactId>oss-parent</artifactId>
    <version>9</version>
  </parent>

  <groupId>io.netty</groupId>
  <artifactId>netty-parent</artifactId>
  <packaging>pom</packaging>
  <version>4.1.110.Final</version>

  <name>Netty</name>
  <url>https://netty.io/</url>
  <description>
    Netty is an asynchronous event-driven network application framework for
    rapid development of maintainable high performance protocol servers and
    clients.
  </description>

  <organization>
    <name>The Netty Project</name>
    <url>https://netty.io/</url>
  </organization>

  <licenses>
    <license>
      <name>Apache License, Version 2.0</name>
      <url>https://www.apache.org/licenses/LICENSE-2.0</url>
    </license>
  </licenses>
  <inceptionYear>2008</inceptionYear>

  <scm>
    <url>https://github.com/netty/netty</url>
    <connection>scm:git:git://github.com/netty/netty.git</connection>
    <developerConnection>scm:git:ssh://git@github.com/netty/netty.git</developerConnection>
    <tag>netty-4.1.110.Final</tag>
  </scm>

  <developers>
    <developer>
      <id>netty.io</id>
      <name>The Netty Project Contributors</name>
      <email>netty@googlegroups.com</email>
      <url>https://netty.io/</url>
      <organization>The Netty Project</organization>
      <organizationUrl>https://netty.io/</organizationUrl>
    </developer>
  </developers>

  <profiles>
    <profile>
      <id>aggregate</id>
      <properties>
        <checkstyle.skip>true</checkstyle.skip>
      </properties>
      <build>
        <plugins>
          <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-javadoc-plugin</artifactId>
            <version>3.2.0</version>
            <executions>
              <execution>
                <id>aggregate</id>
                <goals>
                  <goal>aggregate</goal>
                </goals>
              </execution>
            </executions>
            <configuration>
              <skippedModules>
                netty-all,netty-bom,netty-testsuite,netty-testsuite-autobahn,netty-testsuite-http2,
                netty-testsuite-native,netty-testsuite-native-image,netty-testsuite-native-image-client,
                netty-testsuite-native-image-client-runtime-init,netty-testsuite-osgi,netty-testsuite-shading,
                netty-transport-blockhound-tests,netty-transport-native-unix-common-tests,netty-microbench,
                netty-dev-tools,netty-example
              </skippedModules>
              <sourceFileExcludes>
                <exclude>**/com/sun/**/*.java</exclude>
                <exclude>**/example/**/*.java</exclude>
                <exclude>**/testsuite/**/*.java</exclude>
                <exclude>**/microbench/**/*.java</exclude>
                <exclude>**/microbenchmark/**/*.java</exclude>
                <exclude>**/generated/**/*.java</exclude>
                <exclude>**/*Benchmark.java</exclude>
                <exclude>**/*Bench.java</exclude>
                <exclude>**/*Test.java</exclude>
              </sourceFileExcludes>
              <docfilessubdirs>true</docfilessubdirs>
              <outputDirectory>${project.build.directory}/api</outputDirectory>
              <overview>${project.basedir}/src/javadoc/overview.html</overview>
              <doctitle>Netty API Reference (${project.version})</doctitle>
              <windowtitle>Netty API Reference (${project.version})</windowtitle>
              <detectJavaApiLink>false</detectJavaApiLink>
              <links>
                <link>https://docs.oracle.com/javase/8/docs/api/</link>
                <link>https://developers.google.com/protocol-buffers/docs/reference/java/</link>
                <link>https://www.slf4j.org/apidocs/</link>
              </links>
              <groups>
                <group>
                  <title>Low-level data representation</title>
                  <packages>io.netty.buffer*</packages>
                </group>
                <group>
                  <title>Cent
```