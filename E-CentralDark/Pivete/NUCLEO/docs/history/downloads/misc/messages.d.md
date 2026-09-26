# OUTRO - messages.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\vscode-jsonrpc@9.0.1@@@1\lib\common\messages.d.ts
**SHA:** b716daa9737308e8
**Timestamp:** 2026-08-28T02:26:22.635351
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const jsonrpcReservedErrorRangeStart: -32099;
- const serverErrorStart: -32099;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * A language server message
 */
export interface Message {
    jsonrpc: string;
}
/**
 * Request message
 */
export interface RequestMessage extends Message {
    /**
     * The request id.
     */
    id: number | string | null;
    /**
     * The method to be invoked.
     */
    method: string;
    /**
     * The method's params.
     */
    params?: any[] | object;
}
/**
 * Predefined error codes.
 */
export declare namespace ErrorCodes {
    const ParseError: -32700;
    const InvalidRequest: -32600;
    const MethodNotFound: -32601;
    const InvalidParams: -32602;
    const InternalError: -32603;
    /**
     * This is the start range of JSON RPC reserved error codes.
     * It doesn't denote a real error code. No application error codes should
     * be defined between the start and end range. For backwards
     * compatibility the `ServerNotInitialized` and the `UnknownErrorCode`
     * are left in the range.
     *
     * @since 3.16.0
    */
    const jsonrpcReservedErrorRangeStart: -32099;
    /** @deprecated use  jsonrpcReservedErrorRangeStart */
    const serverErrorStart: -32099;
    /**
     * An error occurred when write a message to the transport layer.
     */
    const MessageWriteError: -32099;
    /**
     * An error occurred when reading a message from the transport layer.
     */
    const MessageReadError: -32098;
    /**
     * The connection got disposed or lost and all pending responses got
     * rejected.
     */
    const PendingResponseRejected: -32097;
    /**
     * The connection is inactive and a use of it failed.
     */
    const ConnectionInactive: -32096;
    /**
     * Error code indicating that a server received a notification or
     * request before the server has received the `initialize` request.
     */
    const ServerNotInitialized: -32002;
    const UnknownErrorCode: -32001;
    /**
     * This is the end range of JSON RPC reserved error codes.
     * It doesn't denote a real error code.
     *
     * @since 3.16.0
    */
    const jsonrpcReservedErrorRangeEnd: -32000;
    /** @deprecated use  jsonrpcReservedErrorRangeEnd */
    const serverErrorEnd: -32000;
}
type integer = number;
export type ErrorCodes = integer;
export interface ResponseErrorLiteral<D = void> {
    /**
     * A number indicating the error type that occurred.
     */
    code: number;
    /**
     * A string providing a short description of the error.
     */
    message: string;
    /**
     * A Primitive or Structured value that contains additional
     * information about the error. Can be omitted.
     */
    data?: D;
}
/**
 * An error object return in a response in case a request
 * has failed.
 */
export declare class ResponseError<D = void> extends Error {
    readonly code: number;
    readonly data: D | undefined;
    constructor(code: number, message: string, data?: D);
    toJson(): ResponseErrorLiteral<D>;
}
/**
 * A response message.
 */
export interface ResponseMessage extends Message {
    /**
     * The request id.
     */
    id: number | string | null;
    /**
     * The result of a request. This member is REQUIRED on success.
     * This member MUST NOT exist if there was an error invoking the method.
     */
    result?: string | number | boolean | object | any[] | null;
    /**
     * The error object in case a request fails.
     */
    error?: ResponseErrorLiteral<any>;
}
/**
 * A LSP Log Entry.
 */
export type LSPMessageType = 'send-request' | 'receive-request' | 'send-response' | 'receive-response' | 'send-notification' | 'receive-notification';
export interface LSPLogMessage {
    type: LSPMessageType;
    message: RequestMessage | ResponseMessage | NotificationMessage;
    timestamp: number;
}
export declare class ParameterStructures {
    private readonly kind;
    /**
     * The parameter structure is automatically inferred on the number of parameters
     * and the parameter type in case of a single param.
     */
    static readonly auto: ParameterStructures;
    /**
     * Forces `byPosition` parameter structure. This is useful if you have a single
     * parameter which has a literal type.
     */
    static readonly byPosition: ParameterStructures;
    /**
     * Forces `byName` parameter structure. This is only useful when having a single
     * parameter. The library will report errors if used with a different number of
     * parameters.
     */
    static readonly byName: ParameterStructures;
    private constructor();
    static is(value: any): value is ParameterStructures;
    toString(): string;
}
/**
 * An interface to type messages.
 */
export interface MessageSignature {
    readonly method: string;
    readonly numberOfParams: number;
    readonly parameterStructures: ParameterStructures;
}
/**
 * An abstract implementation of a MessageType.
 */
export declare abstract class AbstractMessageSignature implements MessageSignature {
    readonly method: string;
    readonly numberOfParams: number;
    constructor(method: string, numberOfParam
```