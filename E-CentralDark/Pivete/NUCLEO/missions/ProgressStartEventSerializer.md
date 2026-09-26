# MISSAO - ProgressStartEventSerializer.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\logging\org\gradle\internal\logging\serializer\ProgressStartEventSerializer.java
**SHA:** abb24f99be945838
**Timestamp:** 2026-08-28T02:50:39.169970
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- private static final short BUILD_OPERATION_START = 1 << 8;
- boolean buildOperationStart = (flags & BUILD_OPERATION_START) != 0;

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2016 the original author or authors.
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

package org.gradle.internal.logging.serializer;

import org.gradle.internal.logging.events.ProgressStartEvent;
import org.gradle.internal.operations.BuildOperationCategory;
import org.gradle.internal.operations.OperationIdentifier;
import org.gradle.internal.serialize.Decoder;
import org.gradle.internal.serialize.Encoder;
import org.gradle.internal.serialize.Serializer;

/**
 * Since Gradle creates a high volume of progress events, this serializer trades simplicity
 * for the smallest possible serialized form. It uses a single byte indicating the presence of optional
 * fields instead of writing an "absent" byte for each of them like most of our serializers do.
 * It also encodes the {@link BuildOperationCategory} in this byte, since that enum only has 3 values
 * for the forseeable future.
 */
public class ProgressStartEventSerializer implements Serializer<ProgressStartEvent> {
    private static final short PARENT_PROGRESS_ID = 1;
    private static final short LOGGING_HEADER = 1 << 2;
    private static final short LOGGING_HEADER_IS_SUB_DESCRIPTION = 1 << 3;
    private static final short STATUS = 1 << 4;
    private static final short STATUS_IS_SUB_DESCRIPTION = 1 << 5;
    private static final short BUILD_OPERATION_ID = 1 << 6;
    private static final short BUILD_OPERATION_ID_IS_PROGRESS_ID = 1 << 7;
    private static final short BUILD_OPERATION_START = 1 << 8;
    private static final short CATEGORY_IS_TASK = 1 << 9;
    private static final short CATEGORY_IS_BUILD_OP = 1 << 10;
    private static final short CATEGORY_NAME = 1 << 11;
    private static final short BUILD_OP_CATEGORY_OFFSET = 12;
    private static final short BUILD_OP_CATEGORY_MASK = 0x7;

    public ProgressStartEventSerializer() {
        BuildOperationCategory maxCategory = BuildOperationCategory.values()[BuildOperationCategory.values().length - 1];
        if ((BUILD_OP_CATEGORY_MASK & maxCategory.ordinal()) != maxCategory.ordinal()) {
            // Too many build operation categories to fit into the flags assigned to encode the category - so you will need to adjust the mask above
            throw new IllegalArgumentException("Too many categories to fit into flags.");
        }
    }

    @Override
    public void write(Encoder encoder, ProgressStartEvent event) throws Exception {
        int flags = 0;
        OperationIdentifier parentProgressOperationId = event.getParentProgressOperationId();
        if (parentProgressOperationId != null) {
            flags |= PARENT_PROGRESS_ID;
        }

        String description = event.getDescription();

        String loggingHeader = event.getLoggingHeader();
        if (loggingHeader != null) {
            if (description.endsWith(loggingHeader)) {
                flags |= LOGGING_HEADER_IS_SUB_DESCRIPTION;
            } else {
                flags |= LOGGING_HEADER;
            }
        }

        String status = event.getStatus();
        if (!status.isEmpty()) {
            if (description.endsWith(status)) {
                flags |= STATUS_IS_SUB_DESCRIPTION;
            } else {
                flags |= STATUS;
            }
        }

        OperationIdentifier buildOperationId = event.getBuildOperationId();
        if (buildOperationId != null) {
            if (buildOperationId.equals(event.getProgressOperationId())) {
                flags |= BUILD_OPERATION_ID_IS_PROGRESS_ID;
            } else {
                flags |= BUILD_OPERATION_ID;
            }
        }

        BuildOperationCategory buildOperationCategory = event.getBuildOperationCategory();
        flags |= (buildOperationCategory.ordinal() & BUILD_OP_CATEGORY_MASK) << BUILD_OP_CATEGORY_OFFSET;

        if (event.isBuildOperationStart()) {
            flags |= BUILD_OPERATION_START;
        }

        if (event.getCategory().equals(ProgressStartEvent.BUILD_OP_CATEGORY)) {
            flags |= CATEGORY_IS_BUILD_OP;
        } else if (event.getCategory().equals(ProgressStartEvent.TASK_CATEGORY)) {
            flags |= CATEGORY_IS_TASK;
        } else {
            flags |= CATEGORY_NAME;
        }

        encoder.writeSmallInt(flags);

        encoder.writeSmallLong(event.getProgressOperationId().getId());
        if (parentProgressOperationId != null) {
            encoder.writeSmallLong(parentProgressOperationId.getId());
        }
        encoder.writeLong(event.getTimestamp());
        if ((flags &
```