# OUTRO - jopt-simple-4.9.pom
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\caches\modules-2\files-2.1\net.sf.jopt-simple\jopt-simple\4.9\ea3cd0a93e4e8adc1cdadd544c9168bc5aa985a8\jopt-simple-4.9.pom
**SHA:** 7af7e2d8b24b4798
**Timestamp:** 2026-08-28T02:49:58.539285
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- <!-- TODO: Workaround for JDK8 - avoid javadoc bug on HTML kbd tag -->

### Ouro Bruto (primeiros 5000 chars)
```
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.sonatype.oss</groupId>
        <artifactId>oss-parent</artifactId>
        <version>7</version>
    </parent>
    <groupId>net.sf.jopt-simple</groupId>
    <artifactId>jopt-simple</artifactId>
    <version>4.9</version>
    <packaging>jar</packaging>
    <name>JOpt Simple</name>
    <url>http://pholser.github.com/jopt-simple</url>
    <description>A Java library for parsing command line options</description>
    <licenses>
        <license>
            <name>The MIT License</name>
            <url>http://www.opensource.org/licenses/mit-license.php</url>
            <distribution>repo</distribution>
        </license>
    </licenses>
    <scm>
        <connection>scm:git:git://github.com/pholser/jopt-simple.git</connection>
        <developerConnection>scm:git:ssh://git@github.com/pholser/jopt-simple.git</developerConnection>
        <url>http://github.com/pholser/jopt-simple</url>
    </scm>
    <issueManagement>
        <system>GitHub</system>
        <url>http://github.com/pholser/jopt-simple/issues</url>
    </issueManagement>
    <developers>
        <developer>
            <id>pholser</id>
            <name>Paul Holser</name>
            <email>pholser@alumni.rice.edu</email>
            <url>http://www.pholser.com</url>
        </developer>
    </developers>
    <properties>
        <project.build.outputEncoding>UTF-8</project.build.outputEncoding>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.project.outputEncoding>UTF-8</project.project.outputEncoding>
    </properties>
    <dependencies>
        <dependency>
            <groupId>joda-time</groupId>
            <artifactId>joda-time</artifactId>
            <version>2.3</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.apache.ant</groupId>
            <artifactId>ant</artifactId>
            <version>1.8.4</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <!-- Must precede junit
            See http://jmockit.googlecode.com/svn/trunk/www/tutorial/RunningTests.html -->
            <groupId>com.googlecode.jmockit</groupId>
            <artifactId>jmockit</artifactId>
            <version>1.6</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.hamcrest</groupId>
            <artifactId>hamcrest-all</artifactId>
            <version>1.3</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.12</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.infinitest</groupId>
            <artifactId>continuous-testing-toolkit</artifactId>
            <version>1.0</version>
            <scope>test</scope>
            <exclusions>
                <exclusion>
                    <groupId>org.hamcrest</groupId>
                    <artifactId>hamcrest-all</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
    </dependencies>
    <build>
        <extensions>
            <extension>
                <groupId>org.apache.maven.scm</groupId>
                <artifactId>maven-scm-provider-gitexe</artifactId>
                <version>1.9.2</version>
            </extension>
            <extension>
                <groupId>org.apache.maven.scm</groupId>
                <artifactId>maven-scm-manager-plexus</artifactId>
                <version>1.9.2</version>
            </extension>
            <extension>
                <groupId>org.kathrynhuxtable.maven.wagon</groupId>
                <artifactId>wagon-gitsite</artifactId>
                <version>0.3.1</version>
            </extension>
        </extensions>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.2</version>
                <configuration>
                    <source>1.5</source>
                    <target>1.5</target>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.codehaus.mojo</groupId>
                <artifactId>animal-sniffer-maven-plugin</artifactId>
                <version>1.13</version>
                <configuration>
                    <signature>
                        <groupId>org.codehaus.mojo.signature</groupId>
                        <artifactId>java15</artifactId>
                        <version>1.0</version>
                    </signature>
                </configuration>
                <ex
```