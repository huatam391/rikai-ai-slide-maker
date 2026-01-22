# Slide Editor Redesign - Split View với Preview

## Mục tiêu
Redesign màn hình tạo slide để:
- Hiển thị structure slides bên trái
- Preview slide bên phải
- Cho phép regenerate từng slide riêng lẻ
- Preview HTML trước khi download PPTX

## UI Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Create Presentation - Split View                                       │
├──────────────────────┬──────────────────────────────────────────────────┤
│ Slide Structure      │ Slide Preview                                    │
│ (30% width)          │ (70% width)                                      │
│                      │                                                  │
│ ┌──────────────────┐ │ ┌──────────────────────────────────────────────┐ │
│ │ ✓ Slide 0: Title │◄├─┤ HTML Preview Area                            │ │
│ │ [Edit] [View]    │ │ │ - Title slide structure preview              │ │
│ └──────────────────┘ │ │ OR                                            │ │
│                      │ │ - Generated slide content preview            │ │
│ ┌──────────────────┐ │ │ (16:9 aspect ratio maintained)               │ │
│ │ ○ Slide 1: Intro │ │ │                                              │ │
│ │ [Edit] [Regen]   │ │ │                                              │ │
│ └──────────────────┘ │ │                                              │ │
│                      │ │                                              │ │
│ ┌──────────────────┐ │ │                                              │ │
│ │ ○ Slide 2: Main  │ │ │                                              │ │
│ │ [Edit] [Regen]   │ │ │                                              │ │
│ └──────────────────┘ │ │                                              │ │
│                      │ │                                              │ │
│ [+ Add Slide]        │ │                                              │ │
│ [Generate All]       │ │                                              │ │
│                      │ └──────────────────────────────────────────────┘ │
│                      │                                                  │
│                      │ [Download PPTX] [Preview Full PPTX]              │
└──────────────────────┴──────────────────────────────────────────────────┘
```

## Component Structure

```
CreateSlideSplitView.vue (NEW - main component)
├── SlideStructurePanel.vue (LEFT)
│   ├── SlideStructureItem.vue (each slide)
│   │   ├── Title display
│   │   ├── Status indicator (✓ generated, ○ pending)
│   │   ├── [Edit] button → expand to show editable fields
│   │   ├── [Regenerate] button → regenerate this slide only
│   │   └── [View] button → load preview in right panel
│   └── Controls
│       ├── [+ Add Slide]
│       └── [Generate All Pending]
│
└── SlidePreviewPanel.vue (RIGHT)
    ├── SlidePreviewRenderer.vue
    │   └── Renders HTML from SlideContent JSON
    └── Controls
        ├── [Download PPTX]
        └── [Preview Full PPTX] → uses pptx-in-html-out
```

## Data Flow

### 1. Initial Load
```
User → Enter Job ID / Select Existing Job
  ↓
Load structure/{jobId}.json
  ↓
Display slides in left panel (all pending)
  ↓
Check if output/{jobId}_content.json exists
  ↓
If exists: mark slides as generated ✓
```

### 2. Regenerate Single Slide
```
User → Click [Regenerate] on Slide N
  ↓
POST /api/pptx/regenerate-slide
  body: { jobId, slideIndex, language }
  ↓
Backend:
  - Load structure for slide N
  - Call generateSlideElements(slide, language)
  - Update output/{jobId}_content.json (only slide N)
  - Return SlideContent
  ↓
Frontend:
  - Update local state
  - Mark slide as generated ✓
  - Auto-select slide to show preview
```

### 3. Preview Slide
```
User → Click slide in left panel
  ↓
Check if slide has generated content
  ↓
If YES:
  - Load SlideContent from state
  - Render HTML preview using SlidePreviewRenderer
If NO:
  - Show structure preview (title + description only)
```

### 4. Generate All Pending
```
User → Click [Generate All]
  ↓
Find all slides with status = pending
  ↓
POST /api/pptx/generate-content-batch
  body: { jobId, slideIndexes[], language }
  ↓
Backend: Promise.all for all pending slides
  ↓
Update all slide statuses to generated ✓
```

### 5. Download PPTX
```
User → Click [Download PPTX]
  ↓
POST /api/pptx/generate (existing endpoint)
  ↓
Generate .pptx file from content JSON
  ↓
Download link
```

### 6. Preview Full PPTX (Optional - using pptx-in-html-out)
```
User → Click [Preview Full PPTX]
  ↓
POST /api/pptx/preview-html
  body: { jobId }
  ↓
Backend:
  - Check if {jobId}.pptx exists, if not generate it
  - Use pptx-in-html-out to convert to HTML
  - Return HTML string
  ↓
Frontend:
  - Open modal/new page with full HTML preview
```

## API Endpoints (New/Modified)

### 1. POST /api/pptx/regenerate-slide
Generate content for a single slide

**Request:**
```json
{
  "jobId": "uuid",
  "slideIndex": 1,
  "language": "Vietnamese"
}
```

**Response:**
```json
{
  "success": true,
  "slideContent": {
    "slide_title": "...",
    "elements": [...]
  }
}
```

### 2. POST /api/pptx/generate-content-batch
Generate content for multiple slides

**Request:**
```json
{
  "jobId": "uuid",
  "slideIndexes": [1, 2, 3],
  "language": "Vietnamese"
}
```

**Response:**
```json
{
  "success": true,
  "results": {
    "1": { "slide_title": "...", "elements": [...] },
    "2": { "slide_title": "...", "elements": [...] },
    "3": { "slide_title": "...", "elements": [...] }
  }
}
```

### 3. POST /api/pptx/preview-html
Convert generated PPTX to HTML for preview

**Request:**
```json
{
  "jobId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "html": "<html>...</html>"
}
```

### 4. GET /api/pptx/content/:jobId
Get current content JSON (to check which slides are generated)

**Response:**
```json
{
  "success": true,
  "content": {
    "slideConfig": {...},
    "slides": {
      "0": {...},
      "1": {...},
      ...
    },
    "font": "Times New Roman"
  }
}
```

## State Management

### Frontend State
```typescript
interface SlideEditorState {
  jobId: string;
  language: string;
  structure: SlideStructure[];  // from structure/{jobId}.json
  content: PPTXConfig | null;   // from output/{jobId}_content.json
  selectedSlideIndex: number;
  generatedSlides: Set<number>; // track which slides have content
  loading: {
    [slideIndex: number]: boolean; // per-slide loading state
  };
}
```

## Implementation Plan

### Phase 1: Backend APIs ✓
1. Create `/api/pptx/regenerate-slide.post.ts`
2. Create `/api/pptx/generate-content-batch.post.ts`
3. Create `/api/pptx/preview-html.post.ts`
4. Create `/api/pptx/content/[jobId].get.ts`
5. Install `pptx-in-html-out` package

### Phase 2: Utilities
1. Create `utils/slidePreviewRenderer.ts` - render HTML from SlideContent JSON
2. Helper functions for content management

### Phase 3: Components
1. Create `SlidePreviewRenderer.vue`
2. Create `SlideStructureItem.vue`
3. Create `SlideStructurePanel.vue`
4. Create `SlidePreviewPanel.vue`
5. Create `CreateSlideSplitView.vue` (main)

### Phase 4: Integration
1. Update routing to use new component
2. Migrate existing functionality
3. Testing

## Preview Rendering Strategy

### Option 1: pptx-in-html-out (for final preview)
- Convert complete PPTX file to HTML
- High fidelity
- Slower (requires PPTX generation)
- Use for final "Preview Full PPTX" feature

### Option 2: Custom HTML Renderer (for real-time preview)
- Render HTML directly from SlideContent JSON
- Faster
- Good enough for preview during editing
- Use for individual slide preview

**Decision:** Use both
- Real-time: Custom renderer
- Final preview: pptx-in-html-out

## Benefits

1. **Better UX**: See changes immediately without full regeneration
2. **Faster iteration**: Edit and regenerate only problematic slides
3. **Preview before download**: Avoid downloading wrong presentations
4. **Flexible editing**: Can mix manual edits with AI regeneration
5. **Cost efficient**: Only call LLM for slides that need changes

## Migration Path

1. Keep old `CreateSlideTab.vue` as fallback
2. Add new `CreateSlideSplitView.vue` as alternative
3. Add route/tab switch
4. Deprecate old version after testing

---

**Sources:**
- pptx-in-html-out: https://www.npmjs.com/package/pptx-in-html-out