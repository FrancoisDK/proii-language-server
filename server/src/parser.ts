/**
 * PRO/II Parser
 * Converts token stream into Abstract Syntax Tree (AST)
 */

import { Token, TokenType } from './types';
import {
    ProgramNode, SectionNode, StatementNode, UnitOperationNode,
    ParameterNode, StreamReferenceNode, ComponentDataNode,
    StreamDataNode, ThermodynamicDataNode, PrintStatementNode,
    NumberNode, IdentifierNode, StringNode, ListNode,
    ComponentNode, ValueNode, SectionType
} from './ast';

export class Parser {
    private tokens: Token[];
    private position: number = 0;
    private currentLine: number = 1;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    /**
     * Parse the entire token stream into a Program AST node
     */
    public parse(): ProgramNode {
        const sections: SectionNode[] = [];

        // Skip initial comments and newlines
        this.skipWhitespaceAndComments();

        while (!this.isAtEnd()) {
            const section = this.parseSection();
            if (section) {
                sections.push(section);
            }
            this.skipWhitespaceAndComments();
        }

        return {
            type: 'Program',
            startLine: 1,
            endLine: this.currentLine,
            sections
        };
    }

    /**
     * Parse a section (COMPONENT DATA, STREAM DATA, UNIT OPERATIONS, etc.)
     */
    private parseSection(): SectionNode | null {
        const startLine = this.getCurrentLine();
        let sectionType: SectionType = 'OTHER';
        const statements: StatementNode[] = [];

        // Detect section type
        if (this.check(TokenType.COMPONENT) && this.checkNext(TokenType.DATA)) {
            sectionType = 'COMPONENT_DATA';
            this.advance(); // COMPONENT
            this.advance(); // DATA
            this.consumeNewlines();

            // Parse component statements until next section
            while (!this.isAtEnd() && !this.isNextSection()) {
                const stmt = this.parseComponentStatement();
                if (stmt) statements.push(stmt);
                this.skipWhitespaceAndComments();
            }
        } else if (this.check(TokenType.STREAM) && this.checkNext(TokenType.DATA)) {
            sectionType = 'STREAM_DATA';
            this.advance(); // STREAM
            this.advance(); // DATA
            this.consumeNewlines();

            while (!this.isAtEnd() && !this.isNextSection()) {
                const stmt = this.parseStreamStatement();
                if (stmt) statements.push(stmt);
                this.skipWhitespaceAndComments();
            }
        } else if (this.check(TokenType.THERMODYNAMIC) && this.checkNext(TokenType.DATA)) {
            sectionType = 'THERMODYNAMIC_DATA';
            this.advance(); // THERMODYNAMIC
            this.advance(); // DATA
            this.consumeNewlines();

            while (!this.isAtEnd() && !this.isNextSection()) {
                const stmt = this.parseThermodynamicStatement();
                if (stmt) statements.push(stmt);
                this.skipWhitespaceAndComments();
            }
        } else if (this.check(TokenType.UNIT_OPERATIONS)) {
            sectionType = 'UNIT_OPERATIONS';
            this.advance(); // UNIT
            this.consumeNewlines();

            while (!this.isAtEnd() && !this.isNextSection()) {
                const stmt = this.parseUnitOperation();
                if (stmt) statements.push(stmt);
                this.skipWhitespaceAndComments();
            }
        } else if (this.check(TokenType.PRINT)) {
            sectionType = 'PRINT';
            const stmt = this.parsePrintStatement();
            if (stmt) statements.push(stmt);
            this.consumeNewlines();
        } else {
            // Unknown section, skip line
            this.advanceLine();
            return null;
        }

        return {
            type: 'Section',
            startLine,
            endLine: this.getCurrentLine(),
            sectionType,
            statements
        };
    }

    /**
     * Parse a unit operation (FLASH, COLUMN, etc.)
     */
    private parseUnitOperation(): UnitOperationNode | null {
        const startLine = this.getCurrentLine();
        const unitType = this.current();

        if (!this.isUnitOperationType(unitType.type)) {
            return null;
        }

        const statementType = unitType.value.toUpperCase();
        this.advance(); // Unit operation keyword

        let uid: IdentifierNode | undefined;
        const parameters: ParameterNode[] = [];
        const feedStreams: StreamReferenceNode[] = [];
        const productStreams: StreamReferenceNode[] = [];

        // Parse rest of line and continuations
        while (!this.isAtEnd() && !this.check(TokenType.NEWLINE)) {
            // Handle continuation
            if (this.check(TokenType.CONTINUATION)) {
                this.advance();
                this.consumeNewlines();
                continue;
            }

            // UID=value
            if (this.check(TokenType.UID)) {
                this.advance();
                if (this.consume(TokenType.EQUALS)) {
                    uid = this.parseIdentifier();
                }
            }
            // FEED stream
            else if (this.check(TokenType.FEED)) {
                this.advance();
                const stream = this.parseStreamReference();
                if (stream) feedStreams.push(stream);
            }
            // PROD stream1, stream2
            else if (this.check(TokenType.PROD) || this.check(TokenType.PRODUCT)) {
                this.advance();
                do {
                    const stream = this.parseStreamReference();
                    if (stream) productStreams.push(stream);
                } while (this.consume(TokenType.COMMA));
            }
            // Parameter=value
            else {
                const param = this.parseParameter();
                if (param) parameters.push(param);
            }

            // Skip comma
            this.consume(TokenType.COMMA);
        }

        this.consumeNewlines();

        return {
            type: 'UnitOperation',
            statementType,
            startLine,
            endLine: this.getCurrentLine(),
            uid,
            parameters,
            feedStreams,
            productStreams
        };
    }

    /**
     * Parse a component data statement (LIBID, NAME, BANK)
     */
    private parseComponentStatement(): ComponentDataNode | null {
        const startLine = this.getCurrentLine();
        let statementType: 'LIBID' | 'NAME' | 'BANK';

        if (this.check(TokenType.LIBID)) {
            statementType = 'LIBID';
        } else if (this.check(TokenType.NAME)) {
            statementType = 'NAME';
        } else if (this.check(TokenType.BANK)) {
            statementType = 'BANK';
        } else {
            this.advanceLine();
            return null;
        }

        this.advance(); // Keyword

        const components: ComponentNode[] = [];

        // Parse components separated by commas
        while (!this.isAtEnd() && !this.check(TokenType.NEWLINE)) {
            if (this.check(TokenType.CONTINUATION)) {
                this.advance();
                this.consumeNewlines();
                continue;
            }

            const component = this.parseComponent();
            if (component) components.push(component);

            if (!this.consume(TokenType.COMMA)) break;
        }

        this.consumeNewlines();

        return {
            type: 'ComponentData',
            statementType,
            startLine,
            endLine: this.getCurrentLine(),
            components
        };
    }

    /**
     * Parse a component (e.g., C1/2, METHANE)
     */
    private parseComponent(): ComponentNode | null {
        const startLine = this.getCurrentLine();

        if (this.check(TokenType.NUMBER)) {
            // LIBID number
            const libid = this.parseNumber();
            this.consume(TokenType.SLASH);
            const identifier = this.current().value;
            this.advance();

            return {
                type: 'Component',
                startLine,
                endLine: this.getCurrentLine(),
                identifier,
                libid
            };
        } else if (this.check(TokenType.IDENTIFIER)) {
            // Component name
            const identifier = this.current().value;
            this.advance();

            // Check for /libid
            let libid: NumberNode | undefined;
            if (this.consume(TokenType.SLASH) && this.check(TokenType.NUMBER)) {
                libid = this.parseNumber();
            }

            return {
                type: 'Component',
                startLine,
                endLine: this.getCurrentLine(),
                identifier,
                libid
            };
        }

        return null;
    }

    /**
     * Parse a stream data statement (PROP DATA, COMP DATA)
     */
    private parseStreamStatement(): StreamDataNode | null {
        const startLine = this.getCurrentLine();
        let statementType: 'PROP' | 'COMP';

        if (this.check(TokenType.PROP)) {
            statementType = 'PROP';
        } else if (this.check(TokenType.COMP)) {
            statementType = 'COMP';
        } else {
            this.advanceLine();
            return null;
        }

        this.advance(); // PROP or COMP

        let dataType = '';
        if (this.check(TokenType.DATA)) {
            dataType = 'DATA';
            this.advance();
        } else if (this.check(TokenType.RATE)) {
            dataType = 'RATE';
            this.advance();
        }

        this.consume(TokenType.EQUALS);

        const streamName = this.parseIdentifier();
        this.consume(TokenType.COMMA);

        const parameters: ParameterNode[] = [];

        while (!this.isAtEnd() && !this.check(TokenType.NEWLINE)) {
            if (this.check(TokenType.CONTINUATION)) {
                this.advance();
                this.consumeNewlines();
                continue;
            }

            const param = this.parseParameter();
            if (param) parameters.push(param);

            if (!this.consume(TokenType.COMMA)) break;
        }

        this.consumeNewlines();

        return {
            type: 'StreamData',
            statementType,
            startLine,
            endLine: this.getCurrentLine(),
            streamName,
            dataType,
            parameters
        };
    }

    /**
     * Parse a thermodynamic data statement
     */
    private parseThermodynamicStatement(): ThermodynamicDataNode | null {
        const startLine = this.getCurrentLine();
        let statementType: 'METHOD' | 'SET';
        let method: string | undefined;

        if (this.check(TokenType.METHOD)) {
            statementType = 'METHOD';
            this.advance();
        } else if (this.check(TokenType.SET)) {
            statementType = 'SET';
            this.advance();
        } else {
            this.advanceLine();
            return null;
        }

        // Check for method type (SRK, PR, NRTL)
        if (this.check(TokenType.SRK) || this.check(TokenType.PR) || this.check(TokenType.NRTL)) {
            method = this.current().value.toUpperCase();
            this.advance();
        }

        const parameters: ParameterNode[] = [];

        while (!this.isAtEnd() && !this.check(TokenType.NEWLINE)) {
            if (this.check(TokenType.CONTINUATION)) {
                this.advance();
                this.consumeNewlines();
                continue;
            }

            const param = this.parseParameter();
            if (param) parameters.push(param);

            if (!this.consume(TokenType.COMMA)) break;
        }

        this.consumeNewlines();

        return {
            type: 'ThermodynamicData',
            statementType,
            startLine,
            endLine: this.getCurrentLine(),
            method,
            parameters
        };
    }

    /**
     * Parse a print statement
     */
    private parsePrintStatement(): PrintStatementNode | null {
        const startLine = this.getCurrentLine();

        if (!this.check(TokenType.PRINT)) {
            return null;
        }

        this.advance(); // PRINT

        const parameters: ParameterNode[] = [];

        while (!this.isAtEnd() && !this.check(TokenType.NEWLINE)) {
            const param = this.parseParameter();
            if (param) parameters.push(param);

            if (!this.consume(TokenType.COMMA)) break;
        }

        this.consumeNewlines();

        return {
            type: 'PrintStatement',
            statementType: 'PRINT',
            startLine,
            endLine: this.getCurrentLine(),
            parameters
        };
    }

    /**
     * Parse a parameter (NAME=VALUE)
     */
    private parseParameter(): ParameterNode | null {
        const startLine = this.getCurrentLine();

        if (!this.check(TokenType.IDENTIFIER) && !this.isParameterKeyword(this.current().type)) {
            return null;
        }

        const name = this.parseIdentifier();

        if (!this.consume(TokenType.EQUALS)) {
            return null;
        }

        const value = this.parseValue();

        return {
            type: 'Parameter',
            startLine,
            endLine: this.getCurrentLine(),
            name,
            value
        };
    }

    /**
     * Parse a value (number, identifier, string, or list)
     */
    private parseValue(): ValueNode {
        // Check for list (comma or slash separated)
        if (this.isListStart()) {
            return this.parseList();
        }

        // Single value
        if (this.check(TokenType.NUMBER)) {
            return this.parseNumber();
        } else if (this.check(TokenType.STRING)) {
            return this.parseString();
        } else {
            return this.parseIdentifier();
        }
    }

    /**
     * Parse a list of values
     */
    private parseList(): ListNode {
        const startLine = this.getCurrentLine();
        const values: ValueNode[] = [];
        let separator: ',' | '/' = ',';

        // Parse first value
        if (this.check(TokenType.NUMBER)) {
            values.push(this.parseNumber());
        } else if (this.check(TokenType.IDENTIFIER)) {
            values.push(this.parseIdentifier());
        }

        // Determine separator
        if (this.check(TokenType.SLASH)) {
            separator = '/';
        }

        // Parse remaining values
        while (this.check(TokenType.COMMA) || this.check(TokenType.SLASH)) {
            this.advance(); // separator

            if (this.check(TokenType.NUMBER)) {
                values.push(this.parseNumber());
            } else if (this.check(TokenType.IDENTIFIER)) {
                values.push(this.parseIdentifier());
            } else {
                break;
            }
        }

        return {
            type: 'List',
            startLine,
            endLine: this.getCurrentLine(),
            values,
            separator
        };
    }

    /**
     * Parse a stream reference
     */
    private parseStreamReference(): StreamReferenceNode | null {
        const startLine = this.getCurrentLine();

        if (!this.check(TokenType.IDENTIFIER)) {
            return null;
        }

        const streamName = this.parseIdentifier();
        let streamType: string | undefined;

        // Check for stream type (V, L, VAPOR, LIQUID)
        if (this.consume(TokenType.COMMA)) {
            if (this.check(TokenType.IDENTIFIER)) {
                streamType = this.current().value.toUpperCase();
                this.advance();
            }
        }

        return {
            type: 'StreamReference',
            startLine,
            endLine: this.getCurrentLine(),
            streamName,
            streamType
        };
    }

    /**
     * Parse a number
     */
    private parseNumber(): NumberNode {
        const token = this.current();
        const startLine = token.line;
        this.advance();

        return {
            type: 'Number',
            startLine,
            endLine: startLine,
            value: parseFloat(token.value),
            raw: token.value
        };
    }

    /**
     * Parse an identifier
     */
    private parseIdentifier(): IdentifierNode {
        const token = this.current();
        const startLine = token.line;
        this.advance();

        return {
            type: 'Identifier',
            startLine,
            endLine: startLine,
            name: token.value
        };
    }

    /**
     * Parse a string
     */
    private parseString(): StringNode {
        const token = this.current();
        const startLine = token.line;
        this.advance();

        // Remove quotes
        let value = token.value;
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }

        return {
            type: 'String',
            startLine,
            endLine: startLine,
            value
        };
    }

    // ===== Helper Methods =====

    private current(): Token {
        return this.tokens[this.position];
    }

    private previous(): Token {
        return this.tokens[this.position - 1];
    }

    private peek(): Token | null {
        if (this.position + 1 >= this.tokens.length) return null;
        return this.tokens[this.position + 1];
    }

    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.current().type === type;
    }

    private checkNext(type: TokenType): boolean {
        const next = this.peek();
        return next !== null && next.type === type;
    }

    private advance(): Token {
        if (!this.isAtEnd()) {
            const token = this.current();
            this.position++;
            this.currentLine = token.line;
            return token;
        }
        return this.current();
    }

    private consume(type: TokenType): boolean {
        if (this.check(type)) {
            this.advance();
            return true;
        }
        return false;
    }

    private consumeNewlines(): void {
        while (this.check(TokenType.NEWLINE)) {
            this.advance();
        }
    }

    private skipWhitespaceAndComments(): void {
        while (this.check(TokenType.NEWLINE) || this.check(TokenType.COMMENT)) {
            this.advance();
        }
    }

    private advanceLine(): void {
        while (!this.isAtEnd() && !this.check(TokenType.NEWLINE)) {
            this.advance();
        }
        this.consumeNewlines();
    }

    private isAtEnd(): boolean {
        if (this.position >= this.tokens.length) return true;
        return this.current().type === TokenType.EOF;
    }

    private getCurrentLine(): number {
        if (this.isAtEnd()) return this.currentLine;
        return this.current().line;
    }

    private isUnitOperationType(type: TokenType): boolean {
        return type === TokenType.FLASH ||
               type === TokenType.COLUMN ||
               type === TokenType.HCURVE ||
               type === TokenType.HX ||
               type === TokenType.COMPRESSOR ||
               type === TokenType.PUMP ||
               type === TokenType.MIXER ||
               type === TokenType.SPLITTER ||
               type === TokenType.VALVE ||
               type === TokenType.REACTOR ||
               type === TokenType.CALCULATOR ||
               type === TokenType.STCALC;
    }

    private isParameterKeyword(type: TokenType): boolean {
        return type === TokenType.TEMP ||
               type === TokenType.PRES ||
               type === TokenType.RATE ||
               type === TokenType.TYPE ||
               type === TokenType.INPUT ||
               type === TokenType.RESULT;
    }

    private isNextSection(): boolean {
        return (this.check(TokenType.COMPONENT) && this.checkNext(TokenType.DATA)) ||
               (this.check(TokenType.STREAM) && this.checkNext(TokenType.DATA)) ||
               (this.check(TokenType.THERMODYNAMIC) && this.checkNext(TokenType.DATA)) ||
               this.check(TokenType.UNIT_OPERATIONS) ||
               this.check(TokenType.PRINT);
    }

    private isListStart(): boolean {
        // Check if we have multiple values separated by comma or slash
        if (!this.check(TokenType.NUMBER) && !this.check(TokenType.IDENTIFIER)) {
            return false;
        }

        const next = this.peek();
        return next !== null && (next.type === TokenType.COMMA || next.type === TokenType.SLASH);
    }
}
