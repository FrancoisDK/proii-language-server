/**
 * PRO/II Language Server - Client Extension
 * Thin client that connects to the language server
 */

import * as path from 'path';
import { workspace, ExtensionContext } from 'vscode';
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
    console.log('🚀 PRO/II Language Server v2.0 activating...');

    // Server module path
    const serverModule = context.asAbsolutePath(
        path.join('server', 'out', 'server.js')
    );

    // Server options
    const serverOptions: ServerOptions = {
        run: { 
            module: serverModule, 
            transport: TransportKind.ipc 
        },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: { execArgv: ['--nolazy', '--inspect=6009'] }
        }
    };

    // Client options
    const clientOptions: LanguageClientOptions = {
        // Register the server for PRO/II documents
        documentSelector: [
            { scheme: 'file', language: 'proii' },
            { scheme: 'untitled', language: 'proii' }
        ],
        synchronize: {
            // Notify server when .proii config files change
            fileEvents: workspace.createFileSystemWatcher('**/.proii')
        }
    };

    // Create and start the language client
    client = new LanguageClient(
        'proiiLanguageServer',
        'PRO/II Language Server',
        serverOptions,
        clientOptions
    );

    // Start the client (and server)
    client.start();
    
    console.log('✅ PRO/II Language Server v2.0 activated!');
}

export function deactivate(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }
    console.log('👋 PRO/II Language Server deactivating...');
    return client.stop();
}
