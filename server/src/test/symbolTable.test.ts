/**
 * Symbol Table Tests
 */

import { SymbolTable, SymbolKind } from '../symbolTable';
import { Lexer } from '../lexer';
import { Parser } from '../parser';

describe('SymbolTable', () => {
    describe('Component Data Processing', () => {
        it('extracts components from LIBID statements', () => {
            const code = `
COMPONENT DATA
LIBID 1, C1/2, C2/3, C3/4
`;
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();
            
            const symbolTable = new SymbolTable();
            symbolTable.build(ast);
            
            const components = symbolTable.getSymbolsByKind(SymbolKind.COMPONENT);
            expect(components.length).toBeGreaterThanOrEqual(3);
            
            // Check for specific components
            expect(symbolTable.isDefined('C1')).toBe(true);
            expect(symbolTable.isDefined('C2')).toBe(true);
            expect(symbolTable.isDefined('C3')).toBe(true);
        });
        
        it('extracts components from NAME statements', () => {
            const code = `
COMPONENT DATA
NAME METHANE, ETHANE, PROPANE
`;
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();
            
            const symbolTable = new SymbolTable();
            symbolTable.build(ast);
            
            const components = symbolTable.getSymbolsByKind(SymbolKind.COMPONENT);
            expect(components.length).toBe(3);
            
            expect(symbolTable.isDefined('METHANE')).toBe(true);
            expect(symbolTable.isDefined('ETHANE')).toBe(true);
            expect(symbolTable.isDefined('PROPANE')).toBe(true);
        });
    });
    
    describe('Stream Data Processing', () => {
        it('extracts streams from PROP DATA', () => {
            const code = `
STREAM DATA
PROP DATA=FEED, TEMP=100, PRES=300
`;
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();
            
            const symbolTable = new SymbolTable();
            symbolTable.build(ast);
            
            const streams = symbolTable.getSymbolsByKind(SymbolKind.STREAM);
            expect(streams.length).toBeGreaterThan(0);
            
            const feedStream = symbolTable.getSymbol('FEED');
            expect(feedStream).toBeDefined();
            expect(feedStream?.kind).toBe(SymbolKind.STREAM);
        });
        
        it('extracts streams from COMP DATA', () => {
            const code = `
STREAM DATA
COMP DATA=PRODUCT, RATE(WT)=20/30/50
`;
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();
            
            const symbolTable = new SymbolTable();
            symbolTable.build(ast);
            
            expect(symbolTable.isDefined('PRODUCT')).toBe(true);
        });
    });
    
    describe('Unit Operations Processing', () => {
        it('extracts unit operations with UIDs', () => {
            const code = `
UNIT OPERATIONS
FLASH UID=F-100
FEED FEED
PROD VAPOR, LIQUID
`;
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();
            
            const symbolTable = new SymbolTable();
            symbolTable.build(ast);
            
            const units = symbolTable.getSymbolsByKind(SymbolKind.UNIT);
            expect(units.length).toBe(1);
            
            const flashUnit = symbolTable.getSymbol('F-100');
            expect(flashUnit).toBeDefined();
            expect(flashUnit?.kind).toBe(SymbolKind.UNIT);
            expect(flashUnit?.metadata?.unitType).toBe('FLASH');
        });
        
        it('tracks stream references in unit operations', () => {
            const code = `
STREAM DATA
PROP DATA=FEED, TEMP=100

UNIT OPERATIONS
FLASH UID=F-100
FEED FEED
PROD VAPOR, LIQUID
`;
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();
            
            const symbolTable = new SymbolTable();
            symbolTable.build(ast);
            
            // Check FEED stream
            const feedStream = symbolTable.getSymbol('FEED');
            expect(feedStream).toBeDefined();
            expect(feedStream?.references.length).toBeGreaterThanOrEqual(2); // definition + usage
            
            // Check product streams
            expect(symbolTable.isDefined('VAPOR')).toBe(true);
            expect(symbolTable.isDefined('LIQUID')).toBe(true);
        });
    });
    
    describe('Undefined Symbols Detection', () => {
        it('detects streams used but not defined', () => {
            const code = `
UNIT OPERATIONS
FLASH UID=F-100
FEED UNDEFINED_FEED
PROD VAPOR
`;
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();
            
            const symbolTable = new SymbolTable();
            symbolTable.build(ast);
            
            const undefinedSymbols = symbolTable.getUndefinedSymbols();
            expect(undefinedSymbols.length).toBeGreaterThan(0);
            
            const names = undefinedSymbols.map(s => s.name);
            expect(names).toContain('UNDEFINED_FEED');
        });
        
        it('does not flag properly defined streams as undefined', () => {
            const code = `
STREAM DATA
PROP DATA=FEED, TEMP=100

UNIT OPERATIONS
FLASH UID=F-100
FEED FEED
PROD VAPOR
`;
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();
            
            const symbolTable = new SymbolTable();
            symbolTable.build(ast);
            
            const undefinedSymbols = symbolTable.getUndefinedSymbols();
            const feedUndefined = undefinedSymbols.find(s => s.name === 'FEED');
            expect(feedUndefined).toBeUndefined();
        });
    });
    
    describe('Symbol Statistics', () => {
        it('provides accurate statistics', () => {
            const code = `
COMPONENT DATA
LIBID 1, C1/2, C2/3

STREAM DATA
PROP DATA=FEED, TEMP=100
PROP DATA=PRODUCT, TEMP=200

UNIT OPERATIONS
FLASH UID=F-100
FEED FEED
PROD PRODUCT
`;
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();
            
            const symbolTable = new SymbolTable();
            symbolTable.build(ast);
            
            const stats = symbolTable.getStats();
            expect(stats.components).toBeGreaterThanOrEqual(2);
            expect(stats.streams).toBe(2);
            expect(stats.units).toBe(1);
        });
    });
    
    describe('Symbol Lookup', () => {
        it('performs case-insensitive lookup', () => {
            const code = `
STREAM DATA
PROP DATA=Feed, TEMP=100
`;
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();
            
            const symbolTable = new SymbolTable();
            symbolTable.build(ast);
            
            expect(symbolTable.getSymbol('FEED')).toBeDefined();
            expect(symbolTable.getSymbol('feed')).toBeDefined();
            expect(symbolTable.getSymbol('Feed')).toBeDefined();
        });
        
        it('returns undefined for non-existent symbols', () => {
            const symbolTable = new SymbolTable();
            expect(symbolTable.getSymbol('NONEXISTENT')).toBeUndefined();
        });
    });
});
