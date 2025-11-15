/**
 * Token Types for PRO/II Language
 * Defines all possible token types the lexer can produce
 */

export enum TokenType {
    // Literals
    NUMBER = 'NUMBER',                    // 100, 3.14, 1.5E-3
    IDENTIFIER = 'IDENTIFIER',            // Stream names, UIDs, variable names
    STRING = 'STRING',                    // "quoted string"
    
    // Keywords - Section Headers
    COMPONENT_DATA = 'COMPONENT_DATA',
    STREAM_DATA = 'STREAM_DATA',
    THERMODYNAMIC_DATA = 'THERMODYNAMIC_DATA',
    UNIT_OPERATIONS = 'UNIT_OPERATIONS',
    
    // Keywords - Unit Operations
    FLASH = 'FLASH',
    COLUMN = 'COLUMN',
    HCURVE = 'HCURVE',
    HX = 'HX',
    COMPRESSOR = 'COMPRESSOR',
    PUMP = 'PUMP',
    MIXER = 'MIXER',
    SPLITTER = 'SPLITTER',
    VALVE = 'VALVE',
    REACTOR = 'REACTOR',
    CALCULATOR = 'CALCULATOR',
    STCALC = 'STCALC',
    
    // Keywords - Common Parameters
    UID = 'UID',
    NAME = 'NAME',
    FEED = 'FEED',
    PROD = 'PROD',
    PRODUCT = 'PRODUCT',
    TEMP = 'TEMP',
    TEMPERATURE = 'TEMPERATURE',
    PRES = 'PRES',
    PRESSURE = 'PRESSURE',
    RATE = 'RATE',
    COMP = 'COMP',
    LIBID = 'LIBID',
    BANK = 'BANK',
    METHOD = 'METHOD',
    SET = 'SET',
    SPEC = 'SPEC',
    VARY = 'VARY',
    DEFINE = 'DEFINE',
    
    // Keywords - Thermodynamic Methods
    SRK = 'SRK',
    PR = 'PR',
    NRTL = 'NRTL',
    
    // Operators
    EQUALS = 'EQUALS',                    // =
    COMMA = 'COMMA',                      // ,
    SLASH = 'SLASH',                      // /
    PLUS = 'PLUS',                        // +
    MINUS = 'MINUS',                      // -
    TIMES = 'TIMES',                      // *
    DIVIDE = 'DIVIDE',                    // /
    LPAREN = 'LPAREN',                    // (
    RPAREN = 'RPAREN',                    // )
    
    // Special Characters
    COMMENT = 'COMMENT',                  // $ comment text
    CONTINUATION = 'CONTINUATION',        // &
    NEWLINE = 'NEWLINE',                  // \n
    
    // Meta
    EOF = 'EOF',                          // End of file
    UNKNOWN = 'UNKNOWN'                   // Unknown token
}

/**
 * Token with position information
 */
export interface Token {
    type: TokenType;
    value: string;
    line: number;
    column: number;
    length: number;
}

/**
 * Keyword mapping for quick lookup
 */
export const KEYWORDS: Map<string, TokenType> = new Map([
    // Section headers
    ['COMPONENT', TokenType.COMPONENT_DATA],
    ['STREAM', TokenType.STREAM_DATA],
    ['THERMODYNAMIC', TokenType.THERMODYNAMIC_DATA],
    ['UNIT', TokenType.UNIT_OPERATIONS],
    
    // Unit operations
    ['FLASH', TokenType.FLASH],
    ['COLUMN', TokenType.COLUMN],
    ['HCURVE', TokenType.HCURVE],
    ['HX', TokenType.HX],
    ['COMPRESSOR', TokenType.COMPRESSOR],
    ['PUMP', TokenType.PUMP],
    ['MIXER', TokenType.MIXER],
    ['SPLITTER', TokenType.SPLITTER],
    ['VALVE', TokenType.VALVE],
    ['REACTOR', TokenType.REACTOR],
    ['CALCULATOR', TokenType.CALCULATOR],
    ['STCALC', TokenType.STCALC],
    
    // Parameters
    ['UID', TokenType.UID],
    ['NAME', TokenType.NAME],
    ['FEED', TokenType.FEED],
    ['PROD', TokenType.PROD],
    ['PRODUCT', TokenType.PRODUCT],
    ['TEMP', TokenType.TEMP],
    ['TEMPERATURE', TokenType.TEMPERATURE],
    ['PRES', TokenType.PRES],
    ['PRESSURE', TokenType.PRESSURE],
    ['RATE', TokenType.RATE],
    ['COMP', TokenType.COMP],
    ['LIBID', TokenType.LIBID],
    ['BANK', TokenType.BANK],
    ['METHOD', TokenType.METHOD],
    ['SET', TokenType.SET],
    ['SPEC', TokenType.SPEC],
    ['VARY', TokenType.VARY],
    ['DEFINE', TokenType.DEFINE],
    
    // Thermodynamic methods
    ['SRK', TokenType.SRK],
    ['PR', TokenType.PR],
    ['NRTL', TokenType.NRTL],
]);
