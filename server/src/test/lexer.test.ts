/**
 * Lexer Tests
 * Tests for PRO/II tokenization
 */

import { Lexer } from '../lexer';
import { TokenType } from '../types';

describe('Lexer', () => {
    describe('Basic Tokens', () => {
        test('tokenizes numbers', () => {
            const lexer = new Lexer('100 3.14 1.5E-3 -25');
            const tokens = lexer.tokenize();
            
            expect(tokens[0].type).toBe(TokenType.NUMBER);
            expect(tokens[0].value).toBe('100');
            
            expect(tokens[1].type).toBe(TokenType.NUMBER);
            expect(tokens[1].value).toBe('3.14');
            
            expect(tokens[2].type).toBe(TokenType.NUMBER);
            expect(tokens[2].value).toBe('1.5E-3');
            
            expect(tokens[3].type).toBe(TokenType.NUMBER);
            expect(tokens[3].value).toBe('-25');
        });

        test('tokenizes identifiers', () => {
            const lexer = new Lexer('FEED1 STREAM_NAME test123');
            const tokens = lexer.tokenize();
            
            expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
            expect(tokens[0].value).toBe('FEED1');
            
            expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
            expect(tokens[1].value).toBe('STREAM_NAME');
            
            expect(tokens[2].type).toBe(TokenType.IDENTIFIER);
            expect(tokens[2].value).toBe('test123');
        });

        test('tokenizes keywords', () => {
            const lexer = new Lexer('FLASH COLUMN UID FEED TEMP');
            const tokens = lexer.tokenize();
            
            expect(tokens[0].type).toBe(TokenType.FLASH);
            expect(tokens[1].type).toBe(TokenType.COLUMN);
            expect(tokens[2].type).toBe(TokenType.UID);
            expect(tokens[3].type).toBe(TokenType.FEED);
            expect(tokens[4].type).toBe(TokenType.TEMP);
        });

        test('tokenizes operators', () => {
            const lexer = new Lexer('= , / + - * ( )');
            const tokens = lexer.tokenize();
            
            expect(tokens[0].type).toBe(TokenType.EQUALS);
            expect(tokens[1].type).toBe(TokenType.COMMA);
            expect(tokens[2].type).toBe(TokenType.SLASH);
            expect(tokens[3].type).toBe(TokenType.PLUS);
            expect(tokens[4].type).toBe(TokenType.MINUS);
            expect(tokens[5].type).toBe(TokenType.TIMES);
            expect(tokens[6].type).toBe(TokenType.LPAREN);
            expect(tokens[7].type).toBe(TokenType.RPAREN);
        });

        test('tokenizes comments', () => {
            const lexer = new Lexer('$ This is a comment\n% Another comment');
            const tokens = lexer.tokenize();
            
            expect(tokens[0].type).toBe(TokenType.COMMENT);
            expect(tokens[0].value).toBe('$ This is a comment');
            
            expect(tokens[1].type).toBe(TokenType.NEWLINE);
            
            expect(tokens[2].type).toBe(TokenType.COMMENT);
            expect(tokens[2].value).toBe('% Another comment');
        });

        test('tokenizes continuation character', () => {
            const lexer = new Lexer('LINE1 &\nLINE2');
            const tokens = lexer.tokenize();
            
            expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
            expect(tokens[1].type).toBe(TokenType.CONTINUATION);
            expect(tokens[2].type).toBe(TokenType.NEWLINE);
            expect(tokens[3].type).toBe(TokenType.IDENTIFIER);
        });
    });

    describe('PRO/II Constructs', () => {
        test('tokenizes FLASH unit', () => {
            const input = `FLASH       UID=F-1
  FEED      FEED1
  PROD      V=VAPOR, L=LIQUID
  ISOT      TEMP(F)=350`;
            
            const lexer = new Lexer(input);
            const tokens = lexer.tokenize();
            
            expect(tokens[0].type).toBe(TokenType.FLASH);
            expect(tokens[1].type).toBe(TokenType.UID);
            expect(tokens[2].type).toBe(TokenType.EQUALS);
            
            // Find FEED token
            const feedToken = tokens.find(t => t.type === TokenType.FEED);
            expect(feedToken).toBeDefined();
        });

        test('tokenizes parameter assignment', () => {
            const lexer = new Lexer('TEMP=350');
            const tokens = lexer.tokenize();
            
            expect(tokens[0].type).toBe(TokenType.TEMP);
            expect(tokens[1].type).toBe(TokenType.EQUALS);
            expect(tokens[2].type).toBe(TokenType.NUMBER);
            expect(tokens[2].value).toBe('350');
        });

        test('tokenizes component list', () => {
            const lexer = new Lexer('LIBID 1,H2/2,N2/3,O2');
            const tokens = lexer.tokenize();
            
            expect(tokens[0].type).toBe(TokenType.LIBID);
            expect(tokens[1].type).toBe(TokenType.NUMBER);
            expect(tokens[2].type).toBe(TokenType.COMMA);
            expect(tokens[3].type).toBe(TokenType.IDENTIFIER);
            expect(tokens[4].type).toBe(TokenType.SLASH);
        });
    });

    describe('Position Tracking', () => {
        test('tracks line numbers', () => {
            const lexer = new Lexer('LINE1\nLINE2\nLINE3');
            const tokens = lexer.tokenize();
            
            expect(tokens[0].line).toBe(1);
            expect(tokens[2].line).toBe(2);
            expect(tokens[4].line).toBe(3);
        });

        test('tracks column numbers', () => {
            const lexer = new Lexer('FLASH UID=F1');
            const tokens = lexer.tokenize();
            
            expect(tokens[0].column).toBe(1);  // FLASH
            expect(tokens[1].column).toBe(7);  // UID
            expect(tokens[2].column).toBe(10); // =
        });
    });

    describe('Edge Cases', () => {
        test('handles empty input', () => {
            const lexer = new Lexer('');
            const tokens = lexer.tokenize();
            
            expect(tokens.length).toBe(1);
            expect(tokens[0].type).toBe(TokenType.EOF);
        });

        test('handles whitespace', () => {
            const lexer = new Lexer('   \t  \n  ');
            const tokens = lexer.tokenize();
            
            // Should only have NEWLINE and EOF
            expect(tokens.length).toBe(2);
            expect(tokens[0].type).toBe(TokenType.NEWLINE);
            expect(tokens[1].type).toBe(TokenType.EOF);
        });

        test('handles scientific notation', () => {
            const lexer = new Lexer('1.5E-3 2.0E+5 3e10');
            const tokens = lexer.tokenize();
            
            expect(tokens[0].type).toBe(TokenType.NUMBER);
            expect(tokens[0].value).toBe('1.5E-3');
            
            expect(tokens[1].type).toBe(TokenType.NUMBER);
            expect(tokens[1].value).toBe('2.0E+5');
            
            expect(tokens[2].type).toBe(TokenType.NUMBER);
            expect(tokens[2].value).toBe('3e10');
        });
    });
});
