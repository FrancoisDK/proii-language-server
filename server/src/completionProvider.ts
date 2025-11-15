/**
 * PRO/II Completion Provider
 * Generates completion items for keywords, unit operations, parameters, etc.
 */

import { CompletionItem, CompletionItemKind, InsertTextFormat } from 'vscode-languageserver/node';
import { KEYWORD_DOCS, KeywordDoc } from './keywordDocs';

/**
 * Get all completion items for keywords
 */
export function getKeywordCompletions(): CompletionItem[] {
    const items: CompletionItem[] = [];
    
    KEYWORD_DOCS.forEach((doc, keyword) => {
        const kind = getCompletionKind(doc.category);
        
        items.push({
            label: keyword,
            kind: kind,
            detail: `${doc.category} - ${doc.description.substring(0, 100)}...`,
            documentation: {
                kind: 'markdown',
                value: formatCompletionDoc(doc)
            },
            insertText: keyword,
            sortText: getSortText(doc.category, keyword)
        });
    });
    
    return items;
}

/**
 * Get completion items for unit operations with snippets
 */
export function getUnitOperationSnippets(): CompletionItem[] {
    return [
        {
            label: 'FLASH',
            kind: CompletionItemKind.Snippet,
            detail: 'Flash separator template',
            documentation: 'Two-phase vapor-liquid flash separator',
            insertText: 'FLASH UID=${1:F-101}\n\tFEED=${2:FEED1}\n\tPROD=V=${3:VAPOR}, L=${4:LIQUID}\n\tTEMP=${5:100}, PRES=${6:50}',
            insertTextFormat: InsertTextFormat.Snippet,
            sortText: '0_FLASH'
        },
        {
            label: 'COLUMN',
            kind: CompletionItemKind.Snippet,
            detail: 'Distillation column template',
            documentation: 'Multi-component distillation column',
            insertText: 'COLUMN UID=${1:C-101}\n\tNSTAGE=${2:20}\n\tFEED=${3:10}/${4:FEED1}\n\tPROD=D=${5:DISTILLATE}, B=${6:BOTTOMS}\n\tREFLUX=${7:2.5}',
            insertTextFormat: InsertTextFormat.Snippet,
            sortText: '0_COLUMN'
        },
        {
            label: 'HX',
            kind: CompletionItemKind.Snippet,
            detail: 'Heat exchanger template',
            documentation: 'Heat exchanger for heating or cooling',
            insertText: 'HX UID=${1:E-101}\n\tFEED=${2:HOT-IN}, ${3:COLD-IN}\n\tPROD=${4:HOT-OUT}, ${5:COLD-OUT}\n\tDUTY=${6:1.5E6}',
            insertTextFormat: InsertTextFormat.Snippet,
            sortText: '0_HX'
        },
        {
            label: 'COMPRESSOR',
            kind: CompletionItemKind.Snippet,
            detail: 'Compressor template',
            documentation: 'Gas compressor',
            insertText: 'COMPRESSOR UID=${1:K-101}\n\tFEED=${2:VAPOR-IN}\n\tPROD=${3:VAPOR-OUT}\n\tPRES=${4:250}\n\tEFF=${5:0.75}',
            insertTextFormat: InsertTextFormat.Snippet,
            sortText: '0_COMPRESSOR'
        },
        {
            label: 'PUMP',
            kind: CompletionItemKind.Snippet,
            detail: 'Pump template',
            documentation: 'Liquid pump',
            insertText: 'PUMP UID=${1:P-101}\n\tFEED=${2:LIQUID-IN}\n\tPROD=${3:LIQUID-OUT}\n\tPRES=${4:150}\n\tEFF=${5:0.70}',
            insertTextFormat: InsertTextFormat.Snippet,
            sortText: '0_PUMP'
        },
        {
            label: 'MIXER',
            kind: CompletionItemKind.Snippet,
            detail: 'Mixer template',
            documentation: 'Combines multiple streams',
            insertText: 'MIXER UID=${1:M-101}\n\tFEED=${2:STREAM1}, ${3:STREAM2}\n\tPROD=${4:MIXED}',
            insertTextFormat: InsertTextFormat.Snippet,
            sortText: '0_MIXER'
        },
        {
            label: 'SPLITTER',
            kind: CompletionItemKind.Snippet,
            detail: 'Splitter template',
            documentation: 'Divides one stream into multiple',
            insertText: 'SPLITTER UID=${1:S-101}\n\tFEED=${2:FEED1}\n\tPROD=${3:PROD1}, ${4:PROD2}\n\tFRAC=${5:0.6}, ${6:0.4}',
            insertTextFormat: InsertTextFormat.Snippet,
            sortText: '0_SPLITTER'
        },
        {
            label: 'VALVE',
            kind: CompletionItemKind.Snippet,
            detail: 'Valve template',
            documentation: 'Pressure reduction valve',
            insertText: 'VALVE UID=${1:V-101}\n\tFEED=${2:HIGH-P}\n\tPROD=${3:LOW-P}\n\tPRES=${4:25}',
            insertTextFormat: InsertTextFormat.Snippet,
            sortText: '0_VALVE'
        },
        {
            label: 'REACTOR',
            kind: CompletionItemKind.Snippet,
            detail: 'Reactor template',
            documentation: 'Chemical reactor',
            insertText: 'REACTOR UID=${1:R-101}\n\tTYPE=${2:CONVERSION}\n\tFEED=${3:REACTANTS}\n\tPROD=${4:PRODUCTS}\n\tTEMP=${5:350}, PRES=${6:100}',
            insertTextFormat: InsertTextFormat.Snippet,
            sortText: '0_REACTOR'
        }
    ];
}

/**
 * Get completion items for section headers
 */
export function getSectionCompletions(): CompletionItem[] {
    return [
        {
            label: 'COMPONENT DATA',
            kind: CompletionItemKind.Keyword,
            detail: 'Component definitions',
            documentation: 'Defines chemical components for the simulation',
            insertText: 'COMPONENT DATA\n\tLIBID ${1:1}, ${2:PROPANE} / ${3:2}, ${4:N-BUTANE}',
            insertTextFormat: InsertTextFormat.Snippet,
            sortText: 'A_COMPONENT'
        },
        {
            label: 'STREAM DATA',
            kind: CompletionItemKind.Keyword,
            detail: 'Stream specifications',
            documentation: 'Specifies properties and conditions for streams',
            insertText: 'STREAM DATA\n\tPROP DATA, STREAM=${1:FEED1}, TEMP=${2:25}, PRES=${3:100}, RATE=${4:1000}\n\tCOMP DATA, STREAM=${1:FEED1}, RATE(M)=${5:300},${6:400},${7:300}',
            insertTextFormat: InsertTextFormat.Snippet,
            sortText: 'A_STREAM'
        },
        {
            label: 'THERMODYNAMIC DATA',
            kind: CompletionItemKind.Keyword,
            detail: 'Thermodynamic method',
            documentation: 'Specifies thermodynamic calculation method',
            insertText: 'THERMODYNAMIC DATA\n\tMETHOD SYSTEM=${1:SRK}, SET=${2:SRK01}',
            insertTextFormat: InsertTextFormat.Snippet,
            sortText: 'A_THERMO'
        },
        {
            label: 'UNIT OPERATIONS',
            kind: CompletionItemKind.Keyword,
            detail: 'Unit operation definitions',
            documentation: 'Contains all unit operation specifications',
            insertText: 'UNIT OPERATIONS\n\t$0',
            insertTextFormat: InsertTextFormat.Snippet,
            sortText: 'A_UNIT'
        },
        {
            label: 'PRINT',
            kind: CompletionItemKind.Keyword,
            detail: 'Output control',
            documentation: 'Controls what results are printed',
            insertText: 'PRINT\n\tINPUT\n\tRESULT STREAM=ALL',
            insertTextFormat: InsertTextFormat.Snippet,
            sortText: 'A_PRINT'
        }
    ];
}

/**
 * Get completion items for common parameters
 */
export function getParameterCompletions(): CompletionItem[] {
    const parameters = [
        { name: 'UID', detail: 'Unit identifier', value: '${1:U-101}' },
        { name: 'NAME', detail: 'Descriptive name', value: '"${1:Unit Name}"' },
        { name: 'FEED', detail: 'Inlet stream(s)', value: '${1:STREAM1}' },
        { name: 'PROD', detail: 'Outlet stream(s)', value: '${1:STREAM1}' },
        { name: 'TEMP', detail: 'Temperature', value: '${1:100}' },
        { name: 'PRES', detail: 'Pressure', value: '${1:50}' },
        { name: 'RATE', detail: 'Flow rate', value: '${1:1000}' },
        { name: 'DUTY', detail: 'Heat duty', value: '${1:1.5E6}' },
        { name: 'EFF', detail: 'Efficiency', value: '${1:0.75}' },
        { name: 'FRAC', detail: 'Split fraction', value: '${1:0.5}' },
        { name: 'NSTAGE', detail: 'Number of stages', value: '${1:20}' },
        { name: 'REFLUX', detail: 'Reflux ratio', value: '${1:2.5}' },
        { name: 'VFRAC', detail: 'Vapor fraction', value: '${1:0.5}' }
    ];
    
    return parameters.map(p => ({
        label: p.name,
        kind: CompletionItemKind.Property,
        detail: p.detail,
        insertText: `${p.name}=${p.value}`,
        insertTextFormat: InsertTextFormat.Snippet,
        sortText: `B_${p.name}`
    }));
}

/**
 * Get completion items for thermodynamic methods
 */
export function getThermodynamicMethodCompletions(): CompletionItem[] {
    const methods = [
        { name: 'SRK', detail: 'Soave-Redlich-Kwong equation of state' },
        { name: 'PR', detail: 'Peng-Robinson equation of state' },
        { name: 'IDEAL', detail: 'Ideal gas law' },
        { name: 'NRTL', detail: 'Non-Random Two-Liquid activity coefficient' },
        { name: 'UNIQUAC', detail: 'Universal Quasi-Chemical activity coefficient' },
        { name: 'SRK-HP', detail: 'SRK for high pressure' },
        { name: 'SRK-LP', detail: 'SRK for low pressure' },
        { name: 'SOUR', detail: 'Sour water method' },
        { name: 'STEAM', detail: 'Steam tables' }
    ];
    
    return methods.map(m => ({
        label: m.name,
        kind: CompletionItemKind.Constant,
        detail: m.detail,
        insertText: m.name,
        sortText: `C_${m.name}`
    }));
}

/**
 * Get completion kind based on category
 */
function getCompletionKind(category: string): CompletionItemKind {
    switch (category) {
        case 'unit-operation': return CompletionItemKind.Class;
        case 'parameter': return CompletionItemKind.Property;
        case 'section': return CompletionItemKind.Keyword;
        case 'method': return CompletionItemKind.Constant;
        case 'property': return CompletionItemKind.Field;
        default: return CompletionItemKind.Text;
    }
}

/**
 * Get sort text based on category for better ordering
 */
function getSortText(category: string, keyword: string): string {
    const prefix = {
        'section': 'A_',
        'unit-operation': 'B_',
        'parameter': 'C_',
        'method': 'D_',
        'property': 'E_'
    }[category] || 'Z_';
    
    return prefix + keyword;
}

/**
 * Format documentation for completion items
 */
function formatCompletionDoc(doc: KeywordDoc): string {
    let markdown = `**${doc.keyword}** - *${doc.category}*\n\n`;
    markdown += `${doc.description}\n\n`;
    
    if (doc.syntax) {
        markdown += `**Syntax:**\n\`\`\`proii\n${doc.syntax}\n\`\`\``;
    }
    
    return markdown;
}

/**
 * Get context-aware completions based on current line
 */
export function getContextAwareCompletions(lineText: string, position: number): CompletionItem[] {
    const beforeCursor = lineText.substring(0, position).trim().toUpperCase();
    
    // After METHOD SYSTEM=
    if (beforeCursor.includes('METHOD') && beforeCursor.includes('SYSTEM=')) {
        return getThermodynamicMethodCompletions();
    }
    
    // After SET=
    if (beforeCursor.endsWith('SET=')) {
        return getThermodynamicMethodCompletions();
    }
    
    // After parameter=
    if (beforeCursor.match(/[A-Z]+\s*=\s*$/)) {
        // After FEED=, PROD=, etc. - could suggest stream names (future: from symbol table)
        return [];
    }
    
    // At start of line in UNIT OPERATIONS section
    if (beforeCursor === '' || beforeCursor.match(/^\s*$/)) {
        return getUnitOperationSnippets();
    }
    
    // Default: all completions
    return [];
}
