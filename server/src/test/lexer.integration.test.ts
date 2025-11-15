/**
 * Integration tests with real PRO/II code snippets
 */

import { Lexer } from '../lexer';
import { TokenType } from '../types';

describe('Lexer Integration Tests', () => {
    describe('Real PRO/II Code Snippets', () => {
        test('tokenizes complete FLASH unit definition', () => {
            const code = `FLASH UID=F-100
FEED INLET
PROD VAPOR, LIQUID
TEMP=350, PRES=150`;
            
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();
            
            // Verify structure (not exhaustive, just key tokens)
            expect(tokens[0].type).toBe(TokenType.FLASH);
            expect(tokens[1].type).toBe(TokenType.UID);
            expect(tokens[2].type).toBe(TokenType.EQUALS);
            
            // Check for FEED keyword
            const feedToken = tokens.find(t => t.type === TokenType.FEED);
            expect(feedToken).toBeDefined();
            
            // Check for PROD keyword
            const prodToken = tokens.find(t => t.type === TokenType.PROD);
            expect(prodToken).toBeDefined();
            
            // Check for TEMP keyword
            const tempToken = tokens.find(t => t.type === TokenType.TEMP);
            expect(tempToken).toBeDefined();
            
            // Check for PRES keyword
            const presToken = tokens.find(t => t.type === TokenType.PRES);
            expect(presToken).toBeDefined();
            
            // Verify numbers are parsed
            const numbers = tokens.filter(t => t.type === TokenType.NUMBER);
            expect(numbers.length).toBeGreaterThan(0);
            expect(numbers.some(t => t.value === '350')).toBe(true);
            expect(numbers.some(t => t.value === '150')).toBe(true);
        });

        test('tokenizes COMPONENT DATA section', () => {
            const code = `COMPONENT DATA
LIBID 1, C1/2, C2/3, C3/4, IC4/5
NAME METHANE, ETHANE, PROPANE, ISOBUTANE`;
            
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();
            
            // Verify COMPONENT keyword
            const componentToken = tokens.find(t => t.type === TokenType.COMPONENT);
            expect(componentToken).toBeDefined();
            
            // Verify DATA keyword
            const dataToken = tokens.find(t => t.type === TokenType.DATA);
            expect(dataToken).toBeDefined();
            
            // Verify LIBID keyword
            const libidToken = tokens.find(t => t.type === TokenType.LIBID);
            expect(libidToken).toBeDefined();
            
            // Verify NAME keyword
            const nameToken = tokens.find(t => t.type === TokenType.NAME);
            expect(nameToken).toBeDefined();
            
            // Check for slashes (used in component notation)
            const slashes = tokens.filter(t => t.type === TokenType.SLASH);
            expect(slashes.length).toBeGreaterThan(0);
            
            // Check for commas
            const commas = tokens.filter(t => t.type === TokenType.COMMA);
            expect(commas.length).toBeGreaterThan(0);
        });

        test('tokenizes multi-line statement with continuation', () => {
            const code = `FLASH UID=F-100 &
FEED INLET &
PROD VAPOR, LIQUID`;
            
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();
            
            // Verify continuation tokens
            const continuations = tokens.filter(t => t.type === TokenType.CONTINUATION);
            expect(continuations.length).toBe(2);
            
            // Verify newlines after continuations
            let foundContWithNewline = false;
            for (let i = 0; i < tokens.length - 1; i++) {
                if (tokens[i].type === TokenType.CONTINUATION && tokens[i + 1].type === TokenType.NEWLINE) {
                    foundContWithNewline = true;
                    break;
                }
            }
            expect(foundContWithNewline).toBe(true);
        });

        test('tokenizes STREAM DATA section', () => {
            const code = `STREAM DATA
PROP DATA=INLET, TEMP=100, PRES=300
COMP DATA=INLET, RATE(WT)=10/20/30/40`;
            
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();
            
            // Verify STREAM keyword
            const streamToken = tokens.find(t => t.type === TokenType.STREAM);
            expect(streamToken).toBeDefined();
            
            // Verify PROP keyword
            const propToken = tokens.find(t => t.type === TokenType.PROP);
            expect(propToken).toBeDefined();
            
            // Verify COMP keyword
            const compToken = tokens.find(t => t.type === TokenType.COMP);
            expect(compToken).toBeDefined();
            
            // Verify RATE keyword
            const rateToken = tokens.find(t => t.type === TokenType.RATE);
            expect(rateToken).toBeDefined();
        });

        test('handles comments interspersed with code', () => {
            const code = `$ This is a flash unit
FLASH UID=F-100
% Temperature in F
TEMP=350`;
            
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();
            
            // Verify comments are captured
            const comments = tokens.filter(t => t.type === TokenType.COMMENT);
            expect(comments.length).toBe(2);
            expect(comments[0].value).toContain('This is a flash unit');
            expect(comments[1].value).toContain('Temperature in F');
            
            // Verify code after comments still works
            const flashToken = tokens.find(t => t.type === TokenType.FLASH);
            expect(flashToken).toBeDefined();
            
            const tempToken = tokens.find(t => t.type === TokenType.TEMP);
            expect(tempToken).toBeDefined();
        });

        test('tokenizes COLUMN unit with complex parameters', () => {
            const code = `COLUMN UID=C-200
NSTAGE=20
FEED 1, F1, 10
FEED 2, F2, 15
PROD 1, OVHD, V
PROD 2, BTMS, L
COND TYPE=TOTAL
TRAY SIZE, D=5`;
            
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();
            
            // Verify COLUMN keyword
            expect(tokens[0].type).toBe(TokenType.COLUMN);
            
            // Verify NSTAGE keyword
            const nstageToken = tokens.find(t => t.type === TokenType.NSTAGE);
            expect(nstageToken).toBeDefined();
            
            // Verify COND keyword
            const condToken = tokens.find(t => t.type === TokenType.COND);
            expect(condToken).toBeDefined();
            
            // Verify TYPE keyword
            const typeToken = tokens.find(t => t.type === TokenType.TYPE);
            expect(typeToken).toBeDefined();
            
            // Check for identifiers (stream names, etc.)
            const identifiers = tokens.filter(t => t.type === TokenType.IDENTIFIER);
            expect(identifiers.length).toBeGreaterThan(0);
            expect(identifiers.some(t => t.value === 'F1')).toBe(true);
            expect(identifiers.some(t => t.value === 'OVHD')).toBe(true);
        });

        test('tokenizes PRINT statement', () => {
            const code = `PRINT INPUT=ALL
PRINT RESULT=STREAM, UID=F-100`;
            
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();
            
            // Verify PRINT keywords
            const printTokens = tokens.filter(t => t.type === TokenType.PRINT);
            expect(printTokens.length).toBe(2);
            
            // Verify INPUT keyword
            const inputToken = tokens.find(t => t.type === TokenType.INPUT);
            expect(inputToken).toBeDefined();
            
            // Verify RESULT keyword
            const resultToken = tokens.find(t => t.type === TokenType.RESULT);
            expect(resultToken).toBeDefined();
        });

        test('performance: tokenizes large file quickly', () => {
            // Generate a large PRO/II file (1000 lines)
            const lines: string[] = [];
            for (let i = 0; i < 1000; i++) {
                lines.push(`FLASH UID=F${i}`);
                lines.push(`FEED INLET${i}`);
                lines.push(`PROD VAPOR${i}, LIQUID${i}`);
                lines.push(`TEMP=${100 + i}, PRES=${200 + i}`);
                lines.push('');
            }
            const code = lines.join('\n');
            
            const startTime = Date.now();
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();
            const endTime = Date.now();
            
            const elapsedMs = endTime - startTime;
            
            // Should tokenize 1000 lines in under 100ms
            expect(elapsedMs).toBeLessThan(100);
            
            // Should produce thousands of tokens
            expect(tokens.length).toBeGreaterThan(5000);
            
            console.log(`Tokenized ${lines.length} lines (${code.length} chars) in ${elapsedMs}ms`);
            console.log(`Generated ${tokens.length} tokens`);
            console.log(`Speed: ${(code.length / elapsedMs).toFixed(2)} chars/ms`);
        });
    });
});
