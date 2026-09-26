# COMANDO - estree.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\meriyah@6.1.4@@@1\dist\types\estree.d.ts
**SHA:** 1efc4db32778a162
**Timestamp:** 2026-08-28T02:24:47.117321
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: Position;

### Padroes
- export type BindingPattern = ArrayPattern | ObjectPattern | Identifier;
- export type Pattern = Identifier | ObjectPattern | ArrayPattern | RestElement | AssignmentPattern | MemberExpression;
- pattern: string;

### Contratos
- delegate: boolean;

### Ouro Bruto (primeiros 5000 chars)
```
export interface _Node {
    start?: number;
    end?: number;
    range?: [number, number];
    loc?: SourceLocation | null;
}
export interface SourceLocation {
    source?: string | null;
    start: Position;
    end: Position;
}
export interface Position {
    line: number;
    column: number;
}
export type Labels = any;
export type IdentifierOrExpression = Identifier | Expression | ArrowFunctionExpression;
export type ArgumentExpression = ArrayExpression | AssignmentExpression | ConditionalExpression | Literal | SpreadElement | BinaryExpression | LogicalExpression | SequenceExpression;
export type CommentType = 'SingleLine' | 'MultiLine' | 'HTMLOpen' | 'HTMLClose' | 'HashbangComment';
export interface Comment extends _Node {
    type: CommentType;
    value: string;
}
export type Node = AccessorProperty | ArrayExpression | ArrayPattern | ArrowFunctionExpression | AssignmentExpression | AssignmentPattern | AwaitExpression | BigIntLiteral | BinaryExpression | BlockStatement | BreakStatement | CallExpression | ChainExpression | ImportExpression | CatchClause | ClassBody | ClassDeclaration | ClassExpression | ConditionalExpression | ContinueStatement | DebuggerStatement | Decorator | DoWhileStatement | EmptyStatement | ExportAllDeclaration | ExportDefaultDeclaration | ExportNamedDeclaration | ExportSpecifier | ExpressionStatement | PropertyDefinition | ForInStatement | ForOfStatement | ForStatement | FunctionDeclaration | FunctionExpression | Identifier | IfStatement | ImportDeclaration | ImportDefaultSpecifier | ImportAttribute | ImportNamespaceSpecifier | ImportSpecifier | JSXNamespacedName | JSXAttribute | JSXClosingElement | JSXClosingFragment | JSXElement | JSXEmptyExpression | JSXExpressionContainer | JSXFragment | JSXIdentifier | JSXOpeningElement | JSXOpeningFragment | JSXSpreadAttribute | JSXSpreadChild | JSXMemberExpression | JSXText | LabeledStatement | Literal | LogicalExpression | MemberExpression | MetaProperty | MethodDefinition | NewExpression | ObjectExpression | ObjectPattern | ParenthesizedExpression | PrivateIdentifier | Program | Property | RegExpLiteral | RestElement | ReturnStatement | SequenceExpression | SpreadElement | StaticBlock | Super | SwitchCase | SwitchStatement | TaggedTemplateExpression | TemplateElement | TemplateLiteral | ThisExpression | ThrowStatement | TryStatement | UpdateExpression | UnaryExpression | VariableDeclaration | VariableDeclarator | WhileStatement | WithStatement | YieldExpression;
export type BindingPattern = ArrayPattern | ObjectPattern | Identifier;
export type ClassElement = FunctionExpression | MethodDefinition;
export type DeclarationStatement = ClassDeclaration | ClassExpression | ExportDefaultDeclaration | ExportAllDeclaration | ExportNamedDeclaration | FunctionDeclaration;
export type EntityName = Identifier;
export type ExportDeclaration = ClassDeclaration | ClassExpression | FunctionDeclaration | VariableDeclaration;
export type Expression = ArrowFunctionExpression | AssignmentExpression | BinaryExpression | ConditionalExpression | MetaProperty | ChainExpression | JSXClosingElement | JSXClosingFragment | JSXExpressionContainer | JSXOpeningElement | JSXOpeningFragment | JSXSpreadChild | LogicalExpression | NewExpression | RestElement | SequenceExpression | SpreadElement | AwaitExpression | LeftHandSideExpression | UnaryExpression | UpdateExpression | YieldExpression;
export type ForInitializer = Expression | VariableDeclaration;
export { ForInitializer as ForInitialiser };
export type ImportClause = ImportDefaultSpecifier | ImportNamespaceSpecifier | ImportSpecifier;
export type IterationStatement = DoWhileStatement | ForInStatement | ForOfStatement | ForStatement | WhileStatement;
export type JSXChild = JSXElement | JSXExpression | JSXFragment | JSXText;
export type JSXExpression = JSXEmptyExpression | JSXSpreadChild | JSXExpressionContainer;
export type JSXTagNameExpression = JSXIdentifier | JSXMemberExpression | JSXNamespacedName;
export type LeftHandSideExpression = CallExpression | ChainExpression | ImportExpression | ClassExpression | ClassDeclaration | FunctionExpression | LiteralExpression | MemberExpression | PrimaryExpression | TaggedTemplateExpression;
export type LiteralExpression = Literal | TemplateLiteral;
export type ObjectLiteralElementLike = MethodDefinition | Property | RestElement | SpreadElement;
export type Parameter = AssignmentPattern | RestElement | ArrayPattern | ObjectPattern | Identifier;
export type PrimaryExpression = ArrayExpression | ArrayPattern | ClassExpression | FunctionExpression | Identifier | JSXElement | JSXFragment | JSXOpeningElement | Literal | LiteralExpression | MetaProperty | ObjectExpression | ObjectPattern | Super | TemplateLiteral | ThisExpression;
export type PrimaryExpressionExtended = ArrayExpression | ArrowFunctionExpression | ArrayPattern | AwaitExpression | Expression | ClassExpression | FunctionExpression | Identifier | JSXElement | JSXFragment | JSXOpeningElement | Literal | LiteralExpress
```