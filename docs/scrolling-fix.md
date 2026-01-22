# Scrolling Fix - Split View Component

## Vấn đề

UI không thể scroll được trong split view panels (left và right panels).

## Nguyên nhân

1. **Height calculation không chính xác**: Component `CreateSlideSplitView` sử dụng `height: calc(100vh - 60px)` nhưng nằm trong container có padding và decorations, dẫn đến height không đủ.

2. **Flexbox layout không được configure đúng**: Các header và footer elements không có `flex-shrink: 0`, có thể bị co lại và làm mất space của scrollable areas.

3. **Min-height constraint**: Các flex children cần `min-height: 0` để có thể shrink và enable scrolling.

## Giải pháp

### 1. Fix height calculation

**File: `pages/index.vue`**
```vue
<!-- Thêm inline style cho tab wrapper -->
<div v-else key="create" style="height: calc(100vh - 280px); min-height: 600px;">
  <CreateSlideSplitView />
</div>
```

**File: `components/CreateSlideSplitView.vue`**
```css
.create-slide-split-view {
  display: flex;
  flex-direction: column;
  height: 100%;           /* Changed from calc(100vh - 60px) */
  min-height: 600px;      /* Added minimum height */
  background: #fff;
}
```

### 2. Add flex-shrink: 0 to headers/footers

**Files affected:**
- `CreateSlideSplitView.vue`
- `SlideStructurePanel.vue`
- `SlidePreviewPanel.vue`

**Changes:**
```css
/* Headers and footers should not shrink */
.view-header,
.panel-header,
.panel-actions,
.panel-footer {
  /* ... existing styles ... */
  flex-shrink: 0;  /* Added */
}
```

### 3. Add min-height: 0 to scrollable areas

**File: `SlideStructurePanel.vue`**
```css
.slides-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;  /* Added */
  padding: 16px;
  min-height: 0;       /* Added - allows flex child to shrink below content size */
}
```

**File: `SlidePreviewPanel.vue`**
```css
.preview-container {
  flex: 1;
  overflow: auto;
  padding: 20px;
  background: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 0;       /* Added */
}
```

## CSS Layout Hierarchy

```
pages/index.vue
  └─ div (height: calc(100vh - 280px))
      └─ CreateSlideSplitView (height: 100%)
          ├─ .view-header (flex-shrink: 0)
          └─ .split-container (flex: 1, overflow: hidden)
              ├─ SlideStructurePanel (height: 100%)
              │   ├─ .panel-header (flex-shrink: 0)
              │   ├─ .slides-list (flex: 1, overflow-y: auto, min-height: 0) ← Scrollable
              │   └─ .panel-actions (flex-shrink: 0)
              └─ SlidePreviewPanel (height: 100%)
                  ├─ .panel-header (flex-shrink: 0)
                  ├─ .preview-container (flex: 1, overflow: auto, min-height: 0) ← Scrollable
                  └─ .panel-footer (flex-shrink: 0)
```

## Tại sao min-height: 0 quan trọng?

Theo CSS Flexbox spec, flex items có implicit `min-height: auto` (thay vì `min-height: 0`).
Điều này có nghĩa là flex child sẽ không bao giờ shrink nhỏ hơn content size của nó.

Khi set `min-height: 0`, chúng ta cho phép flex child shrink nhỏ hơn content,
enable overflow/scrolling khi content lớn hơn available space.

## Files Modified

1. ✅ `pages/index.vue` - Added inline height style
2. ✅ `components/CreateSlideSplitView.vue` - Changed height calculation, added flex-shrink
3. ✅ `components/SlideStructurePanel.vue` - Added flex-shrink and min-height
4. ✅ `components/SlidePreviewPanel.vue` - Added flex-shrink and min-height

## Testing Checklist

- [x] Left panel (SlideStructurePanel) scrolls khi có nhiều slides
- [x] Right panel (SlidePreviewPanel) scrolls khi preview content cao
- [x] Layout không bị broken khi resize window
- [x] Min-height đảm bảo panels không bị quá nhỏ
- [x] Headers và footers luôn visible (không scroll đi)

## Result

✅ Both panels có thể scroll independently
✅ Headers và footers luôn visible
✅ Layout responsive và không bị broken
✅ Minimum height được maintain (600px)

---

**Fixed Date:** 2026-01-20
**Status:** ✅ Complete