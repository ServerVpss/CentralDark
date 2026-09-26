# COMANDO - index.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\core@10.71.0@@@1\build\types\tracing\workers-ai\index.d.ts
**SHA:** c888dc2cbad34c80
**Timestamp:** 2026-08-28T02:22:20.511587
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * const result = await ai.run('@cf/meta/llama-3.1-8b-instruct', { prompt: 'Hello' });

### Ouro Bruto (primeiros 5000 chars)
```
import type { WorkersAiOptions } from './types';
/**
 * Instrument a Cloudflare Workers AI binding (`env.AI`) with Sentry tracing.
 *
 * This wraps the binding's `run` method to create `gen_ai` spans following the
 * Sentry AI Agents conventions. All other methods are passed through untouched.
 *
 * In `@sentry/cloudflare`, the `env.AI` binding is instrumented automatically —
 * wrapping manually is only needed to pass custom options.
 *
 * @example
 * ```javascript
 * const ai = Sentry.instrumentWorkersAiClient(env.AI, { recordInputs: true, recordOutputs: true });
 * const result = await ai.run('@cf/meta/llama-3.1-8b-instruct', { prompt: 'Hello' });
 * ```
 */
export declare function instrumentWorkersAiClient<T extends object>(client: T, options?: WorkersAiOptions): T;
//# sourceMappingURL=index.d.ts.map
```

---

# COMANDO - index.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\core@10.71.0@@@1\build\types-ts3.8\tracing\workers-ai\index.d.ts
**SHA:** 264ec49de6059ea8
**Timestamp:** 2026-08-28T02:22:33.962169
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * const result = await ai.run('@cf/meta/llama-3.1-8b-instruct', { prompt: 'Hello' });

### Ouro Bruto (primeiros 5000 chars)
```
import { WorkersAiOptions } from './types';
/**
 * Instrument a Cloudflare Workers AI binding (`env.AI`) with Sentry tracing.
 *
 * This wraps the binding's `run` method to create `gen_ai` spans following the
 * Sentry AI Agents conventions. All other methods are passed through untouched.
 *
 * In `@sentry/cloudflare`, the `env.AI` binding is instrumented automatically —
 * wrapping manually is only needed to pass custom options.
 *
 * @example
 * ```javascript
 * const ai = Sentry.instrumentWorkersAiClient(env.AI, { recordInputs: true, recordOutputs: true });
 * const result = await ai.run('@cf/meta/llama-3.1-8b-instruct', { prompt: 'Hello' });
 * ```
 */
export declare function instrumentWorkersAiClient<T extends object>(client: T, options?: WorkersAiOptions): T;
//# sourceMappingURL=index.d.ts.map

```

---

# COMANDO - index.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@types\estree@1.0.9@@@1\index.d.ts
**SHA:** 751764bb94219b4c
**Timestamp:** 2026-08-28T02:23:48.013106
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: Position;

### Padroes
- Pattern: Pattern;
- export type Pattern = Identifier | ObjectPattern | ArrayPattern | RestElement | AssignmentPattern | MemberExpression;
- pattern: string;

### Contratos
- delegate: boolean;

### Ouro Bruto (primeiros 5000 chars)
```
// This definition file follows a somewhat unusual format. ESTree allows
// runtime type checks based on the `type` parameter. In order to explain this
// to typescript we want to use discriminated union types:
// https://github.com/Microsoft/TypeScript/pull/9163
//
// For ESTree this is a bit tricky because the high level interfaces like
// Node or Function are pulling double duty. We want to pass common fields down
// to the interfaces that extend them (like Identifier or
// ArrowFunctionExpression), but you can't extend a type union or enforce
// common fields on them. So we've split the high level interfaces into two
// types, a base type which passes down inherited fields, and a type union of
// all types which extend the base type. Only the type union is exported, and
// the union is how other types refer to the collection of inheriting types.
//
// This makes the definitions file here somewhat more difficult to maintain,
// but it has the notable advantage of making ESTree much easier to use as
// an end user.

export interface BaseNodeWithoutComments {
    // Every leaf interface that extends BaseNode must specify a type property.
    // The type property should be a string literal. For example, Identifier
    // has: `type: "Identifier"`
    type: string;
    loc?: SourceLocation | null | undefined;
    range?: [number, number] | undefined;
}

export interface BaseNode extends BaseNodeWithoutComments {
    leadingComments?: Comment[] | undefined;
    trailingComments?: Comment[] | undefined;
}

export interface NodeMap {
    AssignmentProperty: AssignmentProperty;
    CatchClause: CatchClause;
    Class: Class;
    ClassBody: ClassBody;
    Expression: Expression;
    Function: Function;
    Identifier: Identifier;
    Literal: Literal;
    MethodDefinition: MethodDefinition;
    ModuleDeclaration: ModuleDeclaration;
    ModuleSpecifier: ModuleSpecifier;
    Pattern: Pattern;
    PrivateIdentifier: PrivateIdentifier;
    Program: Program;
    Property: Property;
    PropertyDefinition: PropertyDefinition;
    SpreadElement: SpreadElement;
    Statement: Statement;
    Super: Super;
    SwitchCase: SwitchCase;
    TemplateElement: TemplateElement;
    VariableDeclarator: VariableDeclarator;
}

export type Node = NodeMap[keyof NodeMap];

export interface Comment extends BaseNodeWithoutComments {
    type: "Line" | "Block";
    value: string;
}

export interface SourceLocation {
    source?: string | null | undefined;
    start: Position;
    end: Position;
}

export interface Position {
    /** >= 1 */
    line: number;
    /** >= 0 */
    column: number;
}

export interface Program extends BaseNode {
    type: "Program";
    sourceType: "script" | "module";
    body: Array<Directive | Statement | ModuleDeclaration>;
    comments?: Comment[] | undefined;
}

export interface Directive extends BaseNode {
    type: "ExpressionStatement";
    expression: Literal;
    directive: string;
}

export interface BaseFunction extends BaseNode {
    params: Pattern[];
    generator?: boolean | undefined;
    async?: boolean | undefined;
    // The body is either BlockStatement or Expression because arrow functions
    // can have a body that's either. FunctionDeclarations and
    // FunctionExpressions have only BlockStatement bodies.
    body: BlockStatement | Expression;
}

export type Function = FunctionDeclaration | FunctionExpression | ArrowFunctionExpression;

export type Statement =
    | ExpressionStatement
    | BlockStatement
    | StaticBlock
    | EmptyStatement
    | DebuggerStatement
    | WithStatement
    | ReturnStatement
    | LabeledStatement
    | BreakStatement
    | ContinueStatement
    | IfStatement
    | SwitchStatement
    | ThrowStatement
    | TryStatement
    | WhileStatement
    | DoWhileStatement
    | ForStatement
    | ForInStatement
    | ForOfStatement
    | Declaration;

export interface BaseStatement extends BaseNode {}

export interface EmptyStatement extends BaseStatement {
    type: "EmptyStatement";
}

export interface BlockStatement extends BaseStatement {
    type: "BlockStatement";
    body: Statement[];
    innerComments?: Comment[] | undefined;
}

export interface StaticBlock extends Omit<BlockStatement, "type"> {
    type: "StaticBlock";
}

export interface ExpressionStatement extends BaseStatement {
    type: "ExpressionStatement";
    expression: Expression;
}

export interface IfStatement extends BaseStatement {
    type: "IfStatement";
    test: Expression;
    consequent: Statement;
    alternate?: Statement | null | undefined;
}

export interface LabeledStatement extends BaseStatement {
    type: "LabeledStatement";
    label: Identifier;
    body: Statement;
}

export interface BreakStatement extends BaseStatement {
    type: "BreakStatement";
    label?: Identifier | null | undefined;
}

export interface ContinueStatement extends BaseStatement {
    type: "ContinueStatement";
    label?: Identifier | null | undefined;
}

export interface WithStatement extends
```