# PRO/II Language Server (v2.0)

**Status**: 🚧 Alpha Development - Not Ready for Production

> **⚠️ This is v2.0 with Language Server Protocol (LSP) implementation**
> 
> Looking for the stable version? Use [proii-language-support v1.x](https://github.com/FrancoisDK/proii-vscode-extension)

---

## Overview

Complete rewrite of the PRO/II extension using the Language Server Protocol. This brings professional IDE features to PRO/II process simulation files.

### Architecture

```
proii-language-server/
├── client/          # VS Code extension (thin client)
├── server/          # Language server (LSP implementation)
└── shared/          # Shared types and utilities
```

### What's New in v2.0

#### ✅ All v1.x Features Migrated
- Syntax highlighting
- Hover tooltips
- Stream name highlighting
- Component lookup
- 80-column limiter
- Code snippets

#### 🆕 New LSP Features
- **Intelligent Auto-completion**: Context-aware suggestions
- **Go-to-Definition**: Navigate to stream/unit definitions
- **Find All References**: See all uses of streams/units
- **Real-time Validation**: Catch errors as you type
- **Rename Refactoring**: Safe symbol renaming
- **Document Symbols**: Structured outline view
- **Quick Fixes**: Automatic error corrections
- **Multi-file Support**: Workspace-wide analysis

---

## Development Roadmap

### Phase 1: Parser Foundation (Month 1) 🚧 IN PROGRESS
- [ ] Lexer implementation
- [ ] Parser (AST generation)
- [ ] AST type definitions
- [ ] Unit tests (50+)

### Phase 2: Core LSP (Month 2)
- [ ] Server infrastructure
- [ ] Document synchronization
- [ ] Symbol table management
- [ ] Basic diagnostics

### Phase 3: Hover & Completion (Month 3)
- [ ] Enhanced hover provider
- [ ] Context-aware completion
- [ ] Migrate v1.x data

### Phase 4: Navigation (Month 4)
- [ ] Go-to-definition
- [ ] Find references
- [ ] Document symbols

### Phase 5: Validation (Month 5)
- [ ] Semantic validation
- [ ] Type checking
- [ ] Quick fixes

### Phase 6: Polish & Release (Month 6)
- [ ] Performance optimization
- [ ] Full test coverage
- [ ] Documentation
- [ ] v2.0.0 release

---

## Development Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- VS Code >= 1.105.0

### Installation

```bash
# Clone repository
git clone https://github.com/FrancoisDK/proii-language-server.git
cd proii-language-server

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Open in VS Code
code .
```

### Running the Extension

1. Press `F5` to open Extension Development Host
2. Open a `.inp` file
3. Test LSP features

### Testing

```bash
# Run all tests
npm test

# Run specific workspace tests
npm run test:server
```

---

## Architecture

### Client (VS Code Extension)
- Lightweight wrapper
- Manages extension lifecycle
- Communicates with server via LSP

### Server (Language Server)
- Heavy lifting (parsing, analysis)
- Independent of VS Code
- Reusable in other editors (Vim, Emacs, etc.)

### Shared
- Common types (AST nodes, symbols)
- Utility functions
- PRO/II specifications

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Parsing (5000 lines) | < 100ms |
| Full validation | < 200ms |
| Completion response | < 50ms |
| Memory usage | < 100MB |

---

## Contributing

This is in early alpha. Contributions welcome but expect breaking changes.

### Development Focus
1. **Parser robustness**: Handle all PRO/II syntax
2. **Performance**: Fast for large files
3. **Test coverage**: 95%+ target
4. **Documentation**: Clear architecture docs

---

## Migration from v1.x

**Not yet available** - v2.0 is in alpha development.

Once stable (Q2 2026), migration guide will be provided.

---

## License

MIT License - See LICENSE file

---

## Links

- **v1.x (Stable)**: https://github.com/FrancoisDK/proii-vscode-extension
- **Marketplace**: https://marketplace.visualstudio.com/items?itemName=francois-de-klerk.proii-language-support
- **Issues**: https://github.com/FrancoisDK/proii-language-server/issues

---

**Status**: Alpha - Development started November 15, 2025
