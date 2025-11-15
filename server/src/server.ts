/**
 * PRO/II Language Server - Server Implementation
 * Main entry point for the LSP server
 */

import {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    InitializeParams,
    TextDocumentSyncKind,
    InitializeResult,
    Diagnostic,
    DiagnosticSeverity,
    Hover,
    MarkupContent
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { Lexer } from './lexer';
import { Parser } from './parser';
import { ProgramNode } from './ast';
import { getKeywordDoc, formatHoverDoc } from './keywordDocs';

// Create LSP connection
const connection = createConnection(ProposedFeatures.all);

// Document manager
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

// Store parsed ASTs for each document
const documentASTs: Map<string, ProgramNode> = new Map();

// Initialize server
connection.onInitialize((params: InitializeParams): InitializeResult => {
    connection.console.log('PRO/II Language Server initializing...');
    
    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            
            // Features we'll implement
            hoverProvider: true,
            completionProvider: {
                resolveProvider: true,
                triggerCharacters: ['=', ',', ' ']
            },
            definitionProvider: false,
            referencesProvider: false,
            documentSymbolProvider: false,
            workspaceSymbolProvider: false,
            codeActionProvider: false,
            renameProvider: false,
            documentFormattingProvider: false
        }
    };
});

connection.onInitialized(() => {
    connection.console.log('✅ PRO/II Language Server initialized!');
});

/**
 * Parse a document and store the AST
 */
function parseDocument(document: TextDocument): ProgramNode | null {
    try {
        const text = document.getText();
        const lexer = new Lexer(text);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        
        documentASTs.set(document.uri, ast);
        connection.console.log(`✅ Parsed ${document.uri}: ${ast.sections.length} sections`);
        
        return ast;
    } catch (error) {
        connection.console.error(`❌ Parse error in ${document.uri}: ${error}`);
        return null;
    }
}

/**
 * Validate document and send diagnostics
 */
function validateDocument(document: TextDocument): void {
    const diagnostics: Diagnostic[] = [];
    
    try {
        const text = document.getText();
        const lexer = new Lexer(text);
        const tokens = lexer.tokenize();
        
        // Check for unknown tokens
        tokens.forEach(token => {
            if (token.type === 'UNKNOWN') {
                diagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    range: {
                        start: { line: token.line - 1, character: token.column - 1 },
                        end: { line: token.line - 1, character: token.column + token.length - 1 }
                    },
                    message: `Unknown token: ${token.value}`,
                    source: 'proii-lsp'
                });
            }
        });
        
        // Try parsing
        const parser = new Parser(tokens);
        const ast = parser.parse();
        documentASTs.set(document.uri, ast);
        
    } catch (error) {
        // Add parse error diagnostic
        diagnostics.push({
            severity: DiagnosticSeverity.Error,
            range: {
                start: { line: 0, character: 0 },
                end: { line: 0, character: 10 }
            },
            message: `Parse error: ${error}`,
            source: 'proii-lsp'
        });
    }
    
    connection.sendDiagnostics({ uri: document.uri, diagnostics });
}

// Document events
documents.onDidOpen((event) => {
    connection.console.log(`📄 Document opened: ${event.document.uri}`);
    parseDocument(event.document);
    validateDocument(event.document);
});

documents.onDidChangeContent((change) => {
    connection.console.log(`✏️ Document changed: ${change.document.uri}`);
    parseDocument(change.document);
    validateDocument(change.document);
});

documents.onDidClose((event) => {
    connection.console.log(`📪 Document closed: ${event.document.uri}`);
    documentASTs.delete(event.document.uri);
    connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
});

// Hover provider
connection.onHover((params): Hover | null => {
    const document = documents.get(params.textDocument.uri);
    if (!document) return null;
    
    const ast = documentASTs.get(params.textDocument.uri);
    if (!ast) return null;
    
    const line = params.position.line + 1; // AST uses 1-based lines
    
    // Find what's at the cursor position
    const text = document.getText();
    const lines = text.split('\n');
    const currentLine = lines[params.position.line];
    const char = params.position.character;
    
    // Get word at position
    let start = char;
    let end = char;
    while (start > 0 && /[A-Za-z0-9_-]/.test(currentLine[start - 1])) start--;
    while (end < currentLine.length && /[A-Za-z0-9_-]/.test(currentLine[end])) end++;
    const word = currentLine.substring(start, end);
    
    if (!word) return null;
    
    connection.console.log(`🔍 Hover on word: "${word}" at line ${line}`);
    
    // Check if it's a multi-word keyword (e.g., "COMPONENT DATA")
    let keyword = word.toUpperCase();
    let keywordDoc = getKeywordDoc(keyword);
    
    // Try to match multi-word keywords
    if (!keywordDoc) {
        const restOfLine = currentLine.substring(start).toUpperCase();
        
        // Check for common multi-word patterns
        const multiWordPatterns = [
            'COMPONENT DATA',
            'STREAM DATA',
            'THERMODYNAMIC DATA',
            'UNIT OPERATIONS',
            'PROP DATA',
            'COMP DATA'
        ];
        
        for (const pattern of multiWordPatterns) {
            if (restOfLine.startsWith(pattern)) {
                keyword = pattern;
                keywordDoc = getKeywordDoc(pattern);
                if (keywordDoc) break;
            }
        }
    }
    
    // If we found documentation, return formatted hover
    if (keywordDoc) {
        return {
            contents: {
                kind: 'markdown',
                value: formatHoverDoc(keywordDoc)
            }
        };
    }
    
    // Fallback: show the word without documentation
    return {
        contents: {
            kind: 'markdown',
            value: `**${word}**\n\n*No documentation available*`
        }
    };
});

// Completion provider (placeholder)
connection.onCompletion((params) => {
    connection.console.log(`Completion requested at ${params.position.line}:${params.position.character}`);
    
    // TODO: Implement context-aware completion
    return [];
});

// Stub handlers to prevent "Unhandled method" errors
connection.onCodeAction(() => {
    // Return empty array instead of throwing error
    return [];
});

connection.onDocumentSymbol(() => {
    // Return empty array instead of throwing error
    return [];
});

// Make the document manager listen on the connection
documents.listen(connection);

// Start listening for messages
connection.listen();

connection.console.log('🎧 PRO/II Language Server listening...');
