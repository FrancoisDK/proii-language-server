/**
 * PRO/II Lexer (Tokenizer)
 * Converts raw PRO/II text into a stream of tokens
 */

import { Token, TokenType, KEYWORDS } from './types';

export class Lexer {
    private input: string;
    private position: number = 0;
    private line: number = 1;
    private column: number = 1;
    private tokens: Token[] = [];

    constructor(input: string) {
        this.input = input;
    }

    /**
     * Tokenize the entire input
     */
    public tokenize(): Token[] {
        this.tokens = [];
        
        while (this.position < this.input.length) {
            this.scanToken();
        }
        
        // Add EOF token
        this.tokens.push(this.createToken(TokenType.EOF, '', 0));
        
        return this.tokens;
    }

    /**
     * Scan a single token
     */
    private scanToken(): void {
        const char = this.currentChar();
        
        // Skip whitespace (except newlines)
        if (char === ' ' || char === '\t' || char === '\r') {
            this.advance();
            return;
        }
        
        // Newline
        if (char === '\n') {
            const col = this.column;
            this.advance();
            this.tokens.push({ type: TokenType.NEWLINE, value: '\n', line: this.line, column: col, length: 1 });
            this.line++;
            this.column = 1;
            return;
        }
        
        // Comment ($ or %)
        if (char === '$' || char === '%') {
            this.scanComment();
            return;
        }
        
        // Continuation character
        if (char === '&') {
            const col = this.column;
            this.advance();
            this.tokens.push(this.createToken(TokenType.CONTINUATION, '&', 1, col));
            return;
        }
        
        // Operators
        if (char === '=') {
            const col = this.column;
            this.advance();
            this.tokens.push(this.createToken(TokenType.EQUALS, '=', 1, col));
            return;
        }
        if (char === ',') {
            const col = this.column;
            this.advance();
            this.tokens.push(this.createToken(TokenType.COMMA, ',', 1, col));
            return;
        }
        if (char === '/') {
            const col = this.column;
            this.advance();
            this.tokens.push(this.createToken(TokenType.SLASH, '/', 1, col));
            return;
        }
        if (char === '+') {
            const col = this.column;
            this.advance();
            this.tokens.push(this.createToken(TokenType.PLUS, '+', 1, col));
            return;
        }
        if (char === '-') {
            // Could be minus or start of negative number
            if (this.isDigit(this.peek())) {
                this.scanNumber();
            } else {
                const col = this.column;
                this.advance();
                this.tokens.push(this.createToken(TokenType.MINUS, '-', 1, col));
            }
            return;
        }
        if (char === '*') {
            const col = this.column;
            this.advance();
            this.tokens.push(this.createToken(TokenType.TIMES, '*', 1, col));
            return;
        }
        if (char === '(') {
            const col = this.column;
            this.advance();
            this.tokens.push(this.createToken(TokenType.LPAREN, '(', 1, col));
            return;
        }
        if (char === ')') {
            const col = this.column;
            this.advance();
            this.tokens.push(this.createToken(TokenType.RPAREN, ')', 1, col));
            return;
        }
        
        // Numbers
        if (this.isDigit(char)) {
            this.scanNumber();
            return;
        }
        
        // Identifiers and keywords
        if (this.isAlpha(char)) {
            this.scanIdentifier();
            return;
        }
        
        // String literals
        if (char === '"' || char === "'") {
            this.scanString(char);
            return;
        }
        
        // Unknown character
        const col = this.column;
        this.advance();
        this.tokens.push(this.createToken(TokenType.UNKNOWN, char, 1, col));
    }

    /**
     * Scan a comment ($ or % to end of line)
     */
    private scanComment(): void {
        const startColumn = this.column;
        const commentChar = this.currentChar();
        let value = commentChar;
        
        this.advance();
        
        // Read until end of line
        while (this.currentChar() !== '\n' && !this.isAtEnd()) {
            value += this.currentChar();
            this.advance();
        }
        
        this.tokens.push(this.createToken(TokenType.COMMENT, value, value.length, startColumn));
    }

    /**
     * Scan a number (integer, decimal, or scientific notation)
     */
    private scanNumber(): void {
        const startColumn = this.column;
        let value = '';
        
        // Handle negative sign
        if (this.currentChar() === '-') {
            value += '-';
            this.advance();
        }
        
        // Integer part
        while (this.isDigit(this.currentChar())) {
            value += this.currentChar();
            this.advance();
        }
        
        // Decimal part
        if (this.currentChar() === '.' && this.isDigit(this.peek())) {
            value += '.';
            this.advance();
            
            while (this.isDigit(this.currentChar())) {
                value += this.currentChar();
                this.advance();
            }
        }
        
        // Scientific notation (E or e)
        if (this.currentChar() === 'E' || this.currentChar() === 'e') {
            value += this.currentChar();
            this.advance();
            
            if (this.currentChar() === '+' || this.currentChar() === '-') {
                value += this.currentChar();
                this.advance();
            }
            
            while (this.isDigit(this.currentChar())) {
                value += this.currentChar();
                this.advance();
            }
        }
        
        this.tokens.push(this.createToken(TokenType.NUMBER, value, value.length, startColumn));
    }

    /**
     * Scan an identifier or keyword
     */
    private scanIdentifier(): void {
        const startColumn = this.column;
        let value = '';
        
        // Read alphanumeric characters and underscores
        while (this.isAlphaNumeric(this.currentChar()) || this.currentChar() === '_') {
            value += this.currentChar();
            this.advance();
        }
        
        // Check if it's a keyword
        const upperValue = value.toUpperCase();
        const tokenType = KEYWORDS.get(upperValue) || TokenType.IDENTIFIER;
        
        this.tokens.push(this.createToken(tokenType, value, value.length, startColumn));
    }

    /**
     * Scan a string literal
     */
    private scanString(quote: string): void {
        const startColumn = this.column;
        let value = quote;
        
        this.advance(); // Skip opening quote
        
        // Read until closing quote or end of line
        while (this.currentChar() !== quote && this.currentChar() !== '\n' && !this.isAtEnd()) {
            value += this.currentChar();
            this.advance();
        }
        
        if (this.currentChar() === quote) {
            value += quote;
            this.advance();
        }
        
        this.tokens.push(this.createToken(TokenType.STRING, value, value.length, startColumn));
    }

    /**
     * Helper: Create a token (captures current position before token was consumed)
     */
    private createToken(type: TokenType, value: string, length: number, startColumn?: number): Token {
        return {
            type,
            value,
            line: this.line,
            column: startColumn !== undefined ? startColumn : this.column,
            length
        };
    }

    /**
     * Helper: Get current character
     */
    private currentChar(): string {
        if (this.isAtEnd()) return '\0';
        return this.input[this.position];
    }

    /**
     * Helper: Peek at next character
     */
    private peek(): string {
        if (this.position + 1 >= this.input.length) return '\0';
        return this.input[this.position + 1];
    }

    /**
     * Helper: Advance position
     */
    private advance(): void {
        if (!this.isAtEnd()) {
            this.position++;
            this.column++;
        }
    }

    /**
     * Helper: Check if at end of input
     */
    private isAtEnd(): boolean {
        return this.position >= this.input.length;
    }

    /**
     * Helper: Check if character is a digit
     */
    private isDigit(char: string): boolean {
        return char >= '0' && char <= '9';
    }

    /**
     * Helper: Check if character is alphabetic
     */
    private isAlpha(char: string): boolean {
        return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
    }

    /**
     * Helper: Check if character is alphanumeric
     */
    private isAlphaNumeric(char: string): boolean {
        return this.isAlpha(char) || this.isDigit(char);
    }
}
