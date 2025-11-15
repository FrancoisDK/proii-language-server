/**
 * Tests for Keyword Documentation
 */

import { getKeywordDoc, formatHoverDoc, getAllKeywords, searchKeywords } from '../keywordDocs';

describe('Keyword Documentation', () => {
    describe('getKeywordDoc', () => {
        test('should retrieve FLASH documentation', () => {
            const doc = getKeywordDoc('FLASH');
            expect(doc).toBeDefined();
            expect(doc?.keyword).toBe('FLASH');
            expect(doc?.category).toBe('unit-operation');
            expect(doc?.description).toContain('flash');
        });

        test('should retrieve COLUMN documentation', () => {
            const doc = getKeywordDoc('COLUMN');
            expect(doc).toBeDefined();
            expect(doc?.keyword).toBe('COLUMN');
            expect(doc?.category).toBe('unit-operation');
        });

        test('should retrieve section headers', () => {
            const doc = getKeywordDoc('COMPONENT DATA');
            expect(doc).toBeDefined();
            expect(doc?.category).toBe('section');
        });

        test('should retrieve parameters', () => {
            const doc = getKeywordDoc('UID');
            expect(doc).toBeDefined();
            expect(doc?.category).toBe('parameter');
        });

        test('should retrieve thermodynamic methods', () => {
            const doc = getKeywordDoc('SRK');
            expect(doc).toBeDefined();
            expect(doc?.category).toBe('method');
        });

        test('should be case insensitive', () => {
            const upper = getKeywordDoc('FLASH');
            const lower = getKeywordDoc('flash');
            const mixed = getKeywordDoc('Flash');
            
            expect(upper).toEqual(lower);
            expect(upper).toEqual(mixed);
        });

        test('should return undefined for unknown keywords', () => {
            const doc = getKeywordDoc('NONEXISTENT');
            expect(doc).toBeUndefined();
        });
    });

    describe('formatHoverDoc', () => {
        test('should format FLASH documentation', () => {
            const doc = getKeywordDoc('FLASH');
            expect(doc).toBeDefined();
            
            const formatted = formatHoverDoc(doc!);
            expect(formatted).toContain('### FLASH');
            expect(formatted).toContain('⚙️');
            expect(formatted).toContain('unit-operation');
            expect(formatted).toContain('flash');
            expect(formatted).toContain('**Syntax:**');
            expect(formatted).toContain('**Example:**');
            expect(formatted).toContain('PRO/II LSP');
        });

        test('should include parameters if available', () => {
            const doc = getKeywordDoc('FLASH');
            const formatted = formatHoverDoc(doc!);
            
            expect(formatted).toContain('**Common Parameters:**');
            expect(formatted).toContain('UID');
            expect(formatted).toContain('FEED');
            expect(formatted).toContain('PROD');
        });

        test('should format section documentation', () => {
            const doc = getKeywordDoc('COMPONENT DATA');
            const formatted = formatHoverDoc(doc!);
            
            expect(formatted).toContain('### COMPONENT DATA');
            expect(formatted).toContain('📋');
            expect(formatted).toContain('section');
        });

        test('should format parameter documentation', () => {
            const doc = getKeywordDoc('UID');
            const formatted = formatHoverDoc(doc!);
            
            expect(formatted).toContain('### UID');
            expect(formatted).toContain('🔧');
            expect(formatted).toContain('parameter');
        });
    });

    describe('getAllKeywords', () => {
        test('should return all keywords', () => {
            const keywords = getAllKeywords();
            expect(keywords.length).toBeGreaterThan(0);
            expect(keywords).toContain('FLASH');
            expect(keywords).toContain('COLUMN');
            expect(keywords).toContain('COMPONENT DATA');
        });

        test('should return keywords in uppercase', () => {
            const keywords = getAllKeywords();
            keywords.forEach(keyword => {
                expect(keyword).toBe(keyword.toUpperCase());
            });
        });
    });

    describe('searchKeywords', () => {
        test('should find keywords by prefix', () => {
            const results = searchKeywords('FL');
            const keywords = results.map(doc => doc.keyword);
            
            expect(keywords).toContain('FLASH');
        });

        test('should find all COMP* keywords', () => {
            const results = searchKeywords('COMP');
            const keywords = results.map(doc => doc.keyword);
            
            expect(keywords).toContain('COMPRESSOR');
            expect(keywords).toContain('COMPONENT DATA');
            expect(keywords).toContain('COMP');
        });

        test('should be case insensitive', () => {
            const upper = searchKeywords('FL');
            const lower = searchKeywords('fl');
            
            expect(upper).toEqual(lower);
        });

        test('should return empty array for no matches', () => {
            const results = searchKeywords('ZZZZZ');
            expect(results).toEqual([]);
        });

        test('should return all keywords for empty prefix', () => {
            const results = searchKeywords('');
            expect(results.length).toBeGreaterThan(0);
        });
    });

    describe('Coverage of unit operations', () => {
        test('should have documentation for common unit operations', () => {
            const ops = ['FLASH', 'COLUMN', 'HX', 'HCURVE', 'COMPRESSOR', 'PUMP', 
                         'MIXER', 'SPLITTER', 'VALVE', 'REACTOR'];
            
            ops.forEach(op => {
                const doc = getKeywordDoc(op);
                expect(doc).toBeDefined();
                expect(doc?.category).toBe('unit-operation');
            });
        });
    });

    describe('Coverage of sections', () => {
        test('should have documentation for all main sections', () => {
            const sections = ['COMPONENT DATA', 'STREAM DATA', 'THERMODYNAMIC DATA', 
                            'UNIT OPERATIONS', 'PRINT'];
            
            sections.forEach(section => {
                const doc = getKeywordDoc(section);
                expect(doc).toBeDefined();
                expect(doc?.category).toBe('section');
            });
        });
    });

    describe('Coverage of parameters', () => {
        test('should have documentation for common parameters', () => {
            const params = ['UID', 'FEED', 'PROD', 'TEMP', 'PRES', 'RATE', 'DUTY'];
            
            params.forEach(param => {
                const doc = getKeywordDoc(param);
                expect(doc).toBeDefined();
                expect(doc?.category).toBe('parameter');
            });
        });
    });
});
