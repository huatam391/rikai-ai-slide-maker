
# Rikai Slide Maker - NuxtJS Version

Hệ thống tự động tạo PowerPoint slides sử dụng AI (Google Gemini).

**Migration từ Python + Node.js sang NuxtJS hoàn toàn.**

## 🌟 Tính năng

- ✨ Tự động tạo cấu trúc slide từ mô tả bằng AI
- 🎨 Chỉnh sửa và tùy chỉnh slide trước khi tạo
- 🤖 AI tự động design nội dung slide chi tiết
- 📊 Hỗ trợ charts, tables, shapes, và images
- 🌍 Đa ngôn ngữ: Vietnamese, Japanese, English
- 💾 Quản lý jobs và lịch sử tạo slide
- 🖼️ Preview PPTX bằng ảnh PNG chất lượng cao (LibreOffice)
- 🐳 Docker support với LibreOffice tích hợp

## 📁 Cấu trúc Project

```
migrate-to-nodejs/
├── server/
│   ├── api/                    # REST API endpoints
│   │   ├── structure/          # Structure generation & saving
│   │   ├── jobs/               # Job management
│   │   └── pptx/               # PPTX generation & download
│   ├── utils/
│   │   ├── llm.ts              # Gemini AI integration
│   │   ├── prompts.ts          # Prompt templates
│   │   └── pptx-generator.ts   # PPTX generation logic
│   └── db/
│       └── index.ts            # SQLite database
├── pages/
│   └── index.vue               # Main page
├── components/
│   ├── DesignStructureTab.vue  # Tab 1: Design structure
│   ├── CreateSlideTab.vue      # Tab 2: Generate PPTX
│   └── SlideEditor.vue         # Slide editor component
├── types/
│   └── index.ts                # TypeScript types
└── public/
    └── images/                 # Slide templates
```

## 🚀 Cài đặt

### 1. Prerequisites

- Node.js >= 18.x
- npm hoặc yarn

### 2. Clone và Install

```bash
# Di chuyển vào folder
cd migrate-to-nodejs

# Install dependencies
npm install
```

### 3. Cấu hình Environment

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cấu hình `GOOGLE_API_KEY` trong file `.env`:

```env
GOOGLE_API_KEY=your_google_api_key_here
MODEL_ID=gemini-2.0-flash-exp
```

**Lưu ý:** Để lấy Google API Key:
1. Truy cập [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Tạo API Key mới
3. **Quan trọng:** Thiết lập billing để sử dụng API (model Gemini 2.0 là paid)

## 🏃 Chạy Development

### Cách 1: Development thông thường

```bash
npm run dev
```

Mở trình duyệt tại: **http://localhost:3000**

### Cách 2: Sử dụng Docker (Recommended cho Production)

Docker setup bao gồm LibreOffice để convert PPTX sang ảnh PNG cho preview chất lượng cao.

```bash
# Build và chạy với Docker Compose
docker-compose up -d

# Xem logs
docker-compose logs -f
```

Chi tiết về Docker setup: [DOCKER.md](./DOCKER.md)

## 🏗️ Build Production

```bash
# Build
npm run build

# Preview production build
npm run preview
```

## 📖 Hướng dẫn sử dụng

### Tab 1: Design Slide Structure

1. **Nhập mô tả presentation** vào textbox
    - Ví dụ: "Tạo presentation 10 slides về chiến lược marketing Q4 2024"

2. **Click "Generate Structure"** - AI sẽ tạo danh sách slides

3. **Chỉnh sửa slides** (nếu cần):
    - Sửa title và description của từng slide
    - Thêm slide mới
    - Xóa slide không cần

4. **Click "Save Structure & Create Job"** - Lưu và tạo job ID

### Tab 2: Create Slide

1. **Click "Refresh Jobs"** để load danh sách jobs

2. **Chọn job** từ dropdown

3. **Chọn ngôn ngữ** (Vietnamese/Japanese/English)

4. **Click "Generate PPTX"**:
    - Step 1: AI sẽ generate nội dung chi tiết cho từng slide
    - Step 2: Tạo file PowerPoint

5. **Download PPTX** khi hoàn thành

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/structure/generate` | POST | Tạo slide structure từ mô tả |
| `/api/structure/save` | POST | Lưu structure và tạo job |
| `/api/jobs` | GET | Lấy danh sách jobs |
| `/api/pptx/generate-content` | POST | Generate content JSON với AI |
| `/api/pptx/generate` | POST | Tạo file PPTX |
| `/api/pptx/download/:jobId` | GET | Download file PPTX |
| `/api/pptx/preview-images` | POST | Convert PPTX sang PNG images (LibreOffice) |
| `/api/pptx/preview-image/:jobId/:filename` | GET | Lấy từng ảnh preview |
| `/api/pptx/preview-html` | POST | Convert PPTX sang HTML (legacy) |

## 🎯 Flow Hoạt động

```
1. User Input (mô tả presentation)
   ↓
2. AI Generate Structure (danh sách slides)
   ↓
3. User Edit & Save (tạo job)
   ↓
4. AI Generate Content (chi tiết từng slide)
   ↓
5. Generate PPTX (file PowerPoint)
   ↓
6. Download
```

## 💾 Database

Sử dụng SQLite (better-sqlite3) với schema:

```sql
CREATE TABLE jobs (
  job_id TEXT PRIMARY KEY,
  file_path TEXT,
  structure_json TEXT,     -- Slide structure JSON
  content_json TEXT,       -- Slide content JSON
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Lưu trữ dữ liệu:**
- Structure và Content JSON được lưu trực tiếp trong database (không còn files)
- `output/*.pptx` - PowerPoint files
- `jobs.db` - SQLite database

**Migration từ files sang database:**
Nếu bạn có dữ liệu cũ từ phiên bản trước (JSON files), chạy migration:
```bash
npm run migrate
```
Chi tiết xem: [MIGRATION_DB.md](./MIGRATION_DB.md)

## 🔄 Migration từ Python

Project này được migrate từ Python + Node.js sang NuxtJS.

Chi tiết migration: [MIGRATION_NOTES.md](./MIGRATION_NOTES.md)

### So sánh

| Aspect | Trước (Python) | Sau (NuxtJS) |
|--------|---------------|--------------|
| UI Framework | Gradio | Vue 3 + Nuxt |
| Backend | Python FastAPI | Nuxt Nitro |
| LLM Integration | Langchain | @google/generative-ai |
| Database | sqlite3 (Python) | better-sqlite3 (Node) |
| PPTX Gen | Node.js CLI | Integrated in Nuxt |

## 🐛 Troubleshooting

### Error: "GOOGLE_API_KEY is not configured"
- Kiểm tra file `.env` có tồn tại không
- Kiểm tra `GOOGLE_API_KEY` đã được set đúng chưa

### Error: Database locked
- Đảm bảo không có process nào khác đang sử dụng `jobs.db`

### Error: Cannot find module 'pptxgenjs'
- Chạy lại `npm install`

## 🖼️ PPTX Preview

Có 2 phương thức preview PPTX:

1. **PNG Images (Recommended)** - Sử dụng LibreOffice + poppler-utils
    - Chất lượng cao, hiển thị chính xác như PowerPoint
    - Convert PPTX → PDF (LibreOffice) → PNG images (pdftoppm)
    - Mỗi slide = 1 file PNG riêng biệt
    - Yêu cầu LibreOffice và pdftoppm (có trong Docker)
    - API: `/api/pptx/preview-images`

2. **HTML Preview (Legacy)** - Sử dụng pptx-in-html-out
    - Không cần LibreOffice
    - Chất lượng thấp hơn, không chính xác
    - API: `/api/pptx/preview-html`

## 📝 TODO

- [x] Add PPTX to PNG conversion với LibreOffice
- [x] Docker support
- [x] Store structure/content JSON in database instead of files
- [ ] Add authentication
- [ ] Add multi-user support
- [ ] Add slide templates
- [ ] Add real-time preview UI component
- [ ] Add export to PDF
- [ ] Add API documentation (Swagger)

## 📄 License

MIT

## 👥 Contributors

Migrated to NuxtJS by Claude Code