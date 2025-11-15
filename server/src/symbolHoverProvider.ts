/**
 * Enhanced Hover Provider for PRO/II Language Server
 * Provides hover information for streams and components
 */

import { Hover, MarkupContent, MarkupKind } from 'vscode-languageserver/node';
import { SymbolTable, SymbolKind } from './symbolTable';

/**
 * Create hover content for stream symbols
 */
export function createStreamHover(symbolTable: SymbolTable, streamName: string): Hover | null {
    const symbol = symbolTable.getSymbol(streamName);
    
    if (!symbol || symbol.kind !== SymbolKind.STREAM) {
        return null;
    }

    const markdown: string[] = [];
    
    // Title with stream icon
    markdown.push(`### 🌊 Stream: ${symbol.name}\n`);
    
    // Description (from NAME statements)
    if (symbol.metadata?.description) {
        markdown.push(`**${symbol.metadata.description}**\n`);
    }
    
    // Properties table
    const hasProps = symbol.metadata?.temp || symbol.metadata?.pres || symbol.metadata?.rate;
    if (hasProps && symbol.metadata) {
        markdown.push(`| Property | Value |`);
        markdown.push(`|----------|-------|`);
        
        if (symbol.metadata.temp !== undefined) {
            markdown.push(`| **Temperature** | ${symbol.metadata.temp} °C |`);
        }
        
        if (symbol.metadata.pres !== undefined) {
            markdown.push(`| **Pressure** | ${symbol.metadata.pres} bar |`);
        }
        
        if (symbol.metadata.rate !== undefined) {
            const unit = symbol.metadata.rateUnit || 'kg/hr';
            markdown.push(`| **Rate** | ${symbol.metadata.rate} ${unit} |`);
        }
        
        if (symbol.metadata.phase) {
            markdown.push(`| **Phase** | ${symbol.metadata.phase} |`);
        }
        
        markdown.push('');
    }
    
    // Usage information
    const feedRefs = symbol.references.filter(r => r.context === 'feed').length;
    const prodRefs = symbol.references.filter(r => r.context === 'product').length;
    
    if (feedRefs > 0 || prodRefs > 0) {
        markdown.push(`**Usage:**`);
        if (feedRefs > 0) {
            markdown.push(`- Used as feed ${feedRefs} time(s)`);
        }
        if (prodRefs > 0) {
            markdown.push(`- Used as product ${prodRefs} time(s)`);
        }
        markdown.push('');
    }
    
    markdown.push(`💡 *Defined at line ${symbol.definedAt.line}*`);

    const content: MarkupContent = {
        kind: MarkupKind.Markdown,
        value: markdown.join('\n')
    };

    return {
        contents: content
    };
}

/**
 * Create hover content for component symbols
 */
export function createComponentHover(symbolTable: SymbolTable, componentName: string): Hover | null {
    const symbol = symbolTable.getSymbol(componentName);
    
    if (!symbol || symbol.kind !== SymbolKind.COMPONENT) {
        return null;
    }

    const markdown: string[] = [];
    
    // Title with component icon
    markdown.push(`### 🧪 Component: ${symbol.name}\n`);
    
    // Properties table
    markdown.push(`| Property | Value |`);
    markdown.push(`|----------|-------|`);
    markdown.push(`| **Index** | ${symbol.metadata?.libid || 'N/A'} |`);
    markdown.push(`| **Name** | ${symbol.metadata?.componentName || symbol.name} |`);
    
    if (symbol.metadata?.type) {
        markdown.push(`| **Type** | ${symbol.metadata.type} |`);
    }
    
    if (symbol.metadata?.formula) {
        markdown.push(`| **Formula** | ${symbol.metadata.formula} |`);
    }
    
    if (symbol.metadata?.molecularWeight) {
        markdown.push(`| **Molecular Weight** | ${symbol.metadata.molecularWeight} g/mol |`);
    }
    
    markdown.push('');
    markdown.push(`💡 *Hover over any component name to see its properties*`);

    const content: MarkupContent = {
        kind: MarkupKind.Markdown,
        value: markdown.join('\n')
    };

    return {
        contents: content
    };
}

/**
 * Create hover content for unit operation symbols
 */
export function createUnitOperationHover(symbolTable: SymbolTable, unitName: string): Hover | null {
    const symbol = symbolTable.getSymbol(unitName);
    
    if (!symbol || symbol.kind !== SymbolKind.UNIT) {
        return null;
    }

    const markdown: string[] = [];
    
    // Title with unit icon
    markdown.push(`### ⚙️ Unit Operation: ${symbol.name}\n`);
    
    if (symbol.metadata?.unitType) {
        markdown.push(`**Type**: ${symbol.metadata.unitType}\n`);
    }
    
    markdown.push(`💡 *Defined at line ${symbol.definedAt.line}*`);

    const content: MarkupContent = {
        kind: MarkupKind.Markdown,
        value: markdown.join('\n')
    };

    return {
        contents: content
    };
}

/**
 * Main hover provider that delegates to specific handlers
 */
export function provideHover(symbolTable: SymbolTable, word: string): Hover | null {
    const upperWord = word.toUpperCase();
    const symbol = symbolTable.getSymbol(upperWord);
    
    if (!symbol) {
        return null;
    }
    
    switch (symbol.kind) {
        case SymbolKind.STREAM:
            return createStreamHover(symbolTable, upperWord);
        case SymbolKind.COMPONENT:
            return createComponentHover(symbolTable, upperWord);
        case SymbolKind.UNIT:
            return createUnitOperationHover(symbolTable, upperWord);
        default:
            return null;
    }
}
