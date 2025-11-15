/**
 * Abstract Syntax Tree (AST) Node Definitions for PRO/II
 * 
 * Represents the parsed structure of a PRO/II input file
 */

import { Token } from './types';

/**
 * Base interface for all AST nodes
 */
export interface ASTNode {
    type: string;
    startLine: number;
    endLine: number;
}

/**
 * Root node representing the entire PRO/II file
 */
export interface ProgramNode extends ASTNode {
    type: 'Program';
    sections: SectionNode[];
}

/**
 * Section node (COMPONENT DATA, STREAM DATA, UNIT OPERATIONS, etc.)
 */
export interface SectionNode extends ASTNode {
    type: 'Section';
    sectionType: SectionType;
    statements: StatementNode[];
}

export type SectionType = 
    | 'COMPONENT_DATA'
    | 'STREAM_DATA'
    | 'THERMODYNAMIC_DATA'
    | 'UNIT_OPERATIONS'
    | 'PRINT'
    | 'OTHER';

/**
 * Base statement node
 */
export interface StatementNode extends ASTNode {
    statementType: string;
}

/**
 * Unit Operation statement (FLASH, COLUMN, etc.)
 */
export interface UnitOperationNode extends StatementNode {
    type: 'UnitOperation';
    statementType: string; // 'FLASH', 'COLUMN', etc.
    uid?: IdentifierNode;
    parameters: ParameterNode[];
    feedStreams: StreamReferenceNode[];
    productStreams: StreamReferenceNode[];
}

/**
 * Parameter assignment (TEMP=100, PRES=200)
 */
export interface ParameterNode extends ASTNode {
    type: 'Parameter';
    name: IdentifierNode;
    value: ValueNode;
}

/**
 * Stream reference (feed or product stream)
 */
export interface StreamReferenceNode extends ASTNode {
    type: 'StreamReference';
    streamName: IdentifierNode;
    streamType?: string; // 'V', 'L', 'VAPOR', 'LIQUID'
}

/**
 * Component data statement
 */
export interface ComponentDataNode extends StatementNode {
    type: 'ComponentData';
    statementType: 'LIBID' | 'NAME' | 'BANK';
    components: ComponentNode[];
}

/**
 * Component specification (C1/2, METHANE, etc.)
 */
export interface ComponentNode extends ASTNode {
    type: 'Component';
    identifier: string; // 'C1', 'METHANE', etc.
    libid?: NumberNode; // Library ID number (e.g., 2 for C1/2)
}

/**
 * Stream data statement
 */
export interface StreamDataNode extends StatementNode {
    type: 'StreamData';
    statementType: 'PROP' | 'COMP';
    streamName: IdentifierNode;
    dataType: string; // 'DATA', 'RATE', etc.
    parameters: ParameterNode[];
}

/**
 * Thermodynamic method statement
 */
export interface ThermodynamicDataNode extends StatementNode {
    type: 'ThermodynamicData';
    statementType: 'METHOD' | 'SET';
    method?: string; // 'SRK', 'PR', 'NRTL'
    parameters: ParameterNode[];
}

/**
 * Print statement
 */
export interface PrintStatementNode extends StatementNode {
    type: 'PrintStatement';
    statementType: 'PRINT';
    parameters: ParameterNode[];
}

/**
 * Value nodes (literals and identifiers)
 */
export type ValueNode = NumberNode | IdentifierNode | StringNode | ListNode;

/**
 * Number literal
 */
export interface NumberNode extends ASTNode {
    type: 'Number';
    value: number;
    raw: string; // Original token value (e.g., "1.5E-3")
}

/**
 * Identifier (stream name, UID, variable)
 */
export interface IdentifierNode extends ASTNode {
    type: 'Identifier';
    name: string;
}

/**
 * String literal
 */
export interface StringNode extends ASTNode {
    type: 'String';
    value: string;
}

/**
 * List of values (separated by commas or slashes)
 */
export interface ListNode extends ASTNode {
    type: 'List';
    values: ValueNode[];
    separator: ',' | '/';
}

/**
 * Comment node
 */
export interface CommentNode extends ASTNode {
    type: 'Comment';
    text: string;
}

/**
 * Helper to create AST nodes with position info
 */
export function createNode<T extends ASTNode>(
    type: T['type'],
    startLine: number,
    endLine: number,
    props: Omit<T, 'type' | 'startLine' | 'endLine'>
): T {
    return {
        type,
        startLine,
        endLine,
        ...props
    } as T;
}

/**
 * Type guard to check if node is a specific type
 */
export function isNodeType<T extends ASTNode>(node: ASTNode, type: T['type']): node is T {
    return node.type === type;
}

/**
 * Visitor pattern for traversing AST
 */
export interface ASTVisitor {
    visitProgram?(node: ProgramNode): void;
    visitSection?(node: SectionNode): void;
    visitUnitOperation?(node: UnitOperationNode): void;
    visitParameter?(node: ParameterNode): void;
    visitStreamReference?(node: StreamReferenceNode): void;
    visitComponentData?(node: ComponentDataNode): void;
    visitStreamData?(node: StreamDataNode): void;
    visitThermodynamicData?(node: ThermodynamicDataNode): void;
    visitPrintStatement?(node: PrintStatementNode): void;
    visitNumber?(node: NumberNode): void;
    visitIdentifier?(node: IdentifierNode): void;
    visitString?(node: StringNode): void;
    visitList?(node: ListNode): void;
    visitComment?(node: CommentNode): void;
}

/**
 * Traverse AST with visitor
 */
export function traverse(node: ASTNode, visitor: ASTVisitor): void {
    switch (node.type) {
        case 'Program':
            visitor.visitProgram?.(node as ProgramNode);
            (node as ProgramNode).sections.forEach(section => traverse(section, visitor));
            break;
        case 'Section':
            visitor.visitSection?.(node as SectionNode);
            (node as SectionNode).statements.forEach(stmt => traverse(stmt, visitor));
            break;
        case 'UnitOperation':
            visitor.visitUnitOperation?.(node as UnitOperationNode);
            break;
        case 'Parameter':
            visitor.visitParameter?.(node as ParameterNode);
            break;
        case 'StreamReference':
            visitor.visitStreamReference?.(node as StreamReferenceNode);
            break;
        case 'ComponentData':
            visitor.visitComponentData?.(node as ComponentDataNode);
            break;
        case 'StreamData':
            visitor.visitStreamData?.(node as StreamDataNode);
            break;
        case 'ThermodynamicData':
            visitor.visitThermodynamicData?.(node as ThermodynamicDataNode);
            break;
        case 'PrintStatement':
            visitor.visitPrintStatement?.(node as PrintStatementNode);
            break;
        case 'Number':
            visitor.visitNumber?.(node as NumberNode);
            break;
        case 'Identifier':
            visitor.visitIdentifier?.(node as IdentifierNode);
            break;
        case 'String':
            visitor.visitString?.(node as StringNode);
            break;
        case 'List':
            visitor.visitList?.(node as ListNode);
            break;
        case 'Comment':
            visitor.visitComment?.(node as CommentNode);
            break;
    }
}
