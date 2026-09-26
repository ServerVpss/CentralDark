# COMANDO - guava-parent-33.3.1-jre.pom
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\caches\modules-2\files-2.1\com.google.guava\guava-parent\33.3.1-jre\94729a0ed1dc35f623edd13afa6c1c2fe9a15d7c\guava-parent-33.3.1-jre.pom
**SHA:** 55441db27e8869df
**Timestamp:** 2026-08-28T02:48:17.654302
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- <!-- TODO: b/286965322 - Use a newer version (probably the default toolchain we set up?) if it doesn't break Javadoc (including causing trouble for our later run of JDiff, which we do outside Maven, d

### Ouro Bruto (primeiros 5000 chars)
```
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">

  <modelVersion>4.0.0</modelVersion>
  <groupId>com.google.guava</groupId>
  <artifactId>guava-parent</artifactId>
  <version>33.3.1-jre</version>
  <packaging>pom</packaging>
  <name>Guava Maven Parent</name>
  <description>Parent for guava artifacts</description>
  <url>https://github.com/google/guava</url>
  <properties>
    <!--
    We could override this to change which version we run tests under.
    However, I think that our -Djava.security.manager=allow profile is based on the *Maven* JDK.
    If we want to use overrides here, we should change that profile to also be based on surefire.toolchain.version.
    -->
    <surefire.toolchain.version>${java.specification.version}</surefire.toolchain.version>
    <!-- Override this with -Dtest.include="**/SomeTest.java" on the CLI -->
    <test.include>%regex[.*.class]</test.include>
    <truth.version>1.4.4</truth.version>
    <jsr305.version>3.0.2</jsr305.version>
    <checker.version>3.43.0</checker.version>
    <errorprone.version>2.28.0</errorprone.version>
    <j2objc.version>3.0.0</j2objc.version>
    <!-- Empty for all JDKs but 9-12 -->
    <maven-javadoc-plugin.additionalJOptions></maven-javadoc-plugin.additionalJOptions>
    <project.build.outputTimestamp>2024-09-23T19:41:42Z</project.build.outputTimestamp>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <test.add.opens></test.add.opens>
    <test.add.args></test.add.args>
    <module.status>release</module.status>
    <variant.jvmEnvironment>standard-jvm</variant.jvmEnvironment>
    <variant.jvmEnvironmentVariantName>jre</variant.jvmEnvironmentVariantName>
    <otherVariant.version>33.3.1-android</otherVariant.version>
    <otherVariant.jvmEnvironment>android</otherVariant.jvmEnvironment>
    <otherVariant.jvmEnvironmentVariantName>android</otherVariant.jvmEnvironmentVariantName>
  </properties>
  <issueManagement>
    <system>GitHub Issues</system>
    <url>https://github.com/google/guava/issues</url>
  </issueManagement>
  <inceptionYear>2010</inceptionYear>
  <licenses>
    <license>
      <name>Apache License, Version 2.0</name>
      <url>http://www.apache.org/licenses/LICENSE-2.0.txt</url>
      <distribution>repo</distribution>
    </license>
  </licenses>
  <scm>
    <connection>scm:git:https://github.com/google/guava.git</connection>
    <developerConnection>scm:git:git@github.com:google/guava.git</developerConnection>
    <url>https://github.com/google/guava</url>
  </scm>
  <developers>
    <developer>
      <id>kevinb9n</id>
      <name>Kevin Bourrillion</name>
      <email>kevinb@google.com</email>
      <organization>Google</organization>
      <organizationUrl>http://www.google.com</organizationUrl>
      <roles>
        <role>owner</role>
        <role>developer</role>
      </roles>
      <timezone>-8</timezone>
    </developer>
  </developers>
  <ciManagement>
    <system>GitHub Actions</system>
    <url>https://github.com/google/guava/actions</url>
  </ciManagement>
  <modules>
    <module>guava</module>
    <module>guava-bom</module>
    <module>guava-gwt</module>
    <module>guava-testlib</module>
    <module>guava-tests</module>
  </modules>
  <build>
    <!-- Handle where Guava deviates from Maven defaults -->
    <sourceDirectory>src</sourceDirectory>
    <testSourceDirectory>test</testSourceDirectory>
    <resources>
      <resource>
        <directory>..</directory>
        <includes>
          <include>LICENSE</include>
        </includes>
        <targetPath>META-INF</targetPath>
      </resource>
    </resources>
    <testResources>
      <testResource>
        <directory>test</directory>
        <excludes>
          <exclude>**/*.java</exclude>
        </excludes>
      </testResource>
    </testResources>
    <plugins>
      <plugin>
        <artifactId>maven-enforcer-plugin</artifactId>
        <executions>
          <execution>
            <id>enforce-versions</id>
            <goals>
              <goal>enforce</goal>
            </goals>
            <configuration>
              <rules>
                <requireMavenVersion>
                  <version>3.0.5</version>
                </requireMavenVersion>
                <requireJavaVersion>
                  <version>1.8.0</version>
                </requireJavaVersion>
              </rules>
            </configuration>
          </execution>
        </executions>
      </plugin>
    </plugins>
    <pluginManagement>
      <plugins>
        <plugin>
          <artifactId>maven-compiler-plugin</artifactId>
          <version>3.13.0</version>
          <configuration>
            <source>1.8</source>
            <target>1.8</target>
            <encoding>UTF-8</encoding>
            <parameters>true</parameters>
            <compile
```