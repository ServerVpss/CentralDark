# MISSAO - TestOutputStore.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\testing-base\org\gradle\api\internal\tasks\testing\junit\result\TestOutputStore.java
**SHA:** 126bfb8f01d50fd2
**Timestamp:** 2026-08-28T02:51:47.416128
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start = -1;
- this.start = start;
- streamRegion.start = total;
- stdOut.start = index.stdOut.start;
- stdErr.start = index.stdErr.start;

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

package org.gradle.api.internal.tasks.testing.junit.result;

import com.esotericsoftware.kryo.io.Input;
import com.esotericsoftware.kryo.io.Output;
import com.google.common.collect.ImmutableMap;
import org.gradle.api.UncheckedIOException;
import org.gradle.api.tasks.testing.TestOutputEvent;
import org.gradle.internal.file.nio.PositionTrackingFileChannelInputStream;
import org.gradle.internal.serialize.kryo.KryoBackedDecoder;
import org.gradle.internal.serialize.kryo.KryoBackedEncoder;

import javax.annotation.Nullable;
import java.io.Closeable;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.channels.FileChannel;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.StandardOpenOption;
import java.util.LinkedHashMap;
import java.util.Map;

public class TestOutputStore {

    private final File resultsDir;
    private final Charset messageStorageCharset;

    public TestOutputStore(File resultsDir) {
        this.resultsDir = resultsDir;
        this.messageStorageCharset = StandardCharsets.UTF_8;
    }

    File getOutputsFile() {
        return new File(resultsDir, "output.bin");
    }

    File getIndexFile() {
        return new File(resultsDir, getOutputsFile().getName() + ".idx");
    }

    private static class Region {
        long start;
        long stop;

        private Region() {
            start = -1;
            stop = -1;
        }

        private Region(long start, long stop) {
            this.start = start;
            this.stop = stop;
        }
    }

    private static class TestCaseRegion {
        Region stdOutRegion = new Region();
        Region stdErrRegion = new Region();
    }

    public class Writer implements Closeable {
        private final KryoBackedEncoder output;

        private final Map<Long, Map<Long, TestCaseRegion>> index = new LinkedHashMap<Long, Map<Long, TestCaseRegion>>();

        public Writer() {
            try {
                output = new KryoBackedEncoder(new FileOutputStream(getOutputsFile()));
            } catch (FileNotFoundException e) {
                throw new UncheckedIOException(e);
            }
        }

        @Override
        public void close() {
            output.close();
            writeIndex();
        }

        public void onOutput(long classId, TestOutputEvent outputEvent) {
            onOutput(classId, 0, outputEvent);
        }

        public void onOutput(long classId, long testId, TestOutputEvent outputEvent) {
            boolean stdout = outputEvent.getDestination() == TestOutputEvent.Destination.StdOut;
            mark(classId, testId, stdout);

            output.writeBoolean(stdout);
            output.writeSmallLong(classId);
            output.writeSmallLong(testId);

            byte[] bytes = outputEvent.getMessage().getBytes(messageStorageCharset);
            output.writeSmallInt(bytes.length);
            output.writeBytes(bytes, 0, bytes.length);
        }

        private void mark(long classId, long testId, boolean isStdout) {
            if (!index.containsKey(classId)) {
                index.put(classId, new LinkedHashMap<>());
            }

            Map<Long, TestCaseRegion> testCaseRegions = index.get(classId);
            TestCaseRegion region = testCaseRegions.computeIfAbsent(testId, k -> new TestCaseRegion());

            Region streamRegion = isStdout ? region.stdOutRegion : region.stdErrRegion;

            long total = output.getWritePosition();
            if (streamRegion.start < 0) {
                streamRegion.start = total;
            }
            streamRegion.stop = total;
        }

        private void writeIndex() {
            Output indexOutput;
            try {
                indexOutput = new Output(new FileOutputStream(getIndexFile()));
            } catch (FileNotFoundException e) {
                throw new UncheckedIOException(e);
            }


            try {
                indexOutput.writeInt(index.size(), true);

                for (Map.Entry<Long, Map<Long, TestCaseRegion>> classEntry : index.entrySet()) {
                    Long classId = classEntry.getKey();
                    Map<Long, TestCaseRegion> regions = classEntry.getValue();

                    indexOutput.writeLong(classId, tru
```