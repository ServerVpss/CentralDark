# COMANDO - native-bridge.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\caches\8.14.3\transforms\145b3d6995f40d2ea201b34d575745af\transformed\out\assets\native-bridge.js
**SHA:** 8ecc290bdd4f5460
**Timestamp:** 2026-08-28T02:40:43.135307
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: export as Cap function
- // TODO: export as Cap function
- //TODO: Add progress event emission on native side

### Ouro Bruto (primeiros 5000 chars)
```

/*! Capacitor: https://capacitorjs.com/ - MIT License */
/* Generated File. Do not edit. */

var nativeBridge = (function (exports) {
    'use strict';

    var ExceptionCode;
    (function (ExceptionCode) {
        /**
         * API is not implemented.
         *
         * This usually means the API can't be used because it is not implemented for
         * the current platform.
         */
        ExceptionCode["Unimplemented"] = "UNIMPLEMENTED";
        /**
         * API is not available.
         *
         * This means the API can't be used right now because:
         *   - it is currently missing a prerequisite, such as network connectivity
         *   - it requires a particular platform or browser version
         */
        ExceptionCode["Unavailable"] = "UNAVAILABLE";
    })(ExceptionCode || (ExceptionCode = {}));
    class CapacitorException extends Error {
        constructor(message, code, data) {
            super(message);
            this.message = message;
            this.code = code;
            this.data = data;
        }
    }

    // For removing exports for iOS/Android, keep let for reassignment
    // eslint-disable-next-line
    let dummy = {};
    const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const data = reader.result;
            resolve(btoa(data));
        };
        reader.onerror = reject;
        reader.readAsBinaryString(file);
    });
    const convertFormData = async (formData) => {
        const newFormData = [];
        for (const pair of formData.entries()) {
            const [key, value] = pair;
            if (value instanceof File) {
                const base64File = await readFileAsBase64(value);
                newFormData.push({
                    key,
                    value: base64File,
                    type: 'base64File',
                    contentType: value.type,
                    fileName: value.name,
                });
            }
            else {
                newFormData.push({ key, value, type: 'string' });
            }
        }
        return newFormData;
    };
    const convertBody = async (body, contentType) => {
        if (body instanceof ReadableStream || body instanceof Uint8Array) {
            let encodedData;
            if (body instanceof ReadableStream) {
                const reader = body.getReader();
                const chunks = [];
                while (true) {
                    const { done, value } = await reader.read();
                    if (done)
                        break;
                    chunks.push(value);
                }
                const concatenated = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
                let position = 0;
                for (const chunk of chunks) {
                    concatenated.set(chunk, position);
                    position += chunk.length;
                }
                encodedData = concatenated;
            }
            else {
                encodedData = body;
            }
            let data = new TextDecoder().decode(encodedData);
            let type;
            if (contentType === 'application/json') {
                try {
                    data = JSON.parse(data);
                }
                catch (ignored) {
                    // ignore
                }
                type = 'json';
            }
            else if (contentType === 'multipart/form-data') {
                type = 'formData';
            }
            else if (contentType === null || contentType === void 0 ? void 0 : contentType.startsWith('image')) {
                type = 'image';
            }
            else if (contentType === 'application/octet-stream') {
                type = 'binary';
            }
            else {
                type = 'text';
            }
            return {
                data,
                type,
                headers: { 'Content-Type': contentType || 'application/octet-stream' },
            };
        }
        else if (body instanceof URLSearchParams) {
            return {
                data: body.toString(),
                type: 'text',
            };
        }
        else if (body instanceof FormData) {
            return {
                data: await convertFormData(body),
                type: 'formData',
            };
        }
        else if (body instanceof File) {
            const fileData = await readFileAsBase64(body);
            return {
                data: fileData,
                type: 'file',
                headers: { 'Content-Type': body.type },
            };
        }
        return { data: body, type: 'json' };
    };
    const CAPACITOR_HTTP_INTERCEPTOR = '/_capacitor_http_interceptor_';
    const CAPACITOR_HTTP_INTERCEPTOR_URL_PARAM = 'u';
    // TODO: export as Cap function
    const isRelativeOrProxyUrl = (url) => !url || !(url.startsWith('htt
```