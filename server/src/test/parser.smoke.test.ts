/**
 * Quick parser smoke test
 */

import { Lexer } from '../lexer';
import { Parser } from '../parser';

describe('Parser Smoke Test', () => {
    test('parses simple COMPONENT DATA without hanging', () => {
        const code = `COMPONENT DATA
LIBID 1`;
        
        const lexer = new Lexer(code);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        
        expect(ast.type).toBe('Program');
    }, 1000); // 1 second timeout
});
