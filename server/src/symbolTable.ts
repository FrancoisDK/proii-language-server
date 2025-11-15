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
        // Stream properties
        temp?: number;
        pres?: number;
        rate?: number;
        rateUnit?: string;
        phase?: string; // 'vapor', 'liquid', 'mixed'
        description?: string; // From NAME statements
        // Component properties
        formula?: string;
        type?: string; // 'Hydrocarbon', 'Inorganic Gas', etc.
        molecularWeight?: string;
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
    public build(ast: ProgramNode, documentText?: string): void {
        this.symbols.clear();
        this.documentText = documentText || '';

        for (const section of ast.sections) {
            this.processSection(section);
        }
    }

    private documentText: string = '';

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
                    // Get the line text if available
                    const lineText = this.getLineText(streamStmt.startLine);
                    
                    this.addStream(
                        streamStmt.streamName.name,
                        streamStmt.startLine,
                        'definition',
                        lineText
                    );
                }
            }
        }
    }

    /**
     * Get line text by line number (1-based)
     */
    private getLineText(lineNumber: number): string {
        if (!this.documentText) return '';
        const lines = this.documentText.split(/\r?\n/);
        return lines[lineNumber - 1] || '';
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
            const details = this.getComponentDetails(name);
            this.symbols.set(name, {
                name,
                kind: SymbolKind.COMPONENT,
                definedAt: { line: comp.startLine },
                references: [],
                metadata: {
                    libid: comp.libid?.value,
                    componentName: comp.identifier,
                    ...details
                }
            });
        }
    }

    /**
     * Get detailed information about common components
     */
    private getComponentDetails(name: string): Record<string, any> {
        const components: { [key: string]: { type: string; formula: string; molecularWeight?: string } } = {
            'H2O': { type: 'Inorganic', formula: 'H₂O', molecularWeight: '18.02' },
            'H2': { type: 'Inorganic Gas', formula: 'H₂', molecularWeight: '2.02' },
            'N2': { type: 'Inorganic Gas', formula: 'N₂', molecularWeight: '28.01' },
            'O2': { type: 'Inorganic Gas', formula: 'O₂', molecularWeight: '32.00' },
            'CO2': { type: 'Inorganic Gas', formula: 'CO₂', molecularWeight: '44.01' },
            'CO': { type: 'Inorganic Gas', formula: 'CO', molecularWeight: '28.01' },
            'H2S': { type: 'Inorganic Gas', formula: 'H₂S', molecularWeight: '34.08' },
            'NH3': { type: 'Inorganic Gas', formula: 'NH₃', molecularWeight: '17.03' },
            'C1': { type: 'Hydrocarbon', formula: 'CH₄ (Methane)', molecularWeight: '16.04' },
            'CH4': { type: 'Hydrocarbon', formula: 'CH₄ (Methane)', molecularWeight: '16.04' },
            'C2': { type: 'Hydrocarbon', formula: 'C₂H₆ (Ethane)', molecularWeight: '30.07' },
            'C2H6': { type: 'Hydrocarbon', formula: 'C₂H₆ (Ethane)', molecularWeight: '30.07' },
            'ETHANE': { type: 'Hydrocarbon', formula: 'C₂H₆ (Ethane)', molecularWeight: '30.07' },
            'C3': { type: 'Hydrocarbon', formula: 'C₃H₈ (Propane)', molecularWeight: '44.10' },
            'C3H8': { type: 'Hydrocarbon', formula: 'C₃H₈ (Propane)', molecularWeight: '44.10' },
            'PROPANE': { type: 'Hydrocarbon', formula: 'C₃H₈ (Propane)', molecularWeight: '44.10' },
            'IC4': { type: 'Hydrocarbon', formula: 'C₄H₁₀ (i-Butane)', molecularWeight: '58.12' },
            'ISOBUTANE': { type: 'Hydrocarbon', formula: 'C₄H₁₀ (i-Butane)', molecularWeight: '58.12' },
            'NC4': { type: 'Hydrocarbon', formula: 'C₄H₁₀ (n-Butane)', molecularWeight: '58.12' },
            'N-BUTANE': { type: 'Hydrocarbon', formula: 'C₄H₁₀ (n-Butane)', molecularWeight: '58.12' },
            'IC5': { type: 'Hydrocarbon', formula: 'C₅H₁₂ (i-Pentane)', molecularWeight: '72.15' },
            'NC5': { type: 'Hydrocarbon', formula: 'C₅H₁₂ (n-Pentane)', molecularWeight: '72.15' },
            'NC6': { type: 'Hydrocarbon', formula: 'C₆H₁₄ (n-Hexane)', molecularWeight: '86.18' },
            'NC7': { type: 'Hydrocarbon', formula: 'C₇H₁₆ (n-Heptane)', molecularWeight: '100.20' },
            'NC8': { type: 'Hydrocarbon', formula: 'C₈H₁₈ (n-Octane)', molecularWeight: '114.23' },
            'NC9': { type: 'Hydrocarbon', formula: 'C₉H₂₀ (n-Nonane)', molecularWeight: '128.26' },
            'NC10': { type: 'Hydrocarbon', formula: 'C₁₀H₂₂ (n-Decane)', molecularWeight: '142.28' },
            'NC12': { type: 'Hydrocarbon', formula: 'C₁₂H₂₆ (n-Dodecane)', molecularWeight: '170.34' },
            'NC13': { type: 'Hydrocarbon', formula: 'C₁₃H₂₈ (n-Tridecane)', molecularWeight: '184.36' },
            'NC14': { type: 'Hydrocarbon', formula: 'C₁₄H₃₀ (n-Tetradecane)', molecularWeight: '198.39' },
            'NC15': { type: 'Hydrocarbon', formula: 'C₁₅H₃₂ (n-Pentadecane)', molecularWeight: '212.41' },
            'NC16': { type: 'Hydrocarbon', formula: 'C₁₆H₃₄ (n-Hexadecane)', molecularWeight: '226.44' },
            'BENZENE': { type: 'Aromatic', formula: 'C₆H₆', molecularWeight: '78.11' },
            'TOLUENE': { type: 'Aromatic', formula: 'C₇H₈', molecularWeight: '92.14' },
            'ETHYLBENZENE': { type: 'Aromatic', formula: 'C₈H₁₀', molecularWeight: '106.17' },
            'XYLENE': { type: 'Aromatic', formula: 'C₈H₁₀', molecularWeight: '106.17' },
        };

        return components[name] || {};
    }

    /**
     * Add a stream to the symbol table
     */
    private addStream(name: string, line: number, context: string, lineText?: string): void {
        const upperName = name.toUpperCase();
        
        if (!this.symbols.has(upperName)) {
            this.symbols.set(upperName, {
                name: upperName,
                kind: SymbolKind.STREAM,
                definedAt: { line },
                references: [{ line, context }],
                metadata: this.extractStreamProperties(lineText || '')
            });
        } else {
            const symbol = this.symbols.get(upperName)!;
            if (symbol.kind === SymbolKind.STREAM) {
                symbol.references.push({ line, context });
                // Merge properties if this is a definition
                if (context === 'definition' && lineText) {
                    const props = this.extractStreamProperties(lineText);
                    symbol.metadata = { ...symbol.metadata, ...props };
                }
            }
        }
    }

    /**
     * Extract stream properties from PROP statement
     */
    private extractStreamProperties(lineText: string): Record<string, any> {
        const props: Record<string, any> = {};

        // Extract TEMP=
        const tempMatch = lineText.match(/TEMP\s*=\s*([\d.]+)/i);
        if (tempMatch) {
            props.temp = parseFloat(tempMatch[1]);
        }

        // Extract PRES=
        const presMatch = lineText.match(/PRES(?:SURE)?\s*(?:\([^)]+\))?\s*=\s*([\d.]+)/i);
        if (presMatch) {
            props.pres = parseFloat(presMatch[1]);
        }

        // Extract RATE=
        const rateMatch = lineText.match(/RATE\s*(?:\(([^)]+)\))?\s*=\s*([\d.]+)/i);
        if (rateMatch) {
            props.rate = parseFloat(rateMatch[2]);
            if (rateMatch[1]) {
                props.rateUnit = rateMatch[1];
            }
        }

        return props;
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
