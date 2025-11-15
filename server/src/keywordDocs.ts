/**
 * PRO/II Keyword Documentation
 * Comprehensive documentation for hover tooltips
 */

export interface KeywordDoc {
    keyword: string;
    category: 'unit-operation' | 'parameter' | 'section' | 'method' | 'property';
    description: string;
    parameters?: string[];
    example?: string;
    syntax?: string;
}

export const KEYWORD_DOCS: Map<string, KeywordDoc> = new Map([
    // ============================================================================
    // UNIT OPERATIONS
    // ============================================================================
    ['FLASH', {
        keyword: 'FLASH',
        category: 'unit-operation',
        description: 'Two-phase vapor-liquid flash separator. Performs flash calculations at specified temperature and pressure to separate feed into vapor and liquid products.',
        parameters: ['UID', 'NAME', 'FEED', 'PROD', 'TEMP', 'PRES', 'DUTY', 'VFRAC'],
        syntax: 'FLASH UID=name\n  FEED=stream\n  PROD=V=vapor, L=liquid\n  TEMP=value, PRES=value',
        example: 'FLASH UID=F101\n  FEED=FEED1\n  PROD=V=VAPOR, L=LIQUID\n  TEMP=100, PRES=50'
    }],
    
    ['COLUMN', {
        keyword: 'COLUMN',
        category: 'unit-operation',
        description: 'Distillation column for multi-component separation. Supports various column types including rigorous tray-by-tray, shortcut, and petroleum fractionation.',
        parameters: ['UID', 'NAME', 'FEED', 'PROD', 'NSTAGE', 'CONDENSER', 'REBOILER', 'REFLUX'],
        syntax: 'COLUMN UID=name\n  NSTAGE=n\n  FEED=stage/stream\n  PROD=D=distillate, B=bottoms',
        example: 'COLUMN UID=C101\n  NSTAGE=20\n  FEED=10/FEED1\n  PROD=D=OVHD, B=BTMS\n  REFLUX=2.5'
    }],
    
    ['HX', {
        keyword: 'HX',
        category: 'unit-operation',
        description: 'Heat exchanger for heating or cooling process streams. Can operate in rating or design mode with various configurations.',
        parameters: ['UID', 'NAME', 'FEED', 'PROD', 'DUTY', 'TEMP', 'PRES', 'DELTA-T', 'AREA', 'U'],
        syntax: 'HX UID=name\n  FEED=hot_in, cold_in\n  PROD=hot_out, cold_out\n  DUTY=value or TEMP=value',
        example: 'HX UID=E101\n  FEED=HOT-IN, COLD-IN\n  PROD=HOT-OUT, COLD-OUT\n  DUTY=1.5E6'
    }],
    
    ['HCURVE', {
        keyword: 'HCURVE',
        category: 'unit-operation',
        description: 'Heating or cooling curve operation. Models gradual temperature change along a vessel or process path.',
        parameters: ['UID', 'NAME', 'FEED', 'PROD', 'DUTY', 'PROFILE'],
        syntax: 'HCURVE UID=name\n  FEED=stream\n  PROD=stream\n  DUTY=value',
        example: 'HCURVE UID=H101\n  FEED=FEED1\n  PROD=PROD1\n  DUTY=5E5'
    }],
    
    ['COMPRESSOR', {
        keyword: 'COMPRESSOR',
        category: 'unit-operation',
        description: 'Gas compressor for increasing pressure of vapor streams. Calculates power requirements, discharge temperature, and efficiency.',
        parameters: ['UID', 'NAME', 'FEED', 'PROD', 'PRES', 'TEMP', 'DUTY', 'EFF', 'TYPE'],
        syntax: 'COMPRESSOR UID=name\n  FEED=stream\n  PROD=stream\n  PRES=discharge_pressure',
        example: 'COMPRESSOR UID=K101\n  FEED=VAPOR-IN\n  PROD=VAPOR-OUT\n  PRES=250\n  EFF=0.75'
    }],
    
    ['PUMP', {
        keyword: 'PUMP',
        category: 'unit-operation',
        description: 'Liquid pump for increasing pressure. Calculates hydraulic power, head, and pump efficiency.',
        parameters: ['UID', 'NAME', 'FEED', 'PROD', 'PRES', 'DELTA-P', 'EFF', 'HEAD'],
        syntax: 'PUMP UID=name\n  FEED=stream\n  PROD=stream\n  PRES=discharge_pressure',
        example: 'PUMP UID=P101\n  FEED=LIQUID-IN\n  PROD=LIQUID-OUT\n  PRES=150\n  EFF=0.70'
    }],
    
    ['MIXER', {
        keyword: 'MIXER',
        category: 'unit-operation',
        description: 'Combines multiple inlet streams into a single outlet stream. Performs material and energy balance.',
        parameters: ['UID', 'NAME', 'FEED', 'PROD', 'TEMP', 'PRES'],
        syntax: 'MIXER UID=name\n  FEED=stream1, stream2, ...\n  PROD=mixed_stream',
        example: 'MIXER UID=M101\n  FEED=STREAM1, STREAM2, STREAM3\n  PROD=MIXED'
    }],
    
    ['SPLITTER', {
        keyword: 'SPLITTER',
        category: 'unit-operation',
        description: 'Divides one inlet stream into multiple outlet streams with specified split ratios.',
        parameters: ['UID', 'NAME', 'FEED', 'PROD', 'FRAC', 'RATE'],
        syntax: 'SPLITTER UID=name\n  FEED=stream\n  PROD=stream1, stream2\n  FRAC=fraction1, fraction2',
        example: 'SPLITTER UID=S101\n  FEED=FEED1\n  PROD=PROD1, PROD2\n  FRAC=0.6, 0.4'
    }],
    
    ['VALVE', {
        keyword: 'VALVE',
        category: 'unit-operation',
        description: 'Pressure reduction device. Performs isenthalpic expansion from inlet to outlet pressure.',
        parameters: ['UID', 'NAME', 'FEED', 'PROD', 'PRES', 'DELTA-P'],
        syntax: 'VALVE UID=name\n  FEED=stream\n  PROD=stream\n  PRES=outlet_pressure',
        example: 'VALVE UID=V101\n  FEED=HIGH-P\n  PROD=LOW-P\n  PRES=25'
    }],
    
    ['REACTOR', {
        keyword: 'REACTOR',
        category: 'unit-operation',
        description: 'Chemical reactor for modeling reactions. Supports various reactor types including conversion, equilibrium, Gibbs, and kinetic.',
        parameters: ['UID', 'NAME', 'FEED', 'PROD', 'TEMP', 'PRES', 'DUTY', 'TYPE', 'REACTION'],
        syntax: 'REACTOR UID=name\n  TYPE=type\n  FEED=stream\n  PROD=stream\n  REACTION=...',
        example: 'REACTOR UID=R101\n  TYPE=CONVERSION\n  FEED=REACTANTS\n  PROD=PRODUCTS\n  TEMP=350, PRES=100'
    }],
    
    ['CALCULATOR', {
        keyword: 'CALCULATOR',
        category: 'unit-operation',
        description: 'User-defined calculation block. Allows custom calculations using PRO/II variables and expressions.',
        parameters: ['UID', 'NAME', 'DEFINE', 'CALCULATE'],
        syntax: 'CALCULATOR UID=name\n  DEFINE=variable\n  CALCULATE=expression',
        example: 'CALCULATOR UID=CALC1\n  DEFINE=RATIO\n  CALCULATE=FLOW(S1)/FLOW(S2)'
    }],
    
    ['STCALC', {
        keyword: 'STCALC',
        category: 'unit-operation',
        description: 'Stream calculator for modifying stream properties or performing stream calculations.',
        parameters: ['UID', 'NAME', 'STREAM', 'PROPERTY', 'VALUE'],
        syntax: 'STCALC UID=name\n  STREAM=stream\n  PROPERTY=property\n  VALUE=value',
        example: 'STCALC UID=SC1\n  STREAM=S1\n  TEMP=100, PRES=50'
    }],
    
    // ============================================================================
    // SECTION HEADERS
    // ============================================================================
    ['COMPONENT DATA', {
        keyword: 'COMPONENT DATA',
        category: 'section',
        description: 'Defines the chemical components used in the simulation. Components can be selected from the built-in library or defined as user components.',
        syntax: 'COMPONENT DATA\nLIBID 1, comp1 / 2, comp2 / ...',
        example: 'COMPONENT DATA\nLIBID 1, PROPANE / 2, N-BUTANE / 3, N-PENTANE'
    }],
    
    ['STREAM DATA', {
        keyword: 'STREAM DATA',
        category: 'section',
        description: 'Specifies properties and conditions for process streams. Includes temperature, pressure, flow rate, and composition.',
        syntax: 'STREAM DATA\nPROP DATA, STREAM=name, TEMP=t, PRES=p, RATE=r\nCOMP DATA, ...',
        example: 'STREAM DATA\nPROP DATA, STREAM=FEED1, TEMP=25, PRES=100, RATE=1000\nCOMP DATA, STREAM=FEED1, RATE(M)=300,400,300'
    }],
    
    ['THERMODYNAMIC DATA', {
        keyword: 'THERMODYNAMIC DATA',
        category: 'section',
        description: 'Specifies the thermodynamic method and models for property calculations. Critical for accurate phase equilibrium and enthalpy calculations.',
        syntax: 'THERMODYNAMIC DATA\nMETHOD SYSTEM=method, SET=set',
        example: 'THERMODYNAMIC DATA\nMETHOD SYSTEM=SRK, SET=SRK01'
    }],
    
    ['UNIT OPERATIONS', {
        keyword: 'UNIT OPERATIONS',
        category: 'section',
        description: 'Contains all unit operation specifications. Each unit operation is defined with its type, connections, and operating parameters.',
        syntax: 'UNIT OPERATIONS\nUNIT_TYPE UID=name\n  parameters...',
        example: 'UNIT OPERATIONS\nFLASH UID=F101\n  FEED=FEED1\n  PROD=V=VAP, L=LIQ'
    }],
    
    ['PRINT', {
        keyword: 'PRINT',
        category: 'section',
        description: 'Controls output reporting. Specifies which results to include in the output file.',
        syntax: 'PRINT\nINPUT\nRESULT STREAM=ALL or stream_list',
        example: 'PRINT\nINPUT\nRESULT STREAM=ALL'
    }],
    
    // ============================================================================
    // COMMON PARAMETERS
    // ============================================================================
    ['UID', {
        keyword: 'UID',
        category: 'parameter',
        description: 'Unit IDentifier. Unique name for a unit operation. Used to reference the unit throughout the simulation.',
        syntax: 'UID=name',
        example: 'UID=F101'
    }],
    
    ['FEED', {
        keyword: 'FEED',
        category: 'parameter',
        description: 'Specifies inlet stream(s) to a unit operation. Can be a single stream or comma-separated list.',
        syntax: 'FEED=stream or FEED=stream1, stream2, ...',
        example: 'FEED=FEED1 or FEED=STREAM1, STREAM2'
    }],
    
    ['PROD', {
        keyword: 'PROD',
        category: 'parameter',
        description: 'Specifies outlet stream(s) from a unit operation. Can include phase designations (V=vapor, L=liquid).',
        syntax: 'PROD=stream or PROD=V=vapor, L=liquid',
        example: 'PROD=PRODUCT1 or PROD=V=VAPOR, L=LIQUID'
    }],
    
    ['TEMP', {
        keyword: 'TEMP',
        category: 'parameter',
        description: 'Temperature specification. Default units are typically °F, but can be changed in unit settings.',
        syntax: 'TEMP=value or TEMPERATURE=value',
        example: 'TEMP=250 or TEMPERATURE=120.5'
    }],
    
    ['PRES', {
        keyword: 'PRES',
        category: 'parameter',
        description: 'Pressure specification. Default units are typically PSIA, but can be changed in unit settings.',
        syntax: 'PRES=value or PRESSURE=value',
        example: 'PRES=150 or PRESSURE=14.7'
    }],
    
    ['RATE', {
        keyword: 'RATE',
        category: 'parameter',
        description: 'Flow rate specification. Can be mass rate, mole rate, or volume rate depending on basis.',
        syntax: 'RATE=value or RATE(M)=value or RATE(V)=value',
        example: 'RATE=1000 or RATE(M)=500'
    }],
    
    ['DUTY', {
        keyword: 'DUTY',
        category: 'parameter',
        description: 'Heat duty specification. Positive values indicate heat addition, negative values indicate heat removal.',
        syntax: 'DUTY=value',
        example: 'DUTY=1.5E6 or DUTY=-5E5'
    }],
    
    ['COMP', {
        keyword: 'COMP',
        category: 'parameter',
        description: 'Component data or composition specification. Used in stream definitions and component selection.',
        syntax: 'COMP DATA or COMP=component',
        example: 'COMP DATA, STREAM=S1, RATE(M)=100,200,300'
    }],
    
    ['LIBID', {
        keyword: 'LIBID',
        category: 'parameter',
        description: 'Library IDentifier. Selects components from the PRO/II built-in component library by ID number and name.',
        syntax: 'LIBID id, name / id, name / ...',
        example: 'LIBID 1, PROPANE / 2, N-BUTANE / 62, WATER'
    }],
    
    ['NAME', {
        keyword: 'NAME',
        category: 'parameter',
        description: 'Optional descriptive name for a unit operation or stream. Provides additional documentation.',
        syntax: 'NAME="description"',
        example: 'NAME="Main Feed Flash Drum"'
    }],
    
    ['NSTAGE', {
        keyword: 'NSTAGE',
        category: 'parameter',
        description: 'Number of equilibrium stages in a column. Includes condenser and reboiler if present.',
        syntax: 'NSTAGE=n',
        example: 'NSTAGE=20'
    }],
    
    ['REFLUX', {
        keyword: 'REFLUX',
        category: 'parameter',
        description: 'Reflux ratio in a distillation column. Ratio of liquid returned to column divided by distillate product.',
        syntax: 'REFLUX=value',
        example: 'REFLUX=2.5'
    }],
    
    ['VFRAC', {
        keyword: 'VFRAC',
        category: 'parameter',
        description: 'Vapor fraction specification. Value between 0 (all liquid) and 1 (all vapor).',
        syntax: 'VFRAC=value',
        example: 'VFRAC=0.5'
    }],
    
    ['EFF', {
        keyword: 'EFF',
        category: 'parameter',
        description: 'Efficiency specification for compressors, pumps, or column trays. Expressed as decimal fraction (0.75 = 75%).',
        syntax: 'EFF=value or EFFICIENCY=value',
        example: 'EFF=0.75 or EFFICIENCY=0.80'
    }],
    
    ['FRAC', {
        keyword: 'FRAC',
        category: 'parameter',
        description: 'Fraction specification for splitters. Defines split ratio for each outlet stream.',
        syntax: 'FRAC=value1, value2, ...',
        example: 'FRAC=0.6, 0.4'
    }],
    
    // ============================================================================
    // THERMODYNAMIC METHODS
    // ============================================================================
    ['SRK', {
        keyword: 'SRK',
        category: 'method',
        description: 'Soave-Redlich-Kwong equation of state. Suitable for hydrocarbons and light gases at moderate to high pressures.',
        syntax: 'METHOD SYSTEM=SRK',
        example: 'METHOD SYSTEM=SRK, SET=SRK01'
    }],
    
    ['PR', {
        keyword: 'PR',
        category: 'method',
        description: 'Peng-Robinson equation of state. General-purpose method for hydrocarbons and non-polar compounds.',
        syntax: 'METHOD SYSTEM=PR',
        example: 'METHOD SYSTEM=PR, SET=PR01'
    }],
    
    ['IDEAL', {
        keyword: 'IDEAL',
        category: 'method',
        description: 'Ideal gas law. Suitable for low-pressure gas systems where interactions are negligible.',
        syntax: 'METHOD SYSTEM=IDEAL',
        example: 'METHOD SYSTEM=IDEAL'
    }],
    
    ['NRTL', {
        keyword: 'NRTL',
        category: 'method',
        description: 'Non-Random Two-Liquid activity coefficient model. Excellent for polar and non-ideal liquid mixtures.',
        syntax: 'METHOD SYSTEM=NRTL',
        example: 'METHOD SYSTEM=NRTL, SET=NRTL01'
    }],
    
    ['UNIQUAC', {
        keyword: 'UNIQUAC',
        category: 'method',
        description: 'Universal Quasi-Chemical activity coefficient model. Good for complex liquid mixtures including polymers.',
        syntax: 'METHOD SYSTEM=UNIQUAC',
        example: 'METHOD SYSTEM=UNIQUAC, SET=UNIQ01'
    }],
    
    // ============================================================================
    // STREAM PROPERTIES
    // ============================================================================
    ['PROP', {
        keyword: 'PROP',
        category: 'property',
        description: 'Property data specification for streams. Defines stream conditions and flow rates.',
        syntax: 'PROP DATA, STREAM=name, TEMP=t, PRES=p, RATE=r',
        example: 'PROP DATA, STREAM=FEED1, TEMP=100, PRES=50, RATE=1000'
    }],
    
    ['STREAM', {
        keyword: 'STREAM',
        category: 'property',
        description: 'Stream identifier. Names a process stream for use in unit operations and reporting.',
        syntax: 'STREAM=name',
        example: 'STREAM=FEED1'
    }],
    
    ['METHOD', {
        keyword: 'METHOD',
        category: 'parameter',
        description: 'Thermodynamic method specification. Defines the calculation method for properties and phase equilibrium.',
        syntax: 'METHOD SYSTEM=method, SET=set',
        example: 'METHOD SYSTEM=SRK, SET=SRK01'
    }],
    
    ['SYSTEM', {
        keyword: 'SYSTEM',
        category: 'parameter',
        description: 'System-level keyword for thermodynamic method selection.',
        syntax: 'SYSTEM=method_name',
        example: 'SYSTEM=SRK'
    }],
    
    ['SET', {
        keyword: 'SET',
        category: 'parameter',
        description: 'Thermodynamic set identifier. Associates parameters with a specific method set.',
        syntax: 'SET=set_name',
        example: 'SET=SRK01'
    }],
]);

/**
 * Get documentation for a keyword
 */
export function getKeywordDoc(keyword: string): KeywordDoc | undefined {
    return KEYWORD_DOCS.get(keyword.toUpperCase());
}

/**
 * Format keyword documentation for hover display
 */
export function formatHoverDoc(doc: KeywordDoc): string {
    let markdown = `### ${doc.keyword}\n\n`;
    
    // Category badge
    const categoryEmoji = {
        'unit-operation': '⚙️',
        'parameter': '🔧',
        'section': '📋',
        'method': '🧪',
        'property': '📊'
    };
    markdown += `${categoryEmoji[doc.category]} *${doc.category}*\n\n`;
    
    // Description
    markdown += `${doc.description}\n\n`;
    
    // Syntax
    if (doc.syntax) {
        markdown += `**Syntax:**\n\`\`\`proii\n${doc.syntax}\n\`\`\`\n\n`;
    }
    
    // Parameters
    if (doc.parameters && doc.parameters.length > 0) {
        markdown += `**Common Parameters:** ${doc.parameters.join(', ')}\n\n`;
    }
    
    // Example
    if (doc.example) {
        markdown += `**Example:**\n\`\`\`proii\n${doc.example}\n\`\`\`\n\n`;
    }
    
    markdown += `---\n*PRO/II LSP v2.0*`;
    
    return markdown;
}

/**
 * Get all keywords for completion
 */
export function getAllKeywords(): string[] {
    return Array.from(KEYWORD_DOCS.keys());
}

/**
 * Search keywords by prefix
 */
export function searchKeywords(prefix: string): KeywordDoc[] {
    const upperPrefix = prefix.toUpperCase();
    return Array.from(KEYWORD_DOCS.values())
        .filter(doc => doc.keyword.startsWith(upperPrefix));
}
