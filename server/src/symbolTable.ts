/**
 * Symbol Table for PRO/II Language Server
 * Tracks all symbols (streams, units, components) in the document
 */

import {
    ProgramNode, SectionNode, StatementNode, UnitOperationNode,
    ComponentDataNode, StreamDataNode, StreamReferenceNode,
    IdentifierNode, ComponentNode
} from './ast';

/**
 * Symbol types in PRO/II
 */
export enum SymbolKind {
    STREAM = 'stream',
    UNIT = 'unit',
    COMPONENT = 'component',
    PARAMETER = 'parameter'
}

/**
 * Symbol information
 */
export interface Symbol {
    name: string;
    kind: SymbolKind;
    definedAt: {
        line: number;
        column?: number;
    };
    references: Array<{
        line: number;
        column?: number;
        context: string; // 'definition', 'feed', 'product', 'parameter'
    }>;
    metadata?: {
        unitType?: string; // For units: FLASH, COLUMN, etc.
        libid?: number; // For components: library ID
        componentName?: string; // For components: full name
        value?: string; // For parameters
    };
}

/**
 * Symbol Table Manager
 */
export class SymbolTable {
    private symbols: Map<string, Symbol> = new Map();

    /**
     * Build symbol table from AST
     */
    public build(ast: ProgramNode): void {
        this.symbols.clear();

        for (const section of ast.sections) {
            this.processSection(section);
        }
    }

    /**
     * Process a section node
     */
    private processSection(section: SectionNode): void {
        switch (section.sectionType) {
            case 'COMPONENT_DATA':
                this.processComponentData(section);
                break;
            case 'STREAM_DATA':
                this.processStreamData(section);
                break;
            case 'UNIT_OPERATIONS':
                this.processUnitOperations(section);
                break;
            default:
                break;
        }
    }

    /**
     * Process COMPONENT DATA section
     */
    private processComponentData(section: SectionNode): void {
        for (const stmt of section.statements) {
            if (stmt.type === 'ComponentData') {
                const compStmt = stmt as ComponentDataNode;
                for (const comp of compStmt.components) {
                    this.addComponent(comp);
                }
            }
        }
    }

    /**
     * Process STREAM DATA section
     */
    private processStreamData(section: SectionNode): void {
        for (const stmt of section.statements) {
            if (stmt.type === 'StreamData') {
                const streamStmt = stmt as StreamDataNode;
                
                // Extract stream name from PROP DATA or COMP DATA
                if (streamStmt.streamName) {
                    this.addStream(
                        streamStmt.streamName.name,
                        streamStmt.startLine,
                        'definition'
                    );
                }
            }
        }
    }

    /**
     * Process UNIT OPERATIONS section
     */
    private processUnitOperations(section: SectionNode): void {
        for (const stmt of section.statements) {
            if (stmt.type === 'UnitOperation') {
                const unitStmt = stmt as UnitOperationNode;
                
                // Add unit definition
                if (unitStmt.uid) {
                    this.addUnit(
                        unitStmt.uid.name,
                        unitStmt.startLine,
                        unitStmt.statementType
                    );
                }
                
                // Add stream references (feeds)
                for (const feed of unitStmt.feedStreams) {
                    this.addStreamReference(
                        feed.streamName.name,
                        feed.startLine,
                        'feed'
                    );
                }
                
                // Add stream references (products)
                for (const prod of unitStmt.productStreams) {
                    this.addStreamReference(
                        prod.streamName.name,
                        prod.startLine,
                        'product'
                    );
                }
            }
        }
    }

    /**
     * Add a component to the symbol table
     */
    private addComponent(comp: ComponentNode): void {
        const name = comp.identifier.toUpperCase();
        
        if (!this.symbols.has(name)) {
            this.symbols.set(name, {
                name,
                kind: SymbolKind.COMPONENT,
                definedAt: { line: comp.startLine },
                references: [],
                metadata: {
                    libid: comp.libid?.value,
                    componentName: comp.identifier
                }
            });
        }
    }

    /**
     * Add a stream to the symbol table
     */
    private addStream(name: string, line: number, context: string): void {
        const upperName = name.toUpperCase();
        
        if (!this.symbols.has(upperName)) {
            this.symbols.set(upperName, {
                name: upperName,
                kind: SymbolKind.STREAM,
                definedAt: { line },
                references: [{ line, context }]
            });
        } else {
            const symbol = this.symbols.get(upperName)!;
            if (symbol.kind === SymbolKind.STREAM) {
                symbol.references.push({ line, context });
            }
        }
    }

    /**
     * Add a stream reference
     */
    private addStreamReference(name: string, line: number, context: string): void {
        const upperName = name.toUpperCase();
        
        if (!this.symbols.has(upperName)) {
            // Stream used but not defined (yet)
            this.symbols.set(upperName, {
                name: upperName,
                kind: SymbolKind.STREAM,
                definedAt: { line }, // First reference location
                references: [{ line, context }]
            });
        } else {
            const symbol = this.symbols.get(upperName)!;
            symbol.references.push({ line, context });
        }
    }

    /**
     * Add a unit to the symbol table
     */
    private addUnit(name: string, line: number, unitType: string): void {
        const upperName = name.toUpperCase();
        
        if (!this.symbols.has(upperName)) {
            this.symbols.set(upperName, {
                name: upperName,
                kind: SymbolKind.UNIT,
                definedAt: { line },
                references: [{ line, context: 'definition' }],
                metadata: { unitType }
            });
        }
    }

    /**
     * Get a symbol by name
     */
    public getSymbol(name: string): Symbol | undefined {
        return this.symbols.get(name.toUpperCase());
    }

    /**
     * Get all symbols of a specific kind
     */
    public getSymbolsByKind(kind: SymbolKind): Symbol[] {
        return Array.from(this.symbols.values()).filter(s => s.kind === kind);
    }

    /**
     * Get all symbols
     */
    public getAllSymbols(): Symbol[] {
        return Array.from(this.symbols.values());
    }

    /**
     * Check if a symbol is defined
     */
    public isDefined(name: string): boolean {
        return this.symbols.has(name.toUpperCase());
    }

    /**
     * Get symbols with references but no proper definition
     */
    public getUndefinedSymbols(): Symbol[] {
        return Array.from(this.symbols.values()).filter(symbol => {
            // Stream or unit used but never properly defined
            if (symbol.kind === SymbolKind.STREAM) {
                // Check if stream is defined in STREAM DATA
                const hasDefinition = symbol.references.some(ref => ref.context === 'definition');
                return !hasDefinition && symbol.references.length > 0;
            }
            return false;
        });
    }

    /**
     * Clear the symbol table
     */
    public clear(): void {
        this.symbols.clear();
    }

    /**
     * Get statistics
     */
    public getStats(): { streams: number; units: number; components: number } {
        return {
            streams: this.getSymbolsByKind(SymbolKind.STREAM).length,
            units: this.getSymbolsByKind(SymbolKind.UNIT).length,
            components: this.getSymbolsByKind(SymbolKind.COMPONENT).length
        };
    }
}
