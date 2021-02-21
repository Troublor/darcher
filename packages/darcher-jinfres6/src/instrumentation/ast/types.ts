export interface Node {
    type: string
}

export type BindingPattern = ArrayPattern | ObjectPattern;

export type Expression = ThisExpression | Identifier | Literal |
    ArrayExpression | ObjectExpression | FunctionExpression | ArrowFunctionExpression | ClassExpression |
    TaggedTemplateExpression | MemberExpression | Super | MetaProperty |
    NewExpression | CallExpression | UpdateExpression | AwaitExpression | UnaryExpression |
    BinaryExpression | LogicalExpression | ConditionalExpression |
    YieldExpression | AssignmentExpression | SequenceExpression;

export interface ArrayPattern extends Node {
    type: 'ArrayPattern';
    elements: ArrayPatternElement[];
}

export type ArrayPatternElement = AssignmentPattern | Identifier | BindingPattern | RestElement | null;

export interface AssignmentPattern extends Node {
    type: 'AssignmentPattern';
    left: Identifier | BindingPattern;
    right: Expression;
}

export interface ObjectPattern extends Node {
    type: 'ObjectPattern';
    properties: Property[];
}

export interface ThisExpression extends Node {
    type: 'ThisExpression';
}

export interface Identifier extends Node {
    type: 'Identifier';
    name: string;
}

export interface Literal extends Node {
    type: 'Literal';
    value: boolean | number | string | RegExp | null;
    raw: string;
    regex?: { pattern: string, flags: string };
}

export interface ArrayExpression extends Node {
    type: 'ArrayExpression';
    elements: ArrayExpressionElement[];
}

export type ArrayExpressionElement = Expression | SpreadElement;

export interface ObjectExpression extends Node {
    type: 'ObjectExpression';
    properties: Property[];
}

export interface Property extends Node {
    type: 'Property';
    key: Expression;
    computed: boolean;
    value: Expression | null;
    kind: 'get' | 'set' | 'init';
    method: false;
    shorthand: boolean;
}

export interface FunctionExpression extends Node {
    type: 'FunctionExpression';
    id: Identifier | null;
    params: FunctionParameter[];
    body: BlockStatement;
    generator: boolean;
    async: boolean;
    expression: boolean;
}

export type FunctionParameter = AssignmentPattern | Identifier | BindingPattern;

export interface ArrowFunctionExpression extends Node {
    type: 'ArrowFunctionExpression';
    id: Identifier | null;
    params: FunctionParameter[];
    body: BlockStatement | Expression;
    generator: boolean;
    async: boolean;
    expression: false;
}

export interface ClassExpression extends Node {
    type: 'ClassExpression';
    id: Identifier | null;
    superClass: Identifier | null;
    body: ClassBody;
}

export interface ClassBody extends Node {
    type: 'ClassBody';
    body: MethodDefinition[];
}

export interface MethodDefinition extends Node {
    type: 'MethodDefinition';
    key: Expression | null;
    computed: boolean;
    value: FunctionExpression | null;
    kind: 'method' | 'constructor';
    static: boolean;
}

export interface TaggedTemplateExpression extends Node {
    type: 'TaggedTemplateExpression';
    readonly tag: Expression;
    readonly quasi: TemplateLiteral;
}

export interface TemplateElement extends Node {
    type: 'TemplateElement';
    value: { cooked: string; raw: string };
    tail: boolean;
}

export interface TemplateLiteral extends Node {
    type: 'TemplateLiteral';
    quasis: TemplateElement[];
    expressions: Expression[];
}

export interface MemberExpression extends Node {
    type: 'MemberExpression';
    computed: boolean;
    object: Expression;
    property: Expression;
}

export interface Super extends Node {
    type: 'Super';
}

export interface MetaProperty extends Node {
    type: 'MetaProperty';
    meta: Identifier;
    property: Identifier;
}

export interface CallExpression extends Node {
    type: 'CallExpression';
    // TODO unclear the use case of Import
    // callee: Expression | Import;
    callee: Expression
    arguments: ArgumentListElement[];
}

export interface NewExpression extends Node {
    type: 'NewExpression';
    callee: Expression;
    arguments: ArgumentListElement[];
}

export interface Import extends Node {
    type: 'Import';
}

export type ArgumentListElement = Expression | SpreadElement;

export interface SpreadElement extends Node {
    type: 'SpreadElement';
    argument: Expression;
}

export interface UpdateExpression extends Node {
    type: 'UpdateExpression';
    operator: '++' | '--';
    argument: Expression;
    prefix: boolean;
}

export interface AwaitExpression extends Node {
    type: 'AwaitExpression';
    argument: Expression;
}

export interface UnaryExpression extends Node {
    type: 'UnaryExpression';
    operator: '+' | '-' | '~' | '!' | 'delete' | 'void' | 'typeof';
    argument: Expression;
    prefix: true;
}

export interface BinaryExpression extends Node {
    type: 'BinaryExpression';
    operator: 'instanceof' | 'in' | '+' | '-' | '*' | '/' | '%' | '**' |
        '|' | '^' | '&' | '==' | '!=' | '===' | '!==' |
        '<' | '>' | '<=' | '<<' | '>>' | '>>>';
    left: Expression;
    right: Expression;
}

export interface LogicalExpression extends Node {
    type: 'LogicalExpression';
    operator: '||' | '&&';
    left: Expression;
    right: Expression;
}


export interface RestElement extends Node {
    type: 'RestElement';
    argument: Identifier | BindingPattern;
}


export interface ConditionalExpression extends Node {
    type: 'ConditionalExpression';
    test: Expression;
    consequent: Expression;
    alternate: Expression;
}

export interface YieldExpression extends Node {
    type: 'YieldExpression';
    argument: Expression | null;
    delegate: boolean;
}

export interface AssignmentExpression extends Node {
    type: 'AssignmentExpression';
    operator: '=' | '*=' | '**=' | '/=' | '%=' | '+=' | '-=' |
        '<<=' | '>>=' | '>>>=' | '&=' | '^=' | '|=';
    left: Expression;
    right: Expression;
}

export interface SequenceExpression extends Node {
    type: 'SequenceExpression';
    expressions: Expression[];
}

export type Statement = BlockStatement | BreakStatement | ContinueStatement |
    DebuggerStatement | DoWhileStatement | EmptyStatement |
    ExpressionStatement | ForStatement | ForInStatement |
    ForOfStatement | FunctionDeclaration | IfStatement |
    LabeledStatement | ReturnStatement | SwitchStatement |
    ThrowStatement | TryStatement | VariableDeclaration |
    WhileStatement | WithStatement;

export type Declaration = ClassDeclaration | FunctionDeclaration | VariableDeclaration;

export type StatementListItem = Declaration | Statement;

export interface BlockStatement extends Node {
    type: 'BlockStatement';
    body: StatementListItem[];
}

export interface BreakStatement extends Node {
    type: 'BreakStatement';
    label: Identifier | null;
}

export interface ClassDeclaration extends Node {
    type: 'ClassDeclaration';
    id: Identifier | null;
    superClass: Identifier | null;
    body: ClassBody;
}

export interface ContinueStatement extends Node {
    type: 'ContinueStatement';
    label: Identifier | null;
}

export interface DebuggerStatement extends Node {
    type: 'DebuggerStatement';
}

export interface DoWhileStatement extends Node {
    type: 'DoWhileStatement';
    body: Statement;
    test: Expression;
}

export interface EmptyStatement extends Node {
    type: 'EmptyStatement';
}

export interface ExpressionStatement extends Node {
    type: 'ExpressionStatement';
    expression: Expression;
    directive?: string;
}

export interface ForStatement extends Node {
    type: 'ForStatement';
    init: Expression | VariableDeclaration | null;
    test: Expression | null;
    update: Expression | null;
    body: Statement;
}

export interface ForInStatement extends Node {
    type: 'ForInStatement';
    left: Expression;
    right: Expression;
    body: Statement;
    each: false;
}

export interface ForOfStatement extends Node {
    type: 'ForOfStatement';
    left: Expression;
    right: Expression;
    body: Statement;
}

export interface FunctionDeclaration extends Node {
    type: 'FunctionDeclaration';
    id: Identifier | null;
    params: FunctionParameter[];
    body: BlockStatement;
    generator: boolean;
    async: boolean;
    expression: false;
}

export interface IfStatement extends Node {
    type: 'IfStatement';
    test: Expression;
    consequent: Statement;
    alternate?: Statement;
}

export interface LabeledStatement extends Node {
    type: 'LabeledStatement';
    label: Identifier;
    body: Statement;
}

export interface ReturnStatement extends Node {
    type: 'ReturnStatement';
    argument: Expression | null;
}

export interface SwitchStatement extends Node {
    type: 'SwitchStatement';
    discriminant: Expression;
    cases: SwitchCase[];
}

export interface SwitchCase extends Node {
    type: 'SwitchCase';
    test: Expression | null;
    consequent: Statement[];
}

export interface ThrowStatement extends Node {
    type: 'ThrowStatement';
    argument: Expression;
}

export interface TryStatement extends Node {
    type: 'TryStatement';
    block: BlockStatement;
    handler: CatchClause | null;
    finalizer: BlockStatement | null;
}

export interface CatchClause extends Node {
    type: 'CatchClause';
    param: Identifier | BindingPattern;
    body: BlockStatement;
}

export interface VariableDeclaration extends Node {
    type: 'VariableDeclaration';
    declarations: VariableDeclarator[];
    kind: 'var' | 'const' | 'let';
}

export interface VariableDeclarator extends Node {
    type: 'VariableDeclarator';
    id: Identifier | BindingPattern;
    init: Expression | null;
}

export interface WhileStatement extends Node {
    type: 'WhileStatement';
    test: Expression;
    body: Statement;
}

export interface WithStatement extends Node {
    type: 'WithStatement';
    object: Expression;
    body: Statement;
}

export interface Program extends Node {
    type: 'Program';
    sourceType: 'script' | 'module';
    body: StatementListItem[] | ModuleItem[];
}

export type ModuleItem = ImportDeclaration | ExportDeclaration | StatementListItem;

export interface ImportDeclaration extends Node {
    type: 'ImportDeclaration';
    specifiers: ImportSpecifier[];
    source: Literal;
}

export interface ImportSpecifier extends Node {
    type: 'ImportSpecifier' | 'ImportDefaultSpecifier' | 'ImportNamespaceSpecifier';
    local: Identifier;
    imported?: Identifier;
}

export type ExportDeclaration = ExportAllDeclaration | ExportDefaultDeclaration | ExportNamedDeclaration;

export interface ExportAllDeclaration extends Node {
    type: 'ExportAllDeclaration';
    source: Literal;
}

export interface ExportDefaultDeclaration extends Node {
    type: 'ExportDefaultDeclaration';
    declaration: Identifier | BindingPattern | ClassDeclaration | Expression | FunctionDeclaration;
}

export interface ExportNamedDeclaration extends Node {
    type: 'ExportNamedDeclaration';
    declaration: ClassDeclaration | FunctionDeclaration | VariableDeclaration;
    specifiers: ExportSpecifier[];
    source: Literal;
}

export interface ExportSpecifier extends Node {
    type: 'ExportSpecifier';
    exported: Identifier;
    local: Identifier;
}