import PptxGenJS from 'pptxgenjs';

import fs from 'fs';



// Type definitions
interface SlideConfig {
    layout: {
        name: string;
        width: number;
        height: number;
    };
    background_url?: string;
    colors?: {
        title?: string;
        primary?: string;
        text?: string;
        border?: string;
        gray?: string;
    };
    fonts?: {
        primary?: string;
    };
}

interface ElementProps {
    x: number;
    y: number;
    w: number;
    h: number;
    fontSize?: number;
    fontFace?: string;
    color?: string;
    bold?: boolean;
    italic?: boolean;
    align?: string;
    valign?: string;
    autoFit?: boolean;
    fit?: string;
    shrinkText?: boolean;
    breakLine?: boolean;
    lineSpacingMultiple?: number;
    lineSpacing?: number;
    wrap?: boolean;
    margin?: {
        left: number;
        right: number;
        top: number;
        bottom: number;
    };
    path?: string;
    fill?: {
        color: string;
    };
    line?: {
        color: string;
        width: number;
    };
    rounding?: number;
    bullet?: {
        indent: number;
    };
    autoPage?: boolean;
    newSlideStartY?: number;
    autoPageRepeatHeader?: boolean;
    holeSize?: number;
    valGridLine?: {
        style: string;
    };
    catGridLine?: {
        style: string;
    };
    showValAxis?: boolean;
    showCatAxis?: boolean;
    showDataLabels?: boolean;
    valAxisPos?: string;
    showLegend?: boolean;
    valAxisHidden?: boolean;
    catAxisHidden?: boolean;
    valAxisLabelFontSize?: number;
    valAxisTitleFontSize?: number;
    [key: string]: any; // Allow additional properties for chart configuration
}

interface TextOptions {
    fontSize?: number;
    fontFace?: string;
    color?: string;
    bold?: boolean;
    italic?: boolean;
    align?: string;
    breakLine?: boolean;
    underline?: boolean;
    strike?: boolean;
    hyperlink?: string;
    bullet?: {
        code?: string;
        indent?: number;
        style?: {
            color?: string;
        };
    };
    paraSpaceAfter?: number;
    paraSpaceBefore?: number;
}

interface TextContent {
    text: string;
    options?: TextOptions;
}

interface SlideElement {
    type: 'shape' | 'text' | 'table' | 'subsidiaryCard' | 'chart' | 'image';
    // content can be: string, array of TextContent objects, or array of mixed strings/TextContent
    // The addText method normalizes string elements to TextContent objects at runtime
    content?: string | (string | TextContent)[];
    shapeType?: string;
    props: ElementProps;
    rows?: any[][];
    chartType?: string;
    data?: any[];
}

interface Slide {
    slide_title: string;
    elements: SlideElement[];
}

interface PPTXConfig {
    slideConfig: SlideConfig;
    slides: { [key: string]: Slide };
    background?: {
        path: string;
    };
    font: string
}

const ShapeType = {
    'accentBorderCallout1': 'accentBorderCallout1',
    'accentBorderCallout2': 'accentBorderCallout2',
    'accentBorderCallout3': 'accentBorderCallout3',
    'accentCallout1': 'accentCallout1',
    'accentCallout2': 'accentCallout2',
    'accentCallout3': 'accentCallout3',
    'actionButtonBackPrevious': 'actionButtonBackPrevious',
    'actionButtonBeginning': 'actionButtonBeginning',
    'actionButtonBlank': 'actionButtonBlank',
    'actionButtonDocument': 'actionButtonDocument',
    'actionButtonEnd': 'actionButtonEnd',
    'actionButtonForwardNext': 'actionButtonForwardNext',
    'actionButtonHelp': 'actionButtonHelp',
    'actionButtonHome': 'actionButtonHome',
    'actionButtonInformation': 'actionButtonInformation',
    'actionButtonMovie': 'actionButtonMovie',
    'actionButtonReturn': 'actionButtonReturn',
    'actionButtonSound': 'actionButtonSound',
    'arc': 'arc',
    'bentArrow': 'bentArrow',
    'bentUpArrow': 'bentUpArrow',
    'bevel': 'bevel',
    'blockArc': 'blockArc',
    'borderCallout1': 'borderCallout1',
    'borderCallout2': 'borderCallout2',
    'borderCallout3': 'borderCallout3',
    'bracePair': 'bracePair',
    'bracketPair': 'bracketPair',
    'callout1': 'callout1',
    'callout2': 'callout2',
    'callout3': 'callout3',
    'can': 'can',
    'chartPlus': 'chartPlus',
    'chartStar': 'chartStar',
    'chartX': 'chartX',
    'chevron': 'chevron',
    'chord': 'chord',
    'circularArrow': 'circularArrow',
    'cloud': 'cloud',
    'cloudCallout': 'cloudCallout',
    'corner': 'corner',
    'cornerTabs': 'cornerTabs',
    'cube': 'cube',
    'curvedDownArrow': 'curvedDownArrow',
    'curvedLeftArrow': 'curvedLeftArrow',
    'curvedRightArrow': 'curvedRightArrow',
    'curvedUpArrow': 'curvedUpArrow',
    'decagon': 'decagon',
    'diagStripe': 'diagStripe',
    'diamond': 'diamond',
    'dodecagon': 'dodecagon',
    'donut': 'donut',
    'doubleWave': 'doubleWave',
    'downArrow': 'downArrow',
    'downArrowCallout': 'downArrowCallout',
    'ellipse': 'ellipse',
    'ellipseRibbon': 'ellipseRibbon',
    'ellipseRibbon2': 'ellipseRibbon2',
    'flowChartAlternateProcess': 'flowChartAlternateProcess',
    'flowChartCollate': 'flowChartCollate',
    'flowChartConnector': 'flowChartConnector',
    'flowChartDecision': 'flowChartDecision',
    'flowChartDelay': 'flowChartDelay',
    'flowChartDisplay': 'flowChartDisplay',
    'flowChartDocument': 'flowChartDocument',
    'flowChartExtract': 'flowChartExtract',
    'flowChartInputOutput': 'flowChartInputOutput',
    'flowChartInternalStorage': 'flowChartInternalStorage',
    'flowChartMagneticDisk': 'flowChartMagneticDisk',
    'flowChartMagneticDrum': 'flowChartMagneticDrum',
    'flowChartMagneticTape': 'flowChartMagneticTape',
    'flowChartManualInput': 'flowChartManualInput',
    'flowChartManualOperation': 'flowChartManualOperation',
    'flowChartMerge': 'flowChartMerge',
    'flowChartMultidocument': 'flowChartMultidocument',
    'flowChartOfflineStorage': 'flowChartOfflineStorage',
    'flowChartOffpageConnector': 'flowChartOffpageConnector',
    'flowChartOnlineStorage': 'flowChartOnlineStorage',
    'flowChartOr': 'flowChartOr',
    'flowChartPredefinedProcess': 'flowChartPredefinedProcess',
    'flowChartPreparation': 'flowChartPreparation',
    'flowChartProcess': 'flowChartProcess',
    'flowChartPunchedCard': 'flowChartPunchedCard',
    'flowChartPunchedTape': 'flowChartPunchedTape',
    'flowChartSort': 'flowChartSort',
    'flowChartSummingJunction': 'flowChartSummingJunction',
    'flowChartTerminator': 'flowChartTerminator',
    'folderCorner': 'folderCorner',
    'frame': 'frame',
    'funnel': 'funnel',
    'gear6': 'gear6',
    'gear9': 'gear9',
    'halfFrame': 'halfFrame',
    'heart': 'heart',
    'heptagon': 'heptagon',
    'hexagon': 'hexagon',
    'homePlate': 'homePlate',
    'horizontalScroll': 'horizontalScroll',
    'irregularSeal1': 'irregularSeal1',
    'irregularSeal2': 'irregularSeal2',
    'leftArrow': 'leftArrow',
    'leftArrowCallout': 'leftArrowCallout',
    'leftBrace': 'leftBrace',
    'leftBracket': 'leftBracket',
    'leftCircularArrow': 'leftCircularArrow',
    'leftRightArrow': 'leftRightArrow',
    'leftRightArrowCallout': 'leftRightArrowCallout',
    'leftRightCircularArrow': 'leftRightCircularArrow',
    'leftRightRibbon': 'leftRightRibbon',
    'leftRightUpArrow': 'leftRightUpArrow',
    'leftUpArrow': 'leftUpArrow',
    'lightningBolt': 'lightningBolt',
    'line': 'line',
    'lineInv': 'lineInv',
    'mathDivide': 'mathDivide',
    'mathEqual': 'mathEqual',
    'mathMinus': 'mathMinus',
    'mathMultiply': 'mathMultiply',
    'mathNotEqual': 'mathNotEqual',
    'mathPlus': 'mathPlus',
    'moon': 'moon',
    'nonIsoscelesTrapezoid': 'nonIsoscelesTrapezoid',
    'noSmoking': 'noSmoking',
    'notchedRightArrow': 'notchedRightArrow',
    'octagon': 'octagon',
    'parallelogram': 'parallelogram',
    'pentagon': 'pentagon',
    'pie': 'pie',
    'pieWedge': 'pieWedge',
    'plaque': 'plaque',
    'plaqueTabs': 'plaqueTabs',
    'plus': 'plus',
    'quadArrow': 'quadArrow',
    'quadArrowCallout': 'quadArrowCallout',
    'rect': 'rect',
    'ribbon': 'ribbon',
    'ribbon2': 'ribbon2',
    'rightArrow': 'rightArrow',
    'rightArrowCallout': 'rightArrowCallout',
    'rightBrace': 'rightBrace',
    'rightBracket': 'rightBracket',
    'round1Rect': 'round1Rect',
    'round2DiagRect': 'round2DiagRect',
    'round2SameRect': 'round2SameRect',
    'roundRect': 'roundRect',
    'rtTriangle': 'rtTriangle',
    'smileyFace': 'smileyFace',
    'snip1Rect': 'snip1Rect',
    'snip2DiagRect': 'snip2DiagRect',
    'snip2SameRect': 'snip2SameRect',
    'snipRoundRect': 'snipRoundRect',
    'squareTabs': 'squareTabs',
    'star10': 'star10',
    'star12': 'star12',
    'star16': 'star16',
    'star24': 'star24',
    'star32': 'star32',
    'star4': 'star4',
    'star5': 'star5',
    'star6': 'star6',
    'star7': 'star7',
    'star8': 'star8',
    'stripedRightArrow': 'stripedRightArrow',
    'sun': 'sun',
    'swooshArrow': 'swooshArrow',
    'teardrop': 'teardrop',
    'trapezoid': 'trapezoid',
    'triangle': 'triangle',
    'upArrow': 'upArrow',
    'upArrowCallout': 'upArrowCallout',
    'upDownArrow': 'upDownArrow',
    'upDownArrowCallout': 'upDownArrowCallout',
    'uturnArrow': 'uturnArrow',
    'verticalScroll': 'verticalScroll',
    'wave': 'wave',
    'wedgeEllipseCallout': 'wedgeEllipseCallout',
    'wedgeRectCallout': 'wedgeRectCallout',
    'wedgeRoundRectCallout': 'wedgeRoundRectCallout'
} as const;

function getChartEnum(chartType: string): string {
    const chartTypeMap: { [key: string]: string } = {
        'bar': 'BAR',
        'bar3d': 'BAR3D',
        'pie': 'PIE',
        'pie3d': 'PIE3D',
        'doughnut': 'DOUGHNUT',
        'line': 'LINE',
        'line3d': 'LINE3D',
        'area': 'AREA',
        'area3d': 'AREA3D',
        'scatter': 'SCATTER',
        'bubble': 'BUBBLE',
        'radar': 'RADAR',
        'column': 'COLUMN',
        'column3d': 'COLUMN3D',
        'bubble3d': 'BUBBLE3D'
    };

    const normalizedType = chartType.toLowerCase();
    const enumType = chartTypeMap[normalizedType];

    if (!enumType) {
        console.warn(`Unknown chart type: ${chartType}. Defaulting to BAR chart.`);
        return 'BAR';
    }

    return enumType;
}

export class PPTXGenerator {
    private config: PPTXConfig;
    private slideTitles: string[];
    private pres: PptxGenJS;
    private ShapeType: typeof ShapeType;
    private font: string;

    constructor(config: PPTXConfig, slideTitles: string[] = []) {
        this.config = config;
        this.slideTitles = slideTitles;
        this.pres = new PptxGenJS();
        this.ShapeType = ShapeType;
        this.font = config.font || "Helvetica Neue";
        this.setupPresentation();
    }

    private setupPresentation(): void {
        const { layout } = this.config.slideConfig;

        this.pres.defineLayout({
            name: layout.name,
            width: layout.width,
            height: layout.height,
        });
        this.pres.layout = layout.name;

        // Define slide master with fixed elements
        const background = "public/images/content-slide-bgr.jpg"

        this.pres.defineSlideMaster({
            title: "MASTER_SLIDE",
            background: { path: background }
        });
        this.pres.defineSlideMaster({
            title: "ENTRY_SLIDE",
            background: { path: "public/images/introduction-bgr.jpg" }
        })
    }

    public async generate(): Promise<PptxGenJS> {
        try {
            const slides = this.config.slides;
            const background = "public/images/content-slide-bgr.jpg"

            console.log('Generating presentation with background:', background);
            console.log('Total slides to generate:', Object.keys(slides).length);
            console.log('Slide keys:', Object.keys(slides));
            this.createEntrySlide(slides["0"]);
            Object.keys(slides).sort((a, b) => parseInt(a) - parseInt(b)).forEach((slideNum, index) => {
                try {
                    if (parseInt(slideNum) == 0) {
                        return;
                    }
                    console.log(`Creating slide ${slideNum} (index: ${index})`);
                    // console.log('Slide data:', JSON.stringify(slides[slideNum], null, 2));
                    this.createSlide(slides[slideNum], background, index);
                } catch (error) {
                    console.error(`Error processing slide ${slideNum}:`, (error as Error).message);
                    console.error('Stack trace:', (error as Error).stack);
                }
            });

            console.log('Presentation generation completed');
            return this.pres;
        } catch (error) {
            console.error('Critical error in presentation generation:', (error as Error).message);
            console.error('Stack trace:', (error as Error).stack);
            return this.pres;
        }
    }

    /**
     * Generate a single slide as a standalone PPTX file (for preview/regenerate)
     * @param slideKey - The slide key (e.g., "0", "1", "2")
     * @returns PptxGenJS instance with only the specified slide
     */
    public async generateSingleSlide(slideKey: string): Promise<PptxGenJS> {
        try {
            const slides = this.config.slides;
            const slideData = slides[slideKey];

            if (!slideData) {
                throw new Error(`Slide with key "${slideKey}" not found`);
            }

            // Create a new presentation instance for this single slide
            const singlePres = new PptxGenJS();
            const { layout } = this.config.slideConfig;

            singlePres.defineLayout({
                name: layout.name,
                width: layout.width,
                height: layout.height,
            });
            singlePres.layout = layout.name;

            // Define slide masters
            const background = "public/images/content-slide-bgr.jpg";
            singlePres.defineSlideMaster({
                title: "MASTER_SLIDE",
                background: { path: background }
            });
            singlePres.defineSlideMaster({
                title: "ENTRY_SLIDE",
                background: { path: "public/images/introduction-bgr.jpg" }
            });

            console.log(`Generating single slide: ${slideKey}`);

            // Generate entry slide (slide 0) or content slide
            if (slideKey === "0") {
                const slide = singlePres.addSlide({ masterName: "ENTRY_SLIDE" });
                slide.addText(slideData.slide_title, {
                    x: 0.75,
                    y: 0.75,
                    w: 9.50,
                    h: 3.75,
                    fontSize: 40,
                    bold: true,
                    color: '008ed4',
                    align: 'left',
                    fontFace: this.font
                });
            } else {
                // Use the existing createSlide logic for content slides
                this.createSingleContentSlide(singlePres, slideData, background);
            }

            console.log(`Single slide ${slideKey} generation completed`);
            return singlePres;
        } catch (error) {
            console.error(`Error generating single slide ${slideKey}:`, (error as Error).message);
            console.error('Stack trace:', (error as Error).stack);
            throw error;
        }
    }

    /**
     * Helper method to create a single content slide on a given presentation instance
     */
    private createSingleContentSlide(pres: PptxGenJS, slideData: Slide, background: string): void {
        try {
            const slide = pres.addSlide({ masterName: "MASTER_SLIDE" });
            let titleText = slideData.slide_title;

            console.log(`Slide title: ${titleText}`);

            if (titleText) {
                console.log('Adding title text to slide');
                slide.addText(titleText, {
                    x: 0.18,
                    y: 0.15,
                    w: 11.77,
                    h: 0.62,
                    fontSize: 20,
                    bold: true,
                    color: '008ed4',
                    align: 'left',
                    fontFace: this.font
                });
            }

            const normalizeString = (str: string | undefined): string => {
                if (!str) return '';
                return str
                    .replace(/\s+/g, '')
                    .replace(/[（(]/g, '(')
                    .replace(/[）)]/g, ')')
                    .replace(/[「『]/g, '"')
                    .replace(/[」』]/g, '"')
                    .replace(/／/g, '/')
                    .toLowerCase();
            };

            if (slideData.elements && Array.isArray(slideData.elements)) {
                const normalizedTitleText = normalizeString(titleText);

                const titleElementIndex = slideData.elements.findIndex(element => {
                    const contentText = Array.isArray(element.content)
                        ? element.content.map(c => typeof c === 'string' ? c : c.text).join('')
                        : element.content || '';
                    const normalizedContent = normalizeString(contentText);
                    return normalizedContent === normalizedTitleText && element.props.y < 1;
                });

                if (titleElementIndex !== -1) {
                    const removedElement = slideData.elements.splice(titleElementIndex, 1)[0];
                    const firstElementHeight = removedElement.props.h || 0;
                    slideData.elements.forEach(element => {
                        element.props.y -= firstElementHeight;
                        this.addElement(slide, element, slideData.elements);
                    });
                    return;
                }
            }

            if (!slideData.elements || !Array.isArray(slideData.elements)) {
                console.warn('Slide has no valid elements array. Skipping element processing.');
                return;
            }

            console.log(`Processing ${slideData.elements.length} elements`);
            slideData.elements.forEach((element, index) => {
                this.addElement(slide, element, slideData.elements);
            });
        } catch (error) {
            console.error(`Error creating single content slide:`, (error as Error).message);
            console.error('Slide data:', slideData);
            console.error('Stack trace:', (error as Error).stack);
            throw error;
        }
    }

    private createEntrySlide(entry_slide: any): void {
        const slide = this.pres.addSlide({ masterName: "ENTRY_SLIDE" });
        slide.addText(entry_slide.slide_title, {
                    x: 0.75,
                    y: 0.75,
                    w: 9.50,
                    h: 3.75,
                    fontSize: 40,
                    bold: true,
                    color: '008ed4',
                    align: 'left',
                    fontFace: this.font
                });
    }

    private createSlide(slideData: Slide, background: string, slideIndex: number): void {
        try {
            // console.log(`Creating slide with data:`, slideData);
            const slide = this.pres.addSlide({ masterName: "MASTER_SLIDE" });
            let titleText = slideData.slide_title;

            console.log(`Slide title: ${titleText}`);

            if (titleText) {
                console.log('Adding title text to slide');
                slide.addText(titleText, {
                    x: 0.18,
                    y: 0.15,
                    w: 11.77,
                    h: 0.62,
                    fontSize: 20,
                    bold: true,
                    color: '008ed4',
                    align: 'left',
                    fontFace: this.font
                });
            }


            // normalize string by removing spaces and converting special characters before comparing
            const normalizeString = (str: string | undefined): string => {
                if (!str) return '';
                return str
                    .replace(/\s+/g, '') // remove all whitespace
                    .replace(/[（(]/g, '(') // normalize opening brackets
                    .replace(/[）)]/g, ')') // normalize closing brackets
                    .replace(/[「『]/g, '"') // normalize opening quotes
                    .replace(/[」』]/g, '"') // normalize closing quotes
                    .replace(/／/g, '/') // normalize slash
                    .toLowerCase();
            };
            // remove title element from elements array to avoid duplication
            if (slideData.elements && Array.isArray(slideData.elements)) {
                const normalizedTitleText = normalizeString(titleText);

                const titleElementIndex = slideData.elements.findIndex(element => {
                    const contentText = Array.isArray(element.content)
                        ? element.content.map(c => typeof c === 'string' ? c : c.text).join('')
                        : element.content || '';
                    const normalizedContent = normalizeString(contentText);
                    return normalizedContent === normalizedTitleText && element.props.y < 1;
                });

                if (titleElementIndex !== -1) {
                    const removedElement = slideData.elements.splice(titleElementIndex, 1)[0];
                    const firstElementHeight = removedElement.props.h || 0;
                    slideData.elements.forEach(element => {
                        element.props.y -= firstElementHeight;
                        this.addElement(slide, element, slideData.elements);
                    });
                    return;
                }
            }

            // check if elements array exists and is valid
            if (!slideData.elements || !Array.isArray(slideData.elements)) {
                    console.warn('Slide has no valid elements array. Skipping element processing.');
                return;
            }

            console.log(`Processing ${slideData.elements.length} elements`);
            slideData.elements.forEach((element, index) => {
                this.addElement(slide, element, slideData.elements);
            });
        } catch (error) {
            console.error(`Error creating slide ${slideIndex}:`, (error as Error).message);
            console.error('Slide data:', slideData);
            console.error('Stack trace:', (error as Error).stack);
        }
    }

    private addElement(slide: any, element: SlideElement, slideElements?: SlideElement[]): void {
        try {
            switch (element.type) {
                case 'shape':
                    this.addShape(slide, element);
                    break;
                case 'text':
                    this.addText(slide, element);
                    break;
                case 'table':
                    this.addTable(slide, element);
                    break;
                case 'chart':
                    this.addChart(slide, element, slideElements);
                    break;
                case 'image':
                    this.addImage(slide, element);
                    break;
                default:
                    console.warn(`Unknown element type: ${element.type}`);
            }
        } catch (error) {
            console.error(`Error adding element of type ${element.type}:`, (error as Error).message);
            console.error('Element data:', element);
            console.error('Stack trace:', (error as Error).stack);
        }
    }

    private addShape(slide: any, element: SlideElement): void {
        let shapeType = element.shapeType;
        const shapeTypeExceptions: { [key: string]: string } = {
            'doughnut': 'donut',
            'oval': 'ellipse'
        };
        if (shapeType && shapeTypeExceptions[shapeType]) {
            shapeType = shapeTypeExceptions[shapeType];
            console.log(`Converting shape type "${element.shapeType}" to "${shapeType}"`);
        }
        if (!shapeType || !this.ShapeType[shapeType as keyof typeof ShapeType]) {
            console.warn(`Invalid shape type: ${shapeType}. Shape will not be created.`);
            return;
        }

        element.props.fontFace = this.font;
        element.props.lineSpacingMultiple = 1;
        element.props.wrap = true;
        element.props.valign = "middle";
        element.props.autoFit = true;
        element.props.fit = "shrink";
        element.props.fontSize = undefined;

        const pptxShapeType = (this.pres as any).ShapeType[shapeType];
        slide.addShape(pptxShapeType, element.props);
    }

    private addText(slide: any, element: SlideElement): void {
        element.props.fontFace = this.font;
        element.props.lineSpacingMultiple = 1;
        element.props.valign = element.props.valign || "middle";
        element.props.fit = "shrink";
        element.props.shrinkText = true;

        delete element.props.lineSpacing;

        const minFontSize = 5;
        const POINTS_PER_INCH = 72;

        const isFullWidth = (char: string): boolean => {
            const code = char.charCodeAt(0);
            return (code >= 0x3000 && code <= 0x9FFF) || (code >= 0xFF00 && code <= 0xFFEF);
        };

        const getTextWidth = (text: string, fontSize: number): number => {
            return text.split('').reduce((sum, char) => {
                return sum + (isFullWidth(char) ? fontSize : fontSize * 0.6);
            }, 0);
        };

        const calculateTotalLines = (text: string, fontSize: number, boxWidthPt: number): number => {
            const lines = text.split('\n');
            let totalLines = 0;

            for (const line of lines) {
                if (line.trim() === '') {
                    totalLines += 1;
                } else {
                    const lineWidth = getTextWidth(line, fontSize);
                    const wrappedLines = Math.ceil(lineWidth / boxWidthPt);
                    totalLines += wrappedLines;
                }
            }

            return totalLines;
        };

        if (Array.isArray(element.content)) {
            // Normalize content array: convert strings to TextContent objects
            const normalizedContent: TextContent[] = element.content.map(item => {
                if (typeof item === 'string') {
                    return { text: item, options: {} };
                }
                return item as TextContent;
            });
            element.content = normalizedContent;

            const fullText = normalizedContent.map(c => c.text).join('');

            const boxWidthPt = element.props.w * POINTS_PER_INCH;
            const boxHeightPt = element.props.h * POINTS_PER_INCH;

            const avgFontSize = normalizedContent.reduce((sum, item) =>
                sum + (item.options?.fontSize || element.props.fontSize || 14), 0) / normalizedContent.length;
            const totalLines = calculateTotalLines(fullText, avgFontSize, boxWidthPt);
            const estimatedHeightNeeded = totalLines * avgFontSize * 1.5;
            let scaleFactor = 1.0;
            if (estimatedHeightNeeded > boxHeightPt) {
                scaleFactor = (boxHeightPt / estimatedHeightNeeded) * 0.88;
            }

        const boxArea = boxWidthPt * boxHeightPt;
        const aspectRatio = boxWidthPt / boxHeightPt;

        let minScaleFactor = 0.5;
        if (boxArea >= 15000) {
            minScaleFactor = aspectRatio > 6 ? 0.65 : 0.75;
        }

        scaleFactor = Math.max(scaleFactor, minScaleFactor);

            element.content = normalizedContent.map(item => {
                if (!item.options) {
                    item.options = {};
                }

                const originalFontSize = item.options.fontSize || element.props.fontSize || 14;
                const maxFontSizeForBox = boxHeightPt * 0.7;
                const targetFontSize = Math.min(
                    originalFontSize * scaleFactor,
                    maxFontSizeForBox
                );

                item.options.fontSize = Math.round(Math.max(minFontSize, targetFontSize));

                if (!item.options.fontFace) {
                    item.options.fontFace = this.font;
                }

                return item;
            });
        } else {
            const content = element.content || '';

            const boxWidthPt = element.props.w * POINTS_PER_INCH;
            const boxHeightPt = element.props.h * POINTS_PER_INCH;

            const originalFontSize = element.props.fontSize || 14;
            const totalLines = calculateTotalLines(content, originalFontSize, boxWidthPt);
            const estimatedHeightNeeded = totalLines * originalFontSize * 1.5;

            let scaleFactor = 1.0;
            if (estimatedHeightNeeded > boxHeightPt) {
                scaleFactor = (boxHeightPt / estimatedHeightNeeded) * 0.88;
            }

        const boxArea = boxWidthPt * boxHeightPt;
        const aspectRatio = boxWidthPt / boxHeightPt;

        let minScaleFactor = 0.5;
        if (boxArea >= 15000) {
            minScaleFactor = aspectRatio > 6 ? 0.65 : 0.75;
        }

        scaleFactor = Math.max(scaleFactor, minScaleFactor);

            const maxFontSizeForBox = boxHeightPt * 0.7;

            element.props.fontSize = Math.round(
                Math.max(minFontSize, Math.min(
                    originalFontSize * scaleFactor,
                    maxFontSizeForBox
                ))
            );
        }

        slide.addText(element.content, element.props);
    }

    private addTable(slide: any, element: SlideElement): void {
        // Validate table data before adding
        if (!element.rows || !Array.isArray(element.rows) || element.rows.length === 0) {
            console.warn('Table element missing or invalid rows data. Table will not be created.');
            console.warn('Expected rows to be an array, got:', typeof element.rows);
            return;
        }

        try {
            element.props.fontFace =this.font;
            element.props.autoPage = true;
            element.props.newSlideStartY = 0.65;
            element.props.autoPageRepeatHeader = true;

            slide.addTable(element.rows, element.props);
        } catch (error) {
            console.warn(`Error adding table: ${(error as Error).message}. Table will be skipped.`);
            console.warn('Table data:', element.rows);
        }
    }

    private addChart(slide: any, element: SlideElement, slideElements?: SlideElement[]): void {
        try {
            if (!element.data || !Array.isArray(element.data) || element.data.length === 0) {
                console.warn('Chart element missing or invalid data. Chart will not be created.');
                return;
            }

            const chartEnum = getChartEnum(element.chartType || 'bar');
            const pptxChartType = (this.pres as any).charts[chartEnum];

            if (!pptxChartType) {
                console.warn(`Chart type ${chartEnum} not found in PptxGenJS charts. Chart will not be created.`);
                return;
            }

            const processedData = element.data.map(series => {
                const processedSeries = { ...series };
                if (series.values && !series.sizes) {
                    processedSeries.sizes = [...series.values];
                }
                if (!processedSeries.labels && processedSeries.values) {
                    if (processedSeries.name) {
                        processedSeries.labels = [processedSeries.name];
                    } else {
                        processedSeries.labels = processedSeries.values.map((_: any, index: number) => `Data ${index + 1}`);
                    }
                }
                if (chartEnum === 'PIE' || chartEnum === 'PIE3D' || chartEnum === 'DOUGHNUT') {
                    if (!processedSeries.sizes && processedSeries.values) {
                        processedSeries.sizes = [...processedSeries.values];
                    }
                }

                return processedSeries;
            });

            if (element?.props?.holeSize && chartEnum === 'DOUGHNUT' && element?.props?.holeSize > 50) {
                element.props.holeSize = 33;
            }
            const chartProps = this.adjustChartPropsForCombinedCharts(element, chartEnum, slideElements);

            slide.addChart(pptxChartType, processedData, chartProps);
        } catch (error) {
            console.warn(`Error adding chart: ${(error as Error).message}. Chart will be skipped.`);
            console.warn('Stack trace:', (error as Error).stack);
        }
    }

    private adjustChartPropsForCombinedCharts(element: SlideElement, chartEnum: string, slideElements?: SlideElement[]): any {
        const chartProps = { ...element.props };
        if (chartEnum === 'LINE' || chartEnum === 'LINE3D') {
            if (slideElements && this.hasBarChartInSlide(slideElements)) {
                console.log('Adjusting chart props for combined charts', chartProps);
                chartProps.valGridLine = { style: 'none' };
                chartProps.catGridLine = { style: 'none' };
                chartProps.showValAxis = false;
                chartProps.showCatAxis = false;
                chartProps.showDataLabels = false;
                chartProps.valAxisHidden = true;
                chartProps.catAxisHidden = true;
                chartProps.valAxisLabelFontSize = 0;
                chartProps.valAxisTitleFontSize = 0;
                if (!chartProps.valAxisPos) {
                    chartProps.valAxisPos = 'r';
                }
                if (!chartProps.showLegend) {
                    chartProps.showLegend = false;
                }
            }
        }

        return chartProps;
    }

    private hasBarChartInSlide(slideElements: SlideElement[]): boolean {
        return slideElements.some(element => {
            if (element.type === 'chart') {
                const chartEnum = getChartEnum(element.chartType || 'bar');
                return chartEnum === 'BAR' || chartEnum === 'BAR3D' || chartEnum === 'COLUMN' || chartEnum === 'COLUMN3D';
            }
            return false;
        });
    }

    private addImage(slide: any, element: SlideElement): void {
        if (!element.props || !element.props.path) {
            console.warn('Image element missing path property. Image will not be created.');
            return;
        }
        if (!fs.existsSync(element.props.path)) {
            console.warn(`Image file not found: ${element.props.path}. Image will not be created.`);
            return;
        }

        slide.addImage(element.props);
    }
}

export { PPTXConfig, Slide, SlideElement, SlideConfig };