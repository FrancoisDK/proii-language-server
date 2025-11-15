/**
 * Tests for Completion Provider
 */

import {
    getKeywordCompletions,
    getUnitOperationSnippets,
    getSectionCompletions,
    getParameterCompletions,
    getThermodynamicMethodCompletions,
    getContextAwareCompletions
} from '../completionProvider';
import { CompletionItemKind } from 'vscode-languageserver/node';

describe('Completion Provider', () => {
    describe('getKeywordCompletions', () => {
        test('should return keyword completions', () => {
            const items = getKeywordCompletions();
            expect(items.length).toBeGreaterThan(0);
            
            // Check that FLASH is in the list
            const flash = items.find(item => item.label === 'FLASH');
            expect(flash).toBeDefined();
            expect(flash?.kind).toBe(CompletionItemKind.Class);
        });

        test('should include documentation', () => {
            const items = getKeywordCompletions();
            items.forEach(item => {
                expect(item.detail).toBeDefined();
                expect(item.documentation).toBeDefined();
            });
        });

        test('should have proper sort order', () => {
            const items = getKeywordCompletions();
            items.forEach(item => {
                expect(item.sortText).toBeDefined();
                expect(item.sortText).toMatch(/^[A-Z]_/);
            });
        });
    });

    describe('getUnitOperationSnippets', () => {
        test('should return unit operation snippets', () => {
            const items = getUnitOperationSnippets();
            expect(items.length).toBeGreaterThan(0);
            
            // Check common unit operations
            const labels = items.map(item => item.label);
            expect(labels).toContain('FLASH');
            expect(labels).toContain('COLUMN');
            expect(labels).toContain('HX');
            expect(labels).toContain('COMPRESSOR');
            expect(labels).toContain('PUMP');
        });

        test('should have snippet format', () => {
            const items = getUnitOperationSnippets();
            items.forEach(item => {
                expect(item.kind).toBe(CompletionItemKind.Snippet);
                expect(item.insertText).toContain('$');
                expect(item.insertTextFormat).toBe(2); // Snippet format
            });
        });

        test('FLASH snippet should have placeholders', () => {
            const items = getUnitOperationSnippets();
            const flash = items.find(item => item.label === 'FLASH');
            
            expect(flash?.insertText).toContain('${1:F-101}');
            expect(flash?.insertText).toContain('${2:FEED1}');
            expect(flash?.insertText).toContain('FEED=');
            expect(flash?.insertText).toContain('PROD=');
        });
    });

    describe('getSectionCompletions', () => {
        test('should return all section headers', () => {
            const items = getSectionCompletions();
            const labels = items.map(item => item.label);
            
            expect(labels).toContain('COMPONENT DATA');
            expect(labels).toContain('STREAM DATA');
            expect(labels).toContain('THERMODYNAMIC DATA');
            expect(labels).toContain('UNIT OPERATIONS');
            expect(labels).toContain('PRINT');
        });

        test('should have snippet format with content', () => {
            const items = getSectionCompletions();
            items.forEach(item => {
                expect(item.kind).toBe(CompletionItemKind.Keyword);
                expect(item.insertText).toBeTruthy();
            });
        });

        test('COMPONENT DATA should include LIBID template', () => {
            const items = getSectionCompletions();
            const compData = items.find(item => item.label === 'COMPONENT DATA');
            
            expect(compData?.insertText).toContain('LIBID');
        });
    });

    describe('getParameterCompletions', () => {
        test('should return common parameters', () => {
            const items = getParameterCompletions();
            const labels = items.map(item => item.label);
            
            expect(labels).toContain('UID');
            expect(labels).toContain('FEED');
            expect(labels).toContain('PROD');
            expect(labels).toContain('TEMP');
            expect(labels).toContain('PRES');
            expect(labels).toContain('RATE');
        });

        test('should include = in insert text', () => {
            const items = getParameterCompletions();
            items.forEach(item => {
                expect(item.insertText).toContain('=');
                expect(item.insertText).toMatch(/[A-Z]+=/);
            });
        });

        test('should have placeholders', () => {
            const items = getParameterCompletions();
            items.forEach(item => {
                expect(item.insertText).toContain('${');
            });
        });
    });

    describe('getThermodynamicMethodCompletions', () => {
        test('should return thermodynamic methods', () => {
            const items = getThermodynamicMethodCompletions();
            const labels = items.map(item => item.label);
            
            expect(labels).toContain('SRK');
            expect(labels).toContain('PR');
            expect(labels).toContain('IDEAL');
            expect(labels).toContain('NRTL');
            expect(labels).toContain('UNIQUAC');
        });

        test('should be marked as constants', () => {
            const items = getThermodynamicMethodCompletions();
            items.forEach(item => {
                expect(item.kind).toBe(CompletionItemKind.Constant);
            });
        });
    });

    describe('getContextAwareCompletions', () => {
        test('should return methods after METHOD SYSTEM=', () => {
            const items = getContextAwareCompletions('METHOD SYSTEM=', 14);
            expect(items.length).toBeGreaterThan(0);
            
            const labels = items.map(item => item.label);
            expect(labels).toContain('SRK');
            expect(labels).toContain('PR');
        });

        test('should return methods after SET=', () => {
            const items = getContextAwareCompletions('SET=', 4);
            expect(items.length).toBeGreaterThan(0);
            
            const labels = items.map(item => item.label);
            expect(labels).toContain('SRK');
        });

        test('should return unit ops at start of line', () => {
            const items = getContextAwareCompletions('', 0);
            expect(items.length).toBeGreaterThan(0);
            
            const labels = items.map(item => item.label);
            expect(labels).toContain('FLASH');
            expect(labels).toContain('COLUMN');
        });

        test('should return empty array for stream references (future)', () => {
            const items = getContextAwareCompletions('FEED=', 5);
            expect(items).toEqual([]);
        });
    });

    describe('Integration', () => {
        test('should not have duplicate labels', () => {
            const allKeywords = getKeywordCompletions();
            const labels = allKeywords.map(item => item.label);
            const uniqueLabels = new Set(labels);
            
            expect(uniqueLabels.size).toBe(labels.length);
        });

        test('should have consistent kind for same category', () => {
            const items = getKeywordCompletions();
            const flashItems = items.filter(item => 
                ['FLASH', 'COLUMN', 'HX'].includes(item.label)
            );
            
            // All unit operations should have same kind
            const kinds = new Set(flashItems.map(item => item.kind));
            expect(kinds.size).toBe(1);
        });
    });
});
