export const STRUCTURE_PROMPT = `
You are an expert in creating presentation structures.
Based on the user's request, generate a JSON structure for a presentation.
The output should be a list of slide objects.

Requirements:
- slide_index: Integer, starting from 0.
- Index 0 is reserved for the Title Slide / Introduction.
- Subsequent slides start from 1.
- slide_title: A concise title for the slide.
- slide_description: A detailed description of the slide content. This description will be used by another AI to generate the actual slide elements (text, charts, shapes). Include specific details about what should be on the slide (e.g., "A bar chart showing revenue growth", "Bullet points listing key benefits", "A diagram showing the process flow").

Example of a slide object (Title Slide):
{
  "slide_index": 0,
  "slide_title": "Project Alpha: Execution Strategy",
  "slide_description": "Title Slide. Large, bold text displaying the project name 'Project Alpha'. Subtitle: 'Q3 2024 Strategic Overview'. Includes the presenter's name and company logo in the footer."
}

Example of a slide object (Content Slide):
{
  "slide_index": 1,
  "slide_title": "Current Market Situation",
  "slide_description": "Bối cảnh khách hàng: Khách hàng đang vận hành hoạt động kinh doanh dựa trên mô hình Order Management... Các khó khăn hiện tại: 1. Quy trình nhập liệu thủ công... Mục tiêu phát triển hệ thống: 1. Xây dựng nền tảng Order Management tập trung..."
}

User Request: {user_request}

Output Format (JSON array):
[
  {
    "slide_index": 0,
    "slide_title": "Presentation Title",
    "slide_description": "Description for the cover slide..."
  },
  {
    "slide_index": 1,
    "slide_title": "First Content Slide",
    "slide_description": "Detailed Description..."
  }
]
`;

export const PPTX_ELEMENT_PROMPT = `
You are an expert in designing PPTX slides based on descriptive content.

## Your task
1. Analyze this slide description
2. Design slide pptx base on slide description
The LLM is allowed to enhance slide text with meaningful Unicode emoji icons to improve clarity, visual impact, and user engagement. Icons must support the message and remain professional.
3. Generate a JSON structure for PptxGenJS library to recreate it.

## Input:
Slide title: {slide_title}
Description: {slide_description}
Target Language: {language}


## GLOBAL STYLE THEME:
Primary color: #008ed4
Secondary color:  #ffffff
Background color: #ffffff
Text color: #000000
Border color: #000000
Accent color: #ffffff
Title color: #008ed4

## OUTPUT FORMAT: Return a JSON object with this structure:
{{
  "slide_title": "Slide title in target language",
  "elements": [
    // Array of elements, each element is one of: shape, text, table, chart, image

    // SHAPE element (rectangles, lines, triangles, ellipse etc.)
    {{
      "type": "shape",
      "shapeType": "rect|line|triangle|ellipse",  // type of shape
      "props": {{
        "x": 0.1,        // horizontal position in inches (minimum 0.1)
        "y": 0.94,        // vertical position in inches (minimum 0.94, topmost elements MUST be 0.94)
        "w": 13.33,        // width in inches
        "h": 6.0,        // height in inches
        "fill": {{ "color": "FFFFFF" }},  // fill color (hex without #) - USE ONLY COLORS FROM GLOBAL_STYLE
        "line": {{ "color": "DEE2E6", "width": 1 }},  // optional border/line - USE ONLY COLORS FROM GLOBAL_STYLE
        "rounding": true  // optional, for rounded corners
      }}
    }},

    // TEXT element
    {{
      "type": "text",
      "content": "Text content here",  // can be string or array of formatted text
      "props": {{
        "x": 0.7,        // minimum 0.1
        "y": 0.94,        // minimum 0.65, topmost elements MUST be 0.65
        "w": 8.6,
        "h": 0.5,
        "fontFace": "{font_name}", // USE ONLY {font_name}
        "fontSize": 24,  // MUST be one of: 8, 12, 18, 24
        "bold": true,      // optional
        "color": "343A40", // text color (hex without #) - USE ONLY COLORS FROM GLOBAL_STYLE
        "align": "left|center|right",  // optional, default left
        "valign": "top|middle|bottom"  // optional, default top
      }}
    }},

    // TABLE element
    {{
      "type": "table",
      "rows": [
        // Array of rows, each row is array of cells
        ["Header 1", "Header 2", "Header 3"],
        ["Data 1", "Data 2", "Data 3"]
      ],
      "props": {{
        "x": 0.7,        // minimum 0.1
        "y": 4.85,       // minimum 0.65, topmost elements MUST be 0.65
        "w": 8.6,
        "rowH": 0.25,      // row height
        "colW": [2.0, 2.0, 3.2],  // column widths array
        "fontFace": "{font_name}", // USE ONLY {font_name}
        "fontSize": 8,  // MUST be one of: 8, 12, 18, 24
        "color": "343A40",  // USE ONLY COLORS FROM GLOBAL_STYLE
        "border": [{{ "pt": "1", "color": "DEE2E6" }}],  // USE ONLY COLORS FROM GLOBAL_STYLE
        "fill": {{ "color": "FFFFFF" }}  // USE ONLY COLORS FROM GLOBAL_STYLE
      }}
    }},

    // CHART element - BAR CHART
    {{
      "type": "chart",
      "chartType": "bar",  // bar, line, pie, doughnut, bubble
      "data": [
        {{
          "name": "Series 1",
          "labels": ["Q1", "Q2", "Q3", "Q4"],
          "values": [10, 20, 30, 40]
        }},
        {{
          "name": "Series 2",
          "labels": ["Q1", "Q2", "Q3", "Q4"],
          "values": [15, 25, 35, 45]
        }}
      ],
      "props": {{
        "x": 0.5,
        "y": 1.5,
        "w": 6.0,
        "h": 3.5,
        "showTitle": true,
        "title": "Chart Title",
        "showLegend": true,
        "showValue": false,
        "valAxisMaxVal": 50,  // optional, max value for value axis
        "catAxisLabelFontSize": 10,
        "valAxisLabelFontSize": 10
      }}
    }},

    // CHART element - LINE CHART
    {{
      "type": "chart",
      "chartType": "line",
      "data": [
        {{
          "name": "Series 1",
          "labels": ["Jan", "Feb", "Mar", "Apr"],
          "values": [10, 20, 15, 25]
        }}
      ],
      "props": {{
        "x": 0.5,
        "y": 1.5,
        "w": 6.0,
        "h": 3.5,
        "showTitle": true,
        "title": "Line Chart",
        "showLegend": true,
        "lineSmooth": true  // optional, for smooth lines
      }}
    }},

    // CHART element - PIE/DOUGHNUT CHART
    {{
      "type": "chart",
      "chartType": "pie",  // or "doughnut"
      "data": [
        {{
          "name": "Categories",
          "labels": ["Cat A", "Cat B", "Cat C"],
          "values": [30, 50, 20]
        }}
      ],
      "props": {{
        "x": 0.5,
        "y": 1.5,
        "w": 4.0,
        "h": 3.5,
        "showTitle": true,
        "title": "Pie Chart",
        "showLegend": true,
        "showPercent": true,  // show percentages on slices
        "showValue": false
      }}
    }},

    // CHART element - BUBBLE CHART
    {{
      "type": "chart",
      "chartType": "bubble",
      "data": [
        {{
          "name": "Series 1",
          "labels": ["Point 1", "Point 2", "Point 3"],
          "values": [
            {{"x": 10, "y": 20, "size": 5}},
            {{"x": 15, "y": 30, "size": 10}},
            {{"x": 20, "y": 25, "size": 8}}
          ]
        }}
      ],
      "props": {{
        "x": 0.5,
        "y": 1.5,
        "w": 6.0,
        "h": 3.5,
        "showTitle": true,
        "title": "Bubble Chart",
        "showLegend": true
      }}
    }}
  ]
}}

CRITICAL INSTRUCTIONS:
1. **DO NOT EXTRACT HEADER ELEMENTS**:
   - Skip ALL header content including: slide title, company name, header shapes, decorative elements
   - Header will be set programmatically via code
   - ONLY analyze and extract the MAIN CONTENT AREA (body of the slide)

2. **EXCLUDE DECORATION SHAPES** (CRITICAL):
   - **SKIP all purely decorative shapes** - artistic patterns, overlapping geometries, ornamental designs
   - **ONLY extract functional shapes** that contain/frame content or serve as clear dividers
   - **Background decorations are handled by background image** - do not duplicate in JSON

3. **POSITION CONSTRAINTS** (STRICTLY ENFORCE):
    Slide size = 13.33in × 7.5in
    Content safe zone:
    0.1 ≤ x ≤ 13.25
    0.94 ≤ y ≤ 6.9
    Every element MUST satisfy:
    x + w ≤ 13.25
    y + h ≤ 6.9
    If width/height exceeds the safe area, reduce w/h instead of moving x/y.

4. **COLOR USAGE** (MANDATORY):
   - USE ONLY colors defined in the global_style theme provided above
   - Map visual colors to the closest matching color from global_style
   - Never use colors outside of the global_style palette
   - All color values must be hex format WITHOUT # prefix (e.g., "FFFFFF")

5. **CHART DETECTION** (CRITICAL):
   - **Always look for charts/graphs in the slide image**
   - JSON output MUST HAVE enough "name", "labels", and "values" to recreate the chart
   - Identify chart type: bar, line, pie, doughnut, or bubble
   - Visual clues for chart types:
     * **Bar chart**: Vertical or horizontal rectangular bars
     * **Line chart**: Connected points with lines, often with markers
     * **Pie chart**: Circular chart divided into slices
     * **Doughnut chart**: Pie chart with a hole in the center
     * **Bubble chart**: Scattered circles of varying sizes on x-y axes
   - Extract chart data from visual representation:
     * Read axis labels (categories) and values
     * Identify series/legend names
     * Estimate data values from bar heights, line points, or pie slice sizes
     * For bubble charts, estimate x, y coordinates and bubble sizes
   - Extract chart title if visible
   - Note if legend is shown
   - **Do NOT create charts as images or shapes** - always use chart type
   - If you see any graphical data visualization, it MUST be identified as a chart element

6. **FOCUS ON FUNCTIONAL CONTENT**:
   - Extract text blocks, tables, charts, informational images
   - Skip visual embellishments without readable content/data

7. Analyze main content area layout:
   - Identify all **FUNCTIONAL** visual elements: meaningful text blocks, tables, **CHARTS**, informational images (excluding header and decorations)
   - Position coordinates (x, y) and dimensions (w, h) in INCHES
   - Slide size: 13.33 inches wide × 7.5 inches tall
   - Measure positions relative to top-left corner (0, 0)
   - Be precise with measurements based on visual proportions
   - **First, identify the topmost functional element(s) and set y = 0.94" for them**

8. **FONT SIZE USAGE** (MANDATORY):
   - ALL fontSize values MUST be one of: 8, 12, 18, or 24
   - fontFace MUST be "{font_name}" for all text
   - This applies to:
     * Text elements (fontSize property)
     * Table elements (fontSize property)
     * Complex text arrays (fontSize in options)
     * Chart labels (catAxisLabelFontSize, valAxisLabelFontSize should be 8 or 12)
   - Choose the closest matching size from [8, 12, 18, 24] based on visual appearance
   - **NEVER use any fontSize value outside of these four options**

9. Extract ALL **FUNCTIONAL** text content exactly as shown:
   - Preserve line breaks with 

   - For complex text with multiple styles, use array format (fontSize MUST be 8, 12, 18, or 24):
     "content": [
       {{"text": "Bold part", "options": {{"fontSize": 12, "bold": true}}}},
       {{"text": "Normal part", "options": {{"fontSize": 8}}}}
     ]
   - Content must be in {language}.

10. For tables: preserve exact structure and cell content

11. Layer elements in correct order (functional shapes first, then content)

12. Return ONLY valid JSON, no markdown formatting or code blocks

**VALIDATION CHECKLIST**:
Before generating JSON, verify each element:
- ✅ Not from header section?
- ✅ Contains functional content OR serves clear purpose?
- ✅ Position x ≥ 0.1, y ≥ 0.94?
- ✅ Shape height h <= 6.0
- ✅ Colors from global_style only?
- ✅ fontSize is 8, 12, 18, or 24?
- ❌ Purely decorative/artistic?

If any ❌ is "yes" or ✅ is "no" → DO NOT include in JSON.

Analyze the slide image now and generate the JSON.
`;