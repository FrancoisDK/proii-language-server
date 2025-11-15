/**
 * Tests for Symbol Hover Provider (Streams and Components)
 */

import { SymbolTable, SymbolKind } from '../symbolTable';
import { 
    createStreamHover, 
    createComponentHover, 
    createUnitOperationHover,
    provideHover 
} from '../symbolHoverProvider';

describe('Symbol Hover Provider', () => {
    let symbolTable: SymbolTable;

    beforeEach(() => {
        symbolTable = new SymbolTable();
    });

    describe('Stream Hover', () => {
        test('should create hover for stream with properties', () => {
            // Add a stream with properties
            const symbol = {
                name: 'FEED1',
                kind: SymbolKind.STREAM,
                definedAt: { line: 10 },
                references: [
                    { line: 10, context: 'definition' },
                    { line: 20, context: 'feed' }
                ],
                metadata: {
                    temp: 100,
                    pres: 300,
                    rate: 1000,
                    rateUnit: 'kg/hr'
                }
            };

            // Mock the symbol table
            (symbolTable as any).symbols = new Map([['FEED1', symbol]]);

            const hover = createStreamHover(symbolTable, 'FEED1');

            expect(hover).toBeDefined();
            expect(hover?.contents).toBeDefined();
            
            const content = (hover?.contents as any).value;
            expect(content).toContain('🌊 Stream: FEED1');
            expect(content).toContain('Temperature');
            expect(content).toContain('100');
            expect(content).toContain('Pressure');
            expect(content).toContain('300');
            expect(content).toContain('Rate');
            expect(content).toContain('1000');
        });

        test('should create hover for stream without properties', () => {
            const symbol = {
                name: 'VAPOR',
                kind: SymbolKind.STREAM,
                definedAt: { line: 15 },
                references: [{ line: 15, context: 'definition' }],
                metadata: {}
            };

            (symbolTable as any).symbols = new Map([['VAPOR', symbol]]);

            const hover = createStreamHover(symbolTable, 'VAPOR');

            expect(hover).toBeDefined();
            const content = (hover?.contents as any).value;
            expect(content).toContain('🌊 Stream: VAPOR');
            expect(content).toContain('line 15');
        });

        test('should show usage statistics', () => {
            const symbol = {
                name: 'FEED1',
                kind: SymbolKind.STREAM,
                definedAt: { line: 10 },
                references: [
                    { line: 10, context: 'definition' },
                    { line: 20, context: 'feed' },
                    { line: 25, context: 'feed' },
                    { line: 30, context: 'product' }
                ],
                metadata: {}
            };

            (symbolTable as any).symbols = new Map([['FEED1', symbol]]);

            const hover = createStreamHover(symbolTable, 'FEED1');

            const content = (hover?.contents as any).value;
            expect(content).toContain('Usage:');
            expect(content).toContain('Used as feed 2 time(s)');
            expect(content).toContain('Used as product 1 time(s)');
        });

        test('should return null for non-existent stream', () => {
            const hover = createStreamHover(symbolTable, 'NONEXISTENT');
            expect(hover).toBeNull();
        });
    });

    describe('Component Hover', () => {
        test('should create hover for component with metadata', () => {
            const symbol = {
                name: 'H2O',
                kind: SymbolKind.COMPONENT,
                definedAt: { line: 5 },
                references: [],
                metadata: {
                    libid: 1,
                    componentName: 'H2O',
                    type: 'Inorganic',
                    formula: 'H₂O',
                    molecularWeight: '18.02'
                }
            };

            (symbolTable as any).symbols = new Map([['H2O', symbol]]);

            const hover = createComponentHover(symbolTable, 'H2O');

            expect(hover).toBeDefined();
            const content = (hover?.contents as any).value;
            expect(content).toContain('🧪 Component: H2O');
            expect(content).toContain('Index');
            expect(content).toContain('1');
            expect(content).toContain('Type');
            expect(content).toContain('Inorganic');
            expect(content).toContain('Formula');
            expect(content).toContain('H₂O');
            expect(content).toContain('Molecular Weight');
            expect(content).toContain('18.02');
        });

        test('should create hover for hydrocarbon component', () => {
            const symbol = {
                name: 'C3',
                kind: SymbolKind.COMPONENT,
                definedAt: { line: 5 },
                references: [],
                metadata: {
                    libid: 3,
                    componentName: 'C3',
                    type: 'Hydrocarbon',
                    formula: 'C₃H₈ (Propane)',
                    molecularWeight: '44.10'
                }
            };

            (symbolTable as any).symbols = new Map([['C3', symbol]]);

            const hover = createComponentHover(symbolTable, 'C3');

            expect(hover).toBeDefined();
            const content = (hover?.contents as any).value;
            expect(content).toContain('🧪 Component: C3');
            expect(content).toContain('Hydrocarbon');
            expect(content).toContain('C₃H₈ (Propane)');
            expect(content).toContain('44.10');
        });

        test('should return null for non-existent component', () => {
            const hover = createComponentHover(symbolTable, 'NONEXISTENT');
            expect(hover).toBeNull();
        });
    });

    describe('Unit Operation Hover', () => {
        test('should create hover for unit operation', () => {
            const symbol = {
                name: 'F-100',
                kind: SymbolKind.UNIT,
                definedAt: { line: 20 },
                references: [{ line: 20, context: 'definition' }],
                metadata: {
                    unitType: 'FLASH'
                }
            };

            (symbolTable as any).symbols = new Map([['F-100', symbol]]);

            const hover = createUnitOperationHover(symbolTable, 'F-100');

            expect(hover).toBeDefined();
            const content = (hover?.contents as any).value;
            expect(content).toContain('⚙️ Unit Operation: F-100');
            expect(content).toContain('**Type**');
            expect(content).toContain('FLASH');
            expect(content).toContain('line 20');
        });
    });

    describe('provideHover - Main Entry Point', () => {
        test('should delegate to stream hover', () => {
            const symbol = {
                name: 'FEED1',
                kind: SymbolKind.STREAM,
                definedAt: { line: 10 },
                references: [],
                metadata: { temp: 100 }
            };

            (symbolTable as any).symbols = new Map([['FEED1', symbol]]);

            const hover = provideHover(symbolTable, 'FEED1');

            expect(hover).toBeDefined();
            const content = (hover?.contents as any).value;
            expect(content).toContain('🌊 Stream: FEED1');
        });

        test('should delegate to component hover', () => {
            const symbol = {
                name: 'H2O',
                kind: SymbolKind.COMPONENT,
                definedAt: { line: 5 },
                references: [],
                metadata: { libid: 1 }
            };

            (symbolTable as any).symbols = new Map([['H2O', symbol]]);

            const hover = provideHover(symbolTable, 'H2O');

            expect(hover).toBeDefined();
            const content = (hover?.contents as any).value;
            expect(content).toContain('🧪 Component: H2O');
        });

        test('should delegate to unit operation hover', () => {
            const symbol = {
                name: 'F-100',
                kind: SymbolKind.UNIT,
                definedAt: { line: 20 },
                references: [],
                metadata: { unitType: 'FLASH' }
            };

            (symbolTable as any).symbols = new Map([['F-100', symbol]]);

            const hover = provideHover(symbolTable, 'F-100');

            expect(hover).toBeDefined();
            const content = (hover?.contents as any).value;
            expect(content).toContain('⚙️ Unit Operation: F-100');
        });

        test('should return null for unknown symbol', () => {
            const hover = provideHover(symbolTable, 'UNKNOWN');
            expect(hover).toBeNull();
        });

        test('should be case insensitive', () => {
            const symbol = {
                name: 'FEED1',
                kind: SymbolKind.STREAM,
                definedAt: { line: 10 },
                references: [],
                metadata: {}
            };

            (symbolTable as any).symbols = new Map([['FEED1', symbol]]);

            const hoverUpper = provideHover(symbolTable, 'FEED1');
            const hoverLower = provideHover(symbolTable, 'feed1');
            const hoverMixed = provideHover(symbolTable, 'Feed1');

            expect(hoverUpper).toBeDefined();
            expect(hoverLower).toBeDefined();
            expect(hoverMixed).toBeDefined();
        });
    });
});
